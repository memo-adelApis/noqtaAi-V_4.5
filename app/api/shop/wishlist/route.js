import { NextResponse } from 'next/server';
import { getShopUserFromRequest, requireShopAuth } from '@/utils/shopAuth';
import { connectToDB } from '@/utils/database';
import ShopUser from '@/models/ShopUser';
import Item from '@/models/Items';

// GET - جلب المفضلة
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

    // جلب المفضلة مع تفاصيل المنتجات
    const userWithWishlist = await ShopUser.findById(authResult.user._id)
      .populate({
        path: 'wishlist',
        select: 'name sellingPrice images quantity_Remaining status isVisible categoryId',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .select('wishlist');

    if (!userWithWishlist) {
      return NextResponse.json({
        success: true,
        wishlist: []
      });
    }

    // فلترة المنتجات المتاحة فقط
    const availableWishlistItems = userWithWishlist.wishlist.filter(item => 
      item && 
      item.status === 'active' && 
      item.isVisible
    );

    return NextResponse.json({
      success: true,
      wishlist: availableWishlistItems
    });

  } catch (error) {
    console.error('خطأ في جلب المفضلة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// POST - إضافة منتج للمفضلة
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

    const { itemId } = await request.json();

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

    // إضافة المنتج للمفضلة
    const user = await ShopUser.findById(authResult.user._id);
    
    // التحقق من عدم وجود المنتج مسبقاً
    if (user.wishlist.includes(itemId)) {
      return NextResponse.json(
        { error: 'المنتج موجود في المفضلة مسبقاً' },
        { status: 400 }
      );
    }

    user.wishlist.push(itemId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'تم إضافة المنتج للمفضلة'
    });

  } catch (error) {
    console.error('خطأ في إضافة المنتج للمفضلة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// DELETE - حذف منتج من المفضلة
export async function DELETE(request) {
  try {
    await connectToDB();
    
    const authResult = await requireShopAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' },
        { status: 400 }
      );
    }

    // حذف المنتج من المفضلة
    const user = await ShopUser.findById(authResult.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== itemId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج من المفضلة'
    });

  } catch (error) {
    console.error('خطأ في حذف المنتج من المفضلة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}