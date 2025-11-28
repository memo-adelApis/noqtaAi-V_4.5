"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Home,
  FileText,
  PlusCircle,
  Users,
  Truck,
  Building,
  PieChart,
} from "lucide-react";

const navItems = [
  { href: "/subuser/home", label: "لوحة التحكم", icon: Home },
  { href: "/subuser/reports", label: "التقارير", icon: PieChart },
  { href: "/subuser/invoices", label: "قائمة الفواتير", icon: FileText },
  { href: "/subuser/invoices/add", label: "إضافة فاتورة", icon: PlusCircle },
  { href: "/subuser/customers", label: "عملاء الفرع", icon: Users },
  { href: "/subuser/suppliers", label: "موردي الفرع", icon: Truck },
  { href: "/subuser/stores", label: "مخازن الفرع", icon: Building },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      dir="rtl"
      className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50 shadow-md"
    >
      <div className="max-w-5xl mx-auto px-4">
        <nav className="flex items-center gap-2 h-14 overflow-x-auto scrollbar-hide py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-[1.05]"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/60 backdrop-blur-sm"
                )}
              >
                <item.icon
                  className={clsx(
                    "ml-2 h-5 w-5 transition-all",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
