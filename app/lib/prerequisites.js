/**
 * دوال للتحقق من المتطلبات الأساسية قبل الوصول للصفحات
 */

import { getMyBranchData } from "@/app/actions/subuserEntiAction";
import { connectToDB } from "@/utils/database";
import Unit from "@/models/Units";

/**
 * التحقق من وجود المخازن المطلوبة
 */
export async function checkStoresPrerequisite() {
    try {
        const branchDataResult = await getMyBranchData();
        
        if (!branchDataResult.success) {
            return {
                success: false,
                error: branchDataResult.error,
                redirectTo: "/subuser/stores"
            };
        }

        if (branchDataResult.data.stores.length === 0) {
            return {
                success: false,
                error: "لم يتم العثور على مخازن. يرجى إضافة مخزن واحد على الأقل أولاً.",
                redirectTo: "/subuser/stores"
            };
        }

        return {
            success: true,
            data: branchDataResult.data.stores
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            redirectTo: "/subuser/stores"
        };
    }
}

/**
 * التحقق من وجود الوحدات المطلوبة
 */
export async function checkUnitsPrerequisite() {
    try {
        await connectToDB();
        const units = await Unit.find({}).select("name _id abbreviation").lean();
        
        if (units.length === 0) {
            return {
                success: false,
                error: "لم يتم العثور على وحدات معرفة في النظام.",
                redirectTo: "/admin/settings"
            };
        }

        return {
            success: true,
            data: units
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            redirectTo: "/admin/settings"
        };
    }
}

/**
 * التحقق من جميع المتطلبات الأساسية للفواتير
 */
export async function checkInvoicePrerequisites() {
    const storesCheck = await checkStoresPrerequisite();
    if (!storesCheck.success) {
        return storesCheck;
    }

    const unitsCheck = await checkUnitsPrerequisite();
    if (!unitsCheck.success) {
        return unitsCheck;
    }

    return {
        success: true,
        data: {
            stores: storesCheck.data,
            units: unitsCheck.data
        }
    };
}