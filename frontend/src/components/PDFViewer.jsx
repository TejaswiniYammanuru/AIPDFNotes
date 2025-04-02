import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const PDFViewer = () => {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const quillInitialized = useRef(false);

  // Fetch PDF data and notes when component mounts or ID changes
  useEffect(() => {
    const fetchPdfData = async () => {
      try {
        setLoading(true);
        
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Build request URL
        const requestUrl = `http://localhost:3000/pdf_handlers/${id}`;
        
        // Fetch PDF data
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.pdf || !data.pdf.file_url) {
          throw new Error('PDF data not found');
        }
        
        setPdfUrl(`http://localhost:3000${data.pdf.file_url}`);
        
        // After fetching PDF data, fetch the notes
        await fetchNotes();
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    // Function to fetch notes
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const notesUrl = `http://localhost:3000/pdf_handlers/${id}/show_notes`;
        
        const response = await fetch(notesUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // If we get a 404, it means there are no notes yet, which is fine
        if (response.status === 404) {
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch notes: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Set the notes content to the editor when quill is initialized
        if (data.notes && quillRef.current) {
          quillRef.current.root.innerHTML = data.notes;
          setEditorContent(data.notes);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        // We don't need to set an error state here as it's not critical
      }
    };
    
    fetchPdfData();
  }, [id]);

  // Function to call the AI endpoint
  const generateAiContent = async (question) => {
    try {
      setAiLoading(true);
      
      const response = await fetch('http://localhost:5001/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pdf_id: id,
          question: question
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.answer;
    } catch (err) {
      console.error('Error generating AI content:', err);
      return `Error: ${err.message}`;
    } finally {
      setAiLoading(false);
    }
  };

  // Initialize Quill editor only once
  useEffect(() => {
    // Only initialize Quill if:
    // 1. Editor ref exists
    // 2. Quill hasn't been initialized yet
    // 3. There is no existing toolbar (to prevent duplicates)
    if (
      editorRef.current && 
      !quillInitialized.current && 
      !document.querySelector('.editor-container .ql-toolbar')
    ) {
      // Register the sparkle/adjustment icon from the image
      const icons = Quill.import('ui/icons');
      icons['generate-ai'] = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
    </svg>`;
      // Ensure we only initialize once
      quillInitialized.current = true;
      
      const toolbarOptions = [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['code-block', 'link'],
        [{ 'align': [] }],
        ['generate-ai'] // Add our custom icon to the toolbar
      ];

      // Create a custom container with a specific class to help manage the toolbar
      const editorContainer = document.createElement('div');
      editorContainer.className = 'editor-container';
      editorContainer.style.height = '100%';
      editorContainer.style.display = 'flex';
      editorContainer.style.flexDirection = 'column';
      
      // Replace the editor ref's content with our container
      if (editorRef.current.firstChild) {
        editorRef.current.innerHTML = '';
      }
      editorRef.current.appendChild(editorContainer);

      // Initialize Quill on our custom container
      quillRef.current = new Quill(editorContainer, {
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              'generate-ai': async function() {
                // Handle the generate-ai button click
                const selection = this.quill.getSelection();
                if (selection) {
                  // Get selected text if any
                  const selectedText = selection.length > 0 
                    ? this.quill.getText(selection.index, selection.length)
                    : '';
                  
                  if (!selectedText) {
                    alert('Please select text to generate AI content');
                    return;
                  }
                  
                  // Show loading indicator in the editor
                  this.quill.insertText(selection.index + selection.length, '\n\nGenerating AI response...');
                  const loadingIndex = selection.index + selection.length + 2;
                  const loadingLength = 'Generating AI response...'.length;
                  
                  // Call the AI endpoint
                  const answer = await generateAiContent(selectedText);
                  
                  // Remove loading indicator
                  this.quill.deleteText(loadingIndex, loadingLength);
                  
                  // Insert the AI response
                  this.quill.insertText(
                    selection.index + selection.length, 
                    `\n\nAI Response:\n${answer}\n`,
                    { 'bold': true }
                  );
                  
                  // Apply formatting to the response
                  this.quill.formatText(
                    selection.index + selection.length + 14, 
                    answer.length, 
                    { 'bold': false }
                  );
                } else {
                  alert('Please select text to generate AI content');
                }
              }
            }
          }
        },
        placeholder: 'Start typing your notes here...',
        theme: 'snow'
      });

      // Handle content change
      quillRef.current.on('text-change', () => {
        setEditorContent(quillRef.current.root.innerHTML);
      });
      
      // Apply custom CSS to make the editor fill the available space
      if (quillRef.current && quillRef.current.container) {
        // Find the editor content area and make it fill available space
        const editorContent = quillRef.current.container.querySelector('.ql-editor');
        if (editorContent) {
          editorContent.style.flexGrow = '1';
          editorContent.style.overflowY = 'auto';
        }
        
        // Style the sparkle/adjustment button
        const generateAiButton = quillRef.current.container.querySelector('.ql-generate-ai');
        if (generateAiButton) {
          generateAiButton.title = 'Generate from AI';
        }
      }

      // After Quill is initialized, fetch and load any existing notes
      const fetchInitialNotes = async () => {
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            console.error('Authentication token not found');
            return;
          }
          
          const notesUrl = `http://localhost:3000/pdf_handlers/${id}/show_notes`;
          
          const response = await fetch(notesUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // If 404, just leave the editor empty
          if (response.status === 404) {
            return;
          }
          
          if (!response.ok) {
            console.error(`Failed to fetch notes: ${response.status}`);
            return;
          }
          
          const data = await response.json();
          
          if (data.notes && quillRef.current) {
            quillRef.current.root.innerHTML = data.notes;
            setEditorContent(data.notes);
          }
        } catch (err) {
          console.error('Error loading initial notes:', err);
        }
      };
      
      // Call the function to fetch notes after Quill is initialized
      fetchInitialNotes();
    }

    // Cleanup on unmount
    return () => {
      quillInitialized.current = false;
      quillRef.current = null;
    };
  }, [id]);

  // Save notes function
  const handleSaveNotes = async () => {
    if (!quillRef.current) return;
  
    const content = quillRef.current.root.innerHTML;
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.error('Authentication token not found');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/pdf_handlers/${id}/save_notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: content })
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to save notes');
      }
  
      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };
  

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Left side - Quill Editor */}
      <div className="w-1/2 h-full flex flex-col border-r border-gray-300">
        {/* Editor container that fills available height */}
        <div className="flex-grow flex flex-col relative">
          {/* Single container for Quill editor */}
          <div ref={editorRef} className="flex-grow overflow-hidden"></div>
          
          {/* Character count overlay at bottom */}
          <div className="absolute bottom-16 left-4 z-10">
            <span className="text-sm text-gray-500">
              {editorContent && editorContent.replace(/<[^>]*>/g, '').length > 0 
                ? `${editorContent.replace(/<[^>]*>/g, '').length} characters` 
                : ''}
            </span>
          </div>
          
          {/* Save button positioned inside the editor area */}
          <div className="absolute bottom-9 right-9 z-20">
            <button 
              onClick={handleSaveNotes}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 text-sm font-medium"
            >
              Save Notes
            </button>
          </div>
          
          {/* AI loading indicator */}
          {aiLoading && (
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 px-3 py-1 rounded-bl-md text-sm">
              Getting AI response...
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - PDF Viewer */}
      <div className="w-1/2 h-full bg-gray-100">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-600">Error: {error}</p>
            </div>
          </div>
        ) : !pdfUrl ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-600">PDF not available</p>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
          />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;