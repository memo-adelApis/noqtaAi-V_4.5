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

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: 'معرف الإشعار مطلوب' },
        { status: 400 }
      );
    }

    // أرشفة الإشعار
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        userId: session.user.id 
      },
      { 
        isArchived: true,
        archivedAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'الإشعار غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم أرشفة الإشعار'
    });

  } catch (error) {
    console.error('Error archiving notification:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}