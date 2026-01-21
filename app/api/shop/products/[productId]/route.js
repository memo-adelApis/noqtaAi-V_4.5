import { NextResponse } from 'next/server';
import { getShopUserFromRequest } from '@/utils/shopAuth';
import { connectToDB } from '@/utils/database';
import Item from '@/models/Items';
import ProductReview from '@/models/ProductReview';
import ShopUser from '@/models/ShopUser';
import Store from '@/models/Store';


// GET - جلب تفاصيل المنتج
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { productId } = await params;

    // جلب المنتج مع المعلومات المرتبطة
    const product = await Item.findById(productId)
      .populate('categoryId', 'name')
      .populate('unitId', 'name')
      .populate('storeId', 'name')
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من أن المنتج مرئي
    if (!product.isVisible || product.status !== 'active') {
      return NextResponse.json(
        { error: 'المنتج غير متاح' },
        { status: 404 }
      );
    }

    // جلب إحصائيات التقييم
    const ratingStats = await ProductReview.getProductRatingStats(productId);

    // جلب بعض التقييمات الأخيرة
    const recentReviews = await ProductReview.find({
      productId,
      status: 'approved'
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // التحقق من حالة المستخدم الحالي
    let userStatus = {
      isLoggedIn: false,
      canReview: false,
      userReview: null,
      isInWishlist: false,
      isInCart: false
    };

    const user = await getShopUserFromRequest(request);
    if (user) {
      userStatus.isLoggedIn = true;
      
      // التحقق من إمكانية المراجعة
      const reviewCheck = await ProductReview.canUserReview(user._id, productId);
      userStatus.canReview = reviewCheck.canReview;
      
      // جلب مراجعة المستخدم إذا كانت موجودة
      userStatus.userReview = await ProductReview.findOne({
        userId: user._id,
        productId
      }).lean();

      // التحقق من المفضلة والسلة
      const userData = await ShopUser.findById(user._id)
        .select('wishlist cart')
        .lean();
      
      if (userData) {
        userStatus.isInWishlist = userData.wishlist?.includes(productId) || false;
        userStatus.isInCart = userData.cart?.some(item => 
          item.item?.toString() === productId
        ) || false;
      }
    }

    // منتجات مشابهة (نفس الفئة)
    const relatedProducts = await Item.find({
      categoryId: product.categoryId._id,
      _id: { $ne: productId },
      isVisible: true,
      status: 'active',
      quantity_Remaining: { $gt: 0 }
    })
      .select('name sellingPrice images rating')
      .limit(4)
      .lean();

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        rating: ratingStats
      },
      recentReviews,
      relatedProducts,
      userStatus
    });

  } catch (error) {
    console.error('خطأ في جلب تفاصيل المنتج:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}