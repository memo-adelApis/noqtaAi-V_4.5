"use server";

import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { getPlanLimits } from "@/utils/limitsChecker";

export async function updateUserLimits(formData) {
  await connectToDB();
  
  const userId = formData.get("userId");
  const invoiceLimit = parseInt(formData.get("invoiceLimit"));
  const branchLimit = parseInt(formData.get("branchLimit"));
  const userLimit = parseInt(formData.get("userLimit"));
  const supplierLimit = parseInt(formData.get("supplierLimit"));
  const customerLimit = parseInt(formData.get("customerLimit"));
  const productLimit = parseInt(formData.get("productLimit"));
  const categoryLimit = parseInt(formData.get("categoryLimit"));
  const warehouseLimit = parseInt(formData.get("warehouseLimit"));

  try {
    await User.findByIdAndUpdate(userId, {
      "subscription.invoiceLimit": invoiceLimit,
      "subscription.branchLimit": branchLimit,
      "subscription.userLimit": userLimit,
      "subscription.supplierLimit": supplierLimit,
      "subscription.customerLimit": customerLimit,
      "subscription.productLimit": productLimit,
      "subscription.categoryLimit": categoryLimit,
      "subscription.warehouseLimit": warehouseLimit
    });

    revalidatePath("/admin/users");
    return { success: true, message: "تم تحديث الحدود بنجاح" };
  } catch (error) {
    console.error("Error updating user limits:", error);
    return { success: false, error: "فشل في تحديث الحدود" };
  }
}

export async function updateSubscriptionPlan(formData) {
  await connectToDB();
  
  const userId = formData.get("userId");
  const plan = formData.get("plan");
  const months = parseInt(formData.get("months")) || 1;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    // الحصول على حدود الخطة الجديدة
    const planLimits = getPlanLimits(plan);

    // حساب تاريخ الانتهاء الجديد
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // تحديث الخطة مع جميع الحدود
    const updateData = {
      "subscription.plan": plan,
      "subscription.endDate": endDate,
      "subscription.isActive": true,
      "subscription.isExpired": false
    };

    // إضافة جميع الحدود
    Object.keys(planLimits).forEach(key => {
      updateData[`subscription.${key}`] = planLimits[key];
    });

    await User.findByIdAndUpdate(userId, updateData);

    revalidatePath("/admin/users");
    return { success: true, message: "تم تحديث الخطة بنجاح" };
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return { success: false, error: "فشل في تحديث الخطة" };
  }
}