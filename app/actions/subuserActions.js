"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth"; // نفترض أن هذه الدالة تجلب المستخدم الحالي
import Customer from "@/models/Customers";
import Store from "@/models/Store";
import Supplier from "@/models/Suppliers";
import Invoice from "@/models/Invoices"; // نحتاجه للتحقق عند الحذف
import { z } from "zod";
import { revalidatePath } from "next/cache";

// --- (1) دالة جلب بيانات الفرع (كما هي - صحيحة) ---


const customerSchema = z.object({
    name: z.string().min(2, "اسم العميل قصير"),
    contact: z.string().optional(),
    address: z.string().optional(),
});
const storeSchema = z.object({
    name: z.string().min(2, "اسم المخزن قصير"),
    location: z.string().optional(),
});
const supplierSchema = z.object({
    name: z.string().min(2, "اسم المورد قصير"),
    contact: z.string().optional(),
    address: z.string().optional(),
});

// --- (دالة جلب بيانات الفرع) ---
export async function getMyBranchData() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        await connectToDB();
        
        // --- (هذا هو الحل: .lean() تحول البيانات إلى كائنات بسيطة) ---
        const [customers, stores, suppliers] = await Promise.all([
            Customer.find({ branchId: currentUser.branchId }).sort({ createdAt: -1 }).lean(),
            Store.find({ branchId: currentUser.branchId }).sort({ createdAt: -1 }).lean(),
            Supplier.find({ branchId: currentUser.branchId }).sort({ createdAt: -1 }).lean()
        ]);

        return { 
            success: true, 
            data: {
                customers: customers, // الآن هذه كائنات بسيطة
                stores: stores,
                suppliers: suppliers
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===========================================
// 🌍 منطق إدارة العملاء (مُصحح ومكتمل)
// ===========================================

export async function createMyCustomer(data) { 
    try {
        const currentUser = await getCurrentUser();
        // ✅ 1. التحقق من أن المستخدم هو مستخدم فرع
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - غير مصرح لك");
        }
        
        const validation = customerSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }
        
        await connectToDB();

        // ✅ 2. إنشاء العميل وربطه بالفرع والمشترك الرئيسي
        const newCustomer = new Customer({
            name: validation.data.name,
            details: {
                contact: validation.data.contact,
                address: validation.data.address
            },
            userId: currentUser.mainAccountId, // المشترك الرئيسي
            branchId: currentUser.branchId,   // الفرع
            createdAt: new Date(),
        });
        await newCustomer.save();

        revalidatePath("/subuser/customers");
        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateMyCustomer(customerId, data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) throw new Error("403 - غير مصرح لك");
        
        const validation = customerSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        // ✅ 3. البحث عن العميل والتأكد أنه يتبع هذا الفرع
        const customer = await Customer.findOne({ 
            _id: customerId, 
            branchId: currentUser.branchId 
        });
        if (!customer) throw new Error("404 - العميل غير موجود أو لا يتبع فرعك");

        customer.name = validation.data.name;
        customer.details = {
            contact: validation.data.contact,
            address: validation.data.address
        };
        await customer.save();
        
        revalidatePath("/subuser/customers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteMyCustomer(customerId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) throw new Error("403 - غير مصرح لك");
        
        await connectToDB();

        const customer = await Customer.findOne({ 
            _id: customerId, 
            branchId: currentUser.branchId 
        });
        if (!customer) throw new Error("404 - العميل غير موجود أو لا يتبع فرعك");

        // ✅ 4. التحقق من عدم وجود فواتير مرتبطة
        const invoiceCount = await Invoice.countDocuments({ 
            customerId: customerId,
            branchId: currentUser.branchId
        });
        
        if (invoiceCount > 0) {
            throw new Error(`لا يمكن حذف العميل. هناك ${invoiceCount} فاتورة مرتبطة به.`);
        }

        await Customer.deleteOne({ _id: customerId });
        revalidatePath("/subuser/customers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}


// ===========================================
// 📦 منطق إدارة المخازن (مُصحح ومكتمل)
// ===========================================

export async function createMyStore(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) throw new Error("403 - أنت غير مرتبط بفرع");
        
        const validation = storeSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        const newStore = new Store({
            name: validation.data.name,
            location: validation.data.location,
            userId: currentUser.mainAccountId, // المشترك الرئيسي
            branchId: currentUser.branchId,   // الفرع
            createdAt: new Date(),
        });
        await newStore.save();

        revalidatePath("/subuser/stores");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateMyStore(storeId, data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) throw new Error("403 - أنت غير مرتبط بفرع");
        
        const validation = storeSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        const store = await Store.findOne({ 
            _id: storeId, 
            branchId: currentUser.branchId 
        });
        if (!store) throw new Error("404 - المخزن غير موجود أو لا يتبع فرعك");

        store.name = validation.data.name;
        store.location = validation.data.location;
        await store.save();
        
        revalidatePath("/subuser/stores");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteMyStore(storeId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) throw new Error("403 - أنت غير مرتبط بفرع");
        
        await connectToDB();

        const store = await Store.findOne({ 
            _id: storeId, 
            branchId: currentUser.branchId 
        });
        if (!store) throw new Error("404 - المخزن غير موجود أو لا يتبع فرعك");

        // ✅ 4. التحقق من عدم وجود فواتير مرتبطة
        const invoiceCount = await Invoice.countDocuments({ 
            storeId: storeId,
            branchId: currentUser.branchId
        });
        
        if (invoiceCount > 0) {
            throw new Error(`لا يمكن حذف المخزن. هناك ${invoiceCount} فاتورة مرتبطة به.`);
        }

        await Store.deleteOne({ _id: storeId });
        revalidatePath("/subuser/stores");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}


// ===========================================
// 🚚 منطق إدارة الموردين (كما هو - صحيح)
// ===========================================

export async function createMySupplier(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) throw new Error("403 - أنت غير مرتبط بفرع");
        
        const validation = supplierSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        const newSupplier = new Supplier({
            name: validation.data.name,
            details: {
                contact: validation.data.contact,
                address: validation.data.address
            },
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId,
            createdAt: new Date(),
        });
        await newSupplier.save();

        revalidatePath("/subuser/suppliers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateMySupplier(supplierId, data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) throw new Error("403 - أنت غير مرتبط بفرع");
        
        const validation = supplierSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        const supplier = await Supplier.findOne({ 
            _id: supplierId, 
            branchId: currentUser.branchId 
        });
        if (!supplier) throw new Error("404 - المورد غير موجود أو لا يتبع فرعك");

        supplier.name = validation.data.name;
        supplier.details = {
            contact: validation.data.contact,
            address: validation.data.address
        };
        await supplier.save();
        
        revalidatePath("/subuser/suppliers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteMySupplier(supplierId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) throw new Error("403 - أنت غير مرتبط بفرع");
        
        await connectToDB();

        const supplier = await Supplier.findOne({ 
            _id: supplierId, 
            branchId: currentUser.branchId 
        });
        if (!supplier) throw new Error("404 - المورد غير موجود أو لا يتبع فرعك");

        const invoiceCount = await Invoice.countDocuments({ 
            supplierId: supplierId,
            branchId: currentUser.branchId
        });
        
        if (invoiceCount > 0) {
            throw new Error(`لا يمكن حذف المورد. هناك ${invoiceCount} فاتورة مرتبطة به.`);
        }

        await Supplier.deleteOne({ _id: supplierId });
        revalidatePath("/subuser/suppliers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ... (دالة التقرير getMyBranchReportData تبقى كما هي) ...
export async function getMyBranchReportData() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        const branchId = currentUser.branchId;
        
        await connectToDB();

        // 1. تحديد نطاق 6 أشهر
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        // 2. جلب الإحصائيات (الكروت)
        const statsAggregation = await Invoice.aggregate([
            {
                $match: {
                    branchId: branchId, // (الأمان) فرعك فقط
                    createdAt: { $gte: sixMonthsAgo },
                    status: { $in: ["paid", "pending", "overdue"] }
                }
            },
            {
                $group: {
                    _id: "$type", // 'revenue' or 'expense'
                    totalAmount: { $sum: "$totalInvoice" },
                    count: { $sum: 1 } // عدد الفواتير
                }
            }
        ]);

        const revenueData = statsAggregation.find(s => s._id === 'revenue') || { totalAmount: 0, count: 0 };
        const expenseData = statsAggregation.find(s => s._id === 'expense') || { totalAmount: 0, count: 0 };
        const netProfit = revenueData.totalAmount - expenseData.totalAmount;

        // 3. جلب بيانات الرسم البياني (شهرياً)
        const chartAggregation = await Invoice.aggregate([
            {
                $match: {
                    branchId: branchId,
                    createdAt: { $gte: sixMonthsAgo },
                    status: { $in: ["paid", "pending", "overdue"] }
                }
            },
            {
                // تجميع حسب الشهر + النوع
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                        type: "$type"
                    },
                    monthlyTotal: { $sum: "$totalInvoice" }
                }
            },
            {
                // "Pivot" - تحويل الصفوف لأعمدة
                $group: {
                    _id: { month: "$_id.month", year: "$_id.year" },
                    revenue: {
                        $sum: { $cond: [ { $eq: ["$_id.type", "revenue"] }, "$monthlyTotal", 0 ] }
                    },
                    expense: {
                        $sum: { $cond: [ { $eq: ["$_id.type", "expense"] }, "$monthlyTotal", 0 ] }
                    }
                }
            },
            {
                // ترتيب
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
        
        // 4. معالجة بيانات الرسم البياني (تعبئة الشهور المفقودة)
        const dateMap = new Map(chartAggregation.map(item => {
            const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
            return [key, item];
        }));

        const finalChartData = [];
        const arLocale = 'ar-EG';
        const timeZone = 'Africa/Cairo';

        for (let i = 5; i >= 0; i--) { // (من 5 شهور مضت حتى الآن)
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = new Intl.DateTimeFormat(arLocale, { month: 'short', year: 'numeric', timeZone: timeZone }).format(date);
            
            const data = dateMap.get(key);
            finalChartData.push({
                name: monthName,
                revenue: data?.revenue || 0,
                expense: data?.expense || 0
            });
        }

        return {
            success: true,
            data: {
                stats: {
                    totalRevenue: revenueData.totalAmount,
                    totalExpenses: expenseData.totalAmount,
                    netProfit: netProfit,
                    revenueCount: revenueData.count,
                    expenseCount: expenseData.count
                },
                chartData: finalChartData
            }
        };

    } catch (error) {
       // console.error("Error fetching branch report data:", error);
        return { success: false, error: error.message };
    }
}