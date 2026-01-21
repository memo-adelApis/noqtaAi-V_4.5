import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Branch from "@/models/Branches";
import Invoice from "@/models/Invoices";
import dbConnect from '@/app/lib/dbConnect';
import mongoose from 'mongoose';
import { Building, MapPin, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';

export default async function OwnerBranchesPage() {
  // الاتصال بقاعدة البيانات
  await dbConnect();
  
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
        invoiceCount: { $sum: 1 }
      } 
    }
  ]);

  // دمج البيانات
  const branchesWithStats = branches.map(branch => {
    const stats = branchStats.find(s => s._id?.toString() === branch._id.toString()) || {
      totalRevenue: 0,
      totalExpenses: 0,
      invoiceCount: 0
    };
    
    return {
      ...branch,
      ...stats,
      profit: stats.totalRevenue - stats.totalExpenses
    };
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building className="text-purple-500" />
          إدارة الفروع
        </h1>
        <p className="text-gray-400 mt-2">
          عرض أداء جميع فروع المؤسسة
        </p>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الفروع</p>
              <p className="text-2xl font-bold text-purple-400">{branches.length}</p>
            </div>
            <Building className="text-purple-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(branchesWithStats.reduce((sum, b) => sum + b.totalRevenue, 0))}
              </p>
            </div>
            <TrendingUp className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">صافي الربح</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(branchesWithStats.reduce((sum, b) => sum + b.profit, 0))}
              </p>
            </div>
            <DollarSign className="text-blue-400" size={24} />
          </div>
        </div>
      </div>

      {/* قائمة الفروع */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branchesWithStats.map((branch) => (
          <div key={branch._id} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/10 p-3 rounded-lg">
                  <Building className="text-purple-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{branch.name}</h3>
                  {branch.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin size={14} />
                      <span>{branch.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                {branch.invoiceCount} فاتورة
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-400 mb-1">الإيرادات</p>
                <p className="text-sm font-semibold text-green-400">
                  {formatCurrency(branch.totalRevenue)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">المصروفات</p>
                <p className="text-sm font-semibold text-red-400">
                  {formatCurrency(branch.totalExpenses)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">الربح</p>
                <p className={`text-sm font-semibold ${
                  branch.profit >= 0 ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {formatCurrency(branch.profit)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto mb-4 text-gray-600" size={64} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            لا توجد فروع بعد
          </h3>
          <p className="text-gray-500">
            لم يتم إضافة أي فروع للمؤسسة
          </p>
        </div>
      )}
    </div>
  );
}