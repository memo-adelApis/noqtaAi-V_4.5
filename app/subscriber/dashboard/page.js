import { getCurrentUser } from '@/app/lib/auth';
import User from '@/models/User';
import DashboardUI from '@/components/subscriber/DashboardUI'; // استدعاء المكون الجديد

export default async function SubscriberDashboardPage() {
  // جلب المستخدم والاشتراك من السيرفر
  const currentUser = await getCurrentUser();
  
  // نحتاج لجلب بيانات الاشتراك كاملة من قاعدة البيانات لضمان الحداثة
  // (getCurrentUser قد يعتمد على الجلسة فقط)
  let subscription = null;
  
  if (currentUser) {
    const userDoc = await User.findById(currentUser.id).select('subscription').lean();
    subscription = userDoc?.subscription || null;
    
    // تحويل التواريخ إلى نصوص لتجنب خطأ Serialization في Client Component
    if (subscription) {
      subscription = {
        ...subscription,
        startDate: subscription.startDate?.toISOString() || null,
        endDate: subscription.endDate?.toISOString() || null,
        _id: subscription._id?.toString() || null, 
      };
    }
  }

  // تمرير البيانات إلى مكون العميل
  return <DashboardUI subscription={subscription} />;
}