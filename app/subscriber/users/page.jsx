import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import User from "@/models/User";
import Branch from "@/models/Branches";
import { Users, User as UserIcon, Building, CheckCircle } from "lucide-react";
import dbConnect from '@/app/lib/dbConnect';
import UserActionsButtons from '@/components/subscriber/UserActionsButtons';

export default async function SubscriberUsersPage() {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  const subscriberId = session.user.id;

  // جلب المستخدمين الفرعيين التابعين للمشترك فقط
  const users = await User.find({ 
    mainAccountId: subscriberId,
    role: { $in: ['owner', 'manager', 'employee'] }
  })
    .populate('branchId', 'name')
    .select('name email role branchId isActive createdAt')
    .sort({ createdAt: -1 })
    .lean();

  // جلب الفروع التابعة للمشترك
  const branches = await Branch.find({ userId: subscriberId })
    .select('_id name')
    .lean();

  const getRoleLabel = (role) => {
    const labels = {
      owner: 'مالك',
      manager: 'مدير',
      employee: 'موظف'
    };
    return labels[role] || role;
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">معلق</span>;
    }
    
    return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">نشط</span>;
  };

  // إحصائيات سريعة
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    owners: users.filter(u => u.role === 'owner').length,
    managers: users.filter(u => u.role === 'manager').length,
    employees: users.filter(u => u.role === 'employee').length
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-blue-500" />
          إدارة المستخدمين
        </h1>
        <p className="text-gray-400 mt-2">
          إدارة شاملة لجميع المستخدمين والمشتركين
        </p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المالكون</p>
              <p className="text-2xl font-bold text-purple-400">{stats.owners}</p>
            </div>
            <UserIcon className="text-purple-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المدراء</p>
              <p className="text-2xl font-bold text-green-400">{stats.managers}</p>
            </div>
            <Building className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الموظفون</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.employees}</p>
            </div>
            <Users className="text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">النشطون</p>
              <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
            </div>
            <CheckCircle className="text-blue-400" size={24} />
          </div>
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">قائمة المستخدمين</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">المستخدم</th>
                <th className="text-right p-4 text-gray-300">الدور</th>
                <th className="text-right p-4 text-gray-300">الفرع</th>
                <th className="text-right p-4 text-gray-300">الحالة</th>
                <th className="text-right p-4 text-gray-300">تاريخ التسجيل</th>
                <th className="text-center p-4 text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                return (
                  <tr key={user._id.toString()} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {user.branchId?.name || 'غير محدد'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4">
                      <UserActionsButtons 
                        userId={user._id.toString()} 
                        isActive={user.isActive}
                        user={{
                          _id: user._id.toString(),
                          name: user.name,
                          email: user.email,
                          role: user.role,
                          branchId: user.branchId?._id?.toString() || user.branchId?.toString() || ''
                        }}
                        branches={branches.map(b => ({
                          _id: b._id.toString(),
                          name: b.name
                        }))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}