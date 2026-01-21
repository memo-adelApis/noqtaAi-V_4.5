import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Shop from '@/models/Shop';
import ShopOrder from '@/models/ShopOrder';

// GET - جلب متجر المشترك
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذا الإجراء' },
        { status: 401 }
      );
    }

    await connectToDB();

    // البحث عن متجر المشترك
    const shop = await Shop.findOne({ 
      subscriberId: session.user.id 
    }).lean();

    if (!shop) {
      return NextResponse.json({
        hasShop: false,
        message: 'لا يوجد متجر مرتبط بحسابك'
      });
    }

    // جلب إحصائيات الطلبات
    const orderStats = await ShopOrder.getShopStats(shop._id);

    // حساب الأيام المتبقية في الاشتراك
    const daysLeft = Math.max(0, Math.ceil((new Date(shop.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

    const response = {
      hasShop: true,
      shop: {
        ...shop,
        daysLeft,
        isExpired: new Date() > new Date(shop.subscription.endDate),
        shopUrl: `/shop/${shop.uniqueName}`,
        orderStats
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('خطأ في جلب بيانات المتجر:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// POST - إنشاء متجر جديد
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذا الإجراء' },
        { status: 401 }
      );
    }

    await connectToDB();

    // التحقق من عدم وجود متجر مسبقاً
    const existingShop = await Shop.findOne({ 
      subscriberId: session.user.id 
    });

    if (existingShop) {
      return NextResponse.json(
        { error: 'لديك متجر مسبقاً' },
        { status: 400 }
      );
    }

    const shopData = await request.json();

    // التحقق من صحة البيانات
    if (!shopData.name || !shopData.uniqueName) {
      return NextResponse.json(
        { error: 'اسم المتجر والاسم الفريد مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من توفر الاسم الفريد
    const isUniqueNameAvailable = await Shop.isUniqueNameAvailable(shopData.uniqueName);
    if (!isUniqueNameAvailable) {
      return NextResponse.json(
        { error: 'الاسم الفريد مستخدم مسبقاً' },
        { status: 400 }
      );
    }

    // إنشاء المتجر
    const newShop = new Shop({
      name: shopData.name,
      uniqueName: shopData.uniqueName,
      description: shopData.description,
      keywords: shopData.keywords || [],
      contact: shopData.contact || {},
      subscriberId: session.user.id,
      status: 'active', // نشط مباشرة بعد الدفع
      subscription: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        isActive: true,
        monthlyPrice: 70
      }
    });

    await newShop.save();

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المتجر بنجاح',
      shop: {
        _id: newShop._id,
        name: newShop.name,
        uniqueName: newShop.uniqueName,
        shopUrl: `/shop/${newShop.uniqueName}`,
        status: newShop.status,
        daysLeft: 30
      }
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء المتجر:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'الاسم الفريد مستخدم مسبقاً' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المتجر' },
      { status: 500 }
    );
  }
}

// PUT - تحديث بيانات المتجر
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذا الإجراء' },
        { status: 401 }
      );
    }

    await connectToDB();

    const updateData = await request.json();

    // البحث عن المتجر
    const shop = await Shop.findOne({ 
      subscriberId: session.user.id 
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'المتجر غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من الاسم الفريد إذا تم تغييره
    if (updateData.uniqueName && updateData.uniqueName !== shop.uniqueName) {
      const isUniqueNameAvailable = await Shop.isUniqueNameAvailable(updateData.uniqueName, shop._id);
      if (!isUniqueNameAvailable) {
        return NextResponse.json(
          { error: 'الاسم الفريد مستخدم مسبقاً' },
          { status: 400 }
        );
      }
    }

    // تحديث البيانات المسموحة
    const allowedUpdates = [
      'name', 'description', 'keywords', 'contact', 'settings', 
      'socialMedia', 'workingHours', 'seo'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // تحديث الاسم الفريد بحذر
    if (updateData.uniqueName) {
      updates.uniqueName = updateData.uniqueName;
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'تم تحديث المتجر بنجاح',
      shop: updatedShop
    });

  } catch (error) {
    console.error('خطأ في تحديث المتجر:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث المتجر' },
      { status: 500 }
    );
  }
}

// DELETE - حذف المتجر
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json(
        { error: 'غير مصرح لك بهذا الإجراء' },
        { status: 401 }
      );
    }

    await connectToDB();

    // البحث عن المتجر
    const shop = await Shop.findOne({ 
      subscriberId: session.user.id 
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'المتجر غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من وجود طلبات معلقة
    const pendingOrders = await ShopOrder.countDocuments({
      shopId: shop._id,
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
    });

    if (pendingOrders > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف المتجر. يوجد ${pendingOrders} طلب معلق` },
        { status: 400 }
      );
    }

    // حذف المتجر
    await Shop.findByIdAndDelete(shop._id);

    return NextResponse.json({
      success: true,
      message: 'تم حذف المتجر بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف المتجر:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف المتجر' },
      { status: 500 }
    );
  }
}