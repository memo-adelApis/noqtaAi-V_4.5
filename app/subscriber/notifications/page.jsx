import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import Notification from '@/models/Notification';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Shield, CreditCard, User, Settings, TestTube } from 'lucide-react';
import TestNotificationButton from '@/components/ui/TestNotificationButton';

export default async function SubscriberNotificationsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !['subscriber', 'manager', 'employee'].includes(session.user.role)) {
    redirect('/login');
  }

  await connectToDB();

  const awaitedSearchParams = await searchParams;
  const filter = awaitedSearchParams?.filter || 'all';
  const page = Number(awaitedSearchParams?.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // بناء query للفلترة
  const query = { 
    userId: session.user.id,
    isArchived: false,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };

  if (filter === 'unread') {
    query.isRead = false;
  } else if (filter === 'read') {
    query.isRead = true;
  }

  // جلب الإشعارات
  const notifications = await Notification.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  // تحويل ObjectId إلى string
  const serializedNotifications = notifications.map(notification => ({
    ...notification,
    _id: notification._id.toString(),
    userId: notification.userId.toString(),
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    expiresAt: notification.expiresAt ? notification.expiresAt.toISOString() : null,
    scheduledFor: notification.scheduledFor ? notification.scheduledFor.toISOString() : null
  }));

  // عدد الإشعارات غير المقروءة
  const unreadCount = await Notification.countDocuments({
    userId: session.user.id,
    isRead: false,
    isArchived: false
  });

  // إجمالي الإشعارات
  const totalCount = await Notification.countDocuments({
    userId: session.user.id,
    isArchived: false
  });

  const totalPages = Math.ceil(totalCount / limit);

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20, className: "flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" {...iconProps} />;
      case 'error':
        return <XCircle className="text-red-400" {...iconProps} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-400" {...iconProps} />;
      case 'security':
        return <Shield className="text-red-400" {...iconProps} />;
      case 'payment':
        return <CreditCard className="text-green-400" {...iconProps} />;
      case 'subscription':
        return <User className="text-blue-400" {...iconProps} />;
      case 'system':
        return <Settings className="text-gray-400" {...iconProps} />;
      default:
        return <Info className="text-blue-400" {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-r-4 border-red-500 bg-red-500/5';
      case 'high':
        return 'border-r-4 border-orange-500 bg-orange-500/5';
      case 'medium':
        return 'border-r-4 border-blue-500 bg-blue-500/5';
      default:
        return 'border-r-4 border-gray-600 bg-gray-800/50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-blue-400" size={32} />
            <h1 className="text-3xl font-bold">الإشعارات</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              إجمالي الإشعارات: {totalCount} | غير مقروء: {unreadCount}
            </p>
            
            {/* فلاتر */}
            <div className="flex gap-2">
              <TestNotificationButton />
              
              <a
                href="/subscriber/notifications?filter=all"
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                الكل ({totalCount})
              </a>
              <a
                href="/subscriber/notifications?filter=unread"
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  filter === 'unread' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                غير مقروء ({unreadCount})
              </a>
              <a
                href="/subscriber/notifications?filter=read"
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  filter === 'read' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                مقروء ({totalCount - unreadCount})
              </a>
            </div>
          </div>
        </div>

        {/* قائمة الإشعارات */}
        <div className="space-y-4">
          {serializedNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'جميع الإشعارات مقروءة' : 'لم تتلق أي إشعارات بعد'}
              </p>
            </div>
          ) : (
            serializedNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-gray-900 rounded-lg p-6 transition-all hover:bg-gray-800 ${
                  getPriorityColor(notification.priority)
                } ${!notification.isRead ? 'ring-1 ring-blue-500/30' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`font-semibold ${
                        !notification.isRead ? 'text-white' : 'text-gray-300'
                      }`}>
                        {notification.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    
                    {/* معلومات إضافية */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded text-xs ${
                          notification.priority === 'urgent' ? 'bg-red-500/20 text-red-300' :
                          notification.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                          notification.priority === 'medium' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {notification.priority === 'urgent' ? 'عاجل' :
                           notification.priority === 'high' ? 'مهم' :
                           notification.priority === 'medium' ? 'متوسط' : 'عادي'}
                        </span>
                        
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {notification.category === 'security' ? 'أمان' :
                           notification.category === 'subscription' ? 'اشتراك' :
                           notification.category === 'system' ? 'نظام' :
                           notification.category === 'payment' ? 'دفع' : 'عام'}
                        </span>
                      </div>
                      
                      {notification.readAt && (
                        <span className="text-xs text-gray-500">
                          قُرئ في: {formatDate(notification.readAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {page > 1 && (
              <a
                href={`/subscriber/notifications?filter=${filter}&page=${page - 1}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
              >
                السابق
              </a>
            )}
            
            <span className="px-4 py-2 text-gray-400">
              صفحة {page} من {totalPages}
            </span>
            
            {page < totalPages && (
              <a
                href={`/subscriber/notifications?filter=${filter}&page=${page + 1}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition"
              >
                التالي
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}