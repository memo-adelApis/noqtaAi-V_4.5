import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Item from '@/models/Items';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST - رفع صورة للصنف
export async function POST(request, { params }) {
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
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم اختيار ملف' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'يجب أن يكون الملف صورة' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'حجم الملف يجب أن يكون أقل من 5MB' },
        { status: 400 }
      );
    }

    // التحقق من وجود الصنف والصلاحية
    let query = { _id: id, userId: session.user.id };
    
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

    // إنشاء مجلد الصور إذا لم يكن موجوداً
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'items');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // إنشاء اسم فريد للملف
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${id}_${timestamp}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    // حفظ الملف
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // تحديث مسار الصورة في قاعدة البيانات
    const imageUrl = `/uploads/items/${fileName}`;
    
    // إضافة الصورة إلى مصفوفة الصور
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { 
        $push: { images: imageUrl }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      imageUrl,
      item: updatedItem
    });

  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في رفع الصورة' },
      { status: 500 }
    );
  }
}

// DELETE - حذف صورة من الصنف
export async function DELETE(request, { params }) {
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
    const { imageUrl } = await request.json();

    let query = { _id: id, userId: session.user.id };
    
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

    // إزالة الصورة من مصفوفة الصور
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { 
        $pull: { images: imageUrl }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصورة بنجاح',
      item: updatedItem
    });

  } catch (error) {
    console.error('خطأ في حذف الصورة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الصورة' },
      { status: 500 }
    );
  }
}