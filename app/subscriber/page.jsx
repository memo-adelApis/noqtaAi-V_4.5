import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from "@/models/User";
import Branch from "@/models/Branches";
import dbConnect from '@/app/lib/dbConnect';
import { Users, Building, Calendar, Settings, CreditCard, Plus, BookOpen } from "lucide-react";
import { redirect } from 'next/navigation';

export default async function SubscriberDashboard() {
  // الاتصال بقاعدة البيانات
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  
//   if (!session || session.user.role !== 'subscriber') {
//     redirect('/login');
//   }

  const userId = session.user.id;
  
  // جلب بيانات المستخدم
  const user = await User.findById(userId);
  
  // جلب الفروع
  const branches = await Branch.find({ userId }).lean();
  
  // جلب المستخدمين الفرعيين
  const subUsers = await User.find({ 
    mainAccountId: userId,
    role: { $in: ['manager', 'employee'] }
  }).populate('branchId', 'name').lean();

  // حساب الأيام المتبقية في الاشتراك
  const daysRemaining = Math.ceil((new Date(user.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24));
  
  const getSubscriptionStatusBadge = (status) => {
    const badges = {
      trial: { color: 'bg-blue-500', text: 'فترة تجريبية' },
      active: { color: 'bg-green-500', text: 'نشط' },
      expired: { color: 'bg-red-500', text: 'منتهي' },
      suspended: { color: 'bg-gray-500', text: 'معلق' }
    };
    
    const badge = badges[status] || badges.trial;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getSubscriptionTypeLabel = (type) => {
    const labels = {
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي'
    };
    return labels[type] || 'غير محدد';
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-blue-500" />
          لوحة المشترك - {user.name}
        </h1>
        <p className="text-gray-400 mt-2">
          إدارة اشتراكك وفروعك ومستخدميك
        </p>
      </div>

      {/* تحذير انتهاء الاشتراك */}
      {daysRemaining <= 7 && daysRemaining > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-yellow-500" size={20} />
            <h3 className="font-medium text-yellow-400">تنبيه: اشتراكك ينتهي قريباً</h3>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            سينتهي اشتراكك خلال {daysRemaining} أيام. يرجى تجديد الاشتراك لتجنب انقطاع الخدمة.
          </p>
          <a 
            href="/subscriber/subscription" 
            className="inline-block mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            تجديد الاشتراك الآن
          </a>
        </div>
      )}

      {daysRemaining <= 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-red-500" size={20} />
            <h3 className="font-medium text-red-400">انتهت صلاحية اشتراكك</h3>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك للمتابعة.
          </p>
          <a 
            href="/subscriber/subscription" 
            className="inline-block mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            تجديد الاشتراك
          </a>
        </div>
      )}

      {/* معلومات الاشتراك */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">حالة الاشتراك</p>
              <div className="mt-2">
                {getSubscriptionStatusBadge(user.subscriptionStatus)}
              </div>
            </div>
            <CreditCard className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">نوع الاشتراك</p>
              <p className="text-lg font-semibold text-white mt-1">
                {getSubscriptionTypeLabel(user.subscriptionType)}
              </p>
            </div>
            <Settings className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الأيام المتبقية</p>
              <p className={`text-lg font-semibold mt-1 ${
                daysRemaining > 7 ? 'text-green-400' : 
                daysRemaining > 0 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
              </p>
            </div>
            <Calendar className={
              daysRemaining > 7 ? 'text-green-500' : 
              daysRemaining > 0 ? 'text-yellow-500' : 'text-red-500'
            } size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">تاريخ الانتهاء</p>
              <p className="text-lg font-semibold text-white mt-1">
                {new Date(user.subscriptionEnd).toLocaleDateString('en-GB')}
              </p>
            </div>
            <Calendar className="text-gray-500" size={24} />
          </div>
        </div>
      </div>

      {/* إدارة الفروع والمستخدمين */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* الفروع */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building className="text-purple-500" />
              الفروع ({branches.length})
            </h2>
            <a 
              href="/subscriber/branches/add"
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition"
            >
              <Plus size={16} />
              إضافة فرع
            </a>
          </div>
          
          <div className="space-y-3">
            {branches.length > 0 ? (
              branches.map((branch) => (
                <div key={branch._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-gray-400">{branch.location || 'لا يوجد موقع محدد'}</p>
                  </div>
                  <a 
                    href={`/subscriber/branches/${branch._id}`}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    إدارة
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Building className="mx-auto mb-3" size={48} />
                <p>لم تقم بإضافة أي فروع بعد</p>
                <a 
                  href="/subscriber/branches/add"
                  className="inline-block mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  إضافة فرع جديد
                </a>
              </div>
            )}
          </div>
        </div>

        {/* المستخدمين */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="text-blue-500" />
              المستخدمين ({subUsers.length})
            </h2>
            <a 
              href="/subscriber/users/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition"
            >
              <Plus size={16} />
              إضافة مستخدم
            </a>
          </div>
          
          <div className="space-y-3">
            {subUsers.length > 0 ? (
              subUsers.map((subUser) => (
                <div key={subUser._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{subUser.name}</p>
                    <p className="text-sm text-gray-400">
                      {subUser.role === 'manager' ? 'مدير' : 'موظف'} - 
                      {subUser.branchId?.name || 'غير مخصص لفرع'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      subUser.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <a 
                      href={`/subscriber/users/${subUser._id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      إدارة
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="mx-auto mb-3" size={48} />
                <p>لم تقم بإضافة أي مستخدمين بعد</p>
                <a 
                  href="/subscriber/users/add"
                  className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  إضافة مستخدم جديد
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">الإدارة السريعة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <a 
            href="/subscriber/guide" 
            className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition flex items-center gap-3 text-white"
          >
            <BookOpen size={20} />
            <span>دليل آلية العمل</span>
          </a>
          
          <a 
            href="/subscriber/subscription" 
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <CreditCard className="text-green-500" size={20} />
            <span>إدارة الاشتراك</span>
          </a>
          
          <a 
            href="/subscriber/branches" 
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <Building className="text-purple-500" size={20} />
            <span>إدارة الفروع</span>
          </a>
          
          <a 
            href="/subscriber/users" 
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <Users className="text-blue-500" size={20} />
            <span>إدارة المستخدمين</span>
          </a>
          
          <a 
            href="/subscriber/settings" 
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <Settings className="text-gray-500" size={20} />
            <span>الإعدادات</span>
          </a>
        </div>
      </div>
    </div>
  );
}