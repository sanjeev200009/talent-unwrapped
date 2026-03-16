import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-100 selection:bg-primary/30 selection:text-white relative overflow-x-hidden bg-[#0a0a0c]">
      {/* Mobile Toggle Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarOpen(!isSidebarOpen);
        }}
        className="lg:hidden fixed top-6 right-6 z-[60] p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all shadow-xl"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main content - offset by sidebar width on lg+ */}
      <main 
        className="min-h-screen relative p-6 md:p-12 lg:p-24 py-20 lg:py-24 lg:ml-80 overflow-x-hidden cursor-pointer"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            window.location.href = '/';
          }
        }}
      >
        {/* Background blobs for premium feel */}
        <div className="absolute top-[-5%] left-[-5%] w-full sm:w-[50%] h-[50%] bg-primary/10 blur-[180px] -z-10 rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-full sm:w-[40%] h-[40%] bg-accent/5 blur-[180px] -z-10 rounded-full" />
        
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
