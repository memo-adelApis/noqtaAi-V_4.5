"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Customer from "@/models/Customers";
import Store from "@/models/Store";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// --- (دوال مساعدة للتحقق) ---
const customerSchema = z.object({
    name: z.string().min(2, "اسم العميل قصير"),
    contact: z.string().optional(),
    address: z.string().optional(),
});
const storeSchema = z.object({
    name: z.string().min(2, "اسم المخزن قصير"),
    location: z.string().optional(),
});

// دالة لجلب "بيانات الفرع" (عملاء ومخازن هذا الفرع)
export async function getMyBranchData() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        await connectToDB();
        
        const [customers, stores] = await Promise.all([
            Customer.find({ branchId: currentUser.branchId }).sort({ createdAt: -1 }),
            Store.find({ branchId: currentUser.branchId }).sort({ createdAt: -1 })
        ]);

        return { 
            success: true, 
            data: {
                customers: JSON.parse(JSON.stringify(customers)),
                stores: JSON.parse(JSON.stringify(stores)),
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// --- (منطق إدارة العملاء - للموظف) ---
export async function createMyCustomer(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        const validation = customerSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        const newCustomer = new Customer({
            name: validation.data.name,
            details: {
                contact: validation.data.contact,
                address: validation.data.address
            },
            userId: currentUser.mainAccountId, // (هام) يتبع المشترك
            branchId: currentUser.branchId,   // (هام) يتبع هذا الفرع
            createdAt: new Date(),
        });
        await newCustomer.save();

        revalidatePath("/subuser/customers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
// (يمكن إضافة updateMyCustomer و deleteMyCustomer بنفس المنطق)

// --- (منطق إدارة المخازن - للموظف) ---
export async function createMyStore(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        const validation = storeSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        const newStore = new Store({
            name: validation.data.name,
            location: validation.data.location,
            userId: currentUser.mainAccountId, // (هام) يتبع المشترك
            branchId: currentUser.branchId,   // (هام) يتبع هذا الفرع
            createdAt: new Date(),
        });
        await newStore.save();

        revalidatePath("/subuser/stores");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
// (يمكن إضافة updateMyStore و deleteMyStore بنفس المنطق)