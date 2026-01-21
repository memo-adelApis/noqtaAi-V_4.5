import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import LoginLog from '@/models/LoginLog';
import User from '@/models/User';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Monitor, 
  Smartphone, 
  Tablet,
  MapPin,
  Clock,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

export default async function LoginLogsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectToDB();
  
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams?.page) || 1;
  const status = resolvedSearchParams?.status || 'all';
  const email = resolvedSearchParams?.email || '';
  const days = parseInt(resolvedSearchParams?.days) || 7;
  
  const limit = 50;
  const skip = (page - 1) * limit;

  // بناء query للفلترة
  const query = {};
  
  if (status !== 'all') {
    query.status = status;
  }
  
  if (email) {
    query.email = { $regex: email, $options: 'i' };
  }

  // فلترة حسب التاريخ
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  query.createdAt = { $gte: startDate };

  // جلب السجلات
  const logs = await LoginLog.find(query)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  const totalLogs = await LoginLog.countDocuments(query);
  const totalPages = Math.ceil(totalLogs / limit);

  // إحصائيات سريعة
  const stats = await LoginLog.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const successCount = stats.find(s => s._id === 'success')?.count || 0;
  const failedCount = stats.find(s => s._id === 'failed')?.count || 0;
  const blockedCount = stats.find(s => s._id === 'blocked')?.count || 0;

  // أكثر IPs فشلاً
  const topFailedIPs = await LoginLog.aggregate([
    {
      $match: {
        status: 'failed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$ipAddress',
        count: { $sum: 1 },
        emails: { $addToSet: '$email' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'failed':
        return <XCircle className="text-red-400" size={16} />;
      case 'blocked':
        return <AlertTriangle className="text-yellow-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="text-blue-400" size={16} />;
      case 'tablet':
        return <Tablet className="text-purple-400" size={16} />;
      default:
        return <Monitor className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="text-red-500" />
            سجلات تسجيل الدخول
          </h1>
          <p className="text-gray-400 mt-2">
            مراقبة ومتابعة جميع محاولات تسجيل الدخول في النظام
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <Download size={16} />
            تصدير
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <RefreshCw size={16} />
            تحديث
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">تسجيل دخول ناجح</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{successCount}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">محاولات فاشلة</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{failedCount}</p>
            </div>
            <XCircle className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 p-6 rounded-xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">محاولات محظورة</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{blockedCount}</p>
            </div>
            <AlertTriangle className="text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المحاولات</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{successCount + failedCount + blockedCount}</p>
            </div>
            <Shield className="text-blue-400" size={32} />
          </div>
        </div>
      </div>

      {/* أكثر IPs مشبوهة */}
      {topFailedIPs.length > 0 && (
        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
            <AlertTriangle className="text-red-500" />
            عناوين IP المشبوهة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topFailedIPs.map((ip, index) => (
              <div key={index} className="bg-red-900/20 rounded-lg p-4 border border-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{ip._id}</span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                    {ip.count} محاولة
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  البريد المستهدف: {ip.emails.slice(0, 2).join(', ')}
                  {ip.emails.length > 2 && ` +${ip.emails.length - 2}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* فلاتر البحث */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter className="text-blue-500" />
          فلاتر البحث
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الحالة</label>
            <select 
              defaultValue={status}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
            >
              <option value="all">جميع الحالات</option>
              <option value="success">ناجح</option>
              <option value="failed">فاشل</option>
              <option value="blocked">محظور</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
            <input 
              type="email"
              defaultValue={email}
              placeholder="البحث بالبريد..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الفترة الزمنية</label>
            <select 
              defaultValue={days}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3"
            >
              <option value="1">آخر يوم</option>
              <option value="7">آخر أسبوع</option>
              <option value="30">آخر شهر</option>
              <option value="90">آخر 3 أشهر</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition">
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* جدول السجلات */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-gray-300">التاريخ والوقت</th>
                <th className="p-4 text-gray-300">المستخدم</th>
                <th className="p-4 text-gray-300">الحالة</th>
                <th className="p-4 text-gray-300">عنوان IP</th>
                <th className="p-4 text-gray-300">الجهاز</th>
                <th className="p-4 text-gray-300">الموقع</th>
                <th className="p-4 text-gray-300">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm">{formatDate(log.createdAt)}</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div>
                      <div className="font-medium">
                        {log.userId ? log.userId.name : 'غير معروف'}
                      </div>
                      <div className="text-sm text-gray-400">{log.email}</div>
                      {log.userId && (
                        <div className="text-xs text-blue-400">{log.userId.role}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className={`text-sm font-medium ${
                        log.status === 'success' ? 'text-green-400' :
                        log.status === 'failed' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {log.status === 'success' ? 'ناجح' :
                         log.status === 'failed' ? 'فاشل' : 'محظور'}
                      </span>
                    </div>
                    {log.failureReason && (
                      <div className="text-xs text-red-300 mt-1">
                        {log.failureReason}
                      </div>
                    )}
                  </td>
                  
                  <td className="p-4">
                    <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                      {log.ipAddress}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(log.device?.type)}
                      <div className="text-sm">
                        <div>{log.device?.browser || 'غير محدد'}</div>
                        <div className="text-xs text-gray-400">
                          {log.device?.os || 'غير محدد'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-sm">
                        {log.location?.city || log.location?.country || 'غير محدد'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <button className="text-blue-400 hover:text-blue-300 transition">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {logs.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    لا توجد سجلات مطابقة للفلاتر المحددة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <div className="text-sm text-gray-400">
            صفحة {page} من {totalPages} ({totalLogs} سجل)
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition">
                السابق
              </button>
            )}
            {page < totalPages && (
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition">
                التالي
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}