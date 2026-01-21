import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Shop from '@/models/Shop';
import ShopOrder from '@/models/ShopOrder';
import ShopUser from '@/models/ShopUser';
import ProductReview from '@/models/ProductReview';
import Item from '@/models/Items';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      );
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30;
    const period = searchParams.get('period') || 'daily';

    // تاريخ البداية والنهاية
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // جلب بيانات المتجر
    const shop = await Shop.findOne({ subscriberId: session.user.id })
      .lean();

    if (!shop) {
      return NextResponse.json({
        success: true,
        shopData: null,
        analytics: null,
        message: 'لا يوجد متجر إلكتروني'
      });
    }

    // إحصائيات المتجر الأساسية
    const [totalProducts, totalCustomers, averageRating] = await Promise.all([
      Item.countDocuments({ 
        userId: session.user.id,
        isVisible: true,
        status: 'active'
      }),
      ShopUser.countDocuments({ ownerId: session.user.id }),
      ProductReview.aggregate([
        {
          $lookup: {
            from: 'items',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $match: {
            'product.userId': session.user.id,
            status: 'approved'
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ])
    ]);

    const shopData = {
      ...shop,
      stats: {
        totalProducts,
        totalCustomers,
        totalReviews: averageRating[0]?.totalReviews || 0
      },
      rating: {
        average: averageRating[0]?.averageRating || 0,
        count: averageRating[0]?.totalReviews || 0
      }
    };

    // تحليل الطلبات والمبيعات
    const currentPeriodOrders = await ShopOrder.find({
      shopId: shop._id,
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['completed', 'delivered'] }
    }).lean();

    // فترة المقارنة (نفس المدة السابقة)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);
    
    const previousPeriodOrders = await ShopOrder.find({
      shopId: shop._id,
      createdAt: { $gte: previousStartDate, $lt: startDate },
      status: { $in: ['completed', 'delivered'] }
    }).lean();

    // حساب الإحصائيات
    const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueChange = getPercentageChange(currentRevenue, previousRevenue);

    const currentOrdersCount = currentPeriodOrders.length;
    const previousOrdersCount = previousPeriodOrders.length;
    const ordersChange = getPercentageChange(currentOrdersCount, previousOrdersCount);

    // إحصائيات الزوار (محاكاة - يمكن ربطها بـ Google Analytics لاحقاً)
    const currentVisitors = Math.floor(Math.random() * 1000) + 500;
    const previousVisitors = Math.floor(Math.random() * 1000) + 400;
    const visitorsChange = getPercentageChange(currentVisitors, previousVisitors);

    // معدل التحويل
    const currentConversionRate = currentVisitors > 0 ? (currentOrdersCount / currentVisitors) * 100 : 0;
    const previousConversionRate = previousVisitors > 0 ? (previousOrdersCount / previousVisitors) * 100 : 0;
    const conversionChange = getPercentageChange(currentConversionRate, previousConversionRate);

    // أفضل المنتجات مبيعاً
    const topProducts = await ShopOrder.aggregate([
      {
        $match: {
          shopId: shop._id,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          revenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // أحدث التقييمات
    const recentReviews = await ProductReview.find({
      shopId: shop._id,
      status: 'approved'
    })
      .populate('productId', 'name')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedReviews = recentReviews.map(review => ({
      ...review,
      productName: review.productId?.name,
      reviewer: {
        name: review.userId?.name || review.reviewer?.name
      }
    }));

    // إحصائيات العملاء
    const newCustomers = await ShopUser.countDocuments({
      ownerId: session.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const returningCustomers = await ShopOrder.distinct('customerId', {
      shopId: shop._id,
      createdAt: { $gte: startDate, $lte: endDate }
    }).then(customerIds => 
      ShopOrder.distinct('customerId', {
        shopId: shop._id,
        customerId: { $in: customerIds },
        createdAt: { $lt: startDate }
      }).then(returningIds => returningIds.length)
    );

    const averageOrderValue = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;

    const analytics = {
      totalRevenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: revenueChange
      },
      totalOrders: {
        current: currentOrdersCount,
        previous: previousOrdersCount,
        change: ordersChange
      },
      totalVisitors: {
        current: currentVisitors,
        previous: previousVisitors,
        change: visitorsChange
      },
      conversionRate: {
        current: currentConversionRate,
        previous: previousConversionRate,
        change: conversionChange
      },
      topProducts,
      recentReviews: formattedReviews,
      customerStats: {
        newCustomers,
        returningCustomers,
        averageOrderValue
      }
    };

    return NextResponse.json({
      success: true,
      shopData,
      analytics
    });

  } catch (error) {
    console.error('خطأ في جلب تقارير المتجر:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

function getPercentageChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100);
}