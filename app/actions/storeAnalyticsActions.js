"use server";

import { getCurrentUser } from "@/app/lib/auth";
import Product from "@/models/Product";
import Store from "@/models/Store";
import { connectToDB } from "@/utils/database";

export async function getStoreAnalyticsData() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("غير مصرح به");

    await connectToDB();

    const userId = currentUser.mainAccountId;

    // 1. تجميع البيانات الأساسية من المنتجات
    const inventoryStats = await Product.aggregate([
      { $match: { userId: userId } }, // تصفية بمنتجات الشركة فقط
      {
        $group: {
          _id: null,
          totalInventoryValue: { $sum: "$inventoryValue" }, // القيمة الإجمالية (كمية * تكلفة)
          totalItemsCount: { $sum: "$quantity" },           // عدد القطع
          totalProducts: { $count: {} },                    // عدد الأصناف المختلفة
          // حساب المنتجات التي أوشكت على النفاد (أقل من 10 قطع)
          lowStockCount: {
            $sum: { $cond: [{ $lte: ["$quantity", 10] }, 1, 0] }
          }
        }
      }
    ]);

    // 2. تجميع قيمة المخزون حسب كل مخزن (للرسم البياني)
    const valueByStore = await Product.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$storeId",
          totalValue: { $sum: "$inventoryValue" },
          itemCount: { $sum: "$quantity" }
        }
      },
      {
        $lookup: {
          from: "stores", // اسم الكولكشن في المونجو (عادة يكون lowercase جمع)
          localField: "_id",
          foreignField: "_id",
          as: "storeInfo"
        }
      },
      { $unwind: "$storeInfo" }, // فك المصفوفة
      {
        $project: {
          name: "$storeInfo.name",
          value: "$totalValue", // القيمة للرسم البياني
          count: "$itemCount"
        }
      }
    ]);

    // 3. جلب قائمة النواقص (أهم 5 أصناف تحتاج شراء)
    const lowStockItems = await Product.find({ 
        userId: userId, 
        quantity: { $lte: 10 } 
    })
    .populate("storeId", "name")
    .sort({ quantity: 1 }) // الأقل كمية أولاً
    .limit(5)
    .select("name quantity storeId averageCost")
    .lean();

    // تجهيز البيانات للإرجاع
    const stats = inventoryStats[0] || { 
        totalInventoryValue: 0, totalItemsCount: 0, totalProducts: 0, lowStockCount: 0 
    };

    return {
      success: true,
      stats,
      charts: {
        valueByStore: valueByStore.map(s => ({ name: s.name, value: s.value }))
      },
      lowStockList: lowStockItems.map(item => ({
          _id: item._id.toString(),
          name: item.name,
          quantity: item.quantity,
          storeName: item.storeId?.name || "غير محدد",
          cost: item.averageCost
      }))
    };

  } catch (error) {
    // console.error("Store Analytics Error:", error);
    return { success: false, error: "فشل في جلب إحصائيات المخازن" };
  }
}