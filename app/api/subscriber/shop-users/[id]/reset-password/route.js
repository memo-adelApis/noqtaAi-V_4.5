import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';

// POST - إعادة تعيين كلمة مرور المستخدم
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    await connectToDB();

    const { id } = await params;
    const { newPassword } = await request.json();

    // التحقق من كلمة المرور الجديدة
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم
    const user = await ShopUser.findOne({
      _id: id,
      ownerId: session.user.id
    });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}