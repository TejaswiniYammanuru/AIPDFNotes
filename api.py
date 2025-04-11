from flask import Flask, request, jsonify
import fitz  # PyMuPDF for PDF text extraction
from transformers import AutoTokenizer, AutoModel
import torch
from pinecone import Pinecone
import uuid
import os
from flask_cors import CORS
from huggingface_hub import InferenceClient
import time

app = Flask(__name__)
# In your Flask app (app.py)
CORS(app, resources={
    r"/ask": {"origins": ["http://localhost:5173", "http://localhost:3000"]},
    r"/upload": {"origins": ["http://localhost:5173", "http://localhost:3000"]},
    r"/list_pdfs": {"origins": ["http://localhost:5173", "http://localhost:3000"]},
    r"/debug_pdf/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}
})

# Initialize Hugging Face model and tokenizer
model_name = 'sentence-transformers/all-MiniLM-L6-v2'
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Initialize Hugging Face API client
client = InferenceClient(api_key="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")

# Initialize Pinecone - Declare index as a global variable
index = None

# Setup Pinecone connection
try:
    pc = Pinecone(api_key="pcsk_4Foh9q_Cnco1gwxKBP6dt7SVCeeFZsC9cHReFEqxu8ffj37GPCDQba6FwfoLCGY6qnRyJv")
    index_name = "aipdfnotes"
    
    # Check if index exists
    existing_indexes = pc.list_indexes().names()
    print(f"Existing indexes: {existing_indexes}")
    
    if index_name not in existing_indexes:
        print(f"Creating new index: {index_name}")
        pc.create_index(
            name=index_name,
            dimension=384,
            metric='cosine'
        )
        # Wait for index to initialize
        time.sleep(10)
    
    # Assign to global index variable
    index = pc.Index(index_name)
    print(f"Successfully connected to index: {index_name}")
except Exception as e:
    print(f"Error initializing Pinecone: {e}")
    import traceback
    traceback.print_exc()

def get_embeddings(texts):
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        embeddings = outputs.last_hidden_state.mean(dim=1)
    
    # Log embedding dimensions
    print(f"Embedding dimensions: {embeddings.shape}")
    return embeddings.numpy()

def extract_text_from_pdf(file_path):
    text = ""
    try:
        with fitz.open(file_path) as doc:
            for page_num, page in enumerate(doc):
                page_text = page.get_text()
                text += page_text
                print(f"Extracted {len(page_text)} characters from page {page_num+1}")
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    
    print(f"Total extracted text length: {len(text)} characters")
    return text

