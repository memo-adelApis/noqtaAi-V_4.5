import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import Branch from '@/models/Branches';
import { Building, Plus, MapPin, Edit, Trash2, Users } from 'lucide-react';
import Link from 'next/link';

export default async function BranchesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  await connectToDB();

  // جلب فروع المستخدم
  const branches = await Branch.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // تحويل ObjectId إلى string
  const serializedBranches = branches.map(branch => ({
    ...branch,
    _id: branch._id.toString(),
    userId: branch.userId.toString(),
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt.toISOString()
  }));

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building className="text-purple-500" />
            إدارة الفروع
          </h1>
          <p className="text-gray-400 mt-2">
            إدارة وتنظيم فروع مؤسستك
          </p>
        </div>
        
        <Link
          href="/subscriber/branches/add"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          إضافة فرع جديد
        </Link>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الفروع</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{serializedBranches.length}</p>
            </div>
            <Building className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الفروع النشطة</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{serializedBranches.length}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">آخر إضافة</p>
              <p className="text-sm font-medium text-green-400 mt-1">
                {serializedBranches.length > 0 
                  ? new Date(serializedBranches[0].createdAt).toLocaleDateString('ar-EG')
                  : 'لا يوجد'
                }
              </p>
            </div>
            <Plus className="text-green-400" size={32} />
          </div>
        </div>
      </div>

      {/* قائمة الفروع */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {serializedBranches.length === 0 ? (
          // حالة عدم وجود فروع
          <div className="text-center py-16">
            <Building size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">لا توجد فروع مسجلة</h3>
            <p className="text-gray-500 mb-6">ابدأ بإضافة أول فرع لمؤسستك</p>
            <Link
              href="/subscriber/branches/add"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-medium"
            >
              <Plus size={20} />
              إضافة فرع جديد
            </Link>
          </div>
        ) : (
          // قائمة الفروع
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-4 text-gray-300 font-medium">اسم الفرع</th>
                  <th className="p-4 text-gray-300 font-medium">الموقع</th>
                  <th className="p-4 text-gray-300 font-medium">تاريخ الإنشاء</th>
                  <th className="p-4 text-gray-300 font-medium">الحالة</th>
                  <th className="p-4 text-gray-300 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {serializedBranches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-800/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Building className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{branch.name}</h3>
                          <p className="text-sm text-gray-400">ID: {branch._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-sm">
                          {branch.location || 'غير محدد'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <span className="text-sm text-gray-400">
                        {new Date(branch.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        نشط
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/subscriber/branches/${branch._id}/edit`}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                          title="تعديل الفرع"
                        >
                          <Edit size={16} />
                        </Link>
                        
                        <button
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          title="حذف الفرع"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* معلومات إضافية */}
      {serializedBranches.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h3 className="font-medium text-blue-400 mb-3">💡 نصائح لإدارة الفروع:</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• يمكنك إضافة مستخدمين ومخازن لكل فرع بشكل منفصل</li>
            <li>• جميع الفواتير والمعاملات ستكون مرتبطة بالفرع المحدد</li>
            <li>• يمكن تعديل بيانات الفرع في أي وقت دون تأثير على البيانات المرتبطة</li>
            <li>• استخدم أسماء واضحة ومميزة لتسهيل التمييز بين الفروع</li>
          </ul>
        </div>
      )}
    </div>
  );
}