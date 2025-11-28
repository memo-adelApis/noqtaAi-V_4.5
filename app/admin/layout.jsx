import Link from "next/link";
import { LayoutDashboard, Users, Bell, Settings, LogOut, BarChart3 } from "lucide-react";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-l border-gray-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="text-indigo-500" />
            <span>لوحة القيادة</span>
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="نظرة عامة" />
          <NavItem href="/admin/users" icon={<Users size={20} />} label="المشتركين" />
          <NavItem href="/admin/notifications" icon={<Bell size={20} />} label="إرسال إشعارات" />
                    <NavItem href="/admin/notifications/nbox" icon={<Bell size={20} />} label=" إشعارات" />

          <NavItem href="/admin/settings" icon={<Settings size={20} />} label="الإعدادات" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/logout" className="flex items-center gap-3 text-red-400 hover:bg-red-500/10 p-3 rounded-lg transition">
            <LogOut size={20} /> تسجيل خروج
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// مكون فرعي للروابط
function NavItem({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 p-3 rounded-lg transition font-medium">
      {icon}
      {label}
    </Link>
  );
}