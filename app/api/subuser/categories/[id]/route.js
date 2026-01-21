import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import Category from "@/models/Categories";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['employee', 'manager', 'subscriber'].includes(session.user.role)) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
        }

        await connectToDB();

        const { id } = params;

        // تحديد المستخدم الرئيسي
        let mainUserId = session.user.id;
        if (session.user.mainAccountId) {
            mainUserId = session.user.mainAccountId;
        }

        // جلب الفئة
        const category = await Category.findOne({
            _id: id,
            userId: mainUserId
        }).lean();

        if (!category) {
            return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            category: {
                _id: category._id.toString(),
                name: category.name,
                description: category.description || '',
                isActive: category.isActive !== false
            }
        });

    } catch (error) {
        console.error('خطأ في جلب الفئة:', error);
        return NextResponse.json({ 
            error: 'حدث خطأ في الخادم' 
        }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['employee', 'manager', 'subscriber'].includes(session.user.role)) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
        }

        await connectToDB();

        const { id } = params;
        const body = await request.json();
        const { name, description, isActive } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 });
        }

        // تحديد المستخدم الرئيسي
        let mainUserId = session.user.id;
        if (session.user.mainAccountId) {
            mainUserId = session.user.mainAccountId;
        }

        // التحقق من وجود الفئة
        const category = await Category.findOne({
            _id: id,
            userId: mainUserId
        });

        if (!category) {
            return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 });
        }

        // التحقق من عدم وجود فئة أخرى بنفس الاسم
        const existingCategory = await Category.findOne({
            userId: mainUserId,
            name: name.trim(),
            _id: { $ne: id }
        });

        if (existingCategory) {
            return NextResponse.json({ error: 'يوجد فئة أخرى بهذا الاسم' }, { status: 400 });
        }

        // تحديث الفئة
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                description: description?.trim() || '',
                isActive: isActive !== false
            },
            { new: true }
        );

        return NextResponse.json({ 
            success: true, 
            message: 'تم تحديث الفئة بنجاح',
            category: {
                _id: updatedCategory._id.toString(),
                name: updatedCategory.name,
                description: updatedCategory.description,
                isActive: updatedCategory.isActive
            }
        });

    } catch (error) {
        console.error('خطأ في تحديث الفئة:', error);
        return NextResponse.json({ 
            error: 'حدث خطأ في تحديث الفئة' 
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['employee', 'manager', 'subscriber'].includes(session.user.role)) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
        }

        await connectToDB();

        const { id } = params;

        // تحديد المستخدم الرئيسي
        let mainUserId = session.user.id;
        if (session.user.mainAccountId) {
            mainUserId = session.user.mainAccountId;
        }

        // التحقق من وجود الفئة
        const category = await Category.findOne({
            _id: id,
            userId: mainUserId
        });

        if (!category) {
            return NextResponse.json({ error: 'الفئة غير موجودة' }, { status: 404 });
        }

        // حذف الفئة
        await Category.findByIdAndDelete(id);

        return NextResponse.json({ 
            success: true, 
            message: 'تم حذف الفئة بنجاح'
        });

    } catch (error) {
        console.error('خطأ في حذف الفئة:', error);
        return NextResponse.json({ 
            error: 'حدث خطأ في حذف الفئة' 
        }, { status: 500 });
    }
}