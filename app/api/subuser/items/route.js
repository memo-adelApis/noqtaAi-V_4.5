import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route'; 
import { connectToDB } from '@/utils/database';
import Item from '@/models/Items';
import Category from '@/models/Categories';

// GET - جلب أصناف الفرع
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      );
    }

    if (!['employee', 'manager', 'subscriber'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية للوصول' },
        { status: 403 }
      );
    }

    await connectToDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';

    const skip = (page - 1) * limit;

    // بناء استعلام البحث
    let query = {
      userId: session.user.id
    };

    // إضافة فلتر الفرع إذا كان المستخدم موظف
    if (session.user.role === 'employee' && session.user.branchId) {
      query.branchId = session.user.branchId;
    }

    // البحث النصي
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // فلتر الفئة
    if (category !== 'all') {
      query.categoryId = category;
    }

    // جلب الأصناف
    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .populate('categoryId', 'name')
        .populate('unitId', 'name')
        .populate('storeId', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('خطأ في جلب الأصناف:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}