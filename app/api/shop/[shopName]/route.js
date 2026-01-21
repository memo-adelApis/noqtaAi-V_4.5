import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import Shop from '@/models/Shop';
import Item from '@/models/Items';
import Category from '@/models/Categories';
import Unit from '@/models/Units';

// GET - جلب بيانات المتجر والمنتجات
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const { shopName } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    // البحث عن المتجر بالاسم الفريد
    const shop = await Shop.findOne({ 
      uniqueName: shopName.toLowerCase(),
      status: 'active'
    }).populate('subscriberId', 'name email');

    if (!shop) {
      return NextResponse.json(
        { error: 'المتجر غير موجود أو غير نشط' },
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

    // بناء استعلام المنتجات
    const productQuery = {
      userId: shop.subscriberId._id,
      status: 'active',
      isVisible: true,
      quantity_Remaining: { $gt: 0 } // المنتجات المتوفرة فقط
    };

    // فلترة حسب الفئة
    if (category && category !== 'all') {
      const categoryDoc = await Category.findOne({ 
        name: category
      });
      if (categoryDoc) {
        productQuery.categoryId = categoryDoc._id;
      }
    }

    // البحث في النص
    if (search) {
      productQuery.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { sku: new RegExp(search, 'i') }
      ];
    }

    // جلب المنتجات مع التصفح
    const [products, totalProducts] = await Promise.all([
      Item.find(productQuery)
        .populate('categoryId', 'name')
        .populate('unitId', 'name abbreviation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(productQuery)
    ]);

    // جلب الفئات المتاحة للمشترك
    const availableCategories = await Category.find({}).lean();

    // تحديث عداد الزوار
    await Shop.findByIdAndUpdate(shop._id, {
      $inc: { 'stats.totalVisitors': 1 }
    });

    // تنسيق البيانات للإرسال
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description || 'وصف المنتج غير متوفر',
      price: product.sellingPrice,
      originalPrice: product.sellingPrice * 1.15, // سعر قبل الخصم (15% زيادة وهمية)
      image: product.images && product.images.length > 0 ? product.images[0] : '/images/no-image.jpg',
      images: product.images || [],
      category: product.categoryId?.name || 'غير محدد',
      unit: product.unitId?.name || 'قطعة',
      stock: product.quantity_Remaining,
      sku: product.sku || `SKU-${product._id.toString().slice(-6)}`,
      rating: 4.2 + (Math.random() * 0.8), // تقييم عشوائي بين 4.2 و 5.0
      reviewCount: Math.floor(Math.random() * 50) + 5,
      isNew: (new Date() - new Date(product.createdAt)) < (7 * 24 * 60 * 60 * 1000), // جديد إذا أقل من أسبوع
      discount: Math.floor(Math.random() * 15) + 5, // خصم عشوائي بين 5% و 20%
      tags: product.tags || [],
      weight: product.weight || 0,
      dimensions: product.dimensions || {},
      isFeatured: product.isFeatured || false,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription
    }));

    const response = {
      shop: {
        _id: shop._id,
        name: shop.name,
        uniqueName: shop.uniqueName,
        description: shop.description,
        logo: shop.logo,
        coverImage: shop.coverImage,
        contact: shop.contact,
        settings: shop.settings,
        rating: shop.rating,
        stats: shop.stats,
        workingHours: shop.workingHours,
        socialMedia: shop.socialMedia
      },
      products: formattedProducts,
      categories: availableCategories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        hasNext: page < Math.ceil(totalProducts / limit),
        hasPrev: page > 1
      },
      filters: {
        category: category || 'all',
        search: search || ''
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