"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, Settings, Building, LayoutDashboard, FileText, 
  Truck, UserCheck, X, StoreIcon, CreditCard, Lock 
} from "lucide-react";

// مكون الرابط الداخلي
function NavLink({ href, icon: Icon, children }) {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname.startsWith(href) && href !== "/");

  return (
    <Link
      href={href}
      className={`
        flex items-center px-4 py-3 mb-1 mx-2 rounded-lg transition-all duration-200 group
        ${isActive 
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }
      `}
    >
      <Icon size={20} className={`ml-3 transition-colors ${isActive ? "text-white" : "group-hover:text-white"}`} />
      <span className="font-medium text-sm">{children}</span>
    </Link>
  );
}

export default function SubscriberSidebar({ isOpen, isMobile, onClose, user }) {
  // 1. منطق التحقق من الاشتراك
  const subscription = user?.subscription || {};
  const isActive = subscription.isActive;
  // نتأكد من صحة التاريخ قبل المقارنة
  const isExpired = subscription.endDate ? new Date(subscription.endDate) < new Date() : false;
  
  // هل الخدمة تعمل؟ (يجب أن يكون نشط وغير منتهي)
  const isServiceRunning = isActive && !isExpired;

  // 2. تعريف هيكل الروابط والأقسام
  const menuGroups = [
    {
      title: "الرئيسية",
      items: [
        { 
          label: "لوحة التحكم", 
          href: "/subscriber/dashboard", 
          icon: LayoutDashboard, 
          alwaysShow: true // يظهر دائماً
        }
      ]
    },
    {
      title: "الإدارة",
      items: [
        { label: "المستخدمين", href: "/subscriber/employees", icon: Users, alwaysShow: false },
        { label: "الفواتير", href: "/subscriber/invoice", icon: FileText, alwaysShow: false },
        { label: "الفروع", href: "/subscriber/dashboard/branches", icon: Building, alwaysShow: false },
        { label: "الموردين", href: "/subscriber/dashboard/suppliers", icon: Truck, alwaysShow: false },
        { label: "مخازني", href: "/subscriber/dashboard/stores/analytics", icon: StoreIcon, alwaysShow: false },
      ]
    },
    {
      title: "المالية والنظام",
      items: [
        { 
          label: "الاشتراك والفوترة", 
          href: "/subscriber/billing", 
          icon: CreditCard, 
          alwaysShow: true, // يظهر دائماً للدفع
          role: "subscriber" // يظهر للمشترك فقط (اختياري)
        },
        { label: "الإعدادات", href: "/subscriber/settings", icon: Settings, alwaysShow: true },
        { label: "الملف الشخصي", href: "/subscriber/profile", icon: UserCheck, alwaysShow: true },
      ]
    }
  ];

  return (
    <aside
      className={`
        fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-800 shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* رأس القائمة */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
        <span className="text-xl font-bold text-white tracking-wide">
          نقطة <span className="text-blue-500">AI</span>
        </span>
        {isMobile && (
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* تنبيه حالة الخدمة (يظهر فقط عند التوقف) */}
      {!isServiceRunning && (
        <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-center animate-pulse">
            <p className="text-xs text-red-400 font-bold mb-1 flex items-center justify-center gap-1">
                <Lock size={12} /> الخدمة مقيدة مؤقتاً
            </p>
            {user?.role === 'subscriber' && (
                <Link href="/subscriber/billing" className="text-[10px] text-white underline hover:text-blue-300 block">
                    اضغط هنا لتجديد الاشتراك
                </Link>
            )}
        </div>
      )}

      {/* روابط القائمة */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {menuGroups.map((group, groupIndex) => {
          // فلترة العناصر داخل كل مجموعة
          const visibleItems = group.items.filter(item => {
            // تحقق من الدور (إذا كان الرابط مخصصاً للمشترك فقط)
            if (item.role && item.role !== user?.role) return false;
            
            // المنطق الرئيسي: إما الخدمة تعمل، أو العنصر مسموح بظهوره دائماً
            return isServiceRunning || item.alwaysShow;
          });

          // إذا لم يتبق عناصر في المجموعة، لا نعرض العنوان
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIndex}>
              <div className="px-4 mt-4 mb-2 first:mt-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.title}
                </p>
              </div>
              
              {visibleItems.map((item, itemIndex) => (
                <NavLink key={itemIndex} href={item.href} icon={item.icon}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* تذييل القائمة */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.charAt(0) || "U"}
           </div>
           <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
           </div>
        </div>
      </div>
    </aside>
  );
}