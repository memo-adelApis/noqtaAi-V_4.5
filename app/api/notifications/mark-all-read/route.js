import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Notification from '@/models/Notification';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    await connectToDB();

    // تحديث جميع الإشعارات غير المقروءة للمستخدم
    const result = await Notification.updateMany(
      { 
        userId: session.user.id,
        isRead: false,
        isArchived: false
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}