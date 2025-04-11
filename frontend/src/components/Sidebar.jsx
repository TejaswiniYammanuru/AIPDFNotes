import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Settings, 
  Users, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  FolderPlus,
  Star,
  Clock,
  HelpCircle,
  LogOut
} from 'lucide-react';
import pdfpng from "../assets/pdfpng.png";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleItemClick = (path) => {
    // Use absolute paths to prevent nesting
    navigate(`/${path}`);
  };

  // Get current path to determine active item
  const currentPath = location.pathname.split('/').filter(Boolean)[0] || 'upload';

  return (
    <div 
      className={`h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } relative shadow-xl border-r border-slate-700`}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center">
           <img 
  src={pdfpng}
  alt="PDFuse Logo" 
  className="w-9 h-9 mr-3 object-contain"
/>

            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              PDFuse
            </h1>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center">
          <img 
 src={pdfpng}
 alt="PDFuse Logo" 
 className="w-9 h-9 mr-3 object-contain"
/>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none transition-colors duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="py-4">
        <div className={`${!collapsed ? 'px-4 mb-2' : 'text-center mb-2'}`}>
          {!collapsed && <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Main Menu</p>}
        </div>
        
        <SidebarItem 
          icon={<FolderPlus size={18} />} 
          text="Upload PDF" 
          collapsed={collapsed}
          active={currentPath === 'upload'}
          onClick={() => handleItemClick('upload')}
        />
        
        <SidebarItem 
          icon={<BookOpen size={18} />} 
          text="My Notes" 
          collapsed={collapsed}
          active={currentPath === 'notes'}
          onClick={() => handleItemClick('notes')}
          // badge="3"
        />
        
        <SidebarItem 
          icon={<Star size={18} />} 
          text="Favorites" 
          collapsed={collapsed}
          active={currentPath === 'favorites'}
          onClick={() => handleItemClick('favorites')}
        />
        
        <SidebarItem 
          icon={<Clock size={18} />} 
          text="Recent" 
          collapsed={collapsed}
          active={currentPath === 'recent'}
          onClick={() => handleItemClick('recent')}
        />
        
        {/* <SidebarItem 
          icon={<Users size={18} />} 
          text="Shared" 
          collapsed={collapsed}
          active={currentPath === 'shared'}
          onClick={() => handleItemClick('shared')}
        /> */}

        {/* Divider */}
        <div className={`my-3 border-t border-slate-700/50 ${collapsed ? 'mx-3' : 'mx-4'}`}></div>
        
        <div className={`${!collapsed ? 'px-4 mb-2' : 'text-center mb-2'}`}>
          {!collapsed && <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Preferences</p>}
        </div>
        
        <SidebarItem 
          icon={<Settings size={18} />} 
          text="Settings" 
          collapsed={collapsed}
          active={currentPath === 'settings'}
          onClick={() => handleItemClick('settings')}
        />
        
        <SidebarItem 
          icon={<HelpCircle size={18} />} 
          text="Help" 
          collapsed={collapsed}
          active={currentPath === 'help'}
          onClick={() => handleItemClick('help')}
        />
        
        {/* Bottom logout */}
        <div className="absolute bottom-4 w-full px-2">
          <SidebarItem 
            icon={<LogOut size={18} />} 
            text="Log Out" 
            collapsed={collapsed}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login")
            }}
            special={true}
          />
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, collapsed, active, onClick, badge, special }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 my-0.5 rounded-md ${
      active 
        ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-md' 
        : special
          ? 'text-slate-300 hover:bg-slate-700/70 hover:text-red-300'
          : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
    } transition-all duration-200 ${collapsed ? 'mx-2' : 'mx-2'}`}
  >
    <div className={`${collapsed ? 'mx-auto' : ''} flex items-center`}>
      <div className={`${active ? 'text-white' : special ? 'text-slate-300' : 'text-slate-400'}`}>
        {icon}
      </div>
      {!collapsed && <span className={`ml-3 text-sm font-medium ${active ? 'text-white' : ''}`}>{text}</span>}
    </div>
    
    {!collapsed && badge && (
      <div className="ml-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 shadow-sm">
        {badge}
      </div>
    )}
  </button>
);

export default Sidebar;