// المسار: app/actions/dashboardActions.js
"use server";

import { connectToDB } from "@/utils/database";
// المسار الصحيح (مجلد lib بجانب app)
import { getCurrentUser } from "@/app/lib/auth"; 
import Invoice from "@/models/Invoices";
import Customer from "@/models/Customers";
import Supplier from "@/models/Suppliers";
import Store from "@/models/Store";


// دالة لجلب إحصائيات لوحة التحكم للمستخدم الفرعي
export async function getSubuserDashboardData() {
    try {
        // --- (تم إلغاء التعليق عن هذا الجزء الهام) ---
        // 1. جلب المستخدم أولاً
        const currentUser = await getCurrentUser();
        
        // 2. التحقق من وجوده
        if (!currentUser) {
            throw new Error("401 - غير مصرح به");
        }

        // 3. التحقق من ربطه بفرع (الأمان)
        if (!currentUser.branchId) {
            throw new Error("403 - هذا المستخدم غير مرتبط بأي فرع");
        }
        // --- (نهاية التصحيح) ---


        // الآن يمكننا استخدام المتغير بأمان
        const mainAccountId = currentUser.mainAccountId;
        const branchId = currentUser.branchId; // مفتاح الأمان

        await connectToDB();

        // --- 1. الإحصائيات الأساسية (KBI) ---
        const statsAggregation = await Invoice.aggregate([
            {
                $match: {
                    userId: mainAccountId,
                    branchId: branchId, // ** الأمان: فلترة حسب الفرع **
                    status: { $in: ["paid", "pending", "overdue"] } 
                }
            },
            {
                $group: {
                    _id: "$type", 
                    totalAmount: { $sum: "$totalInvoice" }
                }
            }
        ]);

        const totalRevenue = statsAggregation.find(s => s._id === 'revenue')?.totalAmount || 0;
        const totalExpenses = statsAggregation.find(s => s._id === 'expense')?.totalAmount || 0;
        const netProfit = totalRevenue - totalExpenses;

        // --- 2. الفواتير المعلقة (Pending) ---
        const pendingInvoices = await Invoice.countDocuments({
            userId: mainAccountId,
            branchId: branchId, 
            status: { $in: ["pending", "overdue"] }
        });

        // --- 3. أحدث الفواتير (Recent) ---
        const recentInvoices = await Invoice.find({
            userId: mainAccountId,
            branchId: branchId, 
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customerId", "name") 
        .populate("supplierId", "name");

        
        // --- 4. بيانات الرسم البياني (بيانات حقيقية) ---
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); 
        sevenDaysAgo.setHours(0, 0, 0, 0); 
        
        const chartAggregation = await Invoice.aggregate([
            {
                $match: {
                    userId: mainAccountId,
                    branchId: branchId, 
                    createdAt: { $gte: sevenDaysAgo }, 
                    status: { $in: ["paid", "pending", "overdue"] }
                }
            },
            {
                $group: {
                    _id: {
                        date: { 
                            $dateToString: { 
                                format: "%Y-%m-%d", 
                                date: "$createdAt", 
                                timezone: "Africa/Cairo" 
                            } 
                        },
                        type: "$type" 
                    },
                    dailyTotal: { $sum: "$totalInvoice" }
                }
            },
            {
                $group: {
                    _id: "$_id.date", 
                    revenue: {
                        $sum: {
                            $cond: [ { $eq: ["$_id.type", "revenue"] }, "$dailyTotal", 0 ]
                        }
                    },
                    expense: {
                        $sum: {
                            $cond: [ { $eq: ["$_id.type", "expense"] }, "$dailyTotal", 0 ]
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // 4c. معالجة البيانات (تعبئة الأيام المفقودة وتنسيق الأسماء)
        const dateMap = new Map(chartAggregation.map(item => [item._id, item]));
        const finalChartData = [];
        const arLocale = 'ar-EG'; 
        const timeZone = 'Africa/Cairo';

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dateString = date.toLocaleDateString('en-CA', { timeZone: timeZone });

            let dayName;
            if (i === 0) dayName = "اليوم";
            else if (i === 1) dayName = "الأمس";
            else dayName = new Intl.DateTimeFormat(arLocale, { weekday: 'long', timeZone: timeZone }).format(date);
            
            const data = dateMap.get(dateString);

            finalChartData.push({
                name: dayName,
                revenue: data?.revenue || 0,
                expense: data?.expense || 0
            });
        }
        
        // --- 5. إرجاع كل البيانات ---
        return {
            success: true,
            data: {
                stats: {
                    totalRevenue,
                    totalExpenses,
                    netProfit,
                    pendingInvoices,
                },
                recentInvoices: JSON.parse(JSON.stringify(recentInvoices)),
                chartData: finalChartData 
            }
        };

    } catch (error) {
        // طباعة الخطأ في السيرفر لسهولة التصحيح
        return { success: false, error: error.message };
    }
}