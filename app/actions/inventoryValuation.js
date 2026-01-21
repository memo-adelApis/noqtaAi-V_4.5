"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Item from "@/models/Items";
import Store from "@/models/Store";
import mongoose from "mongoose";

/**
 * حساب قيمة المخزون بناءً على سعر الشراء
 */
export async function getInventoryValuation(filters = {}) {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("غير مصرح بالوصول");
        }

        const userId = currentUser.mainAccountId || currentUser.id;
        const branchId = filters.branchId || currentUser.branchId;

        // بناء الاستعلام الأساسي
        let storeQuery = {
            userId: new mongoose.Types.ObjectId(userId)
        };

        // إضافة فلتر الفرع إذا كان متاحاً
        if (branchId) {
            storeQuery.branchId = new mongoose.Types.ObjectId(branchId);
        }

        // جلب المخازن أولاً
        const stores = await Store.find(storeQuery).lean();
        const storeIds = stores.map(s => s._id);

        if (storeIds.length === 0) {
            return {
                success: true,
                data: {
                    totalInventoryValue: 0,
                    totalItems: 0,
                    totalQuantity: 0,
                    storeBreakdown: [],
                    categoryBreakdown: [],
                    lowStockItems: [],
                    generatedAt: new Date().toISOString()
                }
            };
        }

        // جلب جميع الأصناف من المخازن المحددة
        const items = await Item.find({
            storeId: { $in: storeIds },
            quantity_Remaining: { $gt: 0 } // فقط الأصناف المتوفرة
        })
        .populate('storeId', 'name')
        .populate('categoryId', 'name')
        .populate('unitId', 'name')
        .lean();

        // حساب قيمة المخزون
        let totalInventoryValue = 0;
        let totalQuantity = 0;
        const storeBreakdown = {};
        const categoryBreakdown = {};
        const lowStockItems = [];

        for (const item of items) {
            const itemValue = (item.purchasePrice || 0) * (item.quantity_Remaining || 0);
            totalInventoryValue += itemValue;
            totalQuantity += item.quantity_Remaining || 0;

            // تجميع حسب المخزن
            const storeName = item.storeId?.name || 'غير محدد';
            if (!storeBreakdown[storeName]) {
                storeBreakdown[storeName] = {
                    name: storeName,
                    value: 0,
                    items: 0,
                    quantity: 0
                };
            }
            storeBreakdown[storeName].value += itemValue;
            storeBreakdown[storeName].items += 1;
            storeBreakdown[storeName].quantity += item.quantity_Remaining || 0;

            // تجميع حسب الفئة
            const categoryName = item.categoryId?.name || 'غير مصنف';
            if (!categoryBreakdown[categoryName]) {
                categoryBreakdown[categoryName] = {
                    name: categoryName,
                    value: 0,
                    items: 0,
                    quantity: 0
                };
            }
            categoryBreakdown[categoryName].value += itemValue;
            categoryBreakdown[categoryName].items += 1;
            categoryBreakdown[categoryName].quantity += item.quantity_Remaining || 0;

            // الأصناف قليلة المخزون
            if ((item.quantity_Remaining || 0) <= (item.minStockLevel || 0) && item.minStockLevel > 0) {
                lowStockItems.push({
                    _id: item._id.toString(),
                    name: item.name,
                    currentStock: item.quantity_Remaining || 0,
                    minStockLevel: item.minStockLevel || 0,
                    purchasePrice: item.purchasePrice || 0,
                    value: itemValue,
                    storeName: storeName,
                    categoryName: categoryName,
                    unitName: item.unitId?.name || ''
                });
            }
        }

        // تحويل التجميعات إلى مصفوفات مرتبة
        const storeBreakdownArray = Object.values(storeBreakdown)
            .sort((a, b) => b.value - a.value);

        const categoryBreakdownArray = Object.values(categoryBreakdown)
            .sort((a, b) => b.value - a.value);

        // ترتيب الأصناف قليلة المخزون حسب القيمة
        lowStockItems.sort((a, b) => b.value - a.value);

        return {
            success: true,
            data: {
                totalInventoryValue,
                totalItems: items.length,
                totalQuantity,
                storeBreakdown: storeBreakdownArray,
                categoryBreakdown: categoryBreakdownArray,
                lowStockItems: lowStockItems.slice(0, 20), // أول 20 صنف
                averageItemValue: items.length > 0 ? totalInventoryValue / items.length : 0,
                generatedAt: new Date().toISOString(),
                filters: filters
            }
        };

    } catch (error) {
        console.error("Error in getInventoryValuation:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * حساب ميزان الأرباح والخسائر الشامل
 */
export async function getProfitLossStatement(filters = {}) {
    try {
        // استيراد الدوال المطلوبة
        const { getAccurateFinancialReport } = await import('./financialCalculations');
        
        // جلب البيانات المالية وقيمة المخزون
        const [financialResult, inventoryResult] = await Promise.all([
            getAccurateFinancialReport(filters),
            getInventoryValuation(filters)
        ]);

        if (!financialResult.success) {
            throw new Error(financialResult.error);
        }

        if (!inventoryResult.success) {
            throw new Error(inventoryResult.error);
        }

        const financial = financialResult.data;
        const inventory = inventoryResult.data;

        // حساب ميزان الأرباح والخسائر
        const profitLoss = {
            // الإيرادات
            revenue: {
                totalSales: financial.revenue.totalInvoiced,
                cashSales: financial.revenue.totalPaid,
                creditSales: financial.revenue.totalPending
            },
            
            // تكلفة البضاعة المباعة (تقديرية)
            costOfGoodsSold: {
                // يمكن حسابها بدقة أكثر لاحقاً بناءً على حركة المخزون
                estimated: financial.expense.totalInvoiced * 0.7 // تقدير 70% من المشتريات
            },
            
            // إجمالي الربح
            grossProfit: financial.revenue.totalInvoiced - (financial.expense.totalInvoiced * 0.7),
            
            // المصروفات التشغيلية
            operatingExpenses: {
                purchases: financial.expense.totalInvoiced,
                cashPurchases: financial.expense.totalPaid,
                creditPurchases: financial.expense.totalPending
            },
            
            // صافي الربح
            netProfit: {
                beforeInventory: financial.netProfit.actualPaid,
                inventoryValue: inventory.totalInventoryValue,
                adjustedNetProfit: financial.netProfit.actualPaid + inventory.totalInventoryValue
            },
            
            // المركز المالي
            financialPosition: {
                assets: {
                    cash: financial.revenue.totalPaid - financial.expense.totalPaid,
                    inventory: inventory.totalInventoryValue,
                    accountsReceivable: financial.debtAnalysis.profitsDeferred,
                    totalAssets: 0 // سيتم حسابه
                },
                liabilities: {
                    accountsPayable: financial.debtAnalysis.debtOnUs,
                    totalLiabilities: financial.debtAnalysis.debtOnUs
                },
                equity: {
                    retainedEarnings: 0, // سيتم حسابه
                    totalEquity: 0 // سيتم حسابه
                }
            }
        };

        // حساب إجمالي الأصول
        profitLoss.financialPosition.assets.totalAssets = 
            profitLoss.financialPosition.assets.cash +
            profitLoss.financialPosition.assets.inventory +
            profitLoss.financialPosition.assets.accountsReceivable;

        // حساب حقوق الملكية
        profitLoss.financialPosition.equity.retainedEarnings = 
            profitLoss.financialPosition.assets.totalAssets - 
            profitLoss.financialPosition.liabilities.totalLiabilities;
        
        profitLoss.financialPosition.equity.totalEquity = 
            profitLoss.financialPosition.equity.retainedEarnings;

        return {
            success: true,
            data: {
                ...profitLoss,
                inventoryDetails: inventory,
                financialDetails: financial,
                generatedAt: new Date().toISOString(),
                filters: filters
            }
        };

    } catch (error) {
        console.error("Error in getProfitLossStatement:", error);
        return {
            success: false,
            error: error.message
        };
    }
}