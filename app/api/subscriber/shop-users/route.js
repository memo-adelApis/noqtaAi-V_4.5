import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';
import Shop from '@/models/Shop';
import ShopOrder from '@/models/ShopOrder';

// GET - جلب مستخدمي المتجر
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const shopId = searchParams.get('shopId');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // بناء استعلام البحث
    let query = { ownerId: session.user.id };

    // فلترة حسب المتجر إذا تم تحديده
    if (shopId) {
      const shop = await Shop.findOne({ 
        _id: shopId, 
        subscriberId: session.user.id 
      });
      if (!shop) {
        return NextResponse.json(
          { error: 'المتجر غير موجود' },
          { status: 404 }
        );
      }
      // هنا يمكن إضافة ربط بين المستخدم والمتجر إذا لزم الأمر
    }

    // البحث بالاسم أو الهاتف أو البريد الإلكتروني
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // فلترة حسب الحالة
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'verified') {
        query.isVerified = true;
      } else if (status === 'unverified') {
        query.isVerified = false;
      }
    }

    // جلب المستخدمين مع الإحصائيات
    const [users, totalUsers] = await Promise.all([
      ShopUser.find(query)
        .select('-cart -wishlist')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ShopUser.countDocuments(query)
    ]);

    // إضافة إحصائيات لكل مستخدم
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderStats = await ShopOrder.aggregate([
          { $match: { customerId: user._id } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$pricing.total' },
              lastOrderDate: { $max: '$createdAt' }
            }
          }
        ]);

        const stats = orderStats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null
        };

        return {
          ...user,
          stats
        };
      })
    );

    // إحصائيات عامة
    const generalStats = await ShopUser.aggregate([
      { $match: { ownerId: session.user.id } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
          },
          newUsersThisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$createdAt',
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = generalStats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      newUsersThisMonth: 0
    };

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('خطأ في جلب مستخدمي المتجر:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// POST - إنشاء مستخدم جديد (للاختبار)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    await connectToDB();

    const { name, email, phone, password, address } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من قوة كلمة المرور
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await ShopUser.findOne({
      $or: [
        { email: email },
        { phone: phone }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'المستخدم موجود مسبقاً' },
        { status: 400 }
      );
    }

    // إنشاء المستخدم الجديد
    const newUser = new ShopUser({
      name,
      email,
      phone,
      password,
      address,
      ownerId: session.user.id,
      isActive: true,
      isVerified: false
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        isActive: newUser.isActive,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}