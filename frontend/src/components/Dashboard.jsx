import React, { useState } from 'react';
import { Home, FileUp, FileText, Star, Clock, Users, Settings, HelpCircle, LogOut } from 'lucide-react';

const Dashboard = () => {
  // Sample data for recent PDFs
  const recentPdfs = [
    { id: 1, name: 'Research Paper.pdf', size: '2.4 MB', modified: 'Today', notes: 5 },
    { id: 2, name: 'Project Proposal.pdf', size: '1.8 MB', modified: 'Yesterday', notes: 3 },
    { id: 3, name: 'Technical Documentation.pdf', size: '3.2 MB', modified: 'Mar 27, 2025', notes: 8 }
  ];

  return (
    <div className=" min-h-screen">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to PDFNotes</h1>
          <p className="text-gray-600 mt-2">Manage and annotate your PDF documents</p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FileText size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total PDFs</p>
                <p className="text-2xl font-semibold text-gray-800">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FileText size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Notes</p>
                <p className="text-2xl font-semibold text-gray-800">32</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Clock size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Recent Activity</p>
                <p className="text-2xl font-semibold text-gray-800">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent PDFs */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent PDFs</h2>
            <button className="text-purple-600 hover:text-purple-800 text-sm">View all</button>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPdfs.map((pdf) => (
                    <tr key={pdf.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="text-red-500 mr-3" size={20} />
                          <div className="text-sm font-medium text-gray-900">{pdf.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pdf.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pdf.modified}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pdf.notes} notes</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button className="text-blue-600 hover:text-blue-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="text-purple-600 hover:text-purple-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center text-center transition-all duration-300 hover:translate-y-1 hover:shadow-lg cursor-pointer">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <FileUp className="text-purple-600" size={24} />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Upload PDF</h3>
              <p className="text-gray-500 text-sm">Add new documents to your collection</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center text-center transition-all duration-300 hover:translate-y-1 hover:shadow-lg cursor-pointer">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Search Notes</h3>
              <p className="text-gray-500 text-sm">Find specific annotations quickly</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center text-center transition-all duration-300 hover:translate-y-1 hover:shadow-lg cursor-pointer">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Share PDFs</h3>
              <p className="text-gray-500 text-sm">Collaborate with others on documents</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center text-center transition-all duration-300 hover:translate-y-1 hover:shadow-lg cursor-pointer">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <Settings className="text-yellow-600" size={24} />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Preferences</h3>
              <p className="text-gray-500 text-sm">Customize your PDFNotes experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;