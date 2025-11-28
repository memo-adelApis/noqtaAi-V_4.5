"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Customer from "@/models/Customers";
import Invoice from "@/models/Invoices"; // للتحقق قبل الحذف
import { z } from "zod";
import { revalidatePath } from "next/cache";

// مخطط التحقق من بيانات العميل
const customerSchema = z.object({
    name: z.string().min(2, "اسم العميل قصير جداً"),
    contact: z.string().optional(),
    address: z.string().optional(),
});

/**
 * دالة لجلب عملاء المشترك
 */
export async function getMyCustomers() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        await connectToDB();
        const customers = await Customer.find({ userId: currentUser._id }).sort({ createdAt: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(customers)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لإنشاء عميل جديد
 */
export async function createCustomer(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'manager') {
            throw new Error("403 - غير مصرح لك");
        }
        
        const validation = customerSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }
        
        await connectToDB();

        // التحقق من عدم تكرار الاسم لنفس المشترك
        const existingCustomer = await Customer.findOne({ 
            name: validation.data.name, 
            userId: currentUser._id 
        });
        if (existingCustomer) {
            throw new Error("اسم العميل هذا مستخدم بالفعل");
        }

        const newCustomer = new Customer({
            name: validation.data.name,
            details: {
                contact: validation.data.contact,
                address: validation.data.address
            },
            userId: currentUser._id, // ربط العميل بالمشترك
            createdAt: new Date(),
        });
        await newCustomer.save();

        revalidatePath("/subscriber/customers");
        return { success: true, data: JSON.parse(JSON.stringify(newCustomer)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لتعديل عميل
 */
export async function updateCustomer(customerId, data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        const validation = customerSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }
        
        await connectToDB();

        const customer = await Customer.findOne({ _id: customerId, userId: currentUser._id });
        if (!customer) {
            throw new Error("404 - العميل غير موجود أو لا تملكه");
        }

        const existingCustomer = await Customer.findOne({ 
            name: validation.data.name, 
            userId: currentUser._id,
            _id: { $ne: customerId } 
        });
        if (existingCustomer) {
            throw new Error("اسم العميل هذا مستخدم بالفعل لعميل آخر");
        }

        customer.name = validation.data.name;
        customer.details = {
            contact: validation.data.contact,
            address: validation.data.address
        };
        await customer.save();
        
        revalidatePath("/subscriber/customers");
        return { success: true, data: JSON.parse(JSON.stringify(customer)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لحذف عميل
 */
export async function deleteCustomer(customerId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        await connectToDB();
        
        const customer = await Customer.findOne({ _id: customerId, userId: currentUser._id });
        if (!customer) {
            throw new Error("404 - العميل غير موجود أو لا تملكه");
        }

        // (الأمان) التأكد عدم وجود فواتير مرتبطة بهذا العميل
        const invoiceCount = await Invoice.countDocuments({ 
            customerId: customerId,
            userId: currentUser._id 
        });
        
        if (invoiceCount > 0) {
            throw new Error(`لا يمكن حذف العميل. هناك ${invoiceCount} فاتورة مرتبطة به.`);
        }

        await Customer.deleteOne({ _id: customerId, userId: currentUser._id });

        revalidatePath("/subscriber/customers");
        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
}