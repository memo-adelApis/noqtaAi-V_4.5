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

    // إنشاء إشعار تجريبي
    const notification = await Notification.create({
      userId: session.user.id,
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح.',
      type: 'info',
      priority: 'medium',
      category: 'system'
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الإشعار التجريبي بنجاح',
      notification: {
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message
      }
    });

  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم: ' + error.message },
      { status: 500 }
    );
  }
}