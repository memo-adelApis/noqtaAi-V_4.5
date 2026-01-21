"use server";

import { connectToDB } from "@/utils/database";
import Invoice from "@/models/Invoices";
import { getCurrentUser } from "@/app/lib/auth";
import mongoose from "mongoose";

/**
 * حساب الأرباح والمصروفات بطريقة دقيقة
 * يفصل بين المدفوع فعلياً والأقساط المستحقة
 */
export async function getAccurateFinancialReport(filters = {}) {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("غير مصرح بالوصول");
        }

        const userId = currentUser.mainAccountId || currentUser.id;
        const branchId = filters.branchId || currentUser.branchId;

        // بناء الاستعلام الأساسي
        const baseQuery = {
            userId: new mongoose.Types.ObjectId(userId)
        };

        // إضافة فلتر الفرع إذا كان متاحاً
        if (branchId) {
            baseQuery.branchId = new mongoose.Types.ObjectId(branchId);
        }

        // إضافة فلتر التاريخ إذا كان متاحاً
        if (filters.dateFrom || filters.dateTo) {
            baseQuery.createdAt = {};
            if (filters.dateFrom) {
                baseQuery.createdAt.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                baseQuery.createdAt.$lte = new Date(filters.dateTo);
            }
        }

        // جلب جميع الفواتير
        const invoices = await Invoice.find(baseQuery)
            .populate('customerId', 'name')
            .populate('supplierId', 'name')
            .populate('branchId', 'name')
            .lean();

        // تهيئة المتغيرات للحسابات
        const financialData = {
            // الإيرادات
            revenue: {
                totalInvoiced: 0,        // إجمالي المفوتر
                totalPaid: 0,            // إجمالي المدفوع فعلياً
                totalPending: 0,         // إجمالي المعلق (أقساط + ائتمان)
                installments: {
                    total: 0,            // إجمالي الأقساط
                    paid: 0,             // الأقساط المدفوعة
                    pending: 0,          // الأقساط المعلقة (أرباح آجلة - مستحق لي)
                    overdue: 0           // الأقساط المتأخرة
                },
                credit: {
                    total: 0,            // إجمالي الائتمان
                    paid: 0,             // الائتمان المدفوع
                    pending: 0           // الائتمان المعلق
                }
            },
            // المصروفات
            expense: {
                totalInvoiced: 0,
                totalPaid: 0,
                totalPending: 0,
                installments: {
                    total: 0,
                    paid: 0,
                    pending: 0,          // الأقساط المعلقة (مديونية - مستحق عليا)
                    overdue: 0
                },
                credit: {
                    total: 0,
                    paid: 0,
                    pending: 0
                }
            },
            // صافي الأرباح
            netProfit: {
                invoiced: 0,             // صافي المفوتر
                actualPaid: 0,           // صافي المدفوع فعلياً
                pending: 0               // صافي المعلق
            },
            // المديونية والأرباح الآجلة (التوضيح الجديد)
            debtAnalysis: {
                debtOnUs: 0,             // المديونية علينا (أقساط فواتير التوريد)
                profitsDeferred: 0,      // الأرباح الآجلة (أقساط فواتير الإيرادات)
                netDebtPosition: 0       // صافي المركز المالي
            }
        };

        // معالجة كل فاتورة
        for (const invoice of invoices) {
            const isRevenue = invoice.type === 'revenue';
            const targetSection = isRevenue ? financialData.revenue : financialData.expense;

            // إضافة إجمالي الفاتورة
            targetSection.totalInvoiced += invoice.totalInvoice;

            // حساب المدفوع من الدفعات المباشرة
            const directPayments = invoice.pays.reduce((sum, pay) => sum + pay.amount, 0);
            targetSection.totalPaid += directPayments;

            // معالجة الأقساط
            if (invoice.paymentType === 'installment' && invoice.installments.length > 0) {
                for (const installment of invoice.installments) {
                    targetSection.installments.total += installment.amount;
                    
                    if (installment.status === 'paid') {
                        targetSection.installments.paid += installment.paidAmount || installment.amount;
                        targetSection.totalPaid += installment.paidAmount || installment.amount;
                    } else if (installment.status === 'overdue') {
                        targetSection.installments.overdue += installment.amount;
                        targetSection.totalPending += installment.amount;
                    } else {
                        // pending
                        targetSection.installments.pending += installment.amount;
                        targetSection.totalPending += installment.amount;
                    }
                }
            }
            // معالجة الائتمان
            else if (invoice.paymentType === 'credit') {
                const remainingBalance = invoice.totalInvoice - directPayments;
                targetSection.credit.total += invoice.totalInvoice;
                targetSection.credit.paid += directPayments;
                
                if (remainingBalance > 0) {
                    targetSection.credit.pending += remainingBalance;
                    targetSection.totalPending += remainingBalance;
                }
            }
        }

        // حساب صافي الأرباح
        financialData.netProfit.invoiced = financialData.revenue.totalInvoiced - financialData.expense.totalInvoiced;
        financialData.netProfit.actualPaid = financialData.revenue.totalPaid - financialData.expense.totalPaid;
        financialData.netProfit.pending = financialData.revenue.totalPending - financialData.expense.totalPending;

        // حساب المديونية والأرباح الآجلة
        financialData.debtAnalysis.debtOnUs = financialData.expense.installments.pending + financialData.expense.installments.overdue;
        financialData.debtAnalysis.profitsDeferred = financialData.revenue.installments.pending + financialData.revenue.installments.overdue;
        financialData.debtAnalysis.netDebtPosition = financialData.debtAnalysis.profitsDeferred - financialData.debtAnalysis.debtOnUs;

        // إضافة تفاصيل إضافية
        const additionalData = {
            totalInvoices: invoices.length,
            revenueInvoices: invoices.filter(inv => inv.type === 'revenue').length,
            expenseInvoices: invoices.filter(inv => inv.type === 'expense').length,
            
            // نسب مئوية
            percentages: {
                revenuePaidPercentage: financialData.revenue.totalInvoiced > 0 
                    ? (financialData.revenue.totalPaid / financialData.revenue.totalInvoiced * 100).toFixed(2)
                    : 0,
                expensePaidPercentage: financialData.expense.totalInvoiced > 0 
                    ? (financialData.expense.totalPaid / financialData.expense.totalInvoiced * 100).toFixed(2)
                    : 0
            },

            // تحليل الأقساط
            installmentAnalysis: {
                totalInstallments: invoices.reduce((sum, inv) => sum + (inv.installments?.length || 0), 0),
                overdueInstallments: invoices.reduce((sum, inv) => 
                    sum + (inv.installments?.filter(inst => inst.status === 'overdue').length || 0), 0),
                pendingInstallments: invoices.reduce((sum, inv) => 
                    sum + (inv.installments?.filter(inst => inst.status === 'pending').length || 0), 0),
                paidInstallments: invoices.reduce((sum, inv) => 
                    sum + (inv.installments?.filter(inst => inst.status === 'paid').length || 0), 0)
            }
        };

        return {
            success: true,
            data: {
                ...financialData,
                ...additionalData,
                generatedAt: new Date().toISOString(),
                filters: filters
            }
        };

    } catch (error) {
        console.error("Error in getAccurateFinancialReport:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * حساب تفاصيل الأقساط المستحقة
 */
export async function getInstallmentDetails(filters = {}) {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("غير مصرح بالوصول");
        }

        const userId = currentUser.mainAccountId || currentUser.id;
        const branchId = filters.branchId || currentUser.branchId;

        const baseQuery = {
            userId: new mongoose.Types.ObjectId(userId),
            paymentType: 'installment',
            'installments.0': { $exists: true }
        };

        if (branchId) {
            baseQuery.branchId = new mongoose.Types.ObjectId(branchId);
        }

        const invoicesWithInstallments = await Invoice.find(baseQuery)
            .populate('customerId', 'name phone')
            .populate('supplierId', 'name phone')
            .populate('branchId', 'name')
            .lean();

        const installmentDetails = [];
        const today = new Date();

        for (const invoice of invoicesWithInstallments) {
            for (const [index, installment] of invoice.installments.entries()) {
                const dueDate = new Date(installment.dueDate);
                const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                let status = installment.status;
                if (status === 'pending' && daysDiff < 0) {
                    status = 'overdue';
                }

                installmentDetails.push({
                    invoiceId: invoice._id.toString(),
                    invoiceNumber: invoice.invoiceNumber,
                    invoiceType: invoice.type,
                    installmentIndex: index,
                    installmentId: installment._id?.toString(),
                    amount: installment.amount,
                    paidAmount: installment.paidAmount || 0,
                    remainingAmount: installment.amount - (installment.paidAmount || 0),
                    dueDate: installment.dueDate,
                    status: status,
                    daysDiff: daysDiff,
                    paidDate: installment.paidDate,
                    client: invoice.type === 'revenue' 
                        ? (invoice.customerId?.name || 'غير محدد')
                        : (invoice.supplierId?.name || 'غير محدد'),
                    clientPhone: invoice.type === 'revenue' 
                        ? (invoice.customerId?.phone || '')
                        : (invoice.supplierId?.phone || ''),
                    branchName: invoice.branchId?.name || 'غير محدد',
                    createdAt: invoice.createdAt
                });
            }
        }

        // ترتيب حسب تاريخ الاستحقاق
        installmentDetails.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // تجميع الإحصائيات
        const stats = {
            total: installmentDetails.length,
            paid: installmentDetails.filter(inst => inst.status === 'paid').length,
            pending: installmentDetails.filter(inst => inst.status === 'pending').length,
            overdue: installmentDetails.filter(inst => inst.status === 'overdue').length,
            totalAmount: installmentDetails.reduce((sum, inst) => sum + inst.amount, 0),
            paidAmount: installmentDetails.reduce((sum, inst) => sum + inst.paidAmount, 0),
            pendingAmount: installmentDetails.filter(inst => inst.status !== 'paid')
                .reduce((sum, inst) => sum + inst.remainingAmount, 0)
        };

        return {
            success: true,
            data: {
                installments: installmentDetails,
                stats: stats,
                generatedAt: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error("Error in getInstallmentDetails:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * تحديث حالة قسط وإعادة حساب الأرقام
 */
export async function updateInstallmentStatus(invoiceId, installmentId, status, paidAmount = null) {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("غير مصرح بالوصول");
        }

        const userId = currentUser.mainAccountId || currentUser.id;

        // البحث عن الفاتورة
        const invoice = await Invoice.findOne({
            _id: new mongoose.Types.ObjectId(invoiceId),
            userId: new mongoose.Types.ObjectId(userId)
        });

        if (!invoice) {
            throw new Error("الفاتورة غير موجودة");
        }

        // البحث عن القسط
        let installmentIndex = -1;
        if (mongoose.Types.ObjectId.isValid(installmentId)) {
            installmentIndex = invoice.installments.findIndex(inst => 
                inst._id && inst._id.toString() === installmentId.toString()
            );
        }
        
        if (installmentIndex === -1) {
            const index = parseInt(installmentId);
            if (!isNaN(index) && index >= 0 && index < invoice.installments.length) {
                installmentIndex = index;
            }
        }

        if (installmentIndex === -1) {
            throw new Error("القسط غير موجود");
        }

        const installment = invoice.installments[installmentIndex];

        // تحديث بيانات القسط
        const updateData = {
            [`installments.${installmentIndex}.status`]: status,
            [`installments.${installmentIndex}.updatedAt`]: new Date()
        };

        if (status === 'paid' && paidAmount !== null) {
            updateData[`installments.${installmentIndex}.paidAmount`] = paidAmount;
            updateData[`installments.${installmentIndex}.paidDate`] = new Date();
        }

        // تحديث الفاتورة
        const result = await Invoice.updateOne(
            { _id: new mongoose.Types.ObjectId(invoiceId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            throw new Error("فشل في تحديث القسط");
        }

        // إعادة حساب إجماليات الفاتورة
        const updatedInvoice = await Invoice.findById(invoiceId);
        await updatedInvoice.save(); // سيتم تشغيل pre-save hook لإعادة الحساب

        return {
            success: true,
            message: "تم تحديث القسط بنجاح",
            data: {
                installmentIndex,
                newStatus: status,
                paidAmount: paidAmount,
                updatedAt: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error("Error in updateInstallmentStatus:", error);
        return {
            success: false,
            error: error.message
        };
    }
}