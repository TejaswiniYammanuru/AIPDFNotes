import React, { useState, useEffect } from 'react';
import { Upload, FileText, Edit, Check, AlertCircle, FolderPlus, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadPDF = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [pdfId, setPdfId] = useState(0);
  
  // Folder-related state
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Fetch user's folders when component mounts
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('http://localhost:3000/folders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setFolders(data);
      
      // Select the first folder by default if available
      if (data.length > 0) {
        setSelectedFolderId(data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders. Please try again.');
    }
  };

  const createNewFolder = async () => {
    try {
      if (!newFolderName.trim()) {
        setError('Folder name cannot be empty');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('http://localhost:3000/folders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder: { name: newFolderName } })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const newFolder = await response.json();
      setFolders([...folders, newFolder]);
      setSelectedFolderId(newFolder.id.toString());
      setNewFolderName("");
      setIsCreatingFolder(false);
      setError(null);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder. Please try again.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      handleFileSelected(files[0]);
    }
  };
  
  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      handleFileSelected(files[0]);
    }
  };
  
  const handleFileSelected = (file) => {
    setUploadedFile(file);
    setFileName(file.name);
    setIsEditing(true);
    setError(null);
  };
  
  const handleNameConfirm = () => {
    setIsEditing(false);
  };
  
  const handleProcessPDF = async () => {
    if (!selectedFolderId) {
      setError('Please select or create a folder first');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('pdfname', fileName);
      formData.append('pdf_file', uploadedFile);
      formData.append('pdf_size', uploadedFile.size);
      formData.append('folder_id', selectedFolderId);
      
      // Send the request with authorization header
      const response = await fetch('http://localhost:3000/pdf_handlers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data.pdf);
      
      // Use the PDF ID directly from the response instead of state
      const pdfIdFromResponse = data.pdf.id;

      const form1Data = new FormData();
      form1Data.append('pdf_file', uploadedFile);
      form1Data.append('pdf_id', pdfIdFromResponse);

      const response1 = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form1Data
      });

      if (!response1.ok) {
        const errorData = await response1.json();
        throw new Error(errorData.error || `Server responded with status: ${response1.status}`);
      }

      const successdata = await response1.json();
      console.log('Upload successful:', successdata);
      
      // Set the PDF ID in state for later use (like navigation)
      setPdfId(pdfIdFromResponse);
      
      setIsProcessing(false);
      setProcessComplete(true);
    } catch (err) {
      console.error('Error uploading PDF:', err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  // Folder selection UI component
  const renderFolderSelection = () => {
    return (
      <div className="w-full mb-6">
        <h3 className="font-medium text-lg text-gray-900 mb-2">Select Folder</h3>
        
        {isCreatingFolder ? (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="New folder name"
              />
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition"
                onClick={createNewFolder}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
            <button 
              className="text-sm text-purple-600 hover:text-purple-800"
              onClick={() => setIsCreatingFolder(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center mb-4">
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mr-2"
              disabled={folders.length === 0}
            >
              {folders.length === 0 ? (
                <option value="">No folders available</option>
              ) : (
                folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name} ({folder.pdf_handlers ? folder.pdf_handlers.length : 0} PDFs)
                  </option>
                ))
              )}
            </select>
            <button 
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              onClick={() => setIsCreatingFolder(true)}
            >
              <FolderPlus className="w-4 h-4 mr-1" />
              <span>New Folder</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload PDF</h2>
        <p className="text-gray-500 mb-8">Upload and process your PDF documents</p>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main upload area */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 mb-8 flex flex-col items-center justify-center transition-all ${
            isDragging 
              ? 'border-purple-600 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-400'
          }`}
          style={{ minHeight: "320px" }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadedFile && !isEditing && !isProcessing && !processComplete ? (
            <div className="text-center w-full max-w-md">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex items-center justify-center mb-2">
                <h3 className="font-medium text-xl text-gray-900 mr-2">{fileName}</h3>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-6">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              
              {/* Add folder selection UI here */}
              {renderFolderSelection()}
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-800 font-medium">Ready to Process</p>
                    <p className="text-xs text-purple-600 mt-1">Your PDF will be analyzed for text extraction and indexing</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
                  onClick={handleProcessPDF}
                >
                  Process PDF
                </button>
                <button 
                  className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => setUploadedFile(null)}
                >
                  Upload Different File
                </button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="text-center w-full max-w-md">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-xl text-gray-900 mb-4">Name Your PDF</h3>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Enter file name"
                />
                <p className="text-xs text-gray-500 mt-2">The original filename is: {uploadedFile.name}</p>
              </div>
              
              <div className="flex justify-center gap-3">
                <button 
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
                  onClick={handleNameConfirm}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Confirm Name
                </button>
                <button 
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => {
                    setFileName(uploadedFile.name);
                    handleNameConfirm();
                  }}
                >
                  Use Original Name
                </button>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-6"></div>
              <h3 className="font-medium text-xl text-gray-900 mb-2">Processing PDF</h3>
              <p className="text-gray-500 mb-2">This may take a moment...</p>
              <p className="text-sm text-gray-400">{fileName}</p>
            </div>
          ) : processComplete ? (
            <div className="text-center w-full max-w-md">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-medium text-xl text-gray-900 mb-1">Processing Complete!</h3>
              <p className="text-sm text-gray-500 mb-6">{fileName} has been successfully processed</p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-green-800 font-medium">PDF Successfully Indexed</p>
                <p className="text-xs text-green-600 mt-1">Your PDF is now searchable and ready to use</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate(`/pdf-viewer/${pdfId}`)} className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm">
                  View PDF
                </button>
                <button 
                  className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => {
                    setUploadedFile(null);
                    setProcessComplete(false);
                  }}
                >
                  Upload Another PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-medium text-xl text-gray-900 mb-1">Drag & Drop your PDF here</h3>
              <p className="text-sm text-gray-500 mb-6">or browse from your computer</p>
              <label className="px-6 py-3 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition shadow-sm inline-block">
                Browse Files
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileInput} 
                />
              </label>
            </div>
          )}
        </div>
        
        {/* Info section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              PDF Guidelines
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                <span>Maximum file size: 50 MB</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                <span>Supported format: PDF only</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                <span>For best results, ensure your PDF contains searchable text</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
            <h3 className="font-medium text-purple-800 mb-3 flex items-center">
              <Folder className="w-5 h-5 mr-2 text-purple-600" />
              Folder Organization
            </h3>
            <ul className="text-sm text-purple-700 space-y-2">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                <span>Group your PDFs in custom folders</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                <span>Create separate folders for work, studies, projects, etc.</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                <span>Easily find your documents with organized storage</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPDF;