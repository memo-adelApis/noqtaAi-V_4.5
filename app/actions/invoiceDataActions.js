// المسار: app/actions/invoiceDataActions.js
"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth"; 
import Store from "@/models/Store";
import Unit from "@/models/Units"; // (نموذج الوحدات العام)

/**
 * دالة لجلب البيانات الأولية لفورم الفاتورة (المخازن، الوحدات)
 */
export async function getInvoiceFormData() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("401 - غير مصرح به");

        if (!currentUser.branchId) {
             throw new Error("403 - هذا الموظف غير مرتبط بفرع ولا يمكنه جلب المخازن");
        }
        const storesQuery = { branchId: currentUser.branchId };
        const unitsQuery = {}; 
        
        await connectToDB();

        // --- (هذا هو التعديل: إضافة .lean()) ---
        const [stores, units] = await Promise.all([
            Store.find(storesQuery).select("name _id").lean(),
            Unit.find(unitsQuery).select("name _id abbreviation").lean()
        ]);
        // --- (نهاية التعديل) ---

        if (stores.length === 0) {
            throw new Error("لم يتم العثور على مخازن. يرجى الذهاب إلى (بيانات الفرع > مخازن الفرع) وإضافة مخزن واحد على الأقل أولاً.");
        }
        if (units.length === 0) {
             throw new Error("لم يتم العثور على وحدات معرفة في النظام.");
        }
        
        return {
            success: true,
            data: {
                stores: stores,
                units: units
            }
        };

    } catch (error) {
        // console.error("Error fetching invoice form data:", error.message);
        return { success: false, error: error.message };
    }
}