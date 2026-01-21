"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/subuser/Sidebar';
import Header from '@/components/subuser/Header'; 

export default function SubuserLayoutClient({ children, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobile(false);
        setIsSidebarOpen(true); // في الديسك توب، مفتوح دائماً
      } else {
        setIsMobile(true);
        setIsSidebarOpen(false); // في الموبايل، مغلق افتراضياً
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // دالة تبديل الحالة
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#000a30] text-gray-100 flex flex-col lg:flex-row" dir="rtl">
      
      {/* 1. الشريط الجانبي */}
      {/* ملاحظة: نمرر isMobile و isOpen للتحكم في الـ CSS class داخل Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
      />

      {/* 2. المحتوى الرئيسي */}
      <div 
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${!isMobile && isSidebarOpen ? 'lg:mr-64' : 'lg:mr-0'} 
        `}
      >
        {/* الهيدر: يجب تمرير onSidebarToggle له لكي يعمل زر القائمة */}
        <div className="sticky top-0 z-40 bg-[#0f111a]/80 backdrop-blur-md border-b border-gray-800">
            <Header user={user} onSidebarToggle={toggleSidebar} />
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#03060f] text-gray-200">
          {children}
        </main>
      </div>

      {/* 3. طبقة التعتيم (Overlay) للموبايل فقط */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}