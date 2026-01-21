import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Users, 
  CreditCard, 
  Globe, 
  Lock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectToDB();

  // جلب إحصائيات النظام
  const totalUsers = await User.countDocuments();
  const totalSubscribers = await User.countDocuments({ role: 'subscriber' });
  const activeSubscriptions = await User.countDocuments({ 
    role: 'subscriber',
    'subscription.isActive': true 
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="text-blue-500" />
            إعدادات النظام
          </h1>
          <p className="text-gray-400 mt-2">
            إدارة وتكوين إعدادات المنصة
          </p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalUsers}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المشتركين</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{totalSubscribers}</p>
            </div>
            <CreditCard className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الاشتراكات النشطة</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{activeSubscriptions}</p>
            </div>
            <CheckCircle className="text-purple-400" size={32} />
          </div>
        </div>
      </div>

      {/* أقسام الإعدادات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* إعدادات الأمان */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="text-red-500" />
            إعدادات الأمان
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">المصادقة الثنائية</h3>
                <p className="text-sm text-gray-400">تفعيل الحماية الإضافية للحساب</p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition">
                مفعل
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">تسجيل العمليات</h3>
                <p className="text-sm text-gray-400">حفظ سجل جميع العمليات الإدارية</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                مفعل
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">انتهاء الجلسة</h3>
                <p className="text-sm text-gray-400">مدة انتهاء الجلسة (بالدقائق)</p>
              </div>
              <input 
                type="number" 
                defaultValue="60" 
                className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* إعدادات البريد الإلكتروني */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Mail className="text-blue-500" />
            إعدادات البريد الإلكتروني
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">خادم SMTP</label>
              <input 
                type="text" 
                defaultValue="smtp.gmail.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">المنفذ</label>
                <input 
                  type="number" 
                  defaultValue="587"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">التشفير</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
              <input 
                type="email" 
                placeholder="admin@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
              />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition flex items-center justify-center gap-2">
              <Save size={16} />
              حفظ إعدادات البريد
            </button>
          </div>
        </div>

        {/* إعدادات الإشعارات */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Bell className="text-yellow-500" />
            إعدادات الإشعارات
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">إشعارات المدفوعات</h3>
                <p className="text-sm text-gray-400">تنبيه عند استلام مدفوعات جديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">إشعارات المستخدمين الجدد</h3>
                <p className="text-sm text-gray-400">تنبيه عند تسجيل مستخدمين جدد</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium">إشعارات انتهاء الاشتراكات</h3>
                <p className="text-sm text-gray-400">تنبيه قبل انتهاء الاشتراكات</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* إعدادات قاعدة البيانات */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Database className="text-green-500" />
            إعدادات قاعدة البيانات
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-400" size={20} />
                <h3 className="font-medium text-green-400">حالة الاتصال</h3>
              </div>
              <p className="text-sm text-gray-300">متصل بنجاح</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2">
                <RefreshCw size={16} />
                نسخ احتياطي
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2">
                <Database size={16} />
                تحسين
              </button>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-2">آخر نسخة احتياطية</h3>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* إعدادات عامة */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Globe className="text-indigo-500" />
          الإعدادات العامة
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">اسم المنصة</label>
            <input 
              type="text" 
              defaultValue="منصة نقطة"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">العملة الافتراضية</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3">
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="EUR">يورو (EUR)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">المنطقة الزمنية</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3">
              <option value="Africa/Cairo">القاهرة (GMT+2)</option>
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">اللغة الافتراضية</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3">
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition flex items-center gap-2">
            <Save size={16} />
            حفظ التغييرات
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition">
            إلغاء
          </button>
        </div>
      </div>

      {/* تحذيرات النظام */}
      <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
          <AlertTriangle className="text-red-500" />
          المنطقة الخطرة
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-500/20">
            <div>
              <h3 className="font-medium text-red-400">إعادة تعيين النظام</h3>
              <p className="text-sm text-gray-400">حذف جميع البيانات وإعادة تعيين النظام</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition">
              إعادة تعيين
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-500/20">
            <div>
              <h3 className="font-medium text-red-400">تصدير البيانات</h3>
              <p className="text-sm text-gray-400">تصدير جميع بيانات النظام</p>
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition">
              تصدير
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}