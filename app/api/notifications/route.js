import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Notification from '@/models/Notification';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // بناء query للفلترة - يمكن لجميع الأدوار رؤية إشعاراتهم
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

    // عدد الإشعارات غير المقروءة - استخدام countDocuments مباشرة
    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      isRead: false,
      isArchived: false,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    // إجمالي الإشعارات
    const totalCount = await Notification.countDocuments({
      userId: session.user.id,
      isArchived: false
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}