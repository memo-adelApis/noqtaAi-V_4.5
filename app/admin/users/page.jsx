import Link from "next/link";
// تأكد من استيراد الدالة الجديدة toggleSubscriberStatus
import { getSubscribers, toggleSubscriberStatus } from "@/app/actions/adminActions";
import Search from "@/components/ui/Search";
import Pagination from "@/components/ui/Pagination";
import { Eye, UserCheck, UserX, Power } from "lucide-react"; // أضفنا Power

export default async function SubscribersPage({ searchParams }) {
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;

  const { data: subscribers, totalPages } = await getSubscribers({ query, page });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة المشتركين</h1>
      </div>

      <div className="mb-6">
        <Search placeholder="ابحث باسم المشترك أو البريد الإلكتروني..." />
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <table className="w-full text-right">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="p-4">اسم المشترك</th>
              <th className="p-4">الخطة</th>
              <th className="p-4">تاريخ الانتهاء</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {subscribers?.map((sub) => {
               // التحقق من البيانات لتجنب الأخطاء
               const isActive = sub.subscription?.isActive || false;
               const endDate = sub.subscription?.endDate;
               const isExpired = endDate ? new Date(endDate) < new Date() : false;

               return (
              <tr key={sub._id} className="hover:bg-gray-700/50 transition">
                <td className="p-4">
                  <div className="font-bold">{sub.name}</div>
                  <div className="text-sm text-gray-400">{sub.email}</div>
                </td>
                <td className="p-4">
                  <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-sm border border-indigo-500/30">
                    {sub.subscription?.plan || "Trial"}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  {endDate ? new Date(endDate).toLocaleDateString('ar-EG') : "-"}
                  {isExpired && <span className="block text-xs text-red-400 mt-1">(منتهي)</span>}
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
                
                {/* عمود الإجراءات المعدل */}
                <td className="p-4 flex justify-center items-center gap-3">
                  {/* زر عرض التفاصيل */}
                  <Link
                    href={`/admin/users/${sub._id}`}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
                    title="عرض التفاصيل"
                  >
                    <Eye size={16} />
                  </Link>

                  {/* زر التفعيل/الإيقاف (Server Action Form) */}
                  <form action={toggleSubscriberStatus}>
                    <input type="hidden" name="userId" value={sub._id} />
                    <input type="hidden" name="currentStatus" value={isActive.toString()} />
                    
                    <button 
                        type="submit"
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition font-medium ${
                            isActive 
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/50" 
                            : "bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/50"
                        }`}
                        title={isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
                    >
                        <Power size={16} />
                        {isActive ? "إيقاف" : "تفعيل"}
                    </button>
                  </form>
                </td>
              </tr>
            )})}
            {subscribers?.length === 0 && (
                <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">لا يوجد مشتركين مطابقين للبحث</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}