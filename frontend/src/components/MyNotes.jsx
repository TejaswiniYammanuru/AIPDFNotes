import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pdfIcon from "../assets/pdf.png";
import folderIcon from "../assets/folder.png";

const MyNotes = () => {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Fetch all folders for the current user
      const url = 'http://localhost:3000/folders';
        
      const response = await fetch(url, {
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
      setFolders(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    setPdfs(folder.pdf_handlers || []);
  };

  const handleBackToFolders = () => {
    setCurrentFolder(null);
    setPdfs([]);
  };

  const handleViewPdf = (pdfId) => {
    navigate(`/pdf-viewer/${pdfId}`);
  };

  const handleToggleFavorite = async (e, pdfId) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`http://localhost:3000/pdf_handlers/${pdfId}/toggle_favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update the PDFs state with the toggled favorite status
      setPdfs(prevPdfs => prevPdfs.map(pdf => 
        pdf.id === pdfId 
          ? { ...pdf, is_favorite: result.is_favorite } 
          : pdf
      ));

      // Also update the folder's pdfs
      if (currentFolder) {
        setCurrentFolder(prevFolder => ({
          ...prevFolder,
          pdf_handlers: prevFolder.pdf_handlers.map(pdf => 
            pdf.id === pdfId 
              ? { ...pdf, is_favorite: result.is_favorite } 
              : pdf
          )
        }));
      }

      // Update the folders state as well
      setFolders(prevFolders => 
        prevFolders.map(folder => {
          if (folder.id === currentFolder?.id) {
            return {
              ...folder,
              pdf_handlers: folder.pdf_handlers.map(pdf => 
                pdf.id === pdfId 
                  ? { ...pdf, is_favorite: result.is_favorite } 
                  : pdf
              )
            };
          }
          return folder;
        })
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Size unknown';
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Create a new folder
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) return;
    
    try {
      setIsCreatingFolder(true);
      
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
        throw new Error(`Server error: ${response.status}`);
      }
      
      const newFolder = await response.json();
      
      // Add the new folder to the folders state
      setFolders(prevFolders => [...prevFolders, { ...newFolder, pdf_handlers: [] }]);
      
      // Reset form and close modal
      setNewFolderName('');
      setShowCreateFolderModal(false);
      setIsCreatingFolder(false);
    } catch (err) {
      console.error('Error creating folder:', err);
      setIsCreatingFolder(false);
    }
  };

  // Filter PDFs based on search term if in folder view
  const filteredPdfs = currentFolder ? pdfs.filter(pdf => 
    pdf.pdfname && pdf.pdfname.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Filter folders based on search term if in folder list view
  const filteredFolders = !currentFolder ? folders.filter(folder => 
    folder.name && folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header with search and back button if in folder */}
        <div className="mb-6 border-b border-gray-200 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
            <div className="mb-4 md:mb-0 flex items-center">
              {currentFolder && (
                <button 
                  onClick={handleBackToFolders} 
                  className="mr-3 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label="Back to folders"
                >
                  <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  {currentFolder ? currentFolder.name : "My Folders"}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  {currentFolder 
                    ? `${currentFolder.pdf_handlers?.length || 0} documents` 
                    : "Access your document folders"}
                </p>
              </div>
            </div>
            
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder={currentFolder ? "Search documents..." : "Search folders..."}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 bg-white text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-gray-100 p-8">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading your {currentFolder ? "documents" : "folders"}...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-gray-100 p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">Error: {error}</p>
            <p className="text-gray-600">
              Please make sure you are logged in and try again.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              Go to Login
            </button>
          </div>
        ) : currentFolder ? (
          // Show PDFs in the current folder
          pdfs.length === 0 ? (
            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="h-8 w-8 text-violet-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Documents Found
              </h3>
              <p className="text-gray-600 mb-6">
                This folder doesn't have any PDFs yet. Upload a document to this folder to get started.
              </p>
              <Link 
                to={`/upload?folder_id=${currentFolder.id}`}
                className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload a Document
              </Link>
            </div>
          ) : filteredPdfs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-100 p-6 text-center">
              <p className="text-gray-700 mb-4">No results found for "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPdfs.map((pdf) => (
                <div 
                  key={pdf.id} 
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-violet-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  onClick={() => handleViewPdf(pdf.id)}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        {/* PDF Icon - Using the imported PDF icon image */}
                        <div className="flex-shrink-0">
                          <img 
                            src={pdfIcon} 
                            alt="PDF" 
                            className="h-10 w-8 object-contain"
                          />
                        </div>
                        <div>
                          <h2 className="text-base font-medium text-gray-800 truncate" title={pdf.pdfname || 'Unnamed Document'}>
                            {pdf.pdfname || 'Unnamed Document'}
                          </h2>
                          <p className="text-xs text-gray-500">
                            {new Date(pdf.created_at).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => handleToggleFavorite(e, pdf.id)} 
                        className={`${pdf.is_favorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600 transition-colors focus:outline-none p-1`}
                        title={pdf.is_favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <svg 
                          className="h-5 w-5 fill-current" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill={pdf.is_favorite ? "currentColor" : "none"}
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2 mb-3">
                      <div className="flex items-center">
                        <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                        <span>
                          {formatFileSize(pdf.pdf_size)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>
                          {new Date(pdf.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pdf.has_notes && (
                        <span className="flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="2" x2="22" y2="6"></line>
                            <path d="M7.5 20.5L19 9l-4-4L3.5 16.5 2 22z"></path>
                          </svg>
                          Notes
                        </span>
                      )}
                      
                      {/* {pdf.is_favorite && (
                        <span className="flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          Favorite
                        </span>
                      )} */}
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex justify-center items-center pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPdf(pdf.id);
                        }}
                        className="w-full px-3 py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:ring-offset-1 transition-colors"
                      >
                        <div className="flex items-center justify-center">
                          Open Document
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Show Folders
          folders.length === 0 ? (
            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="h-8 w-8 text-violet-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Folders Found
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have any folders yet. Create your first folder to get started.
              </p>
              <button 
                onClick={() => setShowCreateFolderModal(true)}
                className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  <line x1="12" y1="11" x2="12" y2="17"></line>
                  <line x1="9" y1="14" x2="15" y2="14"></line>
                </svg>
                Create Folder
              </button>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-100 p-6 text-center">
              <p className="text-gray-700 mb-4">No folders found for "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredFolders.map((folder) => (
                <div 
                  key={folder.id} 
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-violet-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      {/* Folder Icon - Using the imported folder icon image */}
                      <div className="flex-shrink-0 mr-3">
                        <img 
                          src={folderIcon} 
                          alt="Folder" 
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-gray-800">
                          {folder.name || 'Unnamed Folder'}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {folder.pdf_handlers?.length || 0} documents
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Created {new Date(folder.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderClick(folder);
                          }}
                          className="px-3 py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:ring-offset-1 transition-colors"
                        >
                          <div className="flex items-center">
                            <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            Open
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        
        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Create New Folder</h3>
                <button 
                  onClick={() => setShowCreateFolderModal(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateFolder}>
                <div className="mb-4">
                  <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="Enter folder name"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateFolderModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingFolder || !newFolderName.trim()}
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingFolder ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      "Create Folder"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Upload/Create button fixed at bottom right */}
        <div className="fixed bottom-6 right-6">
          {currentFolder ? (
            <Link 
              to={`/upload?folder_id=${currentFolder.id}`}
              className="flex items-center justify-center w-12 h-12 bg-violet-600 text-white rounded-full shadow-md hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              title="Upload a new PDF to this folder"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </Link>
          ) : (
            <button 
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center justify-center w-12 h-12 bg-violet-600 text-white rounded-full shadow-md hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              title="Create a new folder"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <line x1="12" y1="11" x2="12" y2="17"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyNotes;