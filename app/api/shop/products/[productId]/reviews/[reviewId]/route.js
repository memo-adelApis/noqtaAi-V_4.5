import { NextResponse } from 'next/server';
import { requireShopAuth } from '@/utils/shopAuth';
import { connectToDB } from '@/utils/database';
import ProductReview from '@/models/ProductReview';

// GET - جلب تقييم محدد
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { productId, reviewId } = await params;

    const review = await ProductReview.findOne({
      _id: reviewId,
      productId,
      status: 'approved'
    })
      .populate('userId', 'name')
      .lean();

    if (!review) {
      return NextResponse.json(
        { error: 'التقييم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review
    });

  } catch (error) {
    console.error('خطأ في جلب التقييم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// PUT - تحديث تقييم
export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    const authResult = await requireShopAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { productId, reviewId } = await params;
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

    // البحث عن التقييم والتأكد من ملكية المستخدم له
    const review = await ProductReview.findOne({
      _id: reviewId,
      productId,
      userId: authResult.user._id
    });

    if (!review) {
      return NextResponse.json(
        { error: 'التقييم غير موجود أو ليس لديك صلاحية لتعديله' },
        { status: 404 }
      );
    }

    // تحديث التقييم
    review.rating = rating;
    review.comment = comment.trim();
    review.status = 'approved'; // يمكن تغييرها إلى 'pending' للمراجعة اليدوية
    
    await review.save();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث التقييم بنجاح',
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        updatedAt: review.updatedAt
      }
    });

  } catch (error) {
    console.error('خطأ في تحديث التقييم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// DELETE - حذف تقييم
export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    const authResult = await requireShopAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { productId, reviewId } = await params;

    // البحث عن التقييم والتأكد من ملكية المستخدم له
    const review = await ProductReview.findOne({
      _id: reviewId,
      productId,
      userId: authResult.user._id
    });

    if (!review) {
      return NextResponse.json(
        { error: 'التقييم غير موجود أو ليس لديك صلاحية لحذفه' },
        { status: 404 }
      );
    }

    // حذف التقييم
    await ProductReview.findByIdAndDelete(reviewId);

    // تحديث إحصائيات المنتج
    const Item = require('@/models/Items').default;
    const stats = await ProductReview.getProductRatingStats(productId);
    
    await Item.findByIdAndUpdate(productId, {
      'rating.average': stats.averageRating,
      'rating.count': stats.totalReviews
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف التقييم بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف التقييم:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}