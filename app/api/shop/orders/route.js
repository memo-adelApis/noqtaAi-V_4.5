import { NextResponse } from 'next/server';
import { requireShopAuth } from '@/utils/shopAuth';
import { connectToDB } from '@/utils/database';
import ShopOrder from '@/models/ShopOrder';
import ShopUser from '@/models/ShopUser';
import Shop from '@/models/Shop';
import Item from '@/models/Items';

// POST - إنشاء طلب جديد
export async function POST(request) {
  try {
    await connectToDB();
    
    const authResult = await requireShopAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { 
      shopName, 
      shippingAddress, 
      paymentMethod, 
      notes, 
      productReviews 
    } = await request.json();

    // البحث عن المتجر
    const shop = await Shop.findOne({ 
      uniqueName: shopName.toLowerCase(),
      status: 'active'
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'المتجر غير موجود' },
        { status: 404 }
      );
    }

    // جلب سلة المستخدم
    const user = await ShopUser.findById(authResult.user._id)
      .populate({
        path: 'cart.item',
        select: 'name sellingPrice images quantity_Remaining status isVisible categoryId',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      });

    if (!user || user.cart.length === 0) {
      return NextResponse.json(
        { error: 'السلة فارغة' },
        { status: 400 }
      );
    }

    // التحقق من توفر المنتجات
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of user.cart) {
      const item = cartItem.item;
      
      if (!item || item.status !== 'active' || !item.isVisible) {
        return NextResponse.json(
          { error: `المنتج ${item?.name || 'غير معروف'} غير متاح` },
          { status: 400 }
        );
      }

      if (item.quantity_Remaining < cartItem.quantity) {
        return NextResponse.json(
          { error: `الكمية المطلوبة من ${item.name} غير متوفرة` },
          { status: 400 }
        );
      }

      const itemTotal = cartItem.price * cartItem.quantity;
      subtotal += itemTotal;

      const orderItem = {
        itemId: item._id,
        name: item.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
        total: itemTotal,
        image: item.images?.[0] || null,
        category: item.categoryId?.name || 'غير محدد'
      };

      // إضافة التقييم إذا كان موجوداً
      if (productReviews && productReviews[item._id]) {
        orderItem.review = {
          rating: productReviews[item._id].rating,
          comment: productReviews[item._id].comment || '',
          date: new Date()
        };
      }

      orderItems.push(orderItem);
    }

    // حساب الإجماليات
    const shipping = subtotal >= 500 ? 0 : 30;
    const tax = subtotal * 0.14;
    const total = subtotal + shipping + tax;

    // إنشاء الطلب
    const newOrder = new ShopOrder({
      shopId: shop._id,
      subscriberId: shop.subscriberId,
      customerId: user._id,
      customer: {
        name: authResult.user.name,
        phone: authResult.user.phone,
        email: authResult.user.email
      },
      items: orderItems,
      pricing: {
        subtotal,
        shipping,
        tax,
        total
      },
      shippingAddress,
      paymentMethod,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await newOrder.save();

    // تحديث كميات المنتجات
    for (const cartItem of user.cart) {
      await Item.findByIdAndUpdate(
        cartItem.item._id,
        { $inc: { quantity_Remaining: -cartItem.quantity } }
      );
    }

    // تفريغ سلة المستخدم
    await user.clearCart();

    // تحديث إحصائيات المتجر
    await Shop.findByIdAndUpdate(shop._id, {
      $inc: { 
        'stats.totalOrders': 1,
        'stats.totalRevenue': total
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      orderNumber: newOrder.orderNumber,
      orderId: newOrder._id.toString(),
      total
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء الطلب:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// GET - جلب طلبات المستخدم
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // جلب طلبات المستخدم
    const [orders, totalOrders] = await Promise.all([
      ShopOrder.find({ customerId: authResult.user._id })
        .populate('shopId', 'name uniqueName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ShopOrder.countDocuments({ customerId: authResult.user._id })
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}