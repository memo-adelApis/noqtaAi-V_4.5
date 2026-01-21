import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Crown, TrendingUp, DollarSign, FileText, Building, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { redirect } from 'next/navigation';
import { getOwnerDashboardData } from '@/app/actions/ownerDashboardActions';

export default async function OwnerDashboard() {
  // التحقق من صلاحية المالك
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  // جلب البيانات من الـ action
  const result = await getOwnerDashboardData();
  
  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-400">{result.error}</p>
        </div>
      </div>
    );
  }
  
  const {
    totalInvoices,
    revenueInvoices,
    expenseInvoices,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    totalRevenue,
    totalExpenses,
    netProfit,
    monthlyRevenue,
    monthlyExpenses,
    outstandingAmount,
    totalBranches,
    totalProducts,
    branchStats,
    last12Months
  } = result.data;

  const formatCurrency = (amount) => {
    if (!amount) return '0.00 ج.م';
    
    // استخدام الأرقام الإنجليزية
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' ج.م';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Crown className="text-yellow-500" />
            لوحة المالك - {session.user.name}
          </h1>
          <p className="text-gray-400 mt-2">
            نظرة شاملة على أداء مؤسستك التجارية
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">آخر تحديث</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <TrendingUp className="text-green-400" size={28} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm font-medium">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <DollarSign className="text-red-400" size={28} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">صافي الربح</p>
              <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <TrendingUp className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'} size={28} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">المبالغ المستحقة</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(outstandingAmount)}
              </p>
            </div>
            <AlertTriangle className="text-yellow-400" size={28} />
          </div>
        </div>
      </div>

      {/* إحصائيات هذا الشهر */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إيرادات هذا الشهر</p>
              <p className="text-xl font-bold text-green-400">
                {formatCurrency(monthlyRevenue)}
              </p>
            </div>
            <TrendingUp className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مصروفات هذا الشهر</p>
              <p className="text-xl font-bold text-red-400">
                {formatCurrency(monthlyExpenses)}
              </p>
            </div>
            <DollarSign className="text-red-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">ربح هذا الشهر</p>
              <p className={`text-xl font-bold ${
                (monthlyRevenue - monthlyExpenses) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(monthlyRevenue - monthlyExpenses)}
              </p>
            </div>
            <TrendingUp className={
              (monthlyRevenue - monthlyExpenses) >= 0 ? 'text-green-400' : 'text-red-400'
            } size={24} />
          </div>
        </div>
      </div>

      {/* إحصائيات الفواتير والفروع */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* حالة الفواتير */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="text-blue-500" />
            حالة الفواتير
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500" size={20} />
                <span>إجمالي الفواتير</span>
              </div>
              <span className="font-semibold text-blue-400">{totalInvoices}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-500" size={20} />
                <span>فواتير الإيرادات</span>
              </div>
              <span className="font-semibold text-green-400">{revenueInvoices}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="text-red-500" size={20} />
                <span>فواتير المصروفات</span>
              </div>
              <span className="font-semibold text-red-400">{expenseInvoices}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={20} />
                <span>مدفوعة</span>
              </div>
              <span className="font-semibold text-green-400">{paidInvoices}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-500" size={20} />
                <span>معلقة</span>
              </div>
              <span className="font-semibold text-yellow-400">{pendingInvoices}</span>
            </div>

            {overdueInvoices > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-500" size={20} />
                  <span className="text-red-400">متأخرة</span>
                </div>
                <span className="font-semibold text-red-400">{overdueInvoices}</span>
              </div>
            )}
          </div>
        </div>

        {/* إحصائيات الفروع */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Building className="text-purple-500" />
            أداء الفروع
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <Building className="text-purple-500" size={20} />
                <span>عدد الفروع</span>
              </div>
              <span className="font-semibold text-purple-400">{totalBranches}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <Package className="text-blue-500" size={20} />
                <span>عدد المنتجات</span>
              </div>
              <span className="font-semibold text-blue-400">{totalProducts}</span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {branchStats.slice(0, 5).map((branch) => (
                <div key={branch._id} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{branch.branch.name}</span>
                    <span className="text-xs text-gray-400">{branch.invoiceCount} فاتورة</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400">
                      إيرادات: {formatCurrency(branch.totalRevenue)}
                    </span>
                    <span className="text-red-400">
                      مصروفات: {formatCurrency(branch.totalExpenses)}
                    </span>
                  </div>
                  <div className="text-xs text-center mt-1">
                    <span className={`font-medium ${
                      branch.totalRevenue - branch.totalExpenses >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      صافي: {formatCurrency(branch.totalRevenue - branch.totalExpenses)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* الأداء المالي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">الأداء المالي - آخر 12 شهر</h2>
            <a 
              href="/owner/financial-report"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              <FileText size={18} />
              عرض التقرير بالكامل
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-max pb-4">
              {last12Months.map((month, index) => {
                const maxValue = Math.max(...last12Months.map(m => Math.max(m.revenue, m.expenses)));
                const revenueHeight = maxValue > 0 ? (month.revenue / maxValue) * 150 : 4;
                const expenseHeight = maxValue > 0 ? (month.expenses / maxValue) * 150 : 4;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-2 min-w-[100px]">
                    <div className="text-xs text-gray-400 text-center">
                      <div className="text-green-400">إ: {formatCurrency(month.revenue).replace('ج.م', '')}</div>
                      <div className="text-red-400">م: {formatCurrency(month.expenses).replace('ج.م', '')}</div>
                      <div className={`font-medium ${month.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ص: {formatCurrency(month.profit).replace('ج.م', '')}
                      </div>
                    </div>
                    <div className="flex gap-1 items-end">
                      <div 
                        className="w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all"
                        style={{ height: `${Math.max(revenueHeight, 4)}px` }}
                        title={`إيرادات: ${formatCurrency(month.revenue)}`}
                      ></div>
                      <div 
                        className="w-6 bg-gradient-to-t from-red-600 to-red-400 rounded-t transition-all"
                        style={{ height: `${Math.max(expenseHeight, 4)}px` }}
                        title={`مصروفات: ${formatCurrency(month.expenses)}`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {month.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>الإيرادات</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>المصروفات</span>
            </div>
          </div>
        </div>

        {/* ملخص مالي */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6">الملخص المالي</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">هامش الربح</p>
              <p className="text-lg font-bold text-blue-400">
                {totalRevenue > 0 ? 
                  ((netProfit / totalRevenue) * 100).toFixed(1) + '%' : 
                  '0%'
                }
              </p>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">متوسط الفاتورة</p>
              <p className="text-lg font-bold text-purple-400">
                {revenueInvoices > 0 ? 
                  formatCurrency(totalRevenue / revenueInvoices) : 
                  formatCurrency(0)
                }
              </p>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">معدل التحصيل</p>
              <p className="text-lg font-bold text-green-400">
                {totalRevenue > 0 ? 
                  (((totalRevenue - outstandingAmount) / totalRevenue) * 100).toFixed(1) + '%' : 
                  '0%'
                }
              </p>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">أفضل فرع (إيرادات)</p>
              <p className="text-lg font-bold text-yellow-400">
                {branchStats[0]?.branch?.name || 'لا يوجد'}
              </p>
              {branchStats[0] && (
                <p className="text-sm text-gray-400">
                  {formatCurrency(branchStats[0].totalRevenue)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">الإدارة السريعة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a 
            href="/owner/invoices" 
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <FileText className="text-blue-500" size={20} />
            <span>إدارة الفواتير</span>
          </a>
          
          <a 
            href="/owner/branches" 
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <Building className="text-purple-500" size={20} />
            <span>إدارة الفروع</span>
          </a>
          
          <a 
            href="/owner/dashboard/products" 
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <Package className="text-green-500" size={20} />
            <span>إدارة المنتجات</span>
          </a>
          
          <a 
            href="/owner/reports" 
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <TrendingUp className="text-yellow-500" size={20} />
            <span>التقارير المتقدمة</span>
          </a>
        </div>
      </div>
    </div>
  );
}