"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Invoice from "@/models/Invoices";
import mongoose from "mongoose";

/**
 * تحديث حالة قسط معين - خاص بالموظفين (محدث)
 */
export async function updateInstallmentStatusSubuser(invoiceId, installmentId, status, paidAmount = null) {
    try {
        await connectToDB();
        
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("401 - غير مصرح به");
        }

        // التحقق من أن المستخدم موظف
        if (!['subuser', 'manager', 'employee'].includes(currentUser.role)) {
            throw new Error("403 - هذه الوظيفة مخصصة للموظفين فقط");
        }

        // للموظفين، استخدم mainAccountId (المالك)
        let targetUserId;
        if (currentUser.mainAccountId) {
            targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
        } else {
            throw new Error("403 - الموظف غير مرتبط بحساب رئيسي");
        }

        // البحث عن الفاتورة والتأكد من أنها تنتمي للفرع الصحيح
        const invoice = await Invoice.findOne({
            _id: new mongoose.Types.ObjectId(invoiceId),
            userId: targetUserId,
            branchId: new mongoose.Types.ObjectId(currentUser.branchId) // التأكد من أن الفاتورة تنتمي لفرع الموظف
        });

        if (!invoice) {
            throw new Error("الفاتورة غير موجودة أو غير مصرح لك بالوصول إليها");
        }

        console.log("Debug - Subuser Invoice found:", {
            invoiceId: invoice._id,
            branchId: invoice.branchId,
            userBranchId: currentUser.branchId,
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

        // البحث عن القسط
        let installmentIndex = -1;
        let foundInstallment = null;
        
        // محاولة البحث بـ _id أولاً
        if (mongoose.Types.ObjectId.isValid(installmentId)) {
            installmentIndex = invoice.installments.findIndex(inst => 
                inst._id && inst._id.toString() === installmentId.toString()
            );
            if (installmentIndex !== -1) {
                foundInstallment = invoice.installments[installmentIndex];
                console.log("Debug - Subuser found by _id:", { installmentIndex, foundInstallment });
            }
        }
        
        // إذا لم يتم العثور عليه بـ _id، استخدم الفهرس
        if (installmentIndex === -1) {
            const index = parseInt(installmentId);
            if (!isNaN(index) && index >= 0 && index < invoice.installments.length) {
                installmentIndex = index;
                foundInstallment = invoice.installments[installmentIndex];
                console.log("Debug - Subuser found by index:", { installmentIndex, foundInstallment });
            }
        }

        // إذا لم يتم العثور عليه، ابحث عن أول قسط معلق
        if (installmentIndex === -1) {
            console.log("Debug - Subuser trying to find first pending installment...");
            installmentIndex = invoice.installments.findIndex((inst, idx) => {
                return inst.status === 'pending' || !inst.status;
            });
            if (installmentIndex !== -1) {
                foundInstallment = invoice.installments[installmentIndex];
                console.log("Debug - Subuser found first pending installment:", { installmentIndex, foundInstallment });
            }
        }

        if (installmentIndex === -1) {
            console.error("Debug - Subuser installment not found:", {
                installmentId,
                invoiceId,
                availableInstallments: invoice.installments
            });
            throw new Error(`القسط غير موجود. معرف القسط: ${installmentId}`);
        }

        // التحقق من أن القسط لم يتم دفعه مسبقاً
        if (foundInstallment.status === 'paid') {
            throw new Error("هذا القسط مدفوع مسبقاً");
        }

        // تحديث بيانات القسط
        const updateData = {
            [`installments.${installmentIndex}.status`]: status,
            [`installments.${installmentIndex}.updatedAt`]: new Date()
        };

        if (paidAmount !== null && status === 'paid') {
            updateData[`installments.${installmentIndex}.paidAmount`] = paidAmount;
            updateData[`installments.${installmentIndex}.paidDate`] = new Date();
        }

        const result = await Invoice.updateOne(
            {
                _id: new mongoose.Types.ObjectId(invoiceId),
                userId: targetUserId,
                branchId: new mongoose.Types.ObjectId(currentUser.branchId)
            },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            throw new Error("فشل في تحديث القسط");
        }

        // إعادة حساب إجماليات الفاتورة
        const updatedInvoice = await Invoice.findById(invoiceId);
        if (updatedInvoice) {
            await updatedInvoice.save(); // سيتم تشغيل pre-save hook لإعادة الحساب
        }

        // إضافة سجل للعملية (اختياري)
        console.log(`Installment updated by subuser: ${currentUser.name} (${currentUser.email}) - Invoice: ${invoiceId}, Installment: ${installmentIndex}, Status: ${status}`);

        return {
            success: true,
            message: "تم تسجيل دفع القسط بنجاح",
            data: {
                installmentIndex,
                newStatus: status,
                paidAmount: paidAmount,
                updatedBy: currentUser.name
            }
        };
        
    } catch (error) {
        console.error("Error in updateInstallmentStatusSubuser:", error);
        return { 
            success: false, 
            error: error.message || "حدث خطأ في تحديث حالة القسط"
        };
    }
}

/**
 * جلب الفواتير التي بها أقساط متبقية للموظف (خاص بفرع الموظف فقط)
 */
export async function getSubuserInvoicesWithPendingInstallments() {
    try {
        await connectToDB();
        
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            throw new Error("401 - غير مصرح به");
        }

        // التحقق من أن المستخدم موظف
        if (!['subuser', 'manager', 'employee'].includes(currentUser.role)) {
            throw new Error("403 - هذه الوظيفة مخصصة للموظفين فقط");
        }

        // للموظفين، استخدم mainAccountId (المالك)
        let targetUserId;
        if (currentUser.mainAccountId) {
            targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
        } else {
            throw new Error("403 - الموظف غير مرتبط بحساب رئيسي");
        }

        // جلب الفواتير التي بها أقساط معلقة للفرع المحدد فقط
        const invoicesWithInstallments = await Invoice.find({
            userId: targetUserId,
            branchId: new mongoose.Types.ObjectId(currentUser.branchId), // فلترة حسب فرع الموظف
            paymentType: 'installment',
            'installments.0': { $exists: true },
            $or: [
                { 'installments.status': 'pending' },
                { 'installments.status': { $exists: false } }
            ]
        })
        .populate('branchId', 'name')
        .populate('customerId', 'name phone email')
        .populate('supplierId', 'name phone email')
        .sort({ createdAt: -1 })
        .lean();

        // معالجة البيانات
        const processedInvoices = invoicesWithInstallments.map(invoice => {
            const pendingInstallments = invoice.installments.filter(
                installment => !installment.status || installment.status === 'pending'
            ).map(installment => ({
                ...installment,
                _id: installment._id ? installment._id.toString() : null
            }));
            
            const totalPendingAmount = pendingInstallments.reduce(
                (sum, installment) => sum + (installment.amount || 0), 0
            );

            const nextInstallment = pendingInstallments
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

            let overdueStatus = 'current';
            if (nextInstallment) {
                const dueDate = new Date(nextInstallment.dueDate);
                const today = new Date();
                const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysDiff < 0) {
                    overdueStatus = 'overdue';
                } else if (daysDiff <= 7) {
                    overdueStatus = 'due_soon';
                }
            }

            return {
                ...invoice,
                _id: invoice._id.toString(),
                branchId: invoice.branchId?._id ? invoice.branchId._id.toString() : invoice.branchId,
                customerId: invoice.customerId?._id ? {
                    ...invoice.customerId,
                    _id: invoice.customerId._id.toString()
                } : invoice.customerId,
                supplierId: invoice.supplierId?._id ? {
                    ...invoice.supplierId,
                    _id: invoice.supplierId._id.toString()
                } : invoice.supplierId,
                pendingInstallments,
                totalPendingAmount,
                nextInstallment,
                overdueStatus
            };
        });

        // إحصائيات سريعة
        const stats = {
            totalInvoices: processedInvoices.length,
            totalPendingAmount: processedInvoices.reduce((sum, inv) => sum + inv.totalPendingAmount, 0),
            overdueCount: processedInvoices.filter(inv => inv.overdueStatus === 'overdue').length,
            dueSoonCount: processedInvoices.filter(inv => inv.overdueStatus === 'due_soon').length
        };

        return {
            success: true,
            data: {
                invoices: processedInvoices,
                stats,
                branchInfo: {
                    branchId: currentUser.branchId.toString(),
                    branchName: currentUser.branchName
                }
            }
        };
        
    } catch (error) {
        console.error("Error in getSubuserInvoicesWithPendingInstallments:", error);
        return { success: false, error: error.message };
    }
}