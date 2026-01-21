import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Store from "@/models/Store";
import Item from "@/models/Items";
import Branch from "@/models/Branches";
import Unit from "@/models/Units";
import Category from "@/models/Categories";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { Package, Warehouse, AlertTriangle, Plus, Box, TrendingUp, TrendingDown } from "lucide-react";
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';
import Link from 'next/link';

export default async function OwnerStoresPage() {
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
  const stores = await Store.find({ userId: subscriberId })
    .populate('branchId', 'name')
    .lean();

  // جلب الفروع
  const branches = await Branch.find({ userId: subscriberId }).lean();

  // جلب الأصناف لكل مخزن
  const storesWithItems = await Promise.all(
    stores.map(async (store) => {
      const items = await Item.find({ storeId: store._id })
        .populate('categoryId', 'name')
        .populate('unitId', 'name')
        .lean();
      
      return {
        ...store,
        items,
        itemsCount: items.length,
        totalValue: items.reduce((sum, item) => sum + (item.totlPrice || 0), 0),
        totalQuantity: items.reduce((sum, item) => sum + (item.quantity_Remaining || 0), 0),
        lowStockItems: items.filter(item => (item.quantity_Remaining || 0) < 10).length,
        outOfStockItems: items.filter(item => (item.quantity_Remaining || 0) === 0).length
      };
    })
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  // إحصائيات عامة
  const totalStores = stores.length;
  const totalItems = storesWithItems.reduce((sum, s) => sum + s.itemsCount, 0);
  const totalValue = storesWithItems.reduce((sum, s) => sum + s.totalValue, 0);
  const totalLowStock = storesWithItems.reduce((sum, s) => sum + s.lowStockItems, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Warehouse className="text-blue-500" />
          إدارة المخازن والأصناف
        </h1>
        <p className="text-gray-400 mt-2">
          عرض تفصيلي لجميع المخازن والأصناف المرتبطة بها
        </p>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المخازن</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalStores}</p>
            </div>
            <Warehouse className="text-blue-400" size={32} />
          </div>
        </div>

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
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatCurrency(totalValue).replace(' ج.م', '')}
              </p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مخزون منخفض</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{totalLowStock}</p>
            </div>
            <AlertTriangle className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* رسالة تحذيرية إذا لم توجد أصناف */}
      {totalStores > 0 && totalItems === 0 && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-yellow-500 flex-shrink-0" size={32} />
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">
                لا توجد أصناف في المخازن
              </h3>
              <p className="text-gray-300 mb-4">
                المخازن موجودة ({totalStores} مخزن) لكن لا توجد أصناف فيها. 
                يجب إضافة أصناف للمخازن لتتمكن من رؤية التقارير والإحصائيات.
              </p>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-2">كيفية إضافة أصناف:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                  <li>سجل دخول كمشترك أو موظف (ليس كمالك)</li>
                  <li>اذهب إلى صفحة المخازن أو الأصناف</li>
                  <li>أضف أصناف جديدة وربطها بالمخازن</li>
                  <li>سجل دخول كمالك مرة أخرى لرؤية البيانات</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* قائمة المخازن */}
      {totalStores === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <Warehouse className="mx-auto mb-4 text-gray-600" size={64} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            لا توجد مخازن بعد
          </h3>
          <p className="text-gray-500 mb-4">
            لم يتم إنشاء أي مخازن للمشترك. يجب على المشترك إنشاء مخازن أولاً.
          </p>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-400">
              💡 المخازن يتم إنشاؤها من قبل المشترك أو الموظفين. المالك يمكنه فقط عرض البيانات.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {storesWithItems.map((store) => (
            <div key={store._id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {/* رأس المخزن */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <Warehouse className="text-blue-400" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{store.name}</h3>
                      {store.branchId && (
                        <p className="text-gray-400 flex items-center gap-2">
                          <Box size={16} />
                          الفرع: {store.branchId.name}
                        </p>
                      )}
                      {store.location && (
                        <p className="text-gray-400 text-sm mt-1">📍 {store.location}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="bg-gray-900/50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-400">عدد الأصناف</p>
                      <p className="text-2xl font-bold text-purple-400">{store.itemsCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* إحصائيات المخزن */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-800/50">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">القيمة المالية</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(store.totalValue)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">الكمية الإجمالية</p>
                  <p className="text-lg font-bold text-blue-400">{store.totalQuantity.toLocaleString('en-US')}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">مخزون منخفض</p>
                  <p className="text-lg font-bold text-yellow-400">{store.lowStockItems}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">نفذ المخزون</p>
                  <p className="text-lg font-bold text-red-400">{store.outOfStockItems}</p>
                </div>
              </div>

              {/* قائمة الأصناف */}
              {store.items.length > 0 ? (
                <div className="p-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="text-purple-500" size={20} />
                    الأصناف في هذا المخزن ({store.items.length})
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="text-right p-3 text-gray-300 text-sm">اسم الصنف</th>
                          <th className="text-right p-3 text-gray-300 text-sm">الفئة</th>
                          <th className="text-center p-3 text-gray-300 text-sm">الكمية المضافة</th>
                          <th className="text-center p-3 text-gray-300 text-sm">الكمية المصروفة</th>
                          <th className="text-center p-3 text-gray-300 text-sm">الكمية المتبقية</th>
                          <th className="text-right p-3 text-gray-300 text-sm">القيمة</th>
                          <th className="text-center p-3 text-gray-300 text-sm">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {store.items.map((item) => {
                          const stockStatus = 
                            (item.quantity_Remaining || 0) === 0 ? 'out' :
                            (item.quantity_Remaining || 0) < 10 ? 'low' : 'good';
                          
                          return (
                            <tr key={item._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="p-3">
                                <div>
                                  <p className="font-medium text-white">{item.name}</p>
                                  {item.description && (
                                    <p className="text-xs text-gray-400">{item.description}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-sm text-gray-400">
                                {item.categoryId?.name || '-'}
                              </td>
                              <td className="p-3 text-center">
                                <span className="text-green-400 font-semibold">
                                  {(item.quantity_added || 0).toLocaleString('en-US')}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className="text-red-400 font-semibold">
                                  {(item.quantity_spent || 0).toLocaleString('en-US')}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`font-bold text-lg ${
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
                              <td className="p-3 font-semibold text-yellow-400">
                                {formatCurrency(item.totlPrice)}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  stockStatus === 'out' ? 'bg-red-500/20 text-red-400' :
                                  stockStatus === 'low' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {stockStatus === 'out' ? 'نفذ' :
                                   stockStatus === 'low' ? 'منخفض' :
                                   'جيد'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Package className="mx-auto mb-3 text-gray-600" size={48} />
                  <p className="text-gray-400 mb-2">لا توجد أصناف في هذا المخزن</p>
                  <p className="text-sm text-gray-500">
                    يجب إضافة أصناف لهذا المخزن من قبل المشترك أو الموظفين
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">ملاحظات هامة</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>• المالك يمكنه فقط عرض البيانات، لا يمكنه إضافة أو تعديل المخازن والأصناف</p>
          <p>• لإضافة مخازن أو أصناف، يجب تسجيل الدخول كمشترك أو موظف</p>
          <p>• الأصناف ذات الكمية المتبقية أقل من 10 تعتبر "مخزون منخفض"</p>
          <p>• الأصناف ذات الكمية المتبقية = 0 تعتبر "نفذ المخزون"</p>
        </div>
      </div>
    </div>
  );
}
