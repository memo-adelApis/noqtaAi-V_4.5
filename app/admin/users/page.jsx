import Link from "next/link";
import { getSubscribers, toggleSubscriberStatus } from "@/app/actions/adminActions";
import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";
import { 
  Eye, 
  UserCheck, 
  UserX, 
  Power, 
  Users, 
  FileText, 
  Building, 
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";

export default async function SubscribersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || "";
  const page = Number(resolvedSearchParams?.page) || 1;

  await connectToDB();

  // جلب المشتركين مع تفاصيل إضافية
  const { data: subscribers, totalPages } = await getSubscribers({ query, page });

  // جلب إحصائيات إضافية لكل مشترك
  const subscribersWithStats = await Promise.all(
    subscribers.map(async (sub) => {
      const invoiceCount = await Invoice.countDocuments({ userId: sub._id });
      const branchCount = await Branch.countDocuments({ userId: sub._id });
      
      return {
        ...sub,
        invoiceCount,
        branchCount,
        invoiceLimit: sub.subscription?.invoiceLimit || 100, // حد افتراضي
      };
    })
  );

  // إحصائيات عامة
  const totalSubscribers = await User.countDocuments({ role: 'subscriber' });
  const activeSubscribers = await User.countDocuments({ 
    role: 'subscriber',
    'subscription.isActive': true 
  });
  const totalInvoices = await Invoice.countDocuments();
  const totalBranches = await Branch.countDocuments();

  // بيانات النمو الشهري (آخر 6 أشهر)
  const monthlyGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const newUsers = await User.countDocuments({
      role: 'subscriber',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    monthlyGrowth.push({
      month: date.toLocaleDateString('ar-EG', { month: 'short' }),
      users: newUsers
    });
  }

  const maxUsers = Math.max(...monthlyGrowth.map(m => m.users), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-blue-500" />
            إدارة المشتركين
          </h1>
          <p className="text-gray-400 mt-2">
            متابعة وإدارة جميع المشتركين في المنصة
          </p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المشتركين</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalSubscribers}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المشتركين النشطين</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{activeSubscribers}</p>
            </div>
            <UserCheck className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{totalInvoices}</p>
            </div>
            <FileText className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 p-6 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الفروع</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{totalBranches}</p>
            </div>
            <Building className="text-orange-400" size={32} />
          </div>
        </div>
      </div>

      {/* بياني النمو الشهري */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="text-green-500" />
          النمو الشهري للمشتركين
        </h2>
        
        <div className="flex items-end justify-between h-64 gap-4">
          {monthlyGrowth.map((data, index) => {
            const height = (data.users / maxUsers) * 200;
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="text-sm font-medium text-gray-300">
                  {data.users}
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-blue-300"
                  style={{ height: `${Math.max(height, 8)}px` }}
                  title={`${data.month}: ${data.users} مشترك جديد`}
                ></div>
                <div className="text-xs text-gray-500">{data.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* البحث */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <Search placeholder="ابحث باسم المشترك أو البريد الإلكتروني..." />
      </div>

      {/* جدول المشتركين المحسن */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-gray-300">المشترك</th>
                <th className="p-4 text-gray-300">الخطة</th>
                <th className="p-4 text-gray-300">الفواتير</th>
                <th className="p-4 text-gray-300">الفروع</th>
                <th className="p-4 text-gray-300">تاريخ الانتهاء</th>
                <th className="p-4 text-gray-300">الحالة</th>
                <th className="p-4 text-gray-300 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {subscribersWithStats?.map((sub) => {
                const isActive = sub.subscription?.isActive || false;
                const endDate = sub.subscription?.endDate;
                const isExpired = endDate ? new Date(endDate) < new Date() : false;
                const invoiceUsage = (sub.invoiceCount / sub.invoiceLimit) * 100;
                const isNearLimit = invoiceUsage > 80;

                return (
                  <tr key={sub._id} className="hover:bg-gray-800/50 transition">
                    <td className="p-4">
                      <div className="font-bold">{sub.name}</div>
                      <div className="text-sm text-gray-400">{sub.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        انضم في {new Date(sub.createdAt).toLocaleDateString('ar-EG')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-sm border border-indigo-500/30">
                        {sub.subscription?.plan || "Trial"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-purple-400" />
                        <div>
                          <div className={`font-semibold ${isNearLimit ? 'text-red-400' : 'text-white'}`}>
                            {sub.invoiceCount} / {sub.invoiceLimit}
                          </div>
                          <div className="w-16 bg-gray-700 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                isNearLimit ? 'bg-red-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${Math.min(invoiceUsage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        {isNearLimit && (
                          <AlertTriangle size={14} className="text-red-400" title="قريب من الحد الأقصى" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-orange-400" />
                        <span className="font-semibold">{sub.branchCount}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {endDate ? (
                        <div>
                          <div>{new Date(endDate).toLocaleDateString('ar-EG')}</div>
                          {isExpired && <span className="text-xs text-red-400 mt-1 block">(منتهي)</span>}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="p-4">
                      {isActive ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm font-bold bg-green-400/10 px-2 py-1 rounded w-fit">
                          <UserCheck size={16} /> نشط
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-sm font-bold bg-red-400/10 px-2 py-1 rounded w-fit">
                          <UserX size={16} /> متوقف
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        {/* زر عرض التفاصيل */}
                        <Link
                          href={`/admin/users/${sub._id}`}
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg text-sm transition"
                          title="عرض التفاصيل"
                        >
                          <Eye size={14} />
                        </Link>

                        {/* زر التفعيل/الإيقاف */}
                        <form action={toggleSubscriberStatus}>
                          <input type="hidden" name="userId" value={sub._id} />
                          <input type="hidden" name="currentStatus" value={isActive.toString()} />
                          
                          <button 
                            type="submit"
                            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm transition font-medium ${
                              isActive 
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/50" 
                                : "bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/50"
                            }`}
                            title={isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
                          >
                            <Power size={14} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {subscribersWithStats?.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    لا يوجد مشتركين مطابقين للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}