"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth"; // (تأكد أن المسار صحيح)
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches"; 
import Supplier from "@/models/Suppliers";
import mongoose from "mongoose"; 

// ==========================================================
// 🔹 دالة مساعدة لتحويل نتائج Mongoose إلى كائنات آمنة
// ==========================================================
function toPlainObject(data) {
    return JSON.parse(JSON.stringify(data));
}

// ==========================================================
// 1️⃣ دوال الموردين (Suppliers)
// ==========================================================

/**
 * 🔸 جلب جميع الموردين مع المجاميع (Suply / Pay / Balance)
 */
export async function getSubscriberSuppliers() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.branchId) {
            throw new Error("403 - غير مصرح لك (Subscribers فقط)");
        }
        
        await connectToDB();

        const suppliersWithAggregates = await Supplier.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(currentUser._id) } },

            {
                $lookup: {
                    from: "invoices",
                    let: { supplier_id: "$_id" },
                    pipeline: [
                        {
                            $match: { 
                                $expr: { $eq: ["$supplierId", "$$supplier_id"] },
                                type: "expense"
                            }
                        }
                    ],
                    as: "expenseInvoices"
                }
            },
            {
                $lookup: {
                    from: "branches",
                    localField: "branchId",
                    foreignField: "_id",
                    as: "branchDetails"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    details: 1,
                    branchId: { 
                        _id: { $arrayElemAt: ["$branchDetails._id", 0] },
                        name: { $arrayElemAt: ["$branchDetails.name", 0] }
                    },
                    
                    // --- (هذا هو التصحيح) ---
                    suply: { $sum: "$expenseInvoices.totalInvoice" }, // إجمالي قيمة الفواتير
                    pay: { $sum: "$expenseInvoices.totalPays" },   // إجمالي ما تم دفعه لهذه الفواتير
                    balnce: { 
                        $subtract: [
                            { $sum: "$expenseInvoices.totalInvoice" },
                            { $sum: "$expenseInvoices.totalPays" }
                        ]
                    }
                    // --- (نهاية التصحيح) ---
                }
            },
            { $sort: { balnce: -1 } }
        ]);

        // (الكود المساعد لتحويل ObjectId - لا تغيير)
        const plainSuppliers = suppliersWithAggregates.map(s => ({
            ...s,
            _id: s._id?.toString() || "",
            branchId: s.branchId
                ? {
                    _id: s.branchId._id?.toString() || "",
                    name: s.branchId.name || ""
                }
                : null
        }));

        return { success: true, data: { suppliers: plainSuppliers } };

    } catch (error) {
//         console.error("❌ getSubscriberSuppliers Error:", error);
        return { success: false, error: error.message };
    }
}

// ==========================================================
// 2️⃣ دوال الفواتير (Invoices)
// ==========================================================

/**
 * 🔸 جلب جميع الفروع والفواتير الخاصة بالمشترك
 */
export async function getSubscriberInvoices() {
    // (الكود كما هو - لا تغيير)
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.branchId) {
            throw new Error("403 - غير مصرح لك (Subscribers فقط)");
        }
        
        await connectToDB();

        const [branches, invoices] = await Promise.all([
            Branch.find({ userId: currentUser._id }).select("name").lean(),
            Invoice.find({ userId: currentUser._id })
                .populate("branchId", "name")
                .populate("customerId", "name")
                .populate("supplierId", "name")
                .sort({ createdAt: -1 })
                .lean()
        ]);

        return { 
            success: true,
            data: {
                invoices: toPlainObject(invoices),
                branches: toPlainObject(branches)
            }
        };

    } catch (error) {
//         console.error("❌ getSubscriberInvoices Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * 🔸 جلب تفاصيل فاتورة واحدة للمشترك
 */
export async function getSubscriberInvoiceDetails(invoiceId) {
    // (الكود كما هو - لا تغيير)
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.branchId) {
            throw new Error("403 - غير مصرح لك");
        }

        if (!invoiceId || !mongoose.Types.ObjectId.isValid(invoiceId)) {
            throw new Error("400 - رقم الفاتورة غير صالح");
        }
        
        await connectToDB();

        const invoice = await Invoice.findOne({ 
            _id: invoiceId,
            userId: currentUser._id
        })
        .populate("branchId", "name")
        .populate("customerId", "name")
        .populate("supplierId", "name")
        .lean();

        if (!invoice) {
            throw new Error("404 - الفاتورة غير موجودة أو لا تملك صلاحية الوصول إليها");
        }

        return { success: true, data: toPlainObject(invoice) };

    } catch (error) {
       // console.error("❌ getSubscriberInvoiceDetails Error:", error);
        return { success: false, error: error.message };
    }
}

// ==========================================================
// 3️⃣ دوال تفاصيل المورد الواحد
// ==========================================================
export async function getSubscriberSupplierDetails(supplierId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.branchId) {
            throw new Error("403 - غير مصرح لك");
        }

        if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
            throw new Error("400 - رقم المورد غير صالح");
        }
        
        await connectToDB();

        const supplier = await Supplier.findOne({
            _id: supplierId,
            userId: currentUser._id
        })
        .populate("branchId", "name")
        .lean();

        if (!supplier) {
            throw new Error("404 - المورد غير موجود أو لا تملك صلاحية الوصول إليه");
        }

        const invoices = await Invoice.find({
            supplierId: supplierId,
            userId: currentUser._id,
            type: "expense"
        })
        .populate("branchId", "name")
        .sort({ createdAt: -1 })
        .lean();

        // 🧮 حساب الإجماليات (هذا هو التصحيح الثاني)
        const aggregates = await Invoice.aggregate([
            {
                $match: {
                    supplierId: new mongoose.Types.ObjectId(supplierId),
                    userId: new mongoose.Types.ObjectId(currentUser._id),
                    type: "expense"
                }
            },
            {
                $group: { 
                    _id: null, 
                    totalSuply: { $sum: "$totalInvoice" },
                    totalPaid: { $sum: "$totalPays" } // <-- (التصحيح)
                }
            }
        ]);

        const calculatedSuply = aggregates[0]?.totalSuply || 0;
        const calculatedPaid = aggregates[0]?.totalPaid || 0; // <-- (التصحيح)
        const calculatedBalance = calculatedSuply - calculatedPaid; // <-- (التصحيح)

        const finalSupplier = {
            ...supplier,
            _id: supplier._id?.toString(),
            branchId: supplier.branchId
                ? {
                    _id: supplier.branchId._id?.toString(),
                    name: supplier.branchId.name
                }
                : null,
            suply: calculatedSuply,
            pay: calculatedPaid, // <-- (التصحيح)
            balnce: calculatedBalance
        };

        return { 
            success: true,
            data: {
                supplier: toPlainObject(finalSupplier),
                invoices: toPlainObject(invoices)
            }
        };

    } catch (error) {
        //console.error("❌ getSubscriberSupplierDetails Error:", error);
        return { success: false, error: error.message };
    }
}