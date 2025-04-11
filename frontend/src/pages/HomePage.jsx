import React from 'react';
import { Link } from 'react-router-dom';
import pdfpng from '../assets/pdfpng.png';



const HomePage = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
  <img src={pdfpng} alt="PDF logo" className="w-8 h-8" />
  <h1 className="text-xl font-bold">PDFuse</h1>
</div>

          <div className="flex space-x-4">
            <Link to="/login" className="px-4 py-2 text-white hover:text-purple-300 transition">Login</Link>
            <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center">
          {/* Left Side - Content */}
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold mb-4 text-slate-800">Smart PDF Management</h2>
            <p className="text-lg text-slate-600 mb-6">
              Upload, organize, and create intelligent notes from your documents with our AI-powered PDF management system.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800">Upload PDFs</h3>
                </div>
                <p className="text-slate-600 text-sm">Process files up to 50MB with our intuitive interface</p>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800">AI Notes</h3>
                </div>
                <p className="text-slate-600 text-sm">Generate intelligent insights and summaries</p>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800">Organization</h3>
                </div>
                <p className="text-slate-600 text-sm">Create custom folders for easy document retrieval</p>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800">Search</h3>
                </div>
                <p className="text-slate-600 text-sm">Find content across all your documents instantly</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - CTA and Visual */}
          <div className="md:w-1/2">
            <div className="bg-slate-900 p-8 rounded-xl shadow-lg relative overflow-hidden">
              {/* Purple accent element */}
              <div className="absolute top-0 right-0 h-24 w-24 bg-purple-600 rounded-bl-full opacity-30"></div>
              
              <h3 className="text-2xl font-bold mb-6 text-white relative z-10">
                Streamline Your Workflow
              </h3>
              
              <p className="text-slate-300 mb-6 relative z-10">
                Join thousands of professionals who are saving time and getting more out of their documents with PDFuse.
              </p>
              
              <ul className="space-y-3 mb-8 relative z-10">
                <li className="flex items-center text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  Maximum file size: 50 MB
                </li>
                <li className="flex items-center text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  Supported format: PDF only
                </li>
                <li className="flex items-center text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  Searchable text for optimal results
                </li>
              </ul>
              
              <div className="flex flex-col space-y-3 relative z-10">
                <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-md font-medium text-center transition">
                  Get Started Free
                </Link>
                <Link to="/login" className="bg-transparent border border-slate-600 hover:border-slate-500 text-white py-3 px-6 rounded-md font-medium text-center transition">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="text-sm">© 2025 PDFuse. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="text-sm hover:text-purple-300">About</Link>
            <Link to="/privacy" className="text-sm hover:text-purple-300">Privacy</Link>
            <Link to="/terms" className="text-sm hover:text-purple-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;