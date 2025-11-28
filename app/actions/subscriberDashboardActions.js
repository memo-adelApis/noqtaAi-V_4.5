// المسار: app/actions/subscriberDashboardActions.js (مصحح)
"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Invoice from "@/models/Invoices";
import User from "@/models/User";
import Branch from "@/models/Branches";
import Customer from "@/models/Customers";
import Supplier from "@/models/Suppliers";
import mongoose from "mongoose";

/**
 * دالة لجلب إحصائيات لوحة التحكم للمشترك (صاحب الحساب)

/**
 * دالة لجلب KPIs الأساسية للمشترك (Server Action)
 * تحتوي على بيانات حساسة: صافي الربح، المستحقات، إجمالي الموظفين والفروع

/**
 * Server Action: بيانات لوحة التحكم الأساسية (Critical Data)
 */
export async function getSubscriberDashboardData() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("401 - غير مصرح به");
        }
        
        await connectToDB();
        const mainAccountId = currentUser._id;

        // --- 1. KPIs ---
        const statsAggregation = await Invoice.aggregate([
            { $match: { userId: mainAccountId, status: { $in: ["paid", "pending", "overdue"] } } },
            { $group: {
                _id: "$type",
                totalAmount: { $sum: "$totalInvoice" },
                totalPaid: { $sum: "$totalPays" },
                totalBalance: { $sum: "$balance" }
            }}
        ]);

        const revenueData = statsAggregation.find(s => s._id === 'revenue') || { totalAmount:0, totalPaid:0, totalBalance:0 };
        const expenseData = statsAggregation.find(s => s._id === 'expense') || { totalAmount:0, totalPaid:0, totalBalance:0 };

        const totalRevenue = revenueData.totalAmount;
        const totalExpenses = expenseData.totalAmount;
        const netProfit = revenueData.totalPaid - expenseData.totalPaid;
        const totalReceivables = revenueData.totalBalance;
        const totalPayables = expenseData.totalBalance;

        const [totalEmployees, totalBranches] = await Promise.all([
            User.countDocuments({ mainAccountId, _id: { $ne: mainAccountId } }),
            Branch.countDocuments({ userId: mainAccountId })
        ]);

        return {
            success: true,
            data: {
                stats: { totalRevenue, totalExpenses, netProfit, totalReceivables, totalPayables, totalEmployees, totalBranches }
            }
        };

    } catch (error) {
       // console.error(error);
        return { success: false, error: error.message };
    }
}


export async function getSubscriberInvoices() {
    try {
        const currentUser = await getCurrentUser();
        // 1. التحقق من أن المستخدم هو المشترك الرئيسي (وليس مستخدم فرعي)
        // (نفترض أن المشترك الرئيسي ليس لديه branchId)
        if (!currentUser || currentUser.branchId) {
            throw new Error("403 - غير مصرح لك (Subscriber only)");
        }
        
        await connectToDB();
        
        // 2. جلب جميع فروع هذا المشترك (لاستخدامها في الفلتر)
        const branches = await Branch.find({ userId: currentUser._id }).select("name");

        // 3. جلب جميع فواتير هذا المشترك، مع جلب بيانات الفرع والعميل
        const invoices = await Invoice.find({ userId: currentUser._id })
            .populate('branchId', 'name')     // جلب اسم الفرع
            .populate('customerId', 'name')  // جلب اسم العميل
            .populate('supplierId', 'name') // جلب اسم المورد
            .sort({ createdAt: -1 });

        return { 
            success: true, 
            data: {
                invoices: JSON.parse(JSON.stringify(invoices)),
                branches: JSON.parse(JSON.stringify(branches))
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}