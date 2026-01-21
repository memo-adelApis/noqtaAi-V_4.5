"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import NotificationCenter from "@/components/ui/NotificationCenter";
import { 
  Menu, Shield, LogOut, LayoutDashboard, FileText, Users, 
  Package, Settings, Bell
} from "lucide-react";

export default function ManagerLayoutClient({ children, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const menuItems = [
    { label: "لوحة التحكم", href: "/manager", icon: LayoutDashboard },
    { label: "الفواتير", href: "/manager/invoices", icon: FileText },
    { label: "الموظفين", href: "/manager/employees", icon: Users },
    { label: "المنتجات", href: "/manager/products", icon: Package },
    { label: "الإشعارات", href: "/manager/notifications", icon: Bell },
    { label: "الإعدادات", href: "/manager/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Overlay للهاتف */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* الشريط الجانبي */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-800 shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* رأس القائمة */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800 bg-gradient-to-l from-blue-900/20 to-transparent">
          <div className="flex items-center gap-2">
            <Shield className="text-blue-500" size={24} />
            <span className="text-xl font-bold text-white">
              لوحة <span className="text-blue-500">المدير</span>
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            ×
          </button>
        </div>

        {/* القائمة */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center px-4 py-3 mb-1 mx-2 rounded-lg transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <item.icon size={20} className="ml-3" />
              <span className="font-medium text-sm">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* تذييل القائمة */}
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.charAt(0) || "M"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-blue-400 truncate">مدير الفرع</p>
            </div>
          </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="transition-all duration-300 ease-in-out">
        {/* شريط العلوي */}
        <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Menu size={24} className="hover:text-blue-500 transition-colors" />
              </button>
              
              <div className="flex items-center gap-2">
                <Shield className="text-blue-500" size={24} />
                <h1 className="text-lg font-bold hidden sm:block">
                  لوحة <span className="text-blue-500">المدير</span>
                </h1>
              </div>
            </div>

            {/* معلومات المستخدم */}
            <div className="flex items-center gap-3">
              {/* مركز الإشعارات */}
              <NotificationCenter />

              {/* زر تسجيل الخروج */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all text-sm font-medium"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">خروج</span>
              </button>

              {/* معلومات المستخدم */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-blue-400">مدير الفرع</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "M"}
              </div>
            </div>
          </div>
        </header>

        {/* محتوى الصفحة */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}