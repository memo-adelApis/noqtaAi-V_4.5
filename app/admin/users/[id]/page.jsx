import { getSubscriberFullProfile } from "@/app/actions/adminActions";
import Link from "next/link";
import { ArrowRight, Building, Users, CreditCard } from "lucide-react";

export default async function UserProfilePage({ params }) {
  const { id } = await params;
  const { success, data, error } = await getSubscriberFullProfile(id);

  if (!success) {
    return <div className="p-10 text-center text-red-500">حدث خطأ: {error}</div>;
  }

  const { subscriber, branches, subusers } = data;

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      {/* زر العودة */}
      <Link href="/admin/users" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 w-fit">
        <ArrowRight size={20} /> العودة للقائمة
      </Link>

      {/* كارت المعلومات الأساسية */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-bold mb-2">{subscriber.name}</h1>
                <p className="text-gray-400">{subscriber.email}</p>
                <div className="mt-4 flex gap-4">
                     <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-500 block">تاريخ التسجيل</span>
                        <span className="font-mono text-sm">{new Date(subscriber.createdAt).toLocaleDateString('ar-EG')}</span>
                     </div>
                     <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-500 block">حالة الاشتراك</span>
                        <span className={subscriber.subscription.isActive ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                            {subscriber.subscription.isActive ? "نشط" : "غير نشط"}
                        </span>
                     </div>
                </div>
            </div>
            {/* تفاصيل الاشتراك */}
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl min-w-[250px]">
                <h3 className="flex items-center gap-2 font-bold text-indigo-300 mb-3">
                    <CreditCard size={18} /> تفاصيل الباقة
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">الخطة:</span>
                        <span>{subscriber.subscription.plan}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">ينتهي في:</span>
                        <span className="font-mono text-yellow-300">
                            {subscriber.subscription.endDate ? new Date(subscriber.subscription.endDate).toLocaleDateString('ar-EG') : "غير محدد"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* قسم الفروع */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-700/50 border-b border-gray-700 flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2">
                    <Building size={20} className="text-blue-400" /> الفروع ({branches.length})
                </h2>
            </div>
            <div className="p-4">
                {branches.length > 0 ? (
                    <ul className="space-y-2">
                        {branches.map(branch => (
                            <li key={branch._id} className="p-3 bg-gray-900 rounded-lg flex justify-between items-center">
                                <span>{branch.name}</span>
                                <span className="text-xs text-gray-500">{branch.address || "لا يوجد عنوان"}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center py-4">لا يوجد فروع مسجلة</p>
                )}
            </div>
        </div>

        {/* قسم المستخدمين الفرعيين (الموظفين) */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 bg-gray-700/50 border-b border-gray-700 flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2">
                    <Users size={20} className="text-purple-400" /> الموظفين والفرعيين ({subusers.length})
                </h2>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
                 {subusers.length > 0 ? (
                    <table className="w-full text-right text-sm">
                        <thead className="text-gray-400 border-b border-gray-700">
                            <tr>
                                <th className="pb-2">الاسم</th>
                                <th className="pb-2">الوظيفة (Role)</th>
                                <th className="pb-2">الفرع</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {subusers.map(u => (
                                <tr key={u._id}>
                                    <td className="py-3 font-medium">{u.name}</td>
                                    <td className="py-3 text-gray-400">{u.role}</td>
                                    <td className="py-3 text-blue-300">{u.branchName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 text-center py-4">لا يوجد مستخدمين فرعيين</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}