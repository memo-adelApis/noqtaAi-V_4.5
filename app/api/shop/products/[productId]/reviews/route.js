import { NextResponse } from 'next/server';
import { requireShopAuth, getShopUserFromRequest } from '@/utils/shopAuth';
import { connectToDB } from '@/utils/database';
import ProductReview from '@/models/ProductReview';
import Item from '@/models/Items';
import ShopOrder from '@/models/ShopOrder';

// GET - جلب تقييمات المنتج
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { productId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, highest, lowest, helpful
    
    const skip = (page - 1) * limit;

    // بناء استعلام الترتيب
    let sortQuery = {};
    switch (sortBy) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'highest':
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortQuery = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        sortQuery = { 'helpful.count': -1, createdAt: -1 };
        break;
      default: // newest
        sortQuery = { createdAt: -1 };
    }

    // جلب التقييمات
    const [reviews, totalReviews, ratingStats] = await Promise.all([
      ProductReview.find({ 
        productId, 
        status: 'approved' 
      })
        .populate('userId', 'name')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      
      ProductReview.countDocuments({ 
        productId, 
        status: 'approved' 
      }),
      
      ProductReview.getProductRatingStats(productId)
    ]);

    // التحقق من إمكانية المراجعة للمستخدم الحالي
    let canReview = false;
    let userReview = null;
    
    const user = await getShopUserFromRequest(request);
    if (user) {
      const reviewCheck = await ProductReview.canUserReview(user._id, productId);
      canReview = reviewCheck.canReview;
      
      // جلب مراجعة المستخدم إذا كانت موجودة
      userReview = await ProductReview.findOne({ 
        userId: user._id, 
        productId 
      }).lean();
    }

    return NextResponse.json({
      success: true,
      reviews,
      ratingStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1
      },
      canReview,
      userReview
    });

  } catch (error) {
    console.error('خطأ في جلب التقييمات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// POST - إضافة تقييم جديد
export async function POST(request, { params }) {
  try {
    await connectToDB();
    
    const authResult = await requireShopAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { productId } = await params;
    const { rating, comment } = await request.json();

    // التحقق من صحة البيانات
    if (!rating || !comment) {
      return NextResponse.json(
        { error: 'التقييم والتعليق مطلوبان' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'التقييم يجب أن يكون بين 1 و 5' },
        { status: 400 }
      );
    }

    if (comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'التعليق يجب أن يكون 10 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من وجود المنتج
    const product = await Item.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من إمكانية المراجعة
    const reviewCheck = await ProductReview.canUserReview(authResult.user._id, productId);
    if (!reviewCheck.canReview) {
      return NextResponse.json(
        { error: reviewCheck.reason },
        { status: 400 }
      );
    }

    // التحقق من شراء المنتج (اختياري)
    const hasPurchased = await ShopOrder.findOne({
      customerId: authResult.user._id,
      'items.itemId': productId,
      status: { $in: ['delivered', 'completed'] }
    });

    // إنشاء التقييم
    const newReview = new ProductReview({
      productId,
      userId: authResult.user._id,
      shopId: product.storeId, // أو يمكن الحصول عليه من المنتج
      orderId: hasPurchased?._id,
      rating,
      comment: comment.trim(),
      reviewer: {
        name: authResult.user.name,
        verified: !!hasPurchased
      },
      status: 'approved', // يمكن تغييرها إلى 'pending' للمراجعة اليدوية
      metadata: {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    await newReview.save();

    return NextResponse.json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      review: {
        _id: newReview._id,
        rating: newReview.rating,
        comment: newReview.comment,
        reviewer: newReview.reviewer,
        createdAt: newReview.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('خطأ في إضافة التقييم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}