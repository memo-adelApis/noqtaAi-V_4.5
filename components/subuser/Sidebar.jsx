// المسار: components/subuser/Sidebar.jsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
    Home, FileText, PlusCircle, Users, Truck, 
    Building, LogOut, PieChart, ChevronDown 
} from 'lucide-react';
import { signOut } from 'next-auth/react';

// 1. تعريف هيكل الروابط (لتسهيل التعديل)
const navItems = [
    {
        label: "القائمة الرئيسية",
        items: [
            { href: "/subuser/home", label: "لوحة تحكم الفرع", icon: Home },
            { href: "/subuser/reports", label: "تقرير أداء الفرع", icon: PieChart },
        ]
    },
    {
        label: "الفواتير",
        items: [
            { href: "/subuser/invoices/add", label: "إضافة فاتورة", icon: PlusCircle },
            { href: "/subuser/invoices", label: "قائمة الفواتير", icon: FileText },
        ]
    },
    {
        label: "بيانات الفرع",
        items: [
            { href: "/subuser/customers", label: "عملاء الفرع", icon: Users },
            { href: "/subuser/suppliers", label: "موردي الفرع", icon: Truck },
            { href: "/subuser/stores", label: "مخازن الفرع", icon: Building },
        ]
    }
];

// 2. المكون الفرعي للروابط (الذي يعالج منطق الفتح/الإغلاق)
function SidebarItem({ item, isOpen, onClick }) {
    const pathname = usePathname();
    
    // هل هذا الرابط (أو أحد أبنائه) نشط؟
    const isParentActive = item.items.some(subItem => pathname.startsWith(subItem.href));

    // للروابط المتداخلة (الأب)
    return (
        <div className="text-right">
            {/* زر القائمة الرئيسية (الأب) */}
            <button
                onClick={onClick}
                className={`
                    flex items-center justify-between w-full px-4 py-3 text-sm font-medium
                    transition-colors duration-150 rounded-lg
                    ${isParentActive 
                        ? 'text-blue-700 bg-blue-50' // لون الأب النشط
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                `}
            >
                <span className="flex items-center">
                    {/* (يمكن إضافة أيقونة للمجموعة هنا إن أردت، مثل: item.icon) */}
                    {item.label}
                </span>
                <ChevronDown 
                    size={16} 
                    className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>
            
            {/* القائمة الفرعية (الأبناء) */}
            {isOpen && (
                <div className="mt-1 mr-4 space-y-1 border-r-2 border-gray-200">
                    {item.items.map(subItem => {
                        const isActive = pathname === subItem.href;
                        return (
                            <Link
                                key={subItem.label}
                                href={subItem.href}
                                className={`
                                    flex items-center w-full pr-4 py-2 text-sm font-medium
                                    transition-colors duration-150
                                    relative
                                    ${isActive
                                        ? 'text-blue-600 font-semibold' // لون الرابط النشط
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
                                `}
                            >
                                {/* الخط الأزرق للرابط النشط */}
                                {isActive && <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-l-full"></div>}
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

// 3. المكون الرئيسي للشريط الجانبي
export default function Sidebar() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState('');

    // الفتح التلقائي للقائمة عند تحميل الصفحة
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
            className="w-64 bg-white border-l border-gray-200 shadow-lg h-screen flex flex-col flex-shrink-0 hidden md:flex" 
            dir="rtl"
        >
            <div className="flex items-center justify-center h-16 border-b">
                <Link href="/subuser/home">
                    <span className="text-2xl font-bold text-blue-600">لوجـو</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map(item => (
                    <SidebarItem 
                        key={item.label}
                        item={item}
                        isOpen={openMenu === item.label}
                        onClick={() => handleMenuClick(item.label)}
                    />
                ))}
            </nav>

            <div className="flex-grow"></div> 
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                >
                    <LogOut size={20} className="ml-3" />
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    );
}