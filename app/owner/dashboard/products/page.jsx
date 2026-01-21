import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Item from "@/models/Items";
import Store from "@/models/Store";
import Invoice from "@/models/Invoices";
import Unit from "@/models/Units";
import Category from "@/models/Categories";
import Branch from "@/models/Branches";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { Package, TrendingDown, TrendingUp, DollarSign, Search, Filter, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/app/lib/auth';

export default async function OwnerProductsPage() {
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

  // جلب جميع المخازن للمشترك
  const stores = await Store.find({ userId: subscriberId }).populate('branchId', 'name').lean();
  const storeIds = stores.map(s => s._id);

  console.log('Owner Products - subscriberId:', subscriberId.toString());
  console.log('Owner Products - stores count:', stores.length);
  console.log('Owner Products - storeIds:', storeIds.map(id => id.toString()));

  // جلب جميع الأصناف من المخازن
  const items = storeIds.length > 0 ?
    await Item.find({ storeId: { $in: storeIds } })
      .populate('storeId', 'name')
      .populate('unitId', 'name')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .lean() : [];

  console.log('Owner Products - items count:', items.length);

  // حساب الإحصائيات
  const totalItems = items.length;
  const totalQuantityAdded = items.reduce((sum, item) => sum + (item.quantity_added || 0), 0);
  const totalQuantitySpent = items.reduce((sum, item) => sum + (item.quantity_spent || 0), 0);
  const totalQuantityRemaining = items.reduce((sum, item) => sum + (item.quantity_Remaining || 0), 0);
  const totalInventoryValue = items.reduce((sum, item) => sum + (item.totlPrice || 0), 0);

  // الأصناف منخفضة المخزون (أقل من 10)
  const lowStockItems = items.filter(item => (item.quantity_Remaining || 0) < 10).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      {/* معلومات تشخيصية */}
      {(stores.length === 0 || items.length === 0) && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">معلومات تشخيصية:</h3>
          <div className="text-sm space-y-1">
            <p>• عدد المخازن: {stores.length}</p>
            <p>• عدد الأصناف: {items.length}</p>
            {stores.length > 0 && (
              <div>
                <p className="font-semibold mt-2">المخازن المتاحة:</p>
                {stores.map(s => (
                  <p key={s._id} className="mr-4">- {s.name} ({s.branchId?.name || 'بدون فرع'})</p>
                ))}
              </div>
            )}
            {stores.length === 0 && (
              <p className="text-yellow-400 mt-2">⚠️ لا توجد مخازن مرتبطة بالمشترك. يرجى إضافة مخازن أولاً.</p>
            )}
            {stores.length > 0 && items.length === 0 && (
              <p className="text-yellow-400 mt-2">⚠️ المخازن موجودة لكن لا توجد أصناف فيها. يرجى إضافة أصناف.</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="text-purple-500" />
          إدارة المنتجات والمخزون
        </h1>
        <p className="text-gray-400 mt-2">
          عرض شامل لجميع الأصناف في المخازن
        </p>
      </div>

      {/* إحصائيات رئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-xl border border-purple-500/30">
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
              <p className="text-gray-400 text-sm">الكمية المضافة</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{totalQuantityAdded.toLocaleString('en-US')}</p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الكمية المصروفة</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{totalQuantitySpent.toLocaleString('en-US')}</p>
            </div>
            <TrendingDown className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الكمية المتبقية</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalQuantityRemaining.toLocaleString('en-US')}</p>
            </div>
            <Package className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">القيمة المالية</p>
              <p className="text-xl font-bold text-yellow-400 mt-1">{formatCurrency(totalInventoryValue)}</p>
            </div>
            <DollarSign className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* تحذير المخزون المنخفض */}
      {lowStockItems > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Filter className="text-yellow-500" size={20} />
            <h3 className="font-medium text-yellow-400">تنبيه: مخزون منخفض</h3>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            يوجد {lowStockItems} صنف بكمية أقل من 10 وحدات. يرجى المراجعة وإعادة الطلب.
          </p>
        </div>
      )}

      {/* جدول المنتجات */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">قائمة الأصناف</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">اسم الصنف</th>
                <th className="text-right p-4 text-gray-300">المخزن</th>
                <th className="text-right p-4 text-gray-300">الفئة</th>
                <th className="text-right p-4 text-gray-300">الكمية المضافة</th>
                <th className="text-right p-4 text-gray-300">الكمية المصروفة</th>
                <th className="text-right p-4 text-gray-300">الكمية المتبقية</th>
                <th className="text-right p-4 text-gray-300">القيمة المالية</th>
                <th className="text-center p-4 text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const stockStatus = 
                  (item.quantity_Remaining || 0) === 0 ? 'out' :
                  (item.quantity_Remaining || 0) < 10 ? 'low' : 'good';
                
                return (
                  <tr key={item._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {item.storeId?.name || 'غير محدد'}
                    </td>
                    <td className="p-4 text-sm">
                      {item.categoryId?.name || 'غير محدد'}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-green-400 font-semibold">
                        {(item.quantity_added || 0).toLocaleString('en-US')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-red-400 font-semibold">
                        {(item.quantity_spent || 0).toLocaleString('en-US')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-semibold ${
                        stockStatus === 'out' ? 'text-red-400' :
                        stockStatus === 'low' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>
                        {(item.quantity_Remaining || 0).toLocaleString('en-US')}
                      </span>
                      {item.unitId?.name && (
                        <span className="text-xs text-gray-400 mr-1">
                          {item.unitId.name}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-yellow-400">
                      {formatCurrency(item.totlPrice)}
                    </td>
                    <td className="p-4 text-center">
                      <Link 
                        href={`/owner/dashboard/products/${item._id}`}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                      >
                        <Search size={14} />
                        التفاصيل
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">حالة المخزون</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">مخزون جيد</span>
              <span className="text-green-400 font-semibold">
                {items.filter(i => (i.quantity_Remaining || 0) >= 10).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">مخزون منخفض</span>
              <span className="text-yellow-400 font-semibold">
                {items.filter(i => (i.quantity_Remaining || 0) > 0 && (i.quantity_Remaining || 0) < 10).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">نفذ المخزون</span>
              <span className="text-red-400 font-semibold">
                {items.filter(i => (i.quantity_Remaining || 0) === 0).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">المخازن</h3>
          <div className="space-y-3">
            {stores.slice(0, 5).map((store) => {
              const storeItems = items.filter(i => i.storeId?._id.toString() === store._id.toString());
              return (
                <div key={store._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{store.name}</p>
                    <p className="text-xs text-gray-400">{store.branchId?.name}</p>
                  </div>
                  <span className="text-purple-400 font-semibold">
                    {storeItems.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">معدلات الاستهلاك</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">معدل الاستهلاك</span>
              <span className="text-blue-400 font-semibold">
                {totalQuantityAdded > 0 
                  ? ((totalQuantitySpent / totalQuantityAdded) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">معدل التوفر</span>
              <span className="text-green-400 font-semibold">
                {totalQuantityAdded > 0 
                  ? ((totalQuantityRemaining / totalQuantityAdded) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">متوسط القيمة</span>
              <span className="text-yellow-400 font-semibold">
                {formatCurrency(totalItems > 0 ? totalInventoryValue / totalItems : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
