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

    console.log('Starting notification cleanup...');
    
    // تنظيف الإشعارات المنتهية
    const result = await NotificationService.cleanupExpiredNotifications();
    
    if (result.success) {
      console.log(`Notification cleanup completed: ${result.deletedCount} notifications deleted`);
      
      return NextResponse.json({
        success: true,
        message: 'تم تنظيف الإشعارات بنجاح',
        data: {
          deletedCount: result.deletedCount
        }
      });
    } else {
      console.error('Notification cleanup failed:', result.error);
      
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in notification cleanup cron:', error);
    
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}