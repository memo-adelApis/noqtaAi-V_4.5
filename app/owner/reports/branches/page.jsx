import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Branch from "@/models/Branches";
import Invoice from "@/models/Invoices";
import Store from "@/models/Store";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { Building, TrendingUp, DollarSign, Package, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import ExportBranchesButton from '@/components/owner/ExportBranchesButton';
import { getCurrentUser } from '@/app/lib/auth';

export default async function BranchesReportPage() {
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

  // جلب الفروع
  const branches = await Branch.find({ userId: subscriberId }).lean();

  // جلب إحصائيات كل فرع
  const branchStats = await Invoice.aggregate([
    { $match: { userId: subscriberId } },
    { 
      $group: { 
        _id: '$branchId',
        totalRevenue: { 
          $sum: { 
            $cond: [{ $eq: ['$type', 'revenue'] }, '$totalInvoice', 0] 
          } 
        },
        totalExpenses: { 
          $sum: { 
            $cond: [{ $eq: ['$type', 'expense'] }, '$totalInvoice', 0] 
          } 
        },
        invoiceCount: { $sum: 1 },
        paidAmount: { $sum: '$totalPays' },
        balance: { $sum: '$balance' }
      } 
    }
  ]);

  // جلب عدد المخازن
  const storesCount = await Store.aggregate([
    { $match: { userId: subscriberId } },
    {
      $group: {
        _id: '$branchId',
        storeCount: { $sum: 1 }
      }
    }
  ]);

  // دمج البيانات
  const branchesWithStats = branches.map(branch => {
    const stats = branchStats.find(s => s._id?.toString() === branch._id.toString()) || {
      totalRevenue: 0,
      totalExpenses: 0,
      invoiceCount: 0,
      paidAmount: 0,
      balance: 0
    };
    
    const stores = storesCount.find(s => s._id?.toString() === branch._id.toString()) || {
      storeCount: 0
    };
    
    return {
      ...branch,
      ...stats,
      ...stores,
      profit: stats.totalRevenue - stats.totalExpenses,
      profitMargin: stats.totalRevenue > 0 ? ((stats.totalRevenue - stats.totalExpenses) / stats.totalRevenue) * 100 : 0
    };
  }).sort((a, b) => b.profit - a.profit);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  // تحضير البيانات للتصدير
  const exportData = {
    totalBranches: branches.length,
    totalRevenue: branchesWithStats.reduce((sum, b) => sum + b.totalRevenue, 0),
    totalProfit: branchesWithStats.reduce((sum, b) => sum + b.profit, 0),
    totalStores: branchesWithStats.reduce((sum, b) => sum + b.storeCount, 0),
    branches: branchesWithStats.map(branch => ({
      name: branch.name,
      revenue: branch.totalRevenue,
      expenses: branch.totalExpenses,
      profit: branch.profit,
      profitMargin: branch.profitMargin,
      invoiceCount: branch.invoiceCount,
      storeCount: branch.storeCount,
      balance: branch.balance
    }))
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building className="text-purple-500" />
            تقرير الفروع
          </h1>
          <p className="text-gray-400 mt-2">
            تحليل شامل لأداء جميع الفروع
          </p>
        </div>

        <ExportBranchesButton 
          data={exportData}
          filename="تقرير_الفروع"
        />
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">عدد الفروع</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{branches.length}</p>
            </div>
            <Building className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatCurrency(branchesWithStats.reduce((sum, b) => sum + b.totalRevenue, 0))}
              </p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">صافي الأرباح</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {formatCurrency(branchesWithStats.reduce((sum, b) => sum + b.profit, 0))}
              </p>
            </div>
            <DollarSign className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المخازن</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {branchesWithStats.reduce((sum, b) => sum + b.storeCount, 0)}
              </p>
            </div>
            <Package className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* تفاصيل الفروع */}
      <div className="space-y-6">
        {branchesWithStats.map((branch, index) => {
          const maxProfit = Math.max(...branchesWithStats.map(b => Math.abs(b.profit)));
          const percentage = maxProfit > 0 ? (Math.abs(branch.profit) / maxProfit) * 100 : 0;
          
          return (
            <div key={branch._id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{branch.name}</h3>
                    {branch.location && (
                      <p className="text-sm text-gray-400 mt-1">{branch.location}</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-2xl font-bold ${branch.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(branch.profit)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    هامش {branch.profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* الإحصائيات */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">الإيرادات</p>
                  <p className="text-sm font-semibold text-green-400">{formatCurrency(branch.totalRevenue)}</p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">المصروفات</p>
                  <p className="text-sm font-semibold text-red-400">{formatCurrency(branch.totalExpenses)}</p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">الفواتير</p>
                  <p className="text-sm font-semibold text-blue-400">{branch.invoiceCount}</p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">المخازن</p>
                  <p className="text-sm font-semibold text-purple-400">{branch.storeCount}</p>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">المستحقات</p>
                  <p className="text-sm font-semibold text-yellow-400">{formatCurrency(branch.balance)}</p>
                </div>
              </div>

              {/* شريط الأداء */}
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${branch.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto mb-4 text-gray-600" size={64} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            لا توجد فروع بعد
          </h3>
        </div>
      )}
    </div>
  );
}
