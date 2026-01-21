"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import Customer from "@/models/Customers";
import Supplier from "@/models/Suppliers";
import Store from "@/models/Store";
import Item from "@/models/Items";
import mongoose from "mongoose";

/**
 * دالة للتحقق من صلاحيات المالك وجلب mainAccountId
 */
async function getOwnerMainAccountId() {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
        throw new Error("401 - غير مصرح به");
    }
    
    if (currentUser.role !== 'owner') {
        throw new Error("403 - هذه الصفحة مخصصة للمالك فقط");
    }
    
    if (!currentUser.mainAccountId) {
        throw new Error("403 - المالك غير مرتبط بحساب مشترك");
    }
    
    return currentUser.mainAccountId;
}

/**
 * جلب إحصائيات لوحة التحكم للمالك
 */
export async function getOwnerDashboardData() {
    try {
        await connectToDB();
        
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("401 - غير مصرح به");
        }
        
        if (currentUser.role !== 'owner') {
            throw new Error("403 - هذه الصفحة مخصصة للمالك فقط");
        }

        // للمالك، نستخدم mainAccountId (المشترك الأساسي)
        let targetUserId;
        if (currentUser.mainAccountId) {
            targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
        } else {
            // إذا لم يكن له mainAccountId، فهو المشترك الأساسي نفسه
            targetUserId = new mongoose.Types.ObjectId(currentUser._id);
        }
        
        // --- 1. إحصائيات الفواتير الأساسية ---
        const totalInvoices = await Invoice.countDocuments({ userId: targetUserId });
        const revenueInvoices = await Invoice.countDocuments({ userId: targetUserId, type: 'revenue' });
        const expenseInvoices = await Invoice.countDocuments({ userId: targetUserId, type: 'expense' });
        
        // --- 2. إحصائيات حالة الفواتير ---
        const paidInvoices = await Invoice.countDocuments({ userId: targetUserId, status: 'paid' });
        const pendingInvoices = await Invoice.countDocuments({ userId: targetUserId, status: 'pending' });
        const overdueInvoices = await Invoice.countDocuments({ userId: targetUserId, status: 'overdue' });
        
        // --- 3. إجمالي الإيرادات والمصروفات ---
        const totalRevenue = await Invoice.aggregate([
            { $match: { userId: targetUserId, type: 'revenue' } },
            { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
        ]);
        
        const totalExpenses = await Invoice.aggregate([
            { $match: { userId: targetUserId, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
        ]);
        
        // --- 4. صافي الربح ---
        const netProfit = (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0);
        
        // --- 5. إيرادات ومصروفات هذا الشهر ---
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyRevenue = await Invoice.aggregate([
            { 
                $match: { 
                    userId: targetUserId,
                    type: 'revenue',
                    createdAt: { $gte: startOfMonth }
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
        ]);
        
        const monthlyExpenses = await Invoice.aggregate([
            { 
                $match: { 
                    userId: targetUserId,
                    type: 'expense',
                    createdAt: { $gte: startOfMonth }
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
        ]);
        
        // --- 6. المبالغ المستحقة ---
        const outstandingAmount = await Invoice.aggregate([
            { $match: { userId: targetUserId, status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$balance' } } }
        ]);
        
        // --- 7. عدد الفروع ---
        const totalBranches = await Branch.countDocuments({ userId: targetUserId });
        
        // --- 8. عدد المنتجات ---
        const stores = await Store.find({ userId: targetUserId }).select('_id');
        const storeIds = stores.map(s => s._id);
        const totalProducts = await Item.countDocuments({ storeId: { $in: storeIds } });
        
        // --- 9. إحصائيات الفروع ---
        const branchStats = await Invoice.aggregate([
            { $match: { userId: targetUserId } },
            { 
                $group: { 
                    _id: '$branchId',
                    totalRevenue: { 
                        $sum: { 
                            $cond: [{ $eq: ['$type', 'revenue'] }, '$totalInvoice', 0] 
                        } 
                    },
                    totalExpenses: { 
                        $sum: { 
                            $cond: [{ $eq: ['$type', 'expense'] }, '$totalInvoice', 0] 
                        } 
                    },
                    invoiceCount: { $sum: 1 }
                } 
            },
            { 
                $lookup: {
                    from: 'branches',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'branch'
                }
            },
            { $unwind: '$branch' },
            { $sort: { totalRevenue: -1 } }
        ]);
        
        // --- 10. إيرادات آخر 12 شهر ---
        const last12Months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const monthData = await Invoice.aggregate([
                { 
                    $match: { 
                        userId: targetUserId,
                        createdAt: { 
                            $gte: startOfMonth,
                            $lte: endOfMonth
                        }
                    } 
                },
                {
                    $group: {
                        _id: '$type',
                        total: { $sum: '$totalInvoice' }
                    }
                }
            ]);
            
            const revenue = monthData.find(m => m._id === 'revenue')?.total || 0;
            const expenses = monthData.find(m => m._id === 'expense')?.total || 0;
            
            last12Months.push({
                month: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
                revenue,
                expenses,
                profit: revenue - expenses
            });
        }
        
        return {
            success: true,
            data: {
                totalInvoices,
                revenueInvoices,
                expenseInvoices,
                paidInvoices,
                pendingInvoices,
                overdueInvoices,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalExpenses: totalExpenses[0]?.total || 0,
                netProfit,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                monthlyExpenses: monthlyExpenses[0]?.total || 0,
                outstandingAmount: outstandingAmount[0]?.total || 0,
                totalBranches,
                totalProducts,
                branchStats: JSON.parse(JSON.stringify(branchStats)),
                last12Months
            }
        };
        
    } catch (error) {
        console.error("Error in getOwnerDashboardData:", error);
        return { success: false, error: error.message };
    }
}

/**
 * جلب الفواتير للمالك
 */
export async function getOwnerInvoices({ page = 1, limit = 50 } = {}) {
    try {
        await connectToDB();
        
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("401 - غير مصرح به");
        }
        
        if (currentUser.role !== 'owner') {
            throw new Error("403 - هذه الصفحة مخصصة للمالك فقط");
        }

        // للمالك، نستخدم mainAccountId (المشترك الأساسي)
        let targetUserId;
        if (currentUser.mainAccountId) {
            targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
        } else {
            // إذا لم يكن له mainAccountId، فهو المشترك الأساسي نفسه
            targetUserId = new mongoose.Types.ObjectId(currentUser._id);
        }
        
        const skip = (page - 1) * limit;
        
        const invoices = await Invoice.find({ userId: targetUserId })
            .populate('branchId', 'name')
            .populate('customerId', 'name')
            .populate('supplierId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const totalCount = await Invoice.countDocuments({ userId: targetUserId });
        
        return {
            success: true,
            data: {
                invoices: JSON.parse(JSON.stringify(invoices)),
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
        
    } catch (error) {
        console.error("Error in getOwnerInvoices:", error);
        return { success: false, error: error.message };
    }
}

/**
 * جلب التقرير المالي للمالك
 */
export async function getOwnerFinancialReport({ startDate, endDate } = {}) {
    try {
        await connectToDB();
        
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("401 - غير مصرح به");
        }
        
        if (currentUser.role !== 'owner') {
            throw new Error("403 - هذه الصفحة مخصصة للمالك فقط");
        }

        // للمالك، نستخدم mainAccountId (المشترك الأساسي)
        let targetUserId;
        if (currentUser.mainAccountId) {
            targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
        } else {
            // إذا لم يكن له mainAccountId، فهو المشترك الأساسي نفسه
            targetUserId = new mongoose.Types.ObjectId(currentUser._id);
        }
        
        // إعداد فلتر التاريخ
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
        
        const matchFilter = { userId: targetUserId };
        if (Object.keys(dateFilter).length > 0) {
            matchFilter.createdAt = dateFilter;
        }
        
        // إجمالي الإيرادات والمصروفات
        const financialSummary = await Invoice.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$totalInvoice' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const revenue = financialSummary.find(s => s._id === 'revenue') || { total: 0, count: 0 };
        const expenses = financialSummary.find(s => s._id === 'expense') || { total: 0, count: 0 };
        
        // تفاصيل حسب الفرع
        const branchBreakdown = await Invoice.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        branchId: '$branchId',
                        type: '$type'
                    },
                    total: { $sum: '$totalInvoice' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: '_id.branchId',
                    foreignField: '_id',
                    as: 'branch'
                }
            },
            { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } }
        ]);
        
        // تفاصيل حسب الشهر
        const monthlyBreakdown = await Invoice.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        type: '$type'
                    },
                    total: { $sum: '$totalInvoice' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        return {
            success: true,
            data: {
                summary: {
                    totalRevenue: revenue.total,
                    revenueCount: revenue.count,
                    totalExpenses: expenses.total,
                    expensesCount: expenses.count,
                    netProfit: revenue.total - expenses.total
                },
                branchBreakdown: JSON.parse(JSON.stringify(branchBreakdown)),
                monthlyBreakdown
            }
        };
        
    } catch (error) {
        console.error("Error in getOwnerFinancialReport:", error);
        return { success: false, error: error.message };
    }
}
/**
 * جلب الفواتير التي بها أقساط متبقية للمالك والموظفين
 */
export async function getInvoicesWithPendingInstallments() {
    try {
        await connectToDB();
        
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("401 - غير مصرح به");
        }

        let targetUserId;
        
        // تحديد userId حسب نوع المستخدم
        if (currentUser.role === 'owner') {
            // للمالك، نستخدم mainAccountId (المشترك الأساسي)
            if (currentUser.mainAccountId) {
                targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
            } else {
                // إذا لم يكن له mainAccountId، فهو المشترك الأساسي نفسه
                targetUserId = new mongoose.Types.ObjectId(currentUser._id);
            }
        } else if (currentUser.role === 'subuser' || currentUser.role === 'manager' || currentUser.role === 'employee') {
            // للموظفين، استخدم mainAccountId (المالك)
            if (currentUser.mainAccountId) {
                targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
            } else {
                throw new Error("403 - الموظف غير مرتبط بحساب رئيسي");
            }
        } else {
            throw new Error("403 - غير مصرح بالوصول");
        }

        // جلب الفواتير التي بها أقساط معلقة
        const invoicesWithInstallments = await Invoice.find({
            userId: targetUserId,
            paymentType: 'installment',
            'installments.0': { $exists: true }, // تأكد من وجود أقساط
            $or: [
                { 'installments.status': 'pending' },
                { 'installments.status': { $exists: false } } // الأقساط بدون حالة تعتبر معلقة
            ]
        })
        .populate('branchId', 'name')
        .populate('customerId', 'name phone email')
        .populate('supplierId', 'name phone email')
        .sort({ createdAt: -1 })
        .lean();

        // معالجة البيانات لإضافة معلومات الأقساط المتبقية
        const processedInvoices = invoicesWithInstallments.map(invoice => {
            const pendingInstallments = invoice.installments.filter(
                installment => !installment.status || installment.status === 'pending'
            );
            
            const totalPendingAmount = pendingInstallments.reduce(
                (sum, installment) => sum + (installment.amount || 0), 0
            );

            // العثور على أقرب قسط مستحق
            const nextInstallment = pendingInstallments
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

            // تحديد حالة الاستحقاق
            let overdueStatus = 'current';
            if (nextInstallment) {
                const today = new Date();
                const dueDate = new Date(nextInstallment.dueDate);
                const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysDiff < 0) {
                    overdueStatus = 'overdue';
                } else if (daysDiff <= 7) {
                    overdueStatus = 'due_soon';
                }
            }

            return {
                ...invoice,
                pendingInstallments,
                totalPendingAmount,
                nextInstallment,
                overdueStatus,
                pendingCount: pendingInstallments.length
            };
        });

        // فلترة الفواتير التي لديها أقساط معلقة فعلاً
        const filteredInvoices = processedInvoices.filter(
            invoice => invoice.pendingCount > 0
        );

        // إحصائيات سريعة
        const stats = {
            totalInvoices: filteredInvoices.length,
            totalPendingAmount: filteredInvoices.reduce(
                (sum, invoice) => sum + invoice.totalPendingAmount, 0
            ),
            overdueInvoices: filteredInvoices.filter(
                invoice => invoice.overdueStatus === 'overdue'
            ).length,
            dueSoonInvoices: filteredInvoices.filter(
                invoice => invoice.overdueStatus === 'due_soon'
            ).length
        };

        return {
            success: true,
            data: {
                invoices: JSON.parse(JSON.stringify(filteredInvoices)),
                stats
            }
        };
        
    } catch (error) {
        console.error("Error in getInvoicesWithPendingInstallments:", error);
        return { success: false, error: error.message };
    }
}

/**
 * تحديث حالة قسط معين
 */
export async function updateInstallmentStatus(invoiceId, installmentId, status, paidAmount = null) {
    try {
        await connectToDB();
        
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("401 - غير مصرح به");
        }

        let targetUserId;
        
        if (currentUser.role === 'owner') {
            // للمالك، نستخدم mainAccountId (المشترك الأساسي)
            if (currentUser.mainAccountId) {
                targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
            } else {
                // إذا لم يكن له mainAccountId، فهو المشترك الأساسي نفسه
                targetUserId = new mongoose.Types.ObjectId(currentUser._id);
            }
        } else if (currentUser.role === 'subuser' || currentUser.role === 'manager' || currentUser.role === 'employee') {
            // للموظفين، استخدم mainAccountId (المالك)
            if (currentUser.mainAccountId) {
                targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
            } else {
                throw new Error("403 - الموظف غير مرتبط بحساب رئيسي");
            }
        } else {
            throw new Error("403 - غير مصرح بالوصول");
        }

        // First, try to find the invoice and check if installments have _id fields
        const invoice = await Invoice.findOne({
            _id: new mongoose.Types.ObjectId(invoiceId),
            userId: targetUserId
        });

        if (!invoice) {
            throw new Error("الفاتورة غير موجودة");
        }

        console.log("Debug - Invoice found:", {
            invoiceId: invoice._id,
            installmentsCount: invoice.installments.length,
            installmentId: installmentId,
            installments: invoice.installments.map((inst, idx) => ({
                index: idx,
                _id: inst._id,
                amount: inst.amount,
                status: inst.status,
                dueDate: inst.dueDate
            }))
        });

        // Find the installment by _id or by index if _id doesn't exist
        let installmentIndex = -1;
        let foundInstallment = null;
        
        // Try to find by _id first
        if (mongoose.Types.ObjectId.isValid(installmentId)) {
            installmentIndex = invoice.installments.findIndex(inst => 
                inst._id && inst._id.toString() === installmentId.toString()
            );
            if (installmentIndex !== -1) {
                foundInstallment = invoice.installments[installmentIndex];
                console.log("Debug - Found by _id:", { installmentIndex, foundInstallment });
            }
        }
        
        // If not found by _id, try to find by index (fallback for old data)
        if (installmentIndex === -1) {
            const index = parseInt(installmentId);
            if (!isNaN(index) && index >= 0 && index < invoice.installments.length) {
                installmentIndex = index;
                foundInstallment = invoice.installments[installmentIndex];
                console.log("Debug - Found by index:", { installmentIndex, foundInstallment });
            }
        }

        // If still not found, try to find by matching amount and date (last resort)
        if (installmentIndex === -1) {
            console.log("Debug - Trying to find by other criteria...");
            // This is a fallback - you might need to adjust based on your data
            installmentIndex = invoice.installments.findIndex((inst, idx) => {
                return inst.status === 'pending' || !inst.status;
            });
            if (installmentIndex !== -1) {
                foundInstallment = invoice.installments[installmentIndex];
                console.log("Debug - Found first pending installment:", { installmentIndex, foundInstallment });
            }
        }

        if (installmentIndex === -1) {
            console.error("Debug - Installment not found:", {
                installmentId,
                invoiceId,
                availableInstallments: invoice.installments
            });
            throw new Error(`القسط غير موجود. معرف القسط: ${installmentId}`);
        }

        const updateData = {
            [`installments.${installmentIndex}.status`]: status,
            [`installments.${installmentIndex}.updatedAt`]: new Date()
        };

        if (paidAmount !== null) {
            updateData[`installments.${installmentIndex}.paidAmount`] = paidAmount;
            updateData[`installments.${installmentIndex}.paidDate`] = new Date();
        }

        const result = await Invoice.updateOne(
            {
                _id: new mongoose.Types.ObjectId(invoiceId),
                userId: targetUserId
            },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            throw new Error("الفاتورة أو القسط غير موجود");
        }

        return {
            success: true,
            message: "تم تحديث حالة القسط بنجاح"
        };
        
    } catch (error) {
        console.error("Error in updateInstallmentStatus:", error);
        return { success: false, error: error.message };
    }
}