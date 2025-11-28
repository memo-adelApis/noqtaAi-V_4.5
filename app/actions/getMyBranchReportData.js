"use server";

import { getSafeSession } from "@/app/lib/auth";
import Invoice from "@/models/Invoices";
import { connectToDB } from "@/utils/database";
import Customer from "@/models/Customers";
import Supplier from "@/models/Suppliers";
import mongoose from "mongoose"; // ✅ ضروري للتحويل

export async function getMyBranchReportData() {
  try {
    const session = await getSafeSession();
    if (!session || !session.user || !session.user.branchId) {
      return { success: false, error: "غير مصرح لك بالوصول" };
    }

    await connectToDB();

    // ✅ تحويل المعرف من نص إلى كائن MongoDB
    const branchId = new mongoose.Types.ObjectId(session.user.branchId);

    // لتوسيع نطاق البحث (مثلاً سنة كاملة بدلاً من شهر لضمان ظهور بيانات)
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // آخر سنة

    // 1. تجميع الإحصائيات (Stats)
    const statsAggregation = await Invoice.aggregate([
      {
        $match: {
          branchId: branchId, // ✅ الآن سيطابق بشكل صحيح
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ["$type", "revenue"] }, "$totalInvoice", 0] } },
          totalExpenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$totalInvoice", 0] } },
          invoicesCount: { $count: {} }
        }
      }
    ]);

    const statsResult = statsAggregation[0] || { totalRevenue: 0, totalExpenses: 0, invoicesCount: 0 };
    
    // 2. تجميع بيانات الرسم البياني (Chart Data)
    const chartAggregation = await Invoice.aggregate([
      {
        $match: {
          branchId: branchId, // ✅ استخدام المعرف المحول
          createdAt: { $gte: startDate } // وسعنا التاريخ ليظهر بيانات
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $cond: [{ $eq: ["$type", "revenue"] }, "$totalInvoice", 0] } },
          expenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$totalInvoice", 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const chartData = chartAggregation.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' }),
      revenue: item.revenue,
      expenses: item.expenses
    }));

    // 3. أحدث الفواتير (find لا تحتاج تحويل، لكن يفضل التوحيد)
    const recentInvoicesDocs = await Invoice.find({ branchId: session.user.branchId }) // هنا String عادي يعمل
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customerId", "name")
      .populate("supplierId", "name")
      .select("invoiceNumber type totalInvoice createdAt customerId supplierId")
      .lean();

    const recentInvoices = recentInvoicesDocs.map(inv => ({
      _id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      type: inv.type,
      total: inv.totalInvoice,
      createdAt: inv.createdAt.toISOString(),
      clientName: inv.type === 'revenue' ? (inv.customerId?.name || "عميل") : (inv.supplierId?.name || "مورد")
    }));

    return {
      success: true,
      data: {
        stats: {
          totalRevenue: statsResult.totalRevenue,
          totalExpenses: statsResult.totalExpenses,
          netProfit: statsResult.totalRevenue - statsResult.totalExpenses,
          invoicesCount: statsResult.invoicesCount
        },
        chartData,
        recentInvoices
      }
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}