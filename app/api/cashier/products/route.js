import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import Item from "@/models/Items";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['cashier', 'employee', 'manager', 'subscriber'].includes(session.user.role)) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
        }

        await connectToDB();

        // تحديد المستخدم الرئيسي والفرع
        let mainUserId = session.user.id;
        let branchId = session.user.branchId;

        // إذا كان المستخدم فرعي، نحصل على المستخدم الرئيسي
        if (session.user.mainAccountId) {
            mainUserId = session.user.mainAccountId;
        }

        // بناء استعلام البحث
        let query = {
            userId: mainUserId,
            quantity_Remaining: { $gt: 0 }, // المنتجات المتوفرة فقط
            status: 'active', // المنتجات النشطة فقط
            isVisible: true // المنتجات المرئية فقط
        };

        // إضافة فلتر الفرع إذا كان المستخدم موظف أو كاشير
        if (['cashier', 'employee'].includes(session.user.role) && branchId) {
            query.branchId = branchId;
        }

        // جلب الأصناف مع المعلومات المرتبطة
        const items = await Item.find(query)
            .populate('categoryId', 'name')
            .populate('unitId', 'name')
            .populate('storeId', 'name')
            .select('name sellingPrice quantity_Remaining barcode sku categoryId unitId storeId images')
            .sort({ name: 1 })
            .lean();

        // تحويل البيانات للتوافق مع واجهة الكاشير
        const serializedProducts = items.map(item => ({
            _id: item._id.toString(),
            name: item.name,
            price: item.sellingPrice || 0,
            quantity: item.quantity_Remaining || 0,
            barcode: item.barcode || item.sku || '',
            category: item.categoryId?.name || 'بدون فئة',
            unit: item.unitId?.name || 'قطعة',
            store: item.storeId?.name || 'المخزن الرئيسي',
            image: item.images && item.images.length > 0 ? item.images[0] : null
        }));

        return NextResponse.json({ 
            success: true, 
            products: serializedProducts,
            total: serializedProducts.length
        });

    } catch (error) {
        console.error('خطأ في جلب المنتجات:', error);
        return NextResponse.json({ 
            error: 'حدث خطأ في الخادم',
            success: false,
            products: []
        }, { status: 500 });
    }
}