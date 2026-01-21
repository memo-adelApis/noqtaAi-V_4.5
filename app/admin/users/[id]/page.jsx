import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import Invoice from '@/models/Invoices';
import Branch from '@/models/Branches';
import Suppliers from '@/models/Suppliers';
import Customers from '@/models/Customers';
import Product from '@/models/Product';
import Categories from '@/models/Categories';
import mongoose from 'mongoose';
import { updateUserLimits, updateSubscriptionPlan } from '@/app/actions/userLimitsActions';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  FileText, 
  Building, 
  Users, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Save
} from 'lucide-react';
import Link from 'next/link';

export default async function UserDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectToDB();
  const { id } = await params;

  // جلب بيانات المستخدم
  const user = await User.findById(id).lean();
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">المستخدم غير موجود</h2>
        </div>
      </div>
    );
  }

  // جلب إحصائيات المستخدم
  const invoiceCount = await Invoice.countDocuments({ userId: id });
  const branchCount = await Branch.countDocuments({ userId: id });
  const subUserCount = await User.countDocuments({ mainAccountId: id });
  
  // إحصائيات إضافية - مع معالجة الأخطاء
  let supplierTotal = 0;
  let customerTotal = 0;
  let productTotal = 0;
  let categoryTotal = 0;

  try {
    supplierTotal = await Suppliers.countDocuments({ userId: id });
  } catch (error) {
    console.log('Suppliers model not found or error:', error.message);
  }

  try {
    customerTotal = await Customers.countDocuments({ userId: id });
  } catch (error) {
    console.log('Customers model not found or error:', error.message);
  }

  try {
    productTotal = await Product.countDocuments({ userId: id });
  } catch (error) {
    console.log('Product model not found or error:', error.message);
  }

  try {
    categoryTotal = await Categories.countDocuments({ userId: id });
  } catch (error) {
    console.log('Categories model not found or error:', error.message);
  }

  // إحصائيات الفواتير الشهرية (آخر 6 أشهر)
  const monthlyInvoices = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const count = await Invoice.countDocuments({
      userId: id,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    monthlyInvoices.push({
      month: date.toLocaleDateString('ar-EG', { month: 'short' }),
      count
    });
  }

  const maxInvoices = Math.max(...monthlyInvoices.map(m => m.count), 1);

  const isActive = user.subscription?.isActive || false;
  const endDate = user.subscription?.endDate;
  const isExpired = endDate ? new Date(endDate) < new Date() : false;
  const invoiceLimit = user.subscription?.invoiceLimit || 100;
  const branchLimit = user.subscription?.branchLimit || 3;
  const userLimit = user.subscription?.userLimit || 5;
  const supplierLimit = user.subscription?.supplierLimit || 50;
  const customerLimit = user.subscription?.customerLimit || 200;
  const productLimit = user.subscription?.productLimit || 500;
  const categoryLimit = user.subscription?.categoryLimit || 50;
  const warehouseLimit = user.subscription?.warehouseLimit || 5;

  const invoiceUsage = (invoiceCount / invoiceLimit) * 100;
  const branchUsage = (branchCount / branchLimit) * 100;
  const userUsage = (subUserCount / userLimit) * 100;
  const supplierUsage = (supplierTotal / supplierLimit) * 100;
  const customerUsage = (customerTotal / customerLimit) * 100;
  const productUsage = (productTotal / productLimit) * 100;
  const categoryUsage = (categoryTotal / categoryLimit) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserIcon className="text-blue-500" />
            تفاصيل المستخدم
          </h1>
          <p className="text-gray-400 mt-2">
            إدارة وتحديث بيانات المستخدم
          </p>
        </div>
        <Link
          href="/admin/users"
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
        >
          العودة للقائمة
        </Link>
      </div>

      {/* معلومات المستخدم الأساسية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserIcon className="text-blue-500" />
            المعلومات الأساسية
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">الاسم</label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                {user.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                {user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">تاريخ التسجيل</label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                {new Date(user.createdAt).toLocaleDateString('ar-EG')}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">الحالة</label>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                {isActive ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={16} /> نشط
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-400">
                    <XCircle size={16} /> متوقف
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* إحصائيات الاستخدام */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            إحصائيات الاستخدام
          </h2>
          
          <div className="space-y-4">
            {/* الفواتير */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">الفواتير</span>
                <span className="text-sm font-medium">{invoiceCount} / {invoiceLimit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    invoiceUsage > 80 ? 'bg-red-500' : invoiceUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(invoiceUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* الفروع */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">الفروع</span>
                <span className="text-sm font-medium">{branchCount} / {branchLimit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    branchUsage > 80 ? 'bg-red-500' : branchUsage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(branchUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* المستخدمين الفرعيين */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">المستخدمين</span>
                <span className="text-sm font-medium">{subUserCount} / {userLimit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    userUsage > 80 ? 'bg-red-500' : userUsage > 60 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(userUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* الموردين */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">الموردين</span>
                <span className="text-sm font-medium">{supplierTotal} / {supplierLimit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    supplierUsage > 80 ? 'bg-red-500' : supplierUsage > 60 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(supplierUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* العملاء */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">العملاء</span>
                <span className="text-sm font-medium">{customerTotal} / {customerLimit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    customerUsage > 80 ? 'bg-red-500' : customerUsage > 60 ? 'bg-yellow-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.min(customerUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* المنتجات */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">المنتجات</span>
                <span className="text-sm font-medium">{productTotal} / {productLimit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    productUsage > 80 ? 'bg-red-500' : productUsage > 60 ? 'bg-yellow-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(productUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* الفئات */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">الفئات</span>
                <span className="text-sm font-medium">{categoryTotal} / {categoryLimit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    categoryUsage > 80 ? 'bg-red-500' : categoryUsage > 60 ? 'bg-yellow-500' : 'bg-pink-500'
                  }`}
                  style={{ width: `${Math.min(categoryUsage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* بياني الفواتير الشهرية */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FileText className="text-purple-500" />
          الفواتير الشهرية
        </h2>
        
        <div className="flex items-end justify-between h-48 gap-4">
          {monthlyInvoices.map((data, index) => {
            const height = (data.count / maxInvoices) * 160;
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="text-sm font-medium text-gray-300">
                  {data.count}
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.max(height, 4)}px` }}
                  title={`${data.month}: ${data.count} فاتورة`}
                ></div>
                <div className="text-xs text-gray-500">{data.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* إدارة الحدود والخطة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* تحديث الحدود */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Settings className="text-orange-500" />
            تحديث الحدود
          </h2>
          
          <form action={updateUserLimits} className="space-y-4">
            <input type="hidden" name="userId" value={user._id.toString()} />
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حد الفواتير الشهري</label>
              <input 
                type="number" 
                name="invoiceLimit"
                defaultValue={invoiceLimit}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حد الفروع</label>
              <input 
                type="number" 
                name="branchLimit"
                defaultValue={branchLimit}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حد المستخدمين الفرعيين</label>
              <input 
                type="number" 
                name="userLimit"
                defaultValue={userLimit}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حد الموردين</label>
              <input 
                type="number" 
                name="supplierLimit"
                defaultValue={supplierLimit}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حد العملاء</label>
              <input 
                type="number" 
                name="customerLimit"
                defaultValue={customerLimit}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حد المنتجات</label>
              <input 
                type="number" 
                name="productLimit"
                defaultValue={productLimit}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حد الفئات</label>
              <input 
                type="number" 
                name="categoryLimit"
                defaultValue={categoryLimit}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حد المخازن</label>
              <input 
                type="number" 
                name="warehouseLimit"
                defaultValue={warehouseLimit}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Save size={16} />
              حفظ الحدود
            </button>
          </form>
        </div>

        {/* تحديث الخطة */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Edit className="text-green-500" />
            تحديث الخطة
          </h2>
          
          <form action={updateSubscriptionPlan} className="space-y-4">
            <input type="hidden" name="userId" value={user._id.toString()} />
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">نوع الخطة</label>
              <select 
                name="plan"
                defaultValue={user.subscription?.plan || "trial"}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              >
                <option value="trial">تجريبي</option>
                <option value="basic">أساسي</option>
                <option value="premium">متقدم</option>
                <option value="enterprise">مؤسسي</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">مدة الاشتراك (بالأشهر)</label>
              <select 
                name="months"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
              >
                <option value="1">شهر واحد</option>
                <option value="3">3 أشهر</option>
                <option value="6">6 أشهر</option>
                <option value="12">سنة كاملة</option>
              </select>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-sm text-gray-400 mb-1">تاريخ الانتهاء الحالي</div>
              <div className="font-medium">
                {endDate ? new Date(endDate).toLocaleDateString('ar-EG') : "غير محدد"}
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Save size={16} />
              تحديث الخطة
            </button>
          </form>
        </div>
      </div>

      {/* تحذيرات */}
      {(invoiceUsage > 80 || branchUsage > 80 || userUsage > 80 || supplierUsage > 80 || customerUsage > 80 || productUsage > 80 || categoryUsage > 80) && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="text-yellow-500" />
            تحذيرات الاستخدام
          </h2>
          
          <div className="space-y-2">
            {invoiceUsage > 80 && (
              <p className="text-yellow-300">⚠️ المستخدم قارب من الوصول لحد الفواتير الشهري ({Math.round(invoiceUsage)}%)</p>
            )}
            {branchUsage > 80 && (
              <p className="text-yellow-300">⚠️ المستخدم قارب من الوصول لحد الفروع ({Math.round(branchUsage)}%)</p>
            )}
            {userUsage > 80 && (
              <p className="text-yellow-300">⚠️ المستخدم قارب من الوصول لحد المستخدمين الفرعيين ({Math.round(userUsage)}%)</p>
            )}
            {supplierUsage > 80 && (
              <p className="text-yellow-300">⚠️ المستخدم قارب من الوصول لحد الموردين ({Math.round(supplierUsage)}%)</p>
            )}
            {customerUsage > 80 && (
              <p className="text-yellow-300">⚠️ المستخدم قارب من الوصول لحد العملاء ({Math.round(customerUsage)}%)</p>
            )}
            {productUsage > 80 && (
              <p className="text-yellow-300">⚠️ المستخدم قارب من الوصول لحد المنتجات ({Math.round(productUsage)}%)</p>
            )}
            {categoryUsage > 80 && (
              <p className="text-yellow-300">⚠️ المستخدم قارب من الوصول لحد الفئات ({Math.round(categoryUsage)}%)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}