import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Store from "@/models/Store";
import Item from "@/models/Items";
import Branch from "@/models/Branches";
import { connectToDB } from '@/utils/database';
import { getCurrentUser } from '@/app/lib/auth';
import mongoose from 'mongoose';
import { redirect } from 'next/navigation';

export default async function DebugPage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return <div>لا يوجد مستخدم</div>;
  }

  const subscriberId = currentUser.mainAccountId ? 
    new mongoose.Types.ObjectId(currentUser.mainAccountId) : null;

  // جلب البيانات
  const storesWithSubscriberId = subscriberId ? 
    await Store.find({ userId: subscriberId }).populate('branchId', 'name').lean() : [];
  
  const storesWithOwnerId = await Store.find({ userId: new mongoose.Types.ObjectId(session.user.id) })
    .populate('branchId', 'name').lean();
  
  const allStores = await Store.find({}).populate('branchId', 'name').lean();
  
  const branches = subscriberId ? 
    await Branch.find({ userId: subscriberId }).lean() : [];

  const storeIds = storesWithSubscriberId.map(s => s._id);
  const items = storeIds.length > 0 ? 
    await Item.find({ storeId: { $in: storeIds } }).lean() : [];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">صفحة التشخيص</h1>
      
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-4">معلومات المستخدم</h2>
        <div className="space-y-2 text-sm">
          <p><strong>ID:</strong> {currentUser._id.toString()}</p>
          <p><strong>الاسم:</strong> {currentUser.name}</p>
          <p><strong>الدور:</strong> {currentUser.role}</p>
          <p><strong>mainAccountId:</strong> {currentUser.mainAccountId?.toString() || 'غير موجود'}</p>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-4">المخازن المرتبطة بالمشترك (mainAccountId)</h2>
        <p className="mb-4">عدد المخازن: {storesWithSubscriberId.length}</p>
        {storesWithSubscriberId.length > 0 ? (
          <div className="space-y-2">
            {storesWithSubscriberId.map(store => (
              <div key={store._id} className="bg-gray-800 p-3 rounded">
                <p><strong>الاسم:</strong> {store.name}</p>
                <p><strong>الفرع:</strong> {store.branchId?.name || 'غير محدد'}</p>
                <p><strong>userId:</strong> {store.userId?.toString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-yellow-400">لا توجد مخازن مرتبطة بالمشترك</p>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-4">المخازن المرتبطة بالمالك مباشرة</h2>
        <p className="mb-4">عدد المخازن: {storesWithOwnerId.length}</p>
        {storesWithOwnerId.length > 0 ? (
          <div className="space-y-2">
            {storesWithOwnerId.map(store => (
              <div key={store._id} className="bg-gray-800 p-3 rounded">
                <p><strong>الاسم:</strong> {store.name}</p>
                <p><strong>الفرع:</strong> {store.branchId?.name || 'غير محدد'}</p>
                <p><strong>userId:</strong> {store.userId?.toString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">لا توجد مخازن مرتبطة بالمالك مباشرة</p>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-4">الفروع</h2>
        <p className="mb-4">عدد الفروع: {branches.length}</p>
        {branches.length > 0 ? (
          <div className="space-y-2">
            {branches.map(branch => (
              <div key={branch._id} className="bg-gray-800 p-3 rounded">
                <p><strong>الاسم:</strong> {branch.name}</p>
                <p><strong>userId:</strong> {branch.userId?.toString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-yellow-400">لا توجد فروع</p>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-4">الأصناف</h2>
        <p className="mb-4">عدد الأصناف: {items.length}</p>
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.slice(0, 5).map(item => (
              <div key={item._id} className="bg-gray-800 p-3 rounded">
                <p><strong>الاسم:</strong> {item.name}</p>
                <p><strong>الكمية المتبقية:</strong> {item.quantity_Remaining || 0}</p>
                <p><strong>storeId:</strong> {item.storeId?.toString()}</p>
              </div>
            ))}
            {items.length > 5 && <p className="text-gray-400">... و {items.length - 5} أصناف أخرى</p>}
          </div>
        ) : (
          <p className="text-yellow-400">لا توجد أصناف</p>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-4">جميع المخازن في النظام</h2>
        <p className="mb-4">إجمالي المخازن: {allStores.length}</p>
        {allStores.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allStores.map(store => (
              <div key={store._id} className="bg-gray-800 p-3 rounded">
                <p><strong>الاسم:</strong> {store.name}</p>
                <p><strong>الفرع:</strong> {store.branchId?.name || 'غير محدد'}</p>
                <p><strong>userId:</strong> {store.userId?.toString()}</p>
                <p className={`text-sm ${
                  store.userId?.toString() === subscriberId?.toString() ? 'text-green-400' :
                  store.userId?.toString() === session.user.id ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {store.userId?.toString() === subscriberId?.toString() ? '✓ مرتبط بالمشترك' :
                   store.userId?.toString() === session.user.id ? '⚠ مرتبط بالمالك' :
                   '✗ مرتبط بمستخدم آخر'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-yellow-400">لا توجد مخازن في النظام</p>
        )}
      </div>
    </div>
  );
}
