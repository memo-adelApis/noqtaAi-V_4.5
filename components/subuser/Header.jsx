"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Bell, ChevronDown, LogOut, Menu, User as UserIcon, Settings, Wallet } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import NotificationCenter from '@/components/ui/NotificationCenter';

export default function Header({ user, onSidebarToggle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const pathname = usePathname();

    // دالة ذكية لتحديد عنوان الصفحة بناءً على المسار
    const getPageTitle = () => {
        if (pathname.includes('/billing')) return 'الاشتراك والفوترة';
        if (pathname.includes('/invoices')) return 'إدارة الفواتير';
        if (pathname.includes('/customers')) return 'العملاء';
        if (pathname.includes('/suppliers')) return 'الموردين';
        if (pathname.includes('/employees')) return 'المستخدمين';
        if (pathname.includes('/settings')) return 'إعدادات النظام';
        if (pathname.includes('/profile')) return 'الملف الشخصي';
        if (pathname.includes('/dashboard')) return 'لوحة القيادة';
        return 'نقطة AI';
    };

    // دالة للحصول على الأحرف الأولى
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // ترجمة الدور للعربية
    const userRole = {
        subscriber: "مشترك",
        manager: "مدير فرع",
        employee: "موظف",
        admin: "مسؤول النظام",
        owner: "مالك"
    }[user?.role] || user?.role;

    return (
        <header 
            className="bg-[#14161f]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 transition-all duration-300" 
            dir="rtl"
        >
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 relative">
                    
                    {/* الجانب الأيمن: القائمة والشعار */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onSidebarToggle}
                            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none"
                            aria-label="Toggle Sidebar"
                        >
                            <Menu size={24} />
                        </button>

                        {/* شعار يظهر في الهيدر أيضاً لتعزيز الهوية */}
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-lg font-bold text-white tracking-wide">
                                نقطة <span className="text-indigo-500">AI</span>
                            </span>
                        </div>
                    </div>

                    {/* المنتصف: عنوان الصفحة */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <h1 className="text-lg font-bold text-white/90 whitespace-nowrap tracking-wide">
                            {getPageTitle()}
                        </h1>
                    </div>

                    {/* الجانب الأيسر: الإجراءات والمستخدم */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        
                        {/* زر الإشعارات */}
                        <NotificationCenter />

                        {/* فاصل عمودي */}
                        <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>

                        {/* قائمة المستخدم */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-3 rounded-full p-1 pl-2 hover:bg-gray-800/50 transition border border-transparent hover:border-gray-700"
                            >
                                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-900/20 ring-2 ring-[#14161f]">
                                    {user?.image ? (
                                        <img 
                                            src={user.image} 
                                            alt={user?.name} 
                                            className="w-full h-full rounded-full object-cover" 
                                        />
                                    ) : (
                                        getInitials(user?.name)
                                    )}
                                </div>
                                
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium text-white leading-none mb-1">{user?.name?.split(' ')[0]}</p>
                                    <p className="text-[10px] text-gray-400 font-medium leading-none">{userRole}</p>
                                </div>

                                <ChevronDown 
                                    size={16} 
                                    className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} 
                                />
                            </button>

                            {/* القائمة المنسدلة */}
                            {dropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setDropdownOpen(false)}
                                    ></div>
                                    
                                    <div className="absolute left-0 top-full mt-3 w-60 bg-[#1c1d24] rounded-xl shadow-2xl border border-gray-800 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                                        
                                        {/* رأس القائمة */}
                                        <div className="px-5 py-4 bg-[#23252e] border-b border-gray-800">
                                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                {userRole}
                                            </span>
                                        </div>

                                        {/* روابط القائمة */}
                                        <div className="py-2">
                                            <Link href="/subscriber/profile" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group">
                                                <UserIcon size={16} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
                                                الملف الشخصي
                                            </Link>
                                            <Link href="/subscriber/billing" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group">
                                                <Wallet size={16} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
                                                الاشتراك والفوترة
                                            </Link>
                                            <Link href="/subscriber/settings" className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group">
                                                <Settings size={16} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
                                                الإعدادات
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-800 pt-1 pb-1 my-1">
                                            <button
                                                onClick={() => signOut({ callbackUrl: "/login" })}
                                                className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                            >
                                                <LogOut size={16} />
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