import Payment from "@/models/Payment";
import User from "@/models/User";
import { connectToDB } from "@/utils/database";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default async function PaymentAnalyticsPage() {
  await connectToDB();
  
  // إحصائيات الدفعات
  const totalPayments = await Payment.countDocuments();
  const verifiedPayments = await Payment.countDocuments({ status: 'verified' });
  const pendingPayments = await Payment.countDocuments({ status: 'pending' });
  const rejectedPayments = await Payment.countDocuments({ status: 'rejected' });

  // إجمالي الإيرادات
  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'verified' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // إيرادات هذا الشهر
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthlyRevenue = await Payment.aggregate([
    { 
      $match: { 
        status: 'verified',
        'verification.verifiedAt': { $gte: startOfMonth }
      } 
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // إحصائيات حسب نوع الاشتراك
  const subscriptionStats = await Payment.aggregate([
    { $match: { status: 'verified' } },
    { 
      $group: { 
        _id: '$subscriptionType',
        count: { $sum: 1 },
        revenue: { $sum: '$amount' }
      } 
    }
  ]);

  // إحصائيات حسب طريقة الدفع
  const paymentMethodStats = await Payment.aggregate([
    { $match: { status: 'verified' } },
    { 
      $group: { 
        _id: '$paymentMethod',
        count: { $sum: 1 },
        revenue: { $sum: '$amount' }
      } 
    }
  ]);

  // آخر 30 يوم - إيرادات يومية
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dailyRevenue = await Payment.aggregate([
    { 
      $match: { 
        status: 'verified',
        'verification.verifiedAt': { $gte: thirtyDaysAgo }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$verification.verifiedAt' },
          month: { $month: '$verification.verifiedAt' },
          day: { $dayOfMonth: '$verification.verifiedAt' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // المستخدمون النشطون
  const activeUsers = await User.countDocuments({ 
    subscriptionStatus: 'active' 
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount || 0);
  };

  const getSubscriptionTypeLabel = (type) => {
    const labels = {
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي'
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      bank_transfer: 'تحويل بنكي',
      stc_pay: 'STC Pay',
      mada: 'مدى',
      credit_card: 'بطاقة ائتمانية',
      other: 'أخرى'
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="text-blue-500" />
          تحليلات الدفعات والإيرادات
        </h1>
        <p className="text-gray-400 mt-2">
          نظرة شاملة على أداء الدفعات والإيرادات
        </p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(totalRevenue[0]?.total)}
              </p>
            </div>
            <DollarSign className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إيرادات هذا الشهر</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(monthlyRevenue[0]?.total)}
              </p>
            </div>
            <TrendingUp className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المستخدمون النشطون</p>
              <p className="text-2xl font-bold text-purple-400">{activeUsers}</p>
            </div>
            <Users className="text-purple-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">معدل التأكيد</p>
              <p className="text-2xl font-bold text-yellow-400">
                {totalPayments > 0 ? Math.round((verifiedPayments / totalPayments) * 100) : 0}%
              </p>
            </div>
            <BarChart3 className="text-yellow-400" size={24} />
          </div>
        </div>
      </div>

      {/* حالة الدفعات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* إحصائيات الدفعات */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6">حالة الدفعات</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>مؤكدة</span>
              </div>
              <span className="font-semibold">{verifiedPayments}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>في الانتظار</span>
              </div>
              <span className="font-semibold">{pendingPayments}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>مرفوضة</span>
              </div>
              <span className="font-semibold">{rejectedPayments}</span>
            </div>
          </div>
        </div>

        {/* إحصائيات نوع الاشتراك */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6">الإيرادات حسب نوع الاشتراك</h2>
          
          <div className="space-y-4">
            {subscriptionStats.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">{getSubscriptionTypeLabel(stat._id)}</p>
                  <p className="text-sm text-gray-400">{stat.count} دفعة</p>
                </div>
                <span className="font-semibold text-green-400">
                  {formatCurrency(stat.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* طرق الدفع */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">الإيرادات حسب طريقة الدفع</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethodStats.map((stat) => (
            <div key={stat._id} className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{getPaymentMethodLabel(stat._id)}</span>
                <span className="text-sm text-gray-400">{stat.count}</span>
              </div>
              <p className="text-lg font-semibold text-blue-400">
                {formatCurrency(stat.revenue)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* الإيرادات اليومية - آخر 30 يوم */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">الإيرادات اليومية - آخر 30 يوم</h2>
        
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-4">
            {dailyRevenue.map((day, index) => {
              const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center gap-2 min-w-[60px]">
                  <div className="text-xs text-gray-400">
                    {formatCurrency(day.revenue)}
                  </div>
                  <div 
                    className="w-8 bg-blue-500 rounded-t min-h-[4px] transition-all"
                    style={{ height: `${Math.max(height, 4)}px` }}
                  ></div>
                  <div className="text-xs text-gray-500">
                    {day._id.day}/{day._id.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}