import { NextResponse } from 'next/server';
import { requireShopAuth } from '@/utils/shopAuth';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';

// GET - جلب ملف المستخدم الشخصي
export async function GET(request) {
  try {
    await connectToDB();
    
    const authResult = await requireShopAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const user = await ShopUser.findById(authResult.user._id)
      .select('-password -phoneVerification')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('خطأ في جلب الملف الشخصي:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// PUT - تحديث ملف المستخدم الشخصي
export async function PUT(request) {
  try {
    await connectToDB();
    
    const authResult = await requireShopAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const updateData = await request.json();
    
    // الحقول المسموح بتحديثها
    const allowedFields = ['name', 'email', 'address', 'dateOfBirth', 'gender', 'preferences'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // التحقق من البريد الإلكتروني إذا تم تحديثه
    if (updates.email) {
      const existingUser = await ShopUser.findOne({ 
        email: updates.email,
        _id: { $ne: authResult.user._id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم مسبقاً' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await ShopUser.findByIdAndUpdate(
      authResult.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -phoneVerification');

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: updatedUser
    });

  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}