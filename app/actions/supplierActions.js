"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/lib/auth";
import Supplier from "@/models/Suppliers";
import Invoice from "@/models/Invoices"; // للتحقق قبل الحذف
import { z } from "zod";
import { revalidatePath } from "next/cache";

// مخطط التحقق من بيانات المورد
const supplierSchema = z.object({
    name: z.string().min(2, "اسم المورد قصير جداً"),
    contact: z.string().optional(),
    address: z.string().optional(),
});

/**
 * دالة لجلب موردي المشترك
 */
export async function getMySuppliers() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        await connectToDB();
        const suppliers = await Supplier.find({ userId: currentUser._id }).sort({ createdAt: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(suppliers)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لإنشاء مورد جديد
 */
export async function createSupplier(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        const validation = supplierSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }
        
        await connectToDB();

        // التحقق من عدم تكرار الاسم لنفس المشترك
        const existingSupplier = await Supplier.findOne({ 
            name: validation.data.name, 
            userId: currentUser._id 
        });
        if (existingSupplier) {
            throw new Error("اسم المورد هذا مستخدم بالفعل");
        }

        const newSupplier = new Supplier({
            name: validation.data.name,
            details: {
                contact: validation.data.contact,
                address: validation.data.address
            },
            userId: currentUser._id, // ربط المورد بالمشترك
            createdAt: new Date(),
            // (الحقول الأخرى pay, suply, balnce ستحصل على قيم افتراضية أو null)
        });
        await newSupplier.save();

        revalidatePath("/subscriber/suppliers");
        return { success: true, data: JSON.parse(JSON.stringify(newSupplier)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لتعديل مورد
 */
export async function updateSupplier(supplierId, data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        const validation = supplierSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }
        
        await connectToDB();

        const supplier = await Supplier.findOne({ _id: supplierId, userId: currentUser._id });
        if (!supplier) {
            throw new Error("404 - المورد غير موجود أو لا تملكه");
        }

        const existingSupplier = await Supplier.findOne({ 
            name: validation.data.name, 
            userId: currentUser._id,
            _id: { $ne: supplierId } 
        });
        if (existingSupplier) {
            throw new Error("اسم المورد هذا مستخدم بالفعل لمورد آخر");
        }

        supplier.name = validation.data.name;
        supplier.details = {
            contact: validation.data.contact,
            address: validation.data.address
        };
        await supplier.save();
        
        revalidatePath("/subscriber/suppliers");
        return { success: true, data: JSON.parse(JSON.stringify(supplier)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لحذف مورد
 */
export async function deleteSupplier(supplierId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        await connectToDB();
        
        const supplier = await Supplier.findOne({ _id: supplierId, userId: currentUser._id });
        if (!supplier) {
            throw new Error("404 - المورد غير موجود أو لا تملكه");
        }

        // (الأمان) التأكد عدم وجود فواتير مرتبطة بهذا المورد
        const invoiceCount = await Invoice.countDocuments({ 
            supplierId: supplierId,
            userId: currentUser._id 
        });
        
        if (invoiceCount > 0) {
            throw new Error(`لا يمكن حذف المورد. هناك ${invoiceCount} فاتورة مرتبطة به.`);
        }

        await Supplier.deleteOne({ _id: supplierId, userId: currentUser._id });

        revalidatePath("/subscriber/suppliers");
        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
}