@app.route('/upload', methods=['POST'])
def upload_pdf():
    # Check if index is initialized
    global index
    if index is None:
        return jsonify({"error": "Pinecone index not initialized"}), 500

    print("Received upload request")
    pdf_file = request.files.get('pdf_file')
    pdf_id = request.form.get('pdf_id')

    if not pdf_file or not pdf_id:
        print(f"Missing PDF file or PDF ID. pdf_file: {bool(pdf_file)}, pdf_id: {pdf_id}")
        return jsonify({"error": "Missing PDF file or PDF ID"}), 400

    # Normalize the PDF ID by removing any leading/trailing whitespace
    pdf_id = pdf_id.strip()
    print(f"Processing PDF with ID: '{pdf_id}'")

    os.makedirs('temp', exist_ok=True)
    file_path = f"temp/{uuid.uuid4()}.pdf"
    pdf_file.save(file_path)
    print(f"Saved PDF to {file_path}")

    try:
        pdf_text = extract_text_from_pdf(file_path)
        if not pdf_text.strip():
            print("Could not extract text from PDF. The file might be image-based or protected.")
            return jsonify({"error": "Could not extract text from PDF. The file might be image-based or protected."}), 400
            
        # Split into sentences and filter empty ones
        sentences = [s.strip() for s in pdf_text.split('.') if s.strip()]
        print(f"Found {len(sentences)} sentences in PDF")
        
        if len(sentences) == 0:
            print("No valid sentences found in PDF")
            return jsonify({"error": "No valid text found in PDF"}), 400
            
        # Get embeddings for each sentence
        embeddings = get_embeddings(sentences)
        
        # Create vectors for Pinecone
        vectors = [
            {
                "id": f"{pdf_id}_{i}",
                "values": embedding.tolist(),
                "metadata": {"sentence": sentences[i], "pdf_id": pdf_id}
            }
            for i, embedding in enumerate(embeddings)
        ]
        
        # First, delete any existing vectors for this PDF ID
        try:
            index.delete(filter={"pdf_id": {"$eq": pdf_id}})
            print(f"Deleted existing vectors for PDF ID: {pdf_id}")
        except Exception as e:
            print(f"No existing vectors found for PDF ID: {pdf_id} or error deleting: {e}")
        
        # Upsert vectors to Pinecone with error handling and retries
        print(f"Upserting {len(vectors)} vectors to Pinecone for PDF ID: {pdf_id}")
        
        # Upsert in batches of 100 to avoid potential size limits
        batch_size = 50  # Smaller batch size for better reliability
        max_retries = 3
        
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i+batch_size]
            retry_count = 0
            
            while retry_count < max_retries:
                try:
                    index.upsert(batch)
                    print(f"Upserted batch {i//batch_size + 1} with {len(batch)} vectors")
                    break
                except Exception as e:
                    retry_count += 1
                    if retry_count >= max_retries:
                        print(f"Failed to upsert batch after {max_retries} retries: {e}")
                        raise
                    print(f"Retry {retry_count}/{max_retries} after error: {e}")
                    time.sleep(2)  # Wait before retrying

        print(f"Successfully uploaded {len(vectors)} vectors to Pinecone for PDF ID: {pdf_id}")
        return jsonify({
            "message": f"PDF processed and stored successfully! Indexed {len(vectors)} sentences.",
            "pdf_id": pdf_id  # Return the PDF ID for confirmation
        })
    except Exception as e:
        print(f"Error processing PDF: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Removed temporary file {file_path}")

@app.route('/ask', methods=['POST'])
def ask_question():
    # Check if index is initialized
    global index
    if index is None:
        return jsonify({"error": "Pinecone index not initialized"}), 500

    data = request.json
    pdf_id = data.get('pdf_id')
    question = data.get('question')

    if not pdf_id or not question:
        print(f"Missing PDF ID or question. pdf_id: {pdf_id}, question: {question}")
        return jsonify({"error": "Missing PDF ID or question"}), 400

    # Normalize the PDF ID by removing any leading/trailing whitespace
    pdf_id = pdf_id.strip()
    print(f"Question received: '{question}' for PDF ID: '{pdf_id}'")

    try:
        # Get embedding for the question
        query_embedding = get_embeddings([question])[0]
        print(f"Generated question embedding with shape: {query_embedding.shape}")

        # Check if the PDF ID exists in the index
        all_pdf_ids = get_all_pdf_ids()
        if pdf_id not in all_pdf_ids:
            print(f"Warning: PDF ID '{pdf_id}' not found in index. Available IDs: {all_pdf_ids}")
            return jsonify({
                "error": f"No data found for PDF ID: '{pdf_id}'. Available PDF IDs: {list(all_pdf_ids)}"
            }), 404
        
        # Main query with filter
        print(f"Querying Pinecone with filter: {{'pdf_id': '{pdf_id}'}}")
        results = index.query(
            vector=query_embedding.tolist(),
            top_k=5,
            include_metadata=True,
            filter={"pdf_id": {"$eq": pdf_id}}
        )

        print(f"Query returned {len(results.get('matches', []))} matches")
        
        # If no matches with the filter, provide a better error message
        if not results.get('matches'):
            print(f"No matches found for PDF ID: '{pdf_id}' and question: '{question}'")
            return jsonify({
                "error": f"No relevant content found in this PDF that answers your question. Try rephrasing or asking a different question."
            }), 404

        # Process results if we have matches
        relevant_texts = [match['metadata']['sentence'] for match in results['matches']]
        print(f"Found {len(relevant_texts)} relevant text segments")
        
        # Log first few words of each relevant text
        for i, text in enumerate(relevant_texts):
            preview = text[:50] + "..." if len(text) > 50 else text
            print(f"Text {i+1}: {preview}")

        prompt = f"""
        Based on the following context:
        {'. '.join(relevant_texts)}
        
        Question: {question}
        # Provide a clear answer based solely on the information in the context. If the answer cannot be determined from the context, say so clearly.
        
        If the answer cannot be specified from the given context,give from your general knowledge.Dont entirely depend on that relevant texts
        """

        print("Sending prompt to Mistral model")
        response = client.text_generation(
            model="mistralai/Mistral-7B-Instruct-v0.3",
            prompt=prompt,
            max_new_tokens=500,
            temperature=0.7
        )

        print(f"Received response from Mistral (first 100 chars): {response[:100]}...")
        return jsonify({"question": question, "answer": response.strip()})
    except Exception as e:
        print(f"Error occurred: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def get_all_pdf_ids():
    """Get all PDF IDs currently in the Pinecone index"""
    global index
    if index is None:
        print("Warning: Pinecone index not initialized when trying to get PDF IDs")
        return set()
        
    try:
        # Use a generic embedding to query
        generic_query = get_embeddings(["general query"])[0]
        
        # Get all results without filtering
        results = index.query(
            vector=generic_query.tolist(),
            top_k=1000,  # Get a large number to cover different PDFs
            include_metadata=True
        )
        
        # Extract unique PDF IDs
        pdf_ids = set()
        for match in results.get('matches', []):
            if 'metadata' in match and 'pdf_id' in match['metadata']:
                pdf_ids.add(match['metadata']['pdf_id'])
        
        return pdf_ids
    except Exception as e:
        print(f"Error getting PDF IDs: {e}")
        return set()

@app.route('/list_pdfs', methods=['GET'])
def list_pdfs():
    # Check if index is initialized
    global index
    if index is None:
        return jsonify({"error": "Pinecone index not initialized"}), 500

    try:
        pdf_ids = get_all_pdf_ids()
        return jsonify({"pdf_ids": list(pdf_ids)})
    except Exception as e:
        print(f"Error listing PDFs: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/debug_pdf/<pdf_id>', methods=['GET'])
def debug_pdf(pdf_id):
    """Endpoint to debug a specific PDF ID"""
    global index
    if index is None:
        return jsonify({"error": "Pinecone index not initialized"}), 500

    try:
        pdf_id = pdf_id.strip()
        # Use a generic embedding to query
        generic_query = get_embeddings(["general query"])[0]
        
        # Get all results for this PDF ID
        results = index.query(
            vector=generic_query.tolist(),
            top_k=10,
            include_metadata=True,
            filter={"pdf_id": {"$eq": pdf_id}}
        )
        
        matches = results.get('matches', [])
        sample_data = []
        
        for match in matches:
            if 'metadata' in match:
                sample_data.append({
                    "id": match['id'],
                    "score": match['score'],
                    "sentence": match['metadata'].get('sentence', ''),
                    "pdf_id": match['metadata'].get('pdf_id', '')
                })
        
        return jsonify({
            "pdf_id": pdf_id,
            "matches_found": len(matches),
            "sample_data": sample_data
        })
    except Exception as e:
        print(f"Error debugging PDF ID: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the server is running"""
    global index
    try:
        # Check Pinecone connection
        pinecone_status = "OK" if index is not None else "Not Connected"
        return jsonify({
            "status": "healthy",
            "pinecone_connection": pinecone_status,
            "model_loaded": bool(model and tokenizer)
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

# Retry Pinecone connection on startup if it failed initially
def retry_pinecone_connection():
    global index
    
    if index is not None:
        return  # Already connected
    
    try:
        print("Retrying Pinecone connection...")
        pc = Pinecone(api_key="pcsk_4Foh9q_Cnco1gwxKBP6dt7SVCeeFZsC9cHReFEqxu8ffj37GPCDQba6FwfoLCGY6qnRyJv")
        index_name = "aipdfnotes"
        index = pc.Index(index_name)
        print(f"Successfully reconnected to Pinecone index: {index_name}")
    except Exception as e:
        print(f"Failed to reconnect to Pinecone: {e}")

if __name__ == '__main__':
    # Retry connection on startup if needed
    if index is None:
        retry_pinecone_connection()
    
    app.run(debug=True, port=5001, host='0.0.0.0')