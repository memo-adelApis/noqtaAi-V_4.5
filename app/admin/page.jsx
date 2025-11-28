import User from "@/models/User";
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import { Users, CreditCard, Building, Activity } from "lucide-react";

async function getStats() {
  const totalUsers = await User.countDocuments({ role: "subscriber" });
  const activeUsers = await User.countDocuments({ "subscription.isActive": true });
  const totalInvoices = await Invoice.countDocuments();
  const totalBranches = await Branch.countDocuments();
  
  return { totalUsers, activeUsers, totalInvoices, totalBranches };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">ملخص الأداء</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المشتركين" value={stats.totalUsers} icon={<Users className="text-blue-500" />} />
        <StatCard title="الاشتراكات النشطة" value={stats.activeUsers} icon={<Activity className="text-green-500" />} />
        <StatCard title="إجمالي الفواتير" value={stats.totalInvoices} icon={<CreditCard className="text-purple-500" />} />
        <StatCard title="الفروع المسجلة" value={stats.totalBranches} icon={<Building className="text-orange-500" />} />
      </div>

      {/* هنا يمكن إضافة رسم بياني مستقبلاً */}
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-64 flex items-center justify-center text-gray-500">
        [مساحة مخصصة للرسم البياني للنمو الشهري]
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-800 rounded-xl">{icon}</div>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">+2.5%</span>
      </div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}