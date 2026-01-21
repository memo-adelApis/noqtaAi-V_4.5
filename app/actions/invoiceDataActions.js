// المسار: app/actions/invoiceDataActions.js
"use server";

import { getCurrentUser } from "@/app/lib/auth"; 
import { checkInvoicePrerequisites } from "@/app/lib/prerequisites";

/**
 * دالة لجلب البيانات الأولية لفورم الفاتورة (المخازن، الوحدات)
 */
export async function getInvoiceFormData() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { 
                success: false, 
                error: "غير مصرح به",
                redirectTo: "/login"
            };
        }

        if (!currentUser.branchId) {
            return { 
                success: false, 
                error: "هذا الموظف غير مرتبط بفرع ولا يمكنه جلب المخازن",
                redirectTo: "/subuser"
            };
        }

        // التحقق من جميع المتطلبات الأساسية
        const prerequisitesResult = await checkInvoicePrerequisites();
        
        if (!prerequisitesResult.success) {
            return prerequisitesResult;
        }
        
        return {
            success: true,
            data: prerequisitesResult.data
        };

    } catch (error) {
        console.error("Error fetching invoice form data:", error.message);
        return { 
            success: false, 
            error: error.message,
            redirectTo: "/subuser"
        };
    }
}