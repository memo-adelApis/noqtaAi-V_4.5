"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Customer from "@/models/Customers";
import Store from "@/models/Store";
import Supplier from "@/models/Suppliers";
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
const supplierSchema = z.object({
    name: z.string().min(2, "اسم المورد قصير"),
    contact: z.string().optional(),
    address: z.string().optional(),
});

// دالة لجلب "بيانات الفرع" (عملاء ومخازن وموردين هذا الفرع)
export async function getMyBranchData() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        await connectToDB();
        
        const [customers, stores, suppliers] = await Promise.all([
            Customer.find({ branchId: currentUser.branchId }).sort({ createdAt: -1 }),
            Store.find({ branchId: currentUser.branchId }).sort({ createdAt: -1 }),
            Supplier.find({ branchId: currentUser.branchId }).sort({ createdAt: -1 })
        ]);

        return { 
            success: true, 
            data: {
                customers: customers.map(customer => ({
                    ...customer.toObject(),
                    _id: customer._id.toString(),
                    userId: customer.userId.toString(),
                    branchId: customer.branchId.toString(),
                    createdAt: customer.createdAt ? customer.createdAt.toISOString() : new Date().toISOString()
                })),
                stores: stores.map(store => ({
                    ...store.toObject(),
                    _id: store._id.toString(),
                    userId: store.userId.toString(),
                    branchId: store.branchId.toString(),
                    createdAt: store.createdAt ? store.createdAt.toISOString() : new Date().toISOString()
                })),
                suppliers: suppliers.map(supplier => ({
                    ...supplier.toObject(),
                    _id: supplier._id.toString(),
                    userId: supplier.userId.toString(),
                    branchId: supplier.branchId.toString(),
                    createdAt: supplier.createdAt ? supplier.createdAt.toISOString() : new Date().toISOString()
                })),
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

export async function updateMyCustomer(customerId, data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        const validation = customerSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        // التحقق من وجود العميل والصلاحية
        const existingCustomer = await Customer.findOne({
            _id: customerId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (!existingCustomer) {
            throw new Error("العميل غير موجود أو غير مصرح بالوصول إليه");
        }

        // التحقق من عدم تكرار الاسم (باستثناء العميل الحالي)
        const duplicateName = await Customer.findOne({
            name: validation.data.name,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId,
            _id: { $ne: customerId }
        });

        if (duplicateName) {
            throw new Error("اسم العميل موجود بالفعل");
        }

        await Customer.findByIdAndUpdate(
            customerId,
            {
                name: validation.data.name,
                details: {
                    contact: validation.data.contact,
                    address: validation.data.address
                },
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        revalidatePath("/subuser/customers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteMyCustomer(customerId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }

        await connectToDB();

        // التحقق من وجود العميل والصلاحية
        const customer = await Customer.findOne({
            _id: customerId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (!customer) {
            throw new Error("العميل غير موجود أو غير مصرح بالوصول إليه");
        }

        // التحقق من وجود فواتير لهذا العميل
        const Invoice = require("@/models/Invoices").default;
        const invoicesCount = await Invoice.countDocuments({
            customerId: customerId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (invoicesCount > 0) {
            throw new Error("لا يمكن حذف العميل لأنه مرتبط بفواتير");
        }

        await Customer.findByIdAndDelete(customerId);

        revalidatePath("/subuser/customers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

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

export async function updateMyStore(storeId, data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        const validation = storeSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        // التحقق من وجود المخزن والصلاحية
        const existingStore = await Store.findOne({
            _id: storeId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (!existingStore) {
            throw new Error("المخزن غير موجود أو غير مصرح بالوصول إليه");
        }

        // التحقق من عدم تكرار الاسم (باستثناء المخزن الحالي)
        const duplicateName = await Store.findOne({
            name: validation.data.name,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId,
            _id: { $ne: storeId }
        });

        if (duplicateName) {
            throw new Error("اسم المخزن موجود بالفعل");
        }

        await Store.findByIdAndUpdate(
            storeId,
            {
                name: validation.data.name,
                location: validation.data.location,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        revalidatePath("/subuser/stores");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteMyStore(storeId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }

        await connectToDB();

        // التحقق من وجود المخزن والصلاحية
        const store = await Store.findOne({
            _id: storeId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (!store) {
            throw new Error("المخزن غير موجود أو غير مصرح بالوصول إليه");
        }

        // التحقق من وجود منتجات في هذا المخزن
        const Item = require("@/models/Items").default;
        const itemsCount = await Item.countDocuments({
            storeId: storeId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (itemsCount > 0) {
            throw new Error("لا يمكن حذف المخزن لأنه يحتوي على منتجات");
        }

        await Store.findByIdAndDelete(storeId);

        revalidatePath("/subuser/stores");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// --- (منطق إدارة الموردين - للموظف) ---
export async function createMySupplier(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        const validation = supplierSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        const newSupplier = new Supplier({
            name: validation.data.name,
            details: {
                contact: validation.data.contact,
                address: validation.data.address
            },
            userId: currentUser.mainAccountId, // (هام) يتبع المشترك
            branchId: currentUser.branchId,   // (هام) يتبع هذا الفرع
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
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }
        
        const validation = supplierSchema.safeParse(data);
        if (!validation.success) throw new Error(validation.error.errors[0].message);

        await connectToDB();

        // التحقق من وجود المورد والصلاحية
        const existingSupplier = await Supplier.findOne({
            _id: supplierId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (!existingSupplier) {
            throw new Error("المورد غير موجود أو غير مصرح بالوصول إليه");
        }

        // التحقق من عدم تكرار الاسم (باستثناء المورد الحالي)
        const duplicateName = await Supplier.findOne({
            name: validation.data.name,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId,
            _id: { $ne: supplierId }
        });

        if (duplicateName) {
            throw new Error("اسم المورد موجود بالفعل");
        }

        await Supplier.findByIdAndUpdate(
            supplierId,
            {
                name: validation.data.name,
                details: {
                    contact: validation.data.contact,
                    address: validation.data.address
                },
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        revalidatePath("/subuser/suppliers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteMySupplier(supplierId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.branchId) {
            throw new Error("403 - أنت غير مرتبط بفرع");
        }

        await connectToDB();

        // التحقق من وجود المورد والصلاحية
        const supplier = await Supplier.findOne({
            _id: supplierId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (!supplier) {
            throw new Error("المورد غير موجود أو غير مصرح بالوصول إليه");
        }

        // التحقق من وجود فواتير لهذا المورد
        const Invoice = require("@/models/Invoices").default;
        const invoicesCount = await Invoice.countDocuments({
            supplierId: supplierId,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId
        });

        if (invoicesCount > 0) {
            throw new Error("لا يمكن حذف المورد لأنه مرتبط بفواتير");
        }

        await Supplier.findByIdAndDelete(supplierId);

        revalidatePath("/subuser/suppliers");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}