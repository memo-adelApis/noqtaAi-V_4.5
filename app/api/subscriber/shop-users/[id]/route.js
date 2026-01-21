import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';
import ShopOrder from '@/models/ShopOrder';

// GET - جلب تفاصيل مستخدم محدد
export async function GET(request, { params }) {
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

    // البحث عن المستخدم
    const user = await ShopUser.findOne({
      _id: id,
      ownerId: session.user.id
    }).populate({
      path: 'cart.item',
      select: 'name sellingPrice images'
    }).populate({
      path: 'wishlist',
      select: 'name sellingPrice images'
    });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // جلب طلبات المستخدم
    const orders = await ShopOrder.find({ customerId: id })
      .select('orderNumber status pricing.total createdAt paymentStatus')
      .sort({ createdAt: -1 })
      .limit(10);

    // حساب الإحصائيات
    const orderStats = await ShopOrder.aggregate([
      { $match: { customerId: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          lastOrderDate: { $max: '$createdAt' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderDate: null,
      pendingOrders: 0,
      completedOrders: 0
    };

    return NextResponse.json({
      success: true,
      user: {
        ...user.toObject(),
        stats
      },
      recentOrders: orders
    });

  } catch (error) {
    console.error('خطأ في جلب تفاصيل المستخدم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// PUT - تحديث بيانات المستخدم
export async function PUT(request, { params }) {
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
    const updateData = await request.json();

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

    // الحقول المسموح بتحديثها
    const allowedFields = [
      'name', 'email', 'phone', 'address', 'isActive', 
      'isVerified', 'preferences', 'dateOfBirth', 'gender'
    ];

    // تحديث الحقول المسموحة فقط
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'address' && typeof updateData[key] === 'object') {
          user.address = { ...user.address, ...updateData[key] };
        } else if (key === 'preferences' && typeof updateData[key] === 'object') {
          user.preferences = { ...user.preferences, ...updateData[key] };
        } else {
          user[key] = updateData[key];
        }
      }
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
        isVerified: user.isVerified,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('خطأ في تحديث المستخدم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// DELETE - حذف المستخدم
export async function DELETE(request, { params }) {
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

    // التحقق من وجود طلبات للمستخدم
    const hasOrders = await ShopOrder.countDocuments({ customerId: id });

    if (hasOrders > 0) {
      // إلغاء تفعيل المستخدم بدلاً من حذفه
      user.isActive = false;
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'تم إلغاء تفعيل المستخدم (لديه طلبات سابقة)'
      });
    } else {
      // حذف المستخدم نهائياً
      await ShopUser.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'تم حذف المستخدم نهائياً'
      });
    }

  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}