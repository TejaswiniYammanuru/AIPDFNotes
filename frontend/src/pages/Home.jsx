import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import UploadPDF from '../components/UploadPDF';
import MyNotes from '../components/MyNotes';
import Favorites from '../components/Favorites';
import Recent from '../components/Recent';
import Shared from '../components/Shared';
import Settings from '../components/Settings';
import Help from '../components/Help';
import PDFViewer from '../components/PDFViewer';


const Home = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPDF />} />
          <Route path="/notes" element={<MyNotes />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/shared" element={<Shared />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/pdf-viewer/:id" element={<PDFViewer />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Home;