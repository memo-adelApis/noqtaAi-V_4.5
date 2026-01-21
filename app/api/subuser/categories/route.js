import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import Category from "@/models/Categories";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['employee', 'manager', 'subscriber'].includes(session.user.role)) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
        }

        await connectToDB();

        // تحديد المستخدم الرئيسي
        let mainUserId = session.user.id;
        if (session.user.mainAccountId) {
            mainUserId = session.user.mainAccountId;
        }

        // جلب الفئات
        const categories = await Category.find({ 
            userId: mainUserId 
        })
        .select('name description isActive')
        .sort({ name: 1 })
        .lean();

        // تحويل البيانات
        const serializedCategories = categories.map(category => ({
            _id: category._id.toString(),
            name: category.name,
            description: category.description || '',
            isActive: category.isActive !== false
        }));

        return NextResponse.json({ 
            success: true, 
            categories: serializedCategories 
        });

    } catch (error) {
        console.error('خطأ في جلب الفئات:', error);
        return NextResponse.json({ 
            error: 'حدث خطأ في الخادم',
            success: false,
            categories: []
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['employee', 'manager', 'subscriber'].includes(session.user.role)) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
        }

        await connectToDB();

        const body = await request.json();
        const { name, description } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 });
        }

        // تحديد المستخدم الرئيسي
        let mainUserId = session.user.id;
        if (session.user.mainAccountId) {
            mainUserId = session.user.mainAccountId;
        }

        // التحقق من عدم وجود فئة بنفس الاسم
        const existingCategory = await Category.findOne({
            userId: mainUserId,
            name: name.trim()
        });

        if (existingCategory) {
            return NextResponse.json({ error: 'يوجد فئة بهذا الاسم بالفعل' }, { status: 400 });
        }

        // إنشاء الفئة الجديدة
        const newCategory = await Category.create({
            name: name.trim(),
            description: description?.trim() || '',
            userId: mainUserId,
            isActive: true
        });

        return NextResponse.json({ 
            success: true, 
            message: 'تم إنشاء الفئة بنجاح',
            category: {
                _id: newCategory._id.toString(),
                name: newCategory.name,
                description: newCategory.description,
                isActive: newCategory.isActive
            }
        });

    } catch (error) {
        console.error('خطأ في إنشاء الفئة:', error);
        return NextResponse.json({ 
            error: 'حدث خطأ في إنشاء الفئة' 
        }, { status: 500 });
    }
}