import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NotificationService } from '../../../utils/notificationService';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول - المديرون فقط' },
        { status: 401 }
      );
    }

    const { type } = await request.json();

    let result;

    switch (type) {
      case 'welcome':
        result = await NotificationService.sendWelcomeNotification(session.user.id);
        break;
        
      case 'subscription_check':
        result = await NotificationService.checkSubscriptionExpiry();
        break;
        
      case 'test_notification':
        result = await NotificationService.sendNotification(
          session.user.id,
          'إشعار تجريبي',
          'هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح.',
          {
            type: 'info',
            priority: 'medium',
            category: 'system'
          }
        );
        break;
        
      case 'broadcast_test':
        result = await NotificationService.broadcastNotification(
          'إشعار عام تجريبي',
          'هذا إشعار تجريبي تم إرساله لجميع المستخدمين النشطين.',
          {
            type: 'info',
            priority: 'low',
            category: 'system'
          }
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'نوع الاختبار غير مدعوم' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'تم تنفيذ الاختبار بنجاح',
      result
    });

  } catch (error) {
    console.error('Error in test notifications:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}