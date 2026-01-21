"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
    Home, FileText, PlusCircle, Users, Truck, 
    Building, LogOut, PieChart, ChevronDown, Lock, X, Calendar, Package, Tag 
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
    {
        label: "القائمة الرئيسية",
        items: [
            { href: "/subuser/home", label: "لوحة تحكم الفرع", icon: Home, alwaysShow: true },
            { href: "/subuser/reports", label: "تقرير أداء الفرع", icon: PieChart, alwaysShow: false },
        ]
    },
    {
        label: "الفواتير والأقساط",
        items: [
            { href: "/subuser/invoices/add", label: "إضافة فاتورة", icon: PlusCircle, alwaysShow: false },
            { href: "/subuser/invoices", label: "قائمة الفواتير", icon: FileText, alwaysShow: false },
            { href: "/subuser/installments", label: "الأقساط المتبقية", icon: Calendar, alwaysShow: false },
        ]
    },
    {
        label: "المخزون",
        items: [
            { href: "/subuser/items", label: "الأصناف", icon: Package, alwaysShow: false },
            { href: "/subuser/categories", label: "الفئات", icon: Tag, alwaysShow: false },
        ]
    },
    {
        label: "بيانات الفرع",
        items: [
            { href: "/subuser/customers", label: "عملاء الفرع", icon: Users, alwaysShow: false },
            { href: "/subuser/suppliers", label: "موردي الفرع", icon: Truck, alwaysShow: false },
            { href: "/subuser/stores", label: "مخازن الفرع", icon: Building, alwaysShow: false },
        ]
    }
];

// مكون العنصر الفرعي (تم تحديث الألوان للوضع الداكن)
function SidebarItem({ item, isOpen, onClick }) {
    const pathname = usePathname();
    const isParentActive = item.items.some(subItem => pathname.startsWith(subItem.href));

    return (
        <div className="text-right mb-2">
            <button
                onClick={onClick}
                className={`
                    flex items-center justify-between w-full px-4 py-3 text-sm font-medium
                    transition-colors duration-150 rounded-lg
                    ${isParentActive 
                        ? 'text-blue-400 bg-blue-900/20' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                `}
            >
                <span className="flex items-center gap-2">
                    {item.label}
                </span>
                <ChevronDown 
                    size={16} 
                    className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>
            
            {isOpen && (
                <div className="mt-1 mr-4 space-y-1 border-r-2 border-gray-700 pr-2">
                    {item.items.map(subItem => {
                        const isActive = pathname === subItem.href;
                        return (
                            <Link
                                key={subItem.label}
                                href={subItem.href}
                                className={`
                                    flex items-center w-full px-2 py-2 text-sm font-medium
                                    transition-colors duration-150 rounded-md
                                    ${isActive
                                        ? 'text-blue-400 bg-blue-900/10'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}
                                `}
                            >
                                <subItem.icon size={16} className="ml-2 flex-shrink-0" />
                                <span className="flex-1">{subItem.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// المكون الرئيسي (تم إضافة props التحكم)
export default function Sidebar({ user, isOpen, onClose, isMobile }) {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState('');

    const subscription = user?.subscription || {};
    const isActive = subscription.isActive;
    const isExpired = subscription.endDate ? new Date(subscription.endDate) < new Date() : false;
    const isServiceRunning = isActive && !isExpired;

    useEffect(() => {
        const activeParent = navItems.find(parent => 
            parent.items.some(child => pathname.startsWith(child.href))
        );
        if (activeParent) {
            setOpenMenu(activeParent.label);
        }
    }, [pathname]);

    const handleMenuClick = (label) => {
        setOpenMenu(prev => (prev === label ? '' : label));
    };

    return (
        <aside 
            className={`
                fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-800 shadow-2xl z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "translate-x-full"}
            `}
            dir="rtl"
        >
            {/* رأس القائمة */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
                <Link href="/subuser/home">
                    <span className="text-xl font-bold text-white tracking-wide">
                        نقطة <span className="text-blue-500">AI</span>
                    </span>
                </Link>
                {/* زر الإغلاق للموبايل */}
                {isMobile && (
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* تنبيه الخدمة */}
            {!isServiceRunning && (
                <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-center animate-pulse">
                    <p className="text-xs text-red-400 font-bold mb-1 flex items-center justify-center gap-1">
                        <Lock size={12} /> الخدمة متوقفة
                    </p>
                    <p className="text-[10px] text-gray-500">
                        يرجى مراجعة إدارة المؤسسة.
                    </p>
                </div>
            )}

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map(item => {
                    const visibleItems = item.items.filter(subItem => isServiceRunning || subItem.alwaysShow);
                    if (visibleItems.length === 0) return null;
                    const filteredItem = { ...item, items: visibleItems };

                    return (
                        <SidebarItem 
                            key={item.label}
                            item={filteredItem}
                            isOpen={openMenu === item.label}
                            onClick={() => handleMenuClick(item.label)}
                        />
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="mb-3 px-2">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full mt-1 inline-block border border-blue-800">
                        {user?.role === 'manager' ? 'مدير فرع' : 'موظف'}
                    </span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={18} className="ml-2" />
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    );
}