import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Item from "@/models/Items";
import Store from "@/models/Store";
import Category from "@/models/Categories";
import { connectToDB } from '@/utils/database';
import { Package, TrendingDown, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { redirect } from 'next/navigation';
import ExportInventoryButton from '@/components/owner/ExportInventoryButton';
import { getCurrentUser } from '@/app/lib/auth';
import mongoose from 'mongoose';

export default async function InventoryReportPage() {
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

  // جلب المخازن
  const stores = await Store.find({ userId: subscriberId }).populate('branchId', 'name').lean();
  const storeIds = stores.map(s => s._id);

  console.log('Owner Debug - subscriberId:', subscriberId.toString());
  console.log('Owner Debug - stores count:', stores.length);
  console.log('Owner Debug - storeIds:', storeIds.map(id => id.toString()));

  // جلب الأصناف
  const items = storeIds.length > 0 ? 
    await Item.find({ storeId: { $in: storeIds } })
      .populate('storeId', 'name')
      .populate('categoryId', 'name')
      .lean() : [];

  console.log('Owner Debug - items count:', items.length);

  // تصنيف الأصناف
  const goodStock = items.filter(i => (i.quantity_Remaining || 0) >= 10);
  const lowStock = items.filter(i => (i.quantity_Remaining || 0) > 0 && (i.quantity_Remaining || 0) < 10);
  const outOfStock = items.filter(i => (i.quantity_Remaining || 0) === 0);

  // إحصائيات
  const totalItems = items.length;
  const totalValue = items.reduce((sum, i) => sum + (i.totlPrice || 0), 0);
  const totalQuantity = items.reduce((sum, i) => sum + (i.quantity_Remaining || 0), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  // تحضير البيانات للتصدير
  const exportData = {
    totalItems,
    totalValue,
    totalQuantity,
    goodStock: goodStock.length,
    lowStock: lowStock.length,
    outOfStock: outOfStock.length,
    lowStockItems: lowStock.map(item => ({
      name: item.name,
      storeName: item.storeId?.name || 'غير محدد',
      quantity: item.quantity_Remaining || 0,
      value: item.totlPrice || 0
    })),
    outOfStockItems: outOfStock.map(item => ({
      name: item.name,
      storeName: item.storeId?.name || 'غير محدد',
      category: item.categoryId?.name || '-',
      lastQuantity: item.quantity_added || 0
    }))
  };

  return (
    <div className="space-y-8">
      {/* معلومات تشخيصية - يمكن إزالتها لاحقاً */}
      {(stores.length === 0 || items.length === 0) && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">معلومات تشخيصية:</h3>
          <div className="text-sm space-y-1">
            <p>• عدد المخازن المرتبطة بالمشترك: {stores.length}</p>
            <p>• عدد الأصناف في المخازن: {items.length}</p>
            {stores.length > 0 && (
              <p>• أسماء المخازن: {stores.map(s => s.name).join(', ')}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="text-purple-500" />
            تقرير المخزون
          </h1>
          <p className="text-gray-400 mt-2">
            حالة المخزون والأصناف
          </p>
        </div>

        <ExportInventoryButton 
          data={exportData}
          filename="تقرير_المخزون"
        />
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الأصناف</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{totalItems}</p>
            </div>
            <Package className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">القيمة الإجمالية</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(totalValue)}</p>
            </div>
            <DollarSign className="text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الكمية الإجمالية</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalQuantity.toLocaleString('en-US')}</p>
            </div>
            <Package className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مخزون منخفض</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{lowStock.length}</p>
            </div>
            <AlertTriangle className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* حالة المخزون */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-400">مخزون جيد</h3>
            <CheckCircle className="text-green-400" size={32} />
          </div>
          <p className="text-3xl font-bold text-white">{goodStock.length}</p>
          <p className="text-sm text-gray-400 mt-2">أصناف بكمية ≥ 10</p>
        </div>

        <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-400">مخزون منخفض</h3>
            <AlertTriangle className="text-yellow-400" size={32} />
          </div>
          <p className="text-3xl font-bold text-white">{lowStock.length}</p>
          <p className="text-sm text-gray-400 mt-2">أصناف بكمية {'<'} 10</p>
        </div>

        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-400">نفذ المخزون</h3>
            <TrendingDown className="text-red-400" size={32} />
          </div>
          <p className="text-3xl font-bold text-white">{outOfStock.length}</p>
          <p className="text-sm text-gray-400 mt-2">أصناف بكمية = 0</p>
        </div>
      </div>

      {/* الأصناف منخفضة المخزون */}
      {lowStock.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 bg-yellow-900/10">
            <h2 className="text-xl font-semibold text-yellow-400">تحذير: أصناف منخفضة المخزون</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-right p-4 text-gray-300">الصنف</th>
                  <th className="text-right p-4 text-gray-300">المخزن</th>
                  <th className="text-right p-4 text-gray-300">الكمية المتبقية</th>
                  <th className="text-right p-4 text-gray-300">القيمة</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4 text-sm text-gray-400">{item.storeId?.name}</td>
                    <td className="p-4">
                      <span className="text-yellow-400 font-semibold">
                        {(item.quantity_Remaining || 0).toLocaleString('en-US')}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-yellow-400">{formatCurrency(item.totlPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* الأصناف نفذت */}
      {outOfStock.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800 bg-red-900/10">
            <h2 className="text-xl font-semibold text-red-400">تنبيه: أصناف نفذت من المخزون</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-right p-4 text-gray-300">الصنف</th>
                  <th className="text-right p-4 text-gray-300">المخزن</th>
                  <th className="text-right p-4 text-gray-300">الفئة</th>
                  <th className="text-right p-4 text-gray-300">آخر كمية</th>
                </tr>
              </thead>
              <tbody>
                {outOfStock.map((item) => (
                  <tr key={item._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4 text-sm text-gray-400">{item.storeId?.name}</td>
                    <td className="p-4 text-sm text-gray-400">{item.categoryId?.name || '-'}</td>
                    <td className="p-4 text-red-400 font-semibold">
                      {(item.quantity_added || 0).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
