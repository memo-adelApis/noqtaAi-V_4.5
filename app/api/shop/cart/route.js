import { NextResponse } from 'next/server';
import { getShopUserFromRequest } from '@/utils/shopAuth';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';
import Item from '@/models/Items';

// GET - جلب محتويات السلة
export async function GET(request) {
  try {
    await connectToDB();
    
    const user = await getShopUserFromRequest(request);
    
    if (!user) {
      // إرجاع سلة فارغة للزوار غير المسجلين
      return NextResponse.json({
        success: true,
        cart: [],
        total: 0
      });
    }

    // جلب السلة مع تفاصيل المنتجات
    const userWithCart = await ShopUser.findById(user._id)
      .populate({
        path: 'cart.item',
        select: 'name sellingPrice images quantity_Remaining status isVisible'
      })
      .select('cart');

    if (!userWithCart) {
      return NextResponse.json({
        success: true,
        cart: [],
        total: 0
      });
    }

    // فلترة المنتجات المتاحة فقط
    const availableCartItems = userWithCart.cart.filter(cartItem => 
      cartItem.item && 
      cartItem.item.status === 'active' && 
      cartItem.item.isVisible && 
      cartItem.item.quantity_Remaining > 0
    );

    // حساب الإجمالي
    const total = availableCartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    return NextResponse.json({
      success: true,
      cart: availableCartItems,
      total
    });

  } catch (error) {
    console.error('خطأ في جلب السلة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// POST - إضافة منتج للسلة
export async function POST(request) {
  try {
    await connectToDB();
    
    const user = await getShopUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const { itemId, quantity = 1 } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود المنتج
    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من توفر المنتج
    if (item.status !== 'active' || !item.isVisible) {
      return NextResponse.json(
        { error: 'المنتج غير متاح' },
        { status: 400 }
      );
    }

    if (item.quantity_Remaining < quantity) {
      return NextResponse.json(
        { error: 'الكمية المطلوبة غير متوفرة' },
        { status: 400 }
      );
    }

    // إضافة المنتج للسلة
    const shopUser = await ShopUser.findById(user._id);
    await shopUser.addToCart(itemId, quantity, item.sellingPrice);

    return NextResponse.json({
      success: true,
      message: 'تم إضافة المنتج للسلة'
    });

  } catch (error) {
    console.error('خطأ في إضافة المنتج للسلة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// PUT - تحديث كمية منتج في السلة
export async function PUT(request) {
  try {
    await connectToDB();
    
    const user = await getShopUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const { itemId, quantity } = await request.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'معرف المنتج والكمية مطلوبان' },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: 'الكمية يجب أن تكون أكبر من أو تساوي صفر' },
        { status: 400 }
      );
    }

    // التحقق من توفر الكمية إذا كانت أكبر من صفر
    if (quantity > 0) {
      const item = await Item.findById(itemId);
      if (!item || item.quantity_Remaining < quantity) {
        return NextResponse.json(
          { error: 'الكمية المطلوبة غير متوفرة' },
          { status: 400 }
        );
      }
    }

    // تحديث الكمية
    const shopUser = await ShopUser.findById(user._id);
    await shopUser.updateCartQuantity(itemId, quantity);

    return NextResponse.json({
      success: true,
      message: quantity > 0 ? 'تم تحديث الكمية' : 'تم حذف المنتج من السلة'
    });

  } catch (error) {
    console.error('خطأ في تحديث السلة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// DELETE - حذف منتج من السلة أو تفريغ السلة
export async function DELETE(request) {
  try {
    await connectToDB();
    
    const user = await getShopUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const clearAll = searchParams.get('clearAll') === 'true';

    const shopUser = await ShopUser.findById(user._id);

    if (clearAll) {
      // تفريغ السلة بالكامل
      await shopUser.clearCart();
      return NextResponse.json({
        success: true,
        message: 'تم تفريغ السلة'
      });
    } else if (itemId) {
      // حذف منتج محدد
      await shopUser.removeFromCart(itemId);
      return NextResponse.json({
        success: true,
        message: 'تم حذف المنتج من السلة'
      });
    } else {
      return NextResponse.json(
        { error: 'يجب تحديد المنتج أو استخدام clearAll' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('خطأ في حذف من السلة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}