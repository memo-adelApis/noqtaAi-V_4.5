import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import Shop from '@/models/Shop';
import ShopOrder from '@/models/ShopOrder';
import Item from '@/models/Items';
import Invoice from '@/models/Invoices';

// POST - إنشاء طلب جديد
export async function POST(request, { params }) {
  try {
    await connectToDB();
    
    const { shopName } = params;
    const orderData = await request.json();

    // التحقق من صحة البيانات
    const { customer, items, shipping, payment } = orderData;

    if (!customer?.name || !customer?.phone || !items?.length) {
      return NextResponse.json(
        { error: 'بيانات الطلب غير مكتملة' },
        { status: 400 }
      );
    }

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

    // التحقق من انتهاء الاشتراك
    if (shop.isSubscriptionExpired) {
      return NextResponse.json(
        { error: 'انتهت صلاحية اشتراك المتجر' },
        { status: 403 }
      );
    }

    // التحقق من المنتجات وتوفرها
    const productIds = items.map(item => item.productId);
    const products = await Item.find({
      _id: { $in: productIds },
      userId: shop.subscriberId,
      status: 'active',
      isVisible: true
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'بعض المنتجات غير متوفرة' },
        { status: 400 }
      );
    }

    // التحقق من الكميات المتوفرة
    const orderItems = [];
    let subtotal = 0;

    for (const orderItem of items) {
      const product = products.find(p => p._id.toString() === orderItem.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: `المنتج غير موجود: ${orderItem.productId}` },
          { status: 400 }
        );
      }

      if (product.quantity_Remaining < orderItem.quantity) {
        return NextResponse.json(
          { error: `الكمية المطلوبة غير متوفرة للمنتج: ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = product.sellingPrice * orderItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        price: product.sellingPrice,
        quantity: orderItem.quantity,
        total: itemTotal,
        productSnapshot: {
          description: product.description,
          image: product.images?.[0],
          category: product.categoryId
        }
      });
    }

    // حساب التكاليف
    const shippingCost = shipping?.cost || shop.settings.shipping.shippingCost || 0;
    const discount = orderData.discount || 0;
    const tax = 0; // يمكن إضافة حساب الضريبة لاحقاً
    const total = subtotal - discount + shippingCost + tax;

    // إنشاء الطلب
    const newOrder = new ShopOrder({
      shopId: shop._id,
      subscriberId: shop.subscriberId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      },
      items: orderItems,
      pricing: {
        subtotal,
        discount,
        shippingCost,
        tax,
        total
      },
      shipping: {
        method: shipping?.method || 'delivery',
        address: shipping?.address || customer.address,
        notes: shipping?.notes
      },
      payment: {
        method: payment?.method || 'cash',
        status: payment?.method === 'cash' ? 'pending' : 'pending'
      },
      notes: {
        customer: orderData.notes
      },
      source: 'website'
    });

    await newOrder.save();

    // تحديث كميات المنتجات (حجز الكمية)
    for (const orderItem of orderItems) {
      await Item.findByIdAndUpdate(orderItem.productId, {
        $inc: { quantity_spent: orderItem.quantity }
      });
    }

    // إنشاء فاتورة في النظام الأساسي
    try {
      const invoice = new Invoice({
        invoiceNumber: `SHOP-${newOrder.orderNumber}`,
        type: 'revenue',
        invoiceKind: 'normal',
        customerId: null, // يمكن ربطه بعميل موجود لاحقاً
        userId: shop.subscriberId,
        branchId: null, // طلب من المتجر الإلكتروني
        items: orderItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total
        })),
        discount: discount,
        extra: shippingCost,
        taxRate: 0,
        vatAmount: tax,
        totalItems: subtotal,
        totalInvoice: total,
        paymentType: payment?.method === 'cash' ? 'cash' : 'credit',
        pays: payment?.method === 'cash' ? [{
          date: new Date(),
          amount: total,
          method: 'cash',
          status: 'pending'
        }] : [],
        currencyCode: shop.settings.currency || 'EGP',
        status: 'pending',
        notes: `طلب من المتجر الإلكتروني - ${newOrder.orderNumber}`
      });

      await invoice.save();
    } catch (invoiceError) {
      console.error('خطأ في إنشاء الفاتورة:', invoiceError);
      // لا نوقف العملية إذا فشل إنشاء الفاتورة
    }

    // تحديث إحصائيات المتجر
    await Shop.findByIdAndUpdate(shop._id, {
      $inc: { 
        'stats.totalOrders': 1,
        'stats.totalRevenue': total
      }
    });

    // إرجاع بيانات الطلب
    const responseOrder = {
      orderNumber: newOrder.orderNumber,
      _id: newOrder._id,
      status: newOrder.status,
      total: newOrder.pricing.total,
      items: newOrder.items,
      customer: newOrder.customer,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 أيام
      trackingUrl: `/shop/${shopName}/order/${newOrder.orderNumber}`
    };

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      order: responseOrder
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إنشاء الطلب:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الطلب' },
      { status: 500 }
    );
  }
}

// GET - جلب طلبات المتجر (للمشترك)
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { shopName } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // البحث عن المتجر
    const shop = await Shop.findOne({ 
      uniqueName: shopName.toLowerCase() 
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'المتجر غير موجود' },
        { status: 404 }
      );
    }

    // بناء استعلام الطلبات
    const orderQuery = { shopId: shop._id };
    if (status && status !== 'all') {
      orderQuery.status = status;
    }

    // جلب الطلبات
    const [orders, totalOrders] = await Promise.all([
      ShopOrder.find(orderQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ShopOrder.countDocuments(orderQuery)
    ]);

    return NextResponse.json({
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
      { error: 'حدث خطأ في جلب الطلبات' },
      { status: 500 }
    );
  }
}