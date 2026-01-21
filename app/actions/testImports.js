// ملف اختبار الاستيرادات
import { 
  sendNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  activateUserSubscription,
  requestRenewal
} from './notificationActions';

// اختبار أن جميع الدوال مستوردة بشكل صحيح
console.log('Testing notification actions imports:');
console.log('sendNotification:', typeof sendNotification);
console.log('markNotificationAsRead:', typeof markNotificationAsRead);
console.log('markAllNotificationsAsRead:', typeof markAllNotificationsAsRead);
console.log('archiveNotification:', typeof archiveNotification);
console.log('deleteNotification:', typeof deleteNotification);
console.log('activateUserSubscription:', typeof activateUserSubscription);
console.log('requestRenewal:', typeof requestRenewal);

export {
  sendNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  activateUserSubscription,
  requestRenewal
};