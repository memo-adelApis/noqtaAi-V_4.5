"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import NotificationCenter from "@/components/ui/NotificationCenter";
import { 
  Menu, Crown, LogOut, LayoutDashboard, FileText, Building2, 
  Package, DollarSign, TrendingUp, BarChart3, User, Settings 
} from "lucide-react";

export default function OwnerLayoutClient({ children, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // مغلق افتراضياً
  const [isMobile, setIsMobile] = useState(false);

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // على جميع الشاشات، يبدأ مغلقاً
      // المستخدم يفتحه يدوياً إذا أراد
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // إغلاق القائمة عند النقر خارجها على الهاتف
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const handleClickOutside = (e) => {
        if (!e.target.closest("aside") && !e.target.closest("button")) {
          setIsSidebarOpen(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMobile, isSidebarOpen]);

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
      <OwnerSidebar 
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
      />

      {/* المحتوى الرئيسي - بدون margin لأن القائمة مغلقة افتراضياً */}
      <div className="transition-all duration-300 ease-in-out">
        {/* شريط العلوي */}
        <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              {/* زر فتح القائمة - دائماً ظاهر */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors group"
                aria-label="Toggle Sidebar"
              >
                <Menu size={24} className="group-hover:text-yellow-500 transition-colors" />
              </button>
              
              <div className="flex items-center gap-2">
                <Crown className="text-yellow-500" size={24} />
                <h1 className="text-lg font-bold hidden sm:block">
                  لوحة <span className="text-yellow-500">المالك</span>
                </h1>
              </div>
            </div>

            {/* الروابط السريعة */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              <a 
                href="/owner" 
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2 group"
              >
                <LayoutDashboard size={16} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="group-hover:text-white transition-colors">لوحة التحكم</span>
              </a>
              <a 
                href="/owner/invoices" 
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2 group"
              >
                <FileText size={16} className="text-green-400 group-hover:text-green-300 transition-colors" />
                <span className="group-hover:text-white transition-colors">الفواتير</span>
              </a>
              <a 
                href="/owner/branches" 
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2 group"
              >
                <Building2 size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="group-hover:text-white transition-colors">الفروع</span>
              </a>
              <a 
                href="/owner/dashboard/products" 
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2 group"
              >
                <Package size={16} className="text-orange-400 group-hover:text-orange-300 transition-colors" />
                <span className="group-hover:text-white transition-colors">المنتجات</span>
              </a>
              <a 
                href="/owner/financial-report" 
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2 group"
              >
                <DollarSign size={16} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <span className="group-hover:text-white transition-colors">التقرير المالي</span>
              </a>
              <a 
                href="/owner/financial-insights" 
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2 group"
              >
                <TrendingUp size={16} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="group-hover:text-white transition-colors">المؤشرات المالية</span>
              </a>
              <a 
                href="/owner/reports" 
                className="px-3 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2 group"
              >
                <BarChart3 size={16} className="text-pink-400 group-hover:text-pink-300 transition-colors" />
                <span className="group-hover:text-white transition-colors">التقارير</span>
              </a>
            </div>

            {/* معلومات المستخدم وزر تسجيل الخروج */}
            <div className="flex items-center gap-3">
              {/* مركز الإشعارات */}
              <NotificationCenter />

              {/* زر تسجيل الخروج */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                title="تسجيل الخروج"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">خروج</span>
              </button>

              {/* معلومات المستخدم */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-yellow-400">مالك المؤسسة</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg">
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

        {/* تذييل */}
        <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Crown className="text-yellow-500" size={20} />
                <p className="text-sm text-gray-400">
                  © 2024 نقطة AI - لوحة المالك
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <a href="/owner/help" className="hover:text-white transition">المساعدة</a>
                <span>•</span>
                <a href="/owner/support" className="hover:text-white transition">الدعم الفني</a>
                <span>•</span>
                <a href="/owner/privacy" className="hover:text-white transition">الخصوصية</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}