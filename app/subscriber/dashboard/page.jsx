import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import Branch from '@/models/Branches';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  CheckCircle, 
  Crown, 
  DollarSign, 
  Calculator, 
  Eye,
  TrendingUp,
  Activity,
  BookOpen
} from 'lucide-react';

export default async function SubscriberDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  await connectToDB();

  const subscriberId = session.user.id;

  // جلب إحصائيات المستخدمين
  const users = await User.find({ 
    mainAccountId: subscriberId,
    role: { $in: ['owner', 'manager', 'employee', 'cashier', 'accountant', 'supervisor'] }
  }).lean();

  // جلب إحصائيات الفروع
  const branches = await Branch.find({ userId: subscriberId }).lean();

  // حساب الإحصائيات
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalBranches: branches.length,
    usersByRole: {
      owners: users.filter(u => u.role === 'owner').length,
      managers: users.filter(u => u.role === 'manager').length,
      employees: users.filter(u => u.role === 'employee').length,
      cashiers: users.filter(u => u.role === 'cashier').length,
      accountants: users.filter(u => u.role === 'accountant').length,
      supervisors: users.filter(u => u.role === 'supervisor').length,
    }
  };

  // آخر المستخدمين المضافين
  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getRoleLabel = (role) => {
    const labels = {
      owner: 'مالك',
      manager: 'مدير فرع',
      employee: 'موظف',
      cashier: 'كاشير',
      accountant: 'محاسب',
      supervisor: 'مشرف'
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      owner: Crown,
      manager: Building,
      employee: Users,
      cashier: DollarSign,
      accountant: Calculator,
      supervisor: Eye
    };
    return icons[role] || Users;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutDashboard className="text-blue-500" />
          لوحة التحكم
        </h1>
        <p className="text-gray-400 mt-2">
          نظرة شاملة على مؤسستك وفريق العمل
        </p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.totalUsers}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المستخدمين النشطين</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.activeUsers}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">عدد الفروع</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{stats.totalBranches}</p>
            </div>
            <Building className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 p-6 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">معدل النشاط</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">
                {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
              </p>
            </div>
            <Activity className="text-orange-400" size={32} />
          </div>
        </div>
      </div>

      {/* توزيع المستخدمين حسب الدور */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            توزيع المستخدمين حسب الدور
          </h2>
          
          <div className="space-y-4">
            {Object.entries(stats.usersByRole).map(([role, count]) => {
              const RoleIcon = getRoleIcon(role);
              const percentage = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
              
              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RoleIcon size={20} className="text-gray-400" />
                    <span className="text-gray-300">{getRoleLabel(role)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* آخر المستخدمين المضافين */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Users className="text-green-500" />
            آخر المستخدمين المضافين
          </h2>
          
          {recentUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">لا يوجد مستخدمون بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                
                return (
                  <div key={user._id.toString()} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{user.name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleIcon size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-300">{getRoleLabel(user.role)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">الإجراءات السريعة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/subscriber/guide"
            className="flex items-center gap-3 p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition text-white"
          >
            <BookOpen size={24} />
            <div>
              <h3 className="font-medium">دليل آلية العمل</h3>
              <p className="text-sm opacity-90">تعلم كيفية استخدام النظام</p>
            </div>
          </a>
          
          <a
            href="/subscriber/employees"
            className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white"
          >
            <Users size={24} />
            <div>
              <h3 className="font-medium">إدارة الموظفين</h3>
              <p className="text-sm opacity-90">إضافة وإدارة المستخدمين</p>
            </div>
          </a>
          
          <a
            href="/subscriber/branches"
            className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-white"
          >
            <Building size={24} />
            <div>
              <h3 className="font-medium">إدارة الفروع</h3>
              <p className="text-sm opacity-90">إضافة وإدارة الفروع</p>
            </div>
          </a>
          
          <a
            href="/subscriber/notifications"
            className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition text-white"
          >
            <Activity size={24} />
            <div>
              <h3 className="font-medium">الإشعارات</h3>
              <p className="text-sm opacity-90">متابعة التحديثات</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}