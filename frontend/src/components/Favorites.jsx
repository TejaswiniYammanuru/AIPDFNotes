import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pdfIcon from "../assets/pdf.png"

const Favorites = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch favorite PDFs for the current user
        const response = await fetch('http://localhost:3000/pdf_handlers/favorites', {
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
        
        if (!data || !data.pdfs) {
          throw new Error('PDF data not found');
        }
        
        setPdfs(data.pdfs);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [navigate]);

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
      
      // Update the PDFs state to remove the unfavorited PDF
      setPdfs(prevPdfs => prevPdfs.filter(pdf => pdf.id !== pdfId));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Format the file size
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date unknown';
    
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time since upload/modification
  const formatTimeSince = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) {
      return 'Just now';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}d ago`;
    }
    
    return formatDate(dateString);
  };

  // Filter PDFs based on search term
  const filteredPdfs = pdfs.filter(pdf => 
    pdf.pdfname && pdf.pdfname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header with search */}
        <div className="mb-6 border-b border-gray-200 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-semibold text-gray-800">Favorites</h1>
              <p className="text-gray-500 mt-1 text-sm">Your favorite documents</p>
            </div>
            
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search favorites..."
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
            <p className="text-gray-600">Loading your favorites...</p>
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
        ) : pdfs.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <div className="mb-6">
              <div className="h-16 w-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-violet-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Favorite Documents
            </h3>
            <p className="text-gray-600 mb-6">
              You don't have any favorite documents yet. Mark some documents as favorites to see them here.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              View All Documents
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
                      {/* PDF Icon */}
                      <div className="flex-shrink-0">
                        {/* <svg className="h-10 w-8" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                          <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48z" fill="#e2e2e2"/>
                          <rect x="65" y="250" width="255" height="150" rx="6" fill="#8b5cf6"/>
                          <text x="105" y="340" fontFamily="Arial" fontSize="55" fill="white">PDF</text>
                        </svg> */}
                        <img src={pdfIcon} alt="pdf Icon" className="h-10 w-8 object-contain"/>
                      </div>
                      <div>
                        <h2 className="text-base font-medium text-gray-800 truncate" title={pdf.pdfname || 'Unnamed Document'}>
                          {pdf.pdfname || 'Unnamed Document'}
                        </h2>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{formatTimeSince(pdf.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Favorite Button */}
                    <button 
                      onClick={(e) => handleToggleFavorite(e, pdf.id)} 
                      className="text-yellow-500 hover:text-yellow-600 transition-colors focus:outline-none p-1"
                      title="Remove from favorites"
                    >
                      <svg 
                        className="h-5 w-5 fill-current" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* File Info Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2 mb-3">
                    <div className="flex items-center">
                      <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                      <span>{formatFileSize(pdf.pdf_size)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{formatDate(pdf.created_at)}</span>
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
                    
                    {/* <span className="flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Favorite
                    </span> */}
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
        )}
        
        {/* Upload button fixed at bottom right */}
        <div className="fixed bottom-6 right-6">
          <Link 
            to="/upload" 
            className="flex items-center justify-center w-12 h-12 bg-violet-600 text-white rounded-full shadow-md hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            title="Upload a new PDF"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Favorites;