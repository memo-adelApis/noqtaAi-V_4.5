"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Crown, LayoutDashboard, FileText, Building, Package, 
  TrendingUp, Users, DollarSign, Settings, UserCheck, 
  X, BarChart3, ShoppingCart, Truck, AlertCircle, Bell, Calendar, PieChart
} from "lucide-react";

// مكون الرابط الداخلي
function NavLink({ href, icon: Icon, children }) {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname.startsWith(href) && href !== "/owner");

  return (
    <Link
      href={href}
      className={`
        flex items-center px-4 py-3 mb-1 mx-2 rounded-lg transition-all duration-200 group
        ${isActive 
          ? "bg-yellow-600 text-white shadow-md shadow-yellow-500/20" 
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }
      `}
    >
      <Icon size={20} className={`ml-3 transition-colors ${isActive ? "text-white" : "group-hover:text-white"}`} />
      <span className="font-medium text-sm">{children}</span>
    </Link>
  );
}

export default function OwnerSidebar({ isOpen, isMobile, onClose, user }) {
  // هيكل الروابط والأقسام
  const menuGroups = [
    {
      title: "الرئيسية",
      items: [
        { 
          label: "لوحة المالك", 
          href: "/owner", 
          icon: Crown
        }
      ]
    },
    {
      title: "التقارير المالية",
      items: [
        { label: "الفواتير", href: "/owner/invoices", icon: FileText },
        { label: "الأقساط المتبقية", href: "/owner/installments", icon: Calendar },
        { label: "الإيرادات", href: "/owner/revenues", icon: DollarSign },
        { label: "المصروفات", href: "/owner/expenses", icon: ShoppingCart },
        { label: "قائمة الأرباح والخسائر", href: "/owner/profit-loss", icon: PieChart },
        { label: "التحليلات المتقدمة", href: "/owner/analytics", icon: BarChart3 },
      ]
    },
    {
      title: "الإدارة",
      items: [
        { label: "الفروع", href: "/owner/dashboard/branches", icon: Building },
        { label: "المنتجات", href: "/owner/dashboard/products", icon: Package },
        { label: "الموردين", href: "/owner/dashboard/suppliers", icon: Truck },
        { label: "العملاء", href: "/owner/dashboard/customers", icon: Users },
      ]
    },
    {
      title: "التقارير",
      items: [
        { label: "التقرير المالي المفصل", href: "/owner/financial-report", icon: BarChart3 },
        { label: "التقرير المحاسبي الدقيق", href: "/owner/financial-report-detailed", icon: PieChart },
        { label: "المؤشرات والتنبؤات", href: "/owner/financial-insights", icon: TrendingUp },
        { label: "تقارير المتجر الإلكتروني", href: "/owner/shop-reports", icon: ShoppingCart },
        { label: "تقرير الأرباح", href: "/owner/reports/profit", icon: DollarSign },
        { label: "تقرير المخزون", href: "/owner/reports/inventory", icon: Package },
        { label: "تقرير الفروع", href: "/owner/reports/branches", icon: Building },
        { label: "المستحقات", href: "/owner/reports/outstanding", icon: AlertCircle },
      ]
    },
    {
      title: "أدوات التطوير",
      items: [
        { label: "اختبار الفواتير", href: "/owner/test-invoice", icon: Settings },
        { label: "الإشعارات", href: "/owner/notifications", icon: Bell },
        { label: "الإعدادات", href: "/owner/settings", icon: Settings },
        { label: "الملف الشخصي", href: "/owner/profile", icon: UserCheck },
      ]
    }
  ];

  return (
    <aside
      className={`
        fixed top-0 right-0 h-full w-72 bg-gray-900 border-l border-gray-800 shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* رأس القائمة */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800 bg-gradient-to-l from-yellow-900/20 to-transparent">
        <div className="flex items-center gap-2">
          <Crown className="text-yellow-500" size={24} />
          <span className="text-xl font-bold text-white tracking-wide">
            لوحة <span className="text-yellow-500">المالك</span>
          </span>
        </div>
        {/* زر الإغلاق - يظهر دائماً */}
        <button 
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="إغلاق القائمة"
        >
          <X size={20} />
        </button>
      </div>

      {/* شارة المالك */}
      <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border border-yellow-500/30 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Crown className="text-yellow-500" size={16} />
          <p className="text-xs text-yellow-400 font-bold">حساب المالك</p>
        </div>
        <p className="text-[10px] text-gray-400">
          صلاحيات كاملة لإدارة المؤسسة
        </p>
      </div>

      {/* روابط القائمة - مع التمرير */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="px-4 mt-4 mb-2 first:mt-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.title}
              </p>
            </div>
            
            {group.items.map((item, itemIndex) => (
              <NavLink key={itemIndex} href={item.href} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* تذييل القائمة */}
      <div className="p-4 border-t border-gray-800 flex-shrink-0">
        <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
            {user?.name?.charAt(0) || "M"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-yellow-400 truncate">مالك المؤسسة</p>
          </div>
        </div>
      </div>

      {/* CSS للـ scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4B5563;
        }
      `}</style>
    </aside>
  );
}