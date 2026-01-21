import { NextResponse } from 'next/server';
import { NotificationService } from '../../../../utils/notificationService';

export async function GET(request) {
  try {
    // التحقق من وجود مفتاح API للحماية
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    console.log('Starting subscription expiry check...');
    
    // فحص انتهاء الاشتراكات
    const result = await NotificationService.checkSubscriptionExpiry();
    
    if (result.success) {
      console.log(`Subscription check completed: ${result.sentCount} notifications sent`);
      
      return NextResponse.json({
        success: true,
        message: 'تم فحص الاشتراكات بنجاح',
        data: {
          notificationsSent: result.sentCount,
          expiringSubscriptions: result.expiringCount,
          expiredSubscriptions: result.expiredCount
        }
      });
    } else {
      console.error('Subscription check failed:', result.error);
      
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in subscription check cron:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // نفس المنطق للـ POST إذا كنت تريد تشغيله يدوياً
  return GET(request);
}