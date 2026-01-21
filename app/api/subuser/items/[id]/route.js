import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Item from '@/models/Items';

// PUT - تحديث بيانات الصنف
export async function PUT(request, { params }) {
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

    const { id } = await params;
    const updateData = await request.json();

    // التحقق من وجود الصنف والصلاحية
    let query = { _id: id, userId: session.user.id };
    
    // إضافة فلتر الفرع إذا كان المستخدم موظف
    if (session.user.role === 'employee' && session.user.branchId) {
      query.branchId = session.user.branchId;
    }

    const item = await Item.findOne(query);
    
    if (!item) {
      return NextResponse.json(
        { error: 'الصنف غير موجود أو ليس لديك صلاحية لتعديله' },
        { status: 404 }
      );
    }

    // الحقول المسموح بتحديثها للموظف
    const allowedFields = [
      'name',
      'description', 
      'sellingPrice',
      'minSellingPrice',
      'isVisible',
      'isFeatured',
      'status',
      'tags',
      'seoTitle',
      'seoDescription',
      'weight',
      'dimensions'
    ];

    // تحديث الحقول المسموحة فقط
    const filteredUpdate = {};
    allowedFields.forEach(field => {
      if (updateData.hasOwnProperty(field)) {
        filteredUpdate[field] = updateData[field];
      }
    });

    // تحديث الصنف
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      filteredUpdate,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name')
     .populate('unitId', 'name')
     .populate('storeId', 'name');

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الصنف بنجاح',
      item: updatedItem
    });

  } catch (error) {
    console.error('خطأ في تحديث الصنف:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// GET - جلب تفاصيل صنف محدد
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      );
    }

    await connectToDB();

    const { id } = await params;

    let query = { _id: id, userId: session.user.id };
    
    if (session.user.role === 'employee' && session.user.branchId) {
      query.branchId = session.user.branchId;
    }

    const item = await Item.findOne(query)
      .populate('categoryId', 'name')
      .populate('unitId', 'name')
      .populate('storeId', 'name')
      .lean();

    if (!item) {
      return NextResponse.json(
        { error: 'الصنف غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('خطأ في جلب الصنف:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}