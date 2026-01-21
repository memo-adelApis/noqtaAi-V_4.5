import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { BarChart3, TrendingUp, DollarSign, PieChart, Activity, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';

export default async function OwnerAnalyticsPage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  // جلب المستخدم الحالي للحصول على mainAccountId
  const currentUser = await getCurrentUser();
  
  if (!currentUser || !currentUser.mainAccountId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في الوصول</h2>
          <p className="text-gray-400">المالك غير مرتبط بحساب مشترك</p>
        </div>
      </div>
    );
  }

  const subscriberId = new mongoose.Types.ObjectId(currentUser.mainAccountId);

  // إحصائيات عامة
  const totalInvoices = await Invoice.countDocuments({ userId: subscriberId });
  const revenueInvoices = await Invoice.countDocuments({ userId: subscriberId, type: 'revenue' });
  const expenseInvoices = await Invoice.countDocuments({ userId: subscriberId, type: 'expense' });

  // الإيرادات والمصروفات
  const revenueTotal = await Invoice.aggregate([
    { $match: { userId: subscriberId, type: 'revenue' } },
    { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
  ]);

  const expenseTotal = await Invoice.aggregate([
    { $match: { userId: subscriberId, type: 'expense' } },
    { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
  ]);

  const totalRevenue = revenueTotal[0]?.total || 0;
  const totalExpenses = expenseTotal[0]?.total || 0;
  const netProfit = totalRevenue - totalExpenses;

  // أداء الفروع
  const branchPerformance = await Invoice.aggregate([
    { $match: { userId: subscriberId } },
    {
      $group: {
        _id: '$branchId',
        revenue: { $sum: { $cond: [{ $eq: ['$type', 'revenue'] }, '$totalInvoice', 0] } },
        expenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$totalInvoice', 0] } },
        invoiceCount: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 }
  ]);

  const branchIds = branchPerformance.map(b => b._id);
  const branches = await Branch.find({ _id: { $in: branchIds } }).lean();
  const branchMap = Object.fromEntries(branches.map(b => [b._id.toString(), b.name]));

  // الأداء الشهري (آخر 12 شهر)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyPerformance = await Invoice.aggregate([
    { $match: { userId: subscriberId, createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type'
        },
        total: { $sum: '$totalInvoice' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // تنظيم البيانات الشهرية
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const revenue = monthlyPerformance.find(
      m => m._id.year === year && m._id.month === month && m._id.type === 'revenue'
    )?.total || 0;

    const expenses = monthlyPerformance.find(
      m => m._id.year === year && m._id.month === month && m._id.type === 'expense'
    )?.total || 0;

    monthlyData.push({
      month: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      revenue,
      expenses,
      profit: revenue - expenses
    });
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="text-blue-500" />
          التحليلات المتقدمة
        </h1>
        <p className="text-gray-400 mt-2">
          تحليل شامل لأداء المؤسسة
        </p>
      </div>

      {/* إحصائيات رئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">صافي الربح</p>
              <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <Activity className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'} size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalExpenses)}</p>
            </div>
            <DollarSign className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{totalInvoices}</p>
            </div>
            <PieChart className="text-purple-400" size={32} />
          </div>
        </div>
      </div>

      {/* نسبة الربح */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">نسبة الربح</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="56" stroke="#1f2937" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#10b981" 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${(totalRevenue / (totalRevenue + totalExpenses)) * 351.86} 351.86`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-400">
                  {totalRevenue > 0 ? Math.round((totalRevenue / (totalRevenue + totalExpenses)) * 100) : 0}%
                </span>
              </div>
            </div>
            <p className="text-gray-400">الإيرادات</p>
            <p className="text-lg font-semibold text-green-400">{formatCurrency(totalRevenue)}</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="56" stroke="#1f2937" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#ef4444" 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${(totalExpenses / (totalRevenue + totalExpenses)) * 351.86} 351.86`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-400">
                  {totalExpenses > 0 ? Math.round((totalExpenses / (totalRevenue + totalExpenses)) * 100) : 0}%
                </span>
              </div>
            </div>
            <p className="text-gray-400">المصروفات</p>
            <p className="text-lg font-semibold text-red-400">{formatCurrency(totalExpenses)}</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="56" stroke="#1f2937" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#3b82f6" 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${totalRevenue > 0 ? (netProfit / totalRevenue) * 351.86 : 0} 351.86`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
                </span>
              </div>
            </div>
            <p className="text-gray-400">هامش الربح</p>
            <p className={`text-lg font-semibold ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatCurrency(netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* الأداء الشهري */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">الأداء الشهري (آخر 12 شهر)</h2>
        
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-4">
            {monthlyData.map((data, index) => {
              const maxValue = Math.max(...monthlyData.map(d => Math.max(d.revenue, d.expenses)));
              const revenueHeight = (data.revenue / maxValue) * 150;
              const expensesHeight = (data.expenses / maxValue) * 150;
              
              return (
                <div key={index} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div className="text-xs text-gray-400 text-center h-8">
                    {data.profit >= 0 ? '+' : ''}{formatCurrency(data.profit)}
                  </div>
                  <div className="flex gap-1 items-end h-[150px]">
                    <div 
                      className="w-6 bg-green-500 rounded-t"
                      style={{ height: `${revenueHeight}px`, minHeight: '4px' }}
                      title={`إيرادات: ${formatCurrency(data.revenue)}`}
                    ></div>
                    <div 
                      className="w-6 bg-red-500 rounded-t"
                      style={{ height: `${expensesHeight}px`, minHeight: '4px' }}
                      title={`مصروفات: ${formatCurrency(data.expenses)}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">{data.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-400">الإيرادات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-400">المصروفات</span>
          </div>
        </div>
      </div>

      {/* أداء الفروع */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">أداء أفضل 5 فروع</h2>
        
        <div className="space-y-4">
          {branchPerformance.map((branch, index) => {
            const profit = branch.revenue - branch.expenses;
            const profitMargin = branch.revenue > 0 ? (profit / branch.revenue) * 100 : 0;
            
            return (
              <div key={branch._id?.toString()} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{branchMap[branch._id?.toString()] || 'غير محدد'}</h3>
                      <p className="text-xs text-gray-400">{branch.invoiceCount} فاتورة</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(profit)}
                    </p>
                    <p className="text-xs text-gray-400">هامش {profitMargin.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">الإيرادات</p>
                    <p className="text-sm font-semibold text-green-400">{formatCurrency(branch.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">المصروفات</p>
                    <p className="text-sm font-semibold text-red-400">{formatCurrency(branch.expenses)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
