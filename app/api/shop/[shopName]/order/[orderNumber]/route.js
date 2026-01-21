import { NextResponse } from 'next/server';
import { requireShopAuth } from '@/utils/shopAuth';
import { connectToDB } from '@/utils/database';
import ShopOrder from '@/models/ShopOrder';
import Shop from '@/models/Shop';

// GET - جلب تفاصيل طلب محدد
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const authResult = await requireShopAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { shopName, orderNumber } = await params;

    // البحث عن المتجر
    const shop = await Shop.findOne({ 
      uniqueName: shopName.toLowerCase(),
      status: 'active'
    }).select('name uniqueName contact socialMedia');

    if (!shop) {
      return NextResponse.json(
        { error: 'المتجر غير موجود' },
        { status: 404 }
      );
    }

    // البحث عن الطلب
    const order = await ShopOrder.findOne({
      orderNumber,
      shopId: shop._id,
      customerId: authResult.user._id
    }).populate({
      path: 'items.itemId',
      select: 'name images'
    });

    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      shop
    });

  } catch (error) {
    console.error('خطأ في جلب تفاصيل الطلب:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}