"use server";

import { connectToDB } from "@/utils/database";
import { revalidatePath } from "next/cache";
import { NotificationService } from "../../utils/notificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function sendOwnerNotification(formData) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'owner') {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const title = formData.get("title");
    const message = formData.get("message");
    const type = formData.get("type");
    const priority = formData.get("priority") || "medium";
    const target = formData.get("target");
    const senderId = formData.get("senderId");
    const mainAccountId = formData.get("mainAccountId");

    let result;

    if (target === "all_employees") {
      // إرسال لجميع الموظفين
      result = await NotificationService.broadcastNotification(
        title,
        message,
        {
          type,
          priority,
          category: "general",
          targetRole: ['manager', 'employee', 'cashier'],
          senderId,
          senderRole: 'owner'
        }
      );
    } else if (target === "managers") {
      // إرسال للمديرين فقط
      result = await NotificationService.sendToRole(
        mainAccountId,
        'manager',
        title,
        message,
        { type, priority, category: "general" }
      );
    } else if (target === "employees") {
      // إرسال للموظفين فقط
      result = await NotificationService.sendToRole(
        mainAccountId,
        'employee',
        title,
        message,
        { type, priority, category: "general" }
      );
    } else if (target === "cashiers") {
      // إرسال للكاشيرز فقط
      result = await NotificationService.sendToRole(
        mainAccountId,
        'cashier',
        title,
        message,
        { type, priority, category: "general" }
      );
    } else if (target.startsWith("branch_")) {
      // إرسال لفرع محدد
      const branchId = target.replace("branch_", "");
      result = await NotificationService.sendToBranch(
        branchId,
        title,
        message,
        { type, priority, category: "general" }
      );
    } else if (target.startsWith("user_")) {
      // إرسال لموظف محدد
      const userId = target.replace("user_", "");
      result = await NotificationService.sendNotification(
        userId,
        title,
        message,
        { type, priority, category: "general" }
      );
    } else {
      return { success: false, error: "هدف غير صحيح" };
    }

    if (result.success) {
      revalidatePath("/owner/notifications");
      return { 
        success: true, 
        message: `تم إرسال الإشعار بنجاح لـ ${result.count || 1} ${result.count > 1 ? 'موظف' : 'موظف'}` 
      };
    } else {
      return { success: false, error: result.error };
    }

  } catch (error) {
    console.error("Error sending owner notification:", error);
    return { success: false, error: "فشل في إرسال الإشعار" };
  }
}