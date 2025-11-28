"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
// تمت إضافة أيقونة Menu هنا
import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header({ user, onSidebarToggle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const pathname = usePathname();

    // دالة لتحديد اسم الصفحة الحالية
    const getPageTitle = () => {
        switch (pathname) {
            case '/dashboard':
                return 'لوحة التحكم';
            case '/profile':
                return 'الملف الشخصي';
            case '/settings':
                return 'الإعدادات';
            // يمكنك إضافة المزيد من الصفحات هنا
            default:
                return 'لوحة التحكم';
        }
    };

    // دالة للحصول على الأحرف الأولى من اسم المستخدم
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header 
            className="bg-gray-900 border-b  border-gray-700 shadow-lg sticky top-0 z-50" 
            dir="rtl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 relative">
                    
                    {/* الجانب الأيمن: زر القائمة + الروابط */}
                    <div className="flex items-center gap-4">
                        {/* زر القائمة: يظهر دائماً للتحكم في الشريط الجانبي */}
                        <button 
                            onClick={onSidebarToggle}
                            className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors focus:outline-none"
                            aria-label="Toggle Sidebar"
                        >
                            <Menu size={24} />
                        </button>

                        {/* الروابط: تظهر فقط في الشاشات المتوسطة والكبيرة وتختفي في الموبايل */}
                        <div className="hidden md:flex items-center gap-6 mr-2">
                       
                            <a href="/me" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                                من نحن ؟
                            </a>
                        
                        </div>
                    </div>

                    {/* المنتصف - عنوان الصفحة */}
                    {/* استخدام التموضع المطلق لضمان توسيط العنوان بدقة */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <h1 className="text-lg font-semibold text-white whitespace-nowrap">
                            {getPageTitle()}
                        </h1>
                    </div>

                    {/* الجانب الأيسر - الإشعارات والمستخدم */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition">
                            <Bell size={20} />
                        </button>

                        {/* القائمة المنسدلة للمستخدم */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 rounded-full p-1 pl-2 text-sm hover:bg-gray-700 transition border border-transparent hover:border-gray-600"
                            >
                                <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white font-semibold overflow-hidden">
                                    {user?.image ? (
                                        <img 
                                            src={user.image} 
                                            alt={user?.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        getInitials(user?.name)
                                    )}
                                </div>
                                <ChevronDown 
                                    size={16} 
                                    className={`text-gray-300 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} 
                                />
                            </button>

                            {/* محتوى القائمة المنسدلة */}
                            {dropdownOpen && (
                                <>
                                    {/* غطاء شفاف لإغلاق القائمة عند النقر خارجها */}
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setDropdownOpen(false)}
                                    ></div>
                                    
                                    <div className="absolute left-0 top-full mt-2 w-56 bg-gray-800 rounded-md shadow-xl border border-gray-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-4 py-3 bg-gray-700/50 border-b border-gray-700">
                                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                        </div>

                                        <div className="py-1">
                                            <a href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">
                                                الملف الشخصي
                                            </a>
                                            <a href="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">
                                                الإعدادات
                                            </a>
                                        </div>

                                        <div className="border-t border-gray-700 pt-1 pb-1">
                                            <button
                                                onClick={() => signOut({ callbackUrl: "/login" })}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700/80 hover:text-red-300 transition"
                                            >
                                                <LogOut size={16} className="ml-2" />
                                                تسجيل الخروج
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
}