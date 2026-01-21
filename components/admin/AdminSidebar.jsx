"use client"; // 👈 هذا السطر ضروري جداً

import Link from "next/link";
import { LayoutDashboard, Users, Bell, Settings, LogOut, BarChart3, CreditCard, Menu, X, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // تحديد ما إذا كان الجهاز موبايل أم لا
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // إغلاق الشريط الجانبي تلقائياً على الموبايل
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* زر القائمة للموبايل */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 md:hidden bg-gray-800 text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* خلفية شفافة للموبايل */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* الشريط الجانبي */}
      <aside
        className={`
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          ${isMobile ? 'fixed' : 'sticky'}
          top-0 right-0 bg-gray-900 border-l border-gray-800 
          flex flex-col h-screen z-50 transition-all duration-300 ease-in-out
          ${isOpen || isMobile ? 'w-64' : 'w-16'}
        `}
      >
        {/* Header مع زر التحكم */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!isOpen && !isMobile ? 'justify-center w-full' : ''}`}>
            <BarChart3 className="text-indigo-500 flex-shrink-0" size={24} />
            <span className={`text-xl font-bold transition-opacity duration-300 ${!isOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              لوحة القيادة
            </span>
          </div>
          
          {/* زر التحكم للديسكتوب */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title={isOpen ? 'إغلاق الشريط الجانبي' : 'فتح الشريط الجانبي'}
            >
              {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>
        
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <NavItem 
            href="/admin" 
            icon={<LayoutDashboard size={20} />} 
            label="نظرة عامة" 
            isCollapsed={!isOpen && !isMobile}
            onClick={closeSidebar}
          />
          <NavItem 
            href="/admin/users" 
            icon={<Users size={20} />} 
            label="المشتركين" 
            isCollapsed={!isOpen && !isMobile}
            onClick={closeSidebar}
          />
          <NavItem 
            href="/admin/payments" 
            icon={<CreditCard size={20} />} 
            label="المدفوعات" 
            isCollapsed={!isOpen && !isMobile}
            onClick={closeSidebar}
          />
          <NavItem 
            href="/admin/notifications" 
            icon={<Bell size={20} />} 
            label="إرسال إشعارات" 
            isCollapsed={!isOpen && !isMobile}
            onClick={closeSidebar}
          />
          <NavItem 
            href="/admin/notifications/nbox" 
            icon={<Bell size={20} />} 
            label="صندوق الوارد" 
            isCollapsed={!isOpen && !isMobile}
            onClick={closeSidebar}
          />
          <NavItem 
            href="/admin/logs" 
            icon={<Shield size={20} />} 
            label="سجلات الأمان" 
            isCollapsed={!isOpen && !isMobile}
            onClick={closeSidebar}
          />
          <NavItem 
            href="/admin/settings" 
            icon={<Settings size={20} />} 
            label="الإعدادات" 
            isCollapsed={!isOpen && !isMobile}
            onClick={closeSidebar}
          />
        </nav>

        {/* زر تسجيل الخروج */}
        <div className="p-2 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group ${
              !isOpen && !isMobile 
                ? 'p-3 justify-center' 
                : 'p-3 gap-3'
            }`}
            title="تسجيل خروج"
          >
            <LogOut size={20} className="flex-shrink-0" />  
            <span className={`transition-all duration-300 ${!isOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              تسجيل خروج
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

// مكون فرعي للروابط
function NavItem({ href, icon, label, isCollapsed, onClick }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`
        flex items-center text-gray-400 hover:text-white hover:bg-gray-800 
        rounded-lg transition-all duration-200 font-medium group relative
        ${isCollapsed 
          ? 'p-3 justify-center' 
          : 'p-3 gap-3'
        }
      `}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      
      <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
        {label}
      </span>
      
      {/* Tooltip للوضع المضغوط */}
      {isCollapsed && (
        <div className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-gray-700">
          {label}
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-800 border-r border-b border-gray-700 rotate-45"></div>
        </div>
      )}
    </Link>
  );
}