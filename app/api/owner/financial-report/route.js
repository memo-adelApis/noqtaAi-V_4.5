import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connectToDB();
    
    // التحقق من صلاحيات المالك
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'owner') {
      return NextResponse.json(
        { error: "غير مصرح به - هذه الصفحة للمالك فقط" },
        { status: 403 }
      );
    }
    
    if (!currentUser.mainAccountId) {
      return NextResponse.json(
        { error: "المالك غير مرتبط بحساب مشترك" },
        { status: 403 }
      );
    }
    
    // استخدام mainAccountId بدلاً من userId
    const subscriberId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
    
    // جلب المعاملات من URL
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();
    const month = searchParams.get('month') || 'all';
    
    // معلومات تشخيصية
    console.log('=== Financial Report Debug ===');
    console.log('Owner ID:', currentUser._id);
    console.log('Main Account ID (Subscriber):', subscriberId);
    console.log('Year:', year);
    console.log('Month:', month);
    
    // إعداد فلتر التاريخ
    let dateFilter = {};
    if (month === 'all') {
      dateFilter = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59)
      };
    } else {
      const monthNum = parseInt(month);
      dateFilter = {
        $gte: new Date(year, monthNum - 1, 1),
        $lte: new Date(year, monthNum, 0, 23, 59, 59)
      };
    }
    
    // جلب الفواتير
    const invoices = await Invoice.find({
      userId: subscriberId,
      createdAt: dateFilter
    })
    .populate('branchId', 'name')
    .sort({ createdAt: -1 })
    .lean();
    
    console.log('Total Invoices Found:', invoices.length);
    if (invoices.length > 0) {
      console.log('Sample Invoice:', {
        invoiceNumber: invoices[0].invoiceNumber,
        type: invoices[0].type,
        totalInvoice: invoices[0].totalInvoice,
        createdAt: invoices[0].createdAt
      });
    }
    
    // التحقق من جميع الفواتير في قاعدة البيانات لهذا المشترك
    const allInvoices = await Invoice.find({ userId: subscriberId }).lean();
    console.log('Total Invoices for Subscriber (all time):', allInvoices.length);
    if (allInvoices.length > 0) {
      console.log('Date Range of Invoices:', {
        oldest: new Date(Math.min(...allInvoices.map(i => new Date(i.createdAt)))),
        newest: new Date(Math.max(...allInvoices.map(i => new Date(i.createdAt))))
      });
    }
    
    // تجميع البيانات الشهرية
    const monthlyData = [];
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    if (month === 'all') {
      // تجميع لكل شهر
      for (let m = 1; m <= 12; m++) {
        const monthInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.createdAt);
          return invDate.getMonth() + 1 === m;
        });
        
        const revenue = monthInvoices
          .filter(inv => inv.type === 'revenue')
          .reduce((sum, inv) => sum + inv.totalInvoice, 0);
        
        const expenses = monthInvoices
          .filter(inv => inv.type === 'expense')
          .reduce((sum, inv) => sum + inv.totalInvoice, 0);
        
        monthlyData.push({
          month: m,
          monthName: monthNames[m - 1],
          revenue,
          expenses,
          profit: revenue - expenses,
          invoiceCount: monthInvoices.length
        });
      }
    } else {
      // شهر واحد فقط
      const monthNum = parseInt(month);
      const revenue = invoices
        .filter(inv => inv.type === 'revenue')
        .reduce((sum, inv) => sum + inv.totalInvoice, 0);
      
      const expenses = invoices
        .filter(inv => inv.type === 'expense')
        .reduce((sum, inv) => sum + inv.totalInvoice, 0);
      
      monthlyData.push({
        month: monthNum,
        monthName: monthNames[monthNum - 1],
        revenue,
        expenses,
        profit: revenue - expenses,
        invoiceCount: invoices.length
      });
    }
    
    // إحصائيات الفروع (بدلاً من الموظفين لأن الفواتير لا تحتوي على createdBy)
    const branchStats = await Invoice.aggregate([
      {
        $match: {
          userId: subscriberId,
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$branchId',
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$type', 'revenue'] }, '$totalInvoice', 0]
            }
          },
          expenses: {
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
      {
        $project: {
          name: { $arrayElemAt: ['$branch.name', 0] },
          revenue: 1,
          expenses: 1,
          contribution: { $subtract: ['$revenue', '$expenses'] },
          invoiceCount: 1
        }
      },
      {
        $sort: { contribution: -1 }
      }
    ]);
    
    // تنسيق الفواتير للإرجاع
    const formattedInvoices = invoices.map(inv => ({
      _id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      type: inv.type,
      totalInvoice: inv.totalInvoice,
      status: inv.status,
      branchName: inv.branchId?.name || 'غير محدد',
      createdAt: inv.createdAt
    }));
    
    return NextResponse.json({
      success: true,
      monthlyData,
      invoices: formattedInvoices,
      employeeStats: branchStats // تغيير الاسم من employeeStats إلى branchStats
    });
    
  } catch (error) {
    console.error("Error in owner financial report:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء جلب التقرير المالي" },
      { status: 500 }
    );
  }
}
