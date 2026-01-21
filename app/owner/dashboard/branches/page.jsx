import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Branch from "@/models/Branches";
import Invoice from "@/models/Invoices";
import Store from "@/models/Store";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { Building, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';
import BranchesClient from '@/components/owner/BranchesClient';

export default async function OwnerDashboardBranchesPage() {
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
        invoiceCount: { $sum: 1 }
      } 
    }
  ]);

  // جلب عدد المخازن لكل فرع
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
      invoiceCount: 0
    };
    
    const stores = storesCount.find(s => s._id?.toString() === branch._id.toString()) || {
      storeCount: 0
    };
    
    return {
      _id: branch._id.toString(),
      name: branch.name,
      location: branch.location,
      totalRevenue: stats.totalRevenue,
      totalExpenses: stats.totalExpenses,
      invoiceCount: stats.invoiceCount,
      storeCount: stores.storeCount,
      profit: stats.totalRevenue - stats.totalExpenses
    };
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0) + ' ج.م';
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
          عرض أداء جميع فروع المؤسسة - اضغط على أي فرع لعرض المخازن والمنتجات
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
      {branches.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto mb-4 text-gray-600" size={64} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            لا توجد فروع بعد
          </h3>
          <p className="text-gray-500">
            لم يتم إضافة أي فروع للمؤسسة
          </p>
        </div>
      ) : (
        <BranchesClient initialBranches={branchesWithStats} />
      )}
    </div>
  );
}
