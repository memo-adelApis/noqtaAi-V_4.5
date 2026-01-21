import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import { CreditCard, DollarSign, TrendingUp, Users, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectToDB();

  // جلب إحصائيات المدفوعات
  const subscribers = await User.find({ role: 'subscriber' }).lean();
  
  const activeSubscriptions = subscribers.filter(user => 
    user.subscription?.isActive && 
    user.subscription?.endDate && 
    new Date(user.subscription.endDate) > new Date()
  );

  const expiredSubscriptions = subscribers.filter(user => 
    user.subscription?.endDate && 
    new Date(user.subscription.endDate) <= new Date()
  );

  const pendingRenewals = subscribers.filter(user => 
    !user.subscription?.isActive || 
    (user.subscription?.endDate && new Date(user.subscription.endDate) <= new Date())
  );

  // حساب الإيرادات الشهرية (تقديرية بناءً على الاشتراكات النشطة)
  const monthlyRevenue = activeSubscriptions.length * 100; // افتراض 100 جنيه شهرياً

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="text-green-500" />
            إدارة المدفوعات
          </h1>
          <p className="text-gray-400 mt-2">
            متابعة الاشتراكات والمدفوعات
          </p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الاشتراكات النشطة</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{activeSubscriptions.length}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الاشتراكات المنتهية</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{expiredSubscriptions.length}</p>
            </div>
            <XCircle className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 p-6 rounded-xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">في انتظار التجديد</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{pendingRenewals.length}</p>
            </div>
            <Clock className="text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الإيرادات الشهرية</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{formatCurrency(monthlyRevenue)}</p>
            </div>
            <DollarSign className="text-blue-400" size={32} />
          </div>
        </div>
      </div>

      {/* جدول الاشتراكات */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="text-indigo-500" />
            حالة الاشتراكات
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-gray-300">المشترك</th>
                <th className="p-4 text-gray-300">الخطة</th>
                <th className="p-4 text-gray-300">تاريخ البداية</th>
                <th className="p-4 text-gray-300">تاريخ الانتهاء</th>
                <th className="p-4 text-gray-300">الحالة</th>
                <th className="p-4 text-gray-300">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {subscribers.map((user) => {
                const subscription = user.subscription;
                const isActive = subscription?.isActive || false;
                const endDate = subscription?.endDate;
                const startDate = subscription?.startDate;
                const isExpired = endDate ? new Date(endDate) < new Date() : false;
                
                let statusColor = 'text-gray-400';
                let statusText = 'غير محدد';
                let statusIcon = <Clock size={16} />;
                
                if (isActive && !isExpired) {
                  statusColor = 'text-green-400';
                  statusText = 'نشط';
                  statusIcon = <CheckCircle size={16} />;
                } else if (isExpired) {
                  statusColor = 'text-red-400';
                  statusText = 'منتهي';
                  statusIcon = <XCircle size={16} />;
                } else {
                  statusColor = 'text-yellow-400';
                  statusText = 'معلق';
                  statusIcon = <Clock size={16} />;
                }

                return (
                  <tr key={user._id} className="hover:bg-gray-800/50 transition">
                    <td className="p-4">
                      <div className="font-bold">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-sm border border-indigo-500/30">
                        {subscription?.plan || "Trial"}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {startDate ? formatDate(startDate) : "-"}
                    </td>
                    <td className="p-4 text-sm">
                      {endDate ? formatDate(endDate) : "-"}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 ${statusColor} text-sm font-bold`}>
                        {statusIcon} {statusText}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-green-400">
                      {isActive ? formatCurrency(100) : "-"}
                    </td>
                  </tr>
                );
              })}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    لا يوجد مشتركين حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* الاشتراكات المنتهية قريباً */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Calendar className="text-orange-500" />
          اشتراكات تنتهي خلال 7 أيام
        </h2>
        
        <div className="space-y-4">
          {subscribers
            .filter(user => {
              const endDate = user.subscription?.endDate;
              if (!endDate) return false;
              const daysUntilExpiry = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
              return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
            })
            .map((user) => {
              const endDate = user.subscription.endDate;
              const daysUntilExpiry = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={user._id} className="bg-orange-900/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-bold">
                        {daysUntilExpiry} {daysUntilExpiry === 1 ? 'يوم' : 'أيام'} متبقية
                      </p>
                      <p className="text-sm text-gray-400">
                        ينتهي في {formatDate(endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          {subscribers.filter(user => {
            const endDate = user.subscription?.endDate;
            if (!endDate) return false;
            const daysUntilExpiry = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
          }).length === 0 && (
            <p className="text-center text-gray-500 py-8">
              لا توجد اشتراكات تنتهي خلال الأسبوع القادم
            </p>
          )}
        </div>
      </div>
    </div>
  );
}