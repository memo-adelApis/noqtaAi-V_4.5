"use client";

import SubscriberSidebar from '../subscriber/SubscriberSidebar';
import Header from '@/components/subuser/Header'; 
import { useState, useEffect } from 'react';
import Footer from "@/components/subscriber/Footer";

export default function SubscriberLayoutClient({ children, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobile(false);
        setIsSidebarOpen(true);
      } else {
        setIsMobile(true);
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen  bg-[#0f111a] text-gray-100" dir="rtl">
      
      {/* تمرير المستخدم المحدث (من الداتابيس) للشريط الجانبي */}
      <SubscriberSidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
      />

      <div 
        className={`
          flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${!isMobile && isSidebarOpen ? 'mr-64' : 'mr-0'} 
        `}
      >
        <Header 
          user={user} 
          onSidebarToggle={toggleSidebar} 
        />

        <main className="flex-1 p-4 bg-[#14161f] p-5 md:p-0 text-gray-200 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>

      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}