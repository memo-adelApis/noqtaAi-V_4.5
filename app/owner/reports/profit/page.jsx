import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { TrendingUp, DollarSign, Calendar, Building, BarChart3, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import ExportExcelButton from '@/components/owner/ExportExcelButton';
import YearFilter from '@/components/owner/YearFilter';
import { getCurrentUser } from '@/app/lib/auth';

export default async function ProfitReportPage({ searchParams }) {
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
  const resolvedSearchParams = await searchParams;
  const selectedYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year) : new Date().getFullYear();

  // تحديد نطاق السنة
  const startOfYear = new Date(selectedYear, 0, 1);
  const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);

  // جلب الإيرادات والمصروفات للسنة المحددة
  const yearlyData = await Invoice.aggregate([
    { 
      $match: { 
        userId: subscriberId,
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      } 
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          type: '$type'
        },
        total: { $sum: '$totalInvoice' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1 } }
  ]);

  // تنظيم البيانات الشهرية
  const monthlyData = [];
  for (let month = 1; month <= 12; month++) {
    const revenue = yearlyData.find(
      d => d._id.month === month && d._id.type === 'revenue'
    )?.total || 0;

    const expenses = yearlyData.find(
      d => d._id.month === month && d._id.type === 'expense'
    )?.total || 0;

    monthlyData.push({
      month,
      monthName: new Date(selectedYear, month - 1).toLocaleDateString('ar-EG', { month: 'long' }),
      revenue,
      expenses,
      profit: revenue - expenses
    });
  }

  // إحصائيات السنة
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // أفضل وأسوأ شهر
  const bestMonth = monthlyData.reduce((max, m) => m.profit > max.profit ? m : max, monthlyData[0]);
  const worstMonth = monthlyData.reduce((min, m) => m.profit < min.profit ? m : min, monthlyData[0]);

  // الأرباح حسب الفرع
  const profitByBranch = await Invoice.aggregate([
    { 
      $match: { 
        userId: subscriberId,
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      } 
    },
    {
      $group: {
        _id: {
          branchId: '$branchId',
          type: '$type'
        },
        total: { $sum: '$totalInvoice' }
      }
    }
  ]);

  const branches = await Branch.find({ userId: subscriberId }).lean();
  const branchProfits = branches.map(branch => {
    const revenue = profitByBranch.find(
      p => p._id.branchId?.toString() === branch._id.toString() && p._id.type === 'revenue'
    )?.total || 0;

    const expenses = profitByBranch.find(
      p => p._id.branchId?.toString() === branch._id.toString() && p._id.type === 'expense'
    )?.total || 0;

    return {
      name: branch.name,
      revenue,
      expenses,
      profit: revenue - expenses
    };
  }).sort((a, b) => b.profit - a.profit);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  // قائمة السنوات المتاحة
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      {/* Header with Year Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-green-500" />
            تقرير الأرباح
          </h1>
          <p className="text-gray-400 mt-2">
            تحليل شامل للأرباح والخسائر
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Export Button */}
          <ExportExcelButton 
            data={{
              totalRevenue,
              totalExpenses,
              totalProfit,
              profitMargin,
              monthlyData,
              branchProfits
            }}
            filename="تقرير_الأرباح"
            year={selectedYear}
          />

          {/* Year Filter */}
          <YearFilter 
            currentYear={selectedYear}
            availableYears={availableYears}
          />
        </div>
      </div>

      {/* إحصائيات السنة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalExpenses)}</p>
            </div>
            <DollarSign className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">صافي الربح</p>
              <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
            <BarChart3 className={totalProfit >= 0 ? 'text-blue-400' : 'text-red-400'} size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">هامش الربح</p>
              <p className={`text-2xl font-bold mt-1 ${profitMargin >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
            <Calendar className="text-purple-400" size={32} />
          </div>
        </div>
      </div>

      {/* أفضل وأسوأ شهر */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">أفضل شهر</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{bestMonth.monthName}</p>
              <p className="text-sm text-gray-400 mt-1">ربح: {formatCurrency(bestMonth.profit)}</p>
            </div>
            <TrendingUp className="text-green-400" size={48} />
          </div>
        </div>

        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">أسوأ شهر</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{worstMonth.monthName}</p>
              <p className="text-sm text-gray-400 mt-1">
                {worstMonth.profit >= 0 ? 'ربح' : 'خسارة'}: {formatCurrency(Math.abs(worstMonth.profit))}
              </p>
            </div>
            <DollarSign className="text-red-400" size={48} />
          </div>
        </div>
      </div>

      {/* الأداء الشهري */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">الأداء الشهري - {selectedYear}</h2>
        
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-4">
            {monthlyData.map((data, index) => {
              const maxValue = Math.max(...monthlyData.map(d => Math.max(d.revenue, d.expenses)));
              const revenueHeight = (data.revenue / maxValue) * 200;
              const expensesHeight = (data.expenses / maxValue) * 200;
              
              return (
                <div key={index} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div className="text-xs text-center h-12">
                    <div className={`font-medium ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(data.profit)}
                    </div>
                  </div>
                  <div className="flex gap-1 items-end h-[200px]">
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
                  <div className="text-xs text-gray-500 text-center">{data.monthName}</div>
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

      {/* الأرباح حسب الفرع */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Building className="text-purple-500" />
          الأرباح حسب الفرع
        </h2>
        
        <div className="space-y-4">
          {branchProfits.map((branch, index) => {
            const maxProfit = Math.max(...branchProfits.map(b => Math.abs(b.profit)));
            const percentage = maxProfit > 0 ? (Math.abs(branch.profit) / maxProfit) * 100 : 0;
            
            return (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">
                      {index + 1}
                    </div>
                    <h3 className="font-medium">{branch.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${branch.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(branch.profit)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">الإيرادات</p>
                    <p className="text-sm font-semibold text-green-400">{formatCurrency(branch.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">المصروفات</p>
                    <p className="text-sm font-semibold text-red-400">{formatCurrency(branch.expenses)}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${branch.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* جدول تفصيلي */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">التفاصيل الشهرية</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">الشهر</th>
                <th className="text-right p-4 text-gray-300">الإيرادات</th>
                <th className="text-right p-4 text-gray-300">المصروفات</th>
                <th className="text-right p-4 text-gray-300">الربح/الخسارة</th>
                <th className="text-right p-4 text-gray-300">هامش الربح</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => {
                const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
                
                return (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 font-medium">{data.monthName}</td>
                    <td className="p-4 font-semibold text-green-400">{formatCurrency(data.revenue)}</td>
                    <td className="p-4 font-semibold text-red-400">{formatCurrency(data.expenses)}</td>
                    <td className={`p-4 font-semibold ${data.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatCurrency(data.profit)}
                    </td>
                    <td className={`p-4 font-semibold ${margin >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                      {margin.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-800 font-bold">
                <td className="p-4">الإجمالي</td>
                <td className="p-4 text-green-400">{formatCurrency(totalRevenue)}</td>
                <td className="p-4 text-red-400">{formatCurrency(totalExpenses)}</td>
                <td className={`p-4 ${totalProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {formatCurrency(totalProfit)}
                </td>
                <td className={`p-4 ${profitMargin >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {profitMargin.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
