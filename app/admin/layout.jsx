import AdminSidebar from "@/components/admin/AdminSidebar"; // استدعاء المكون الجديد

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white" dir="rtl">
      
      {/* استدعاء الشريط الجانبي (Client Component) */}
      <AdminSidebar />

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 md:pt-8">
        {children}
      </main>
    </div>
  );
}