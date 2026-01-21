"use server";

import { connectToDB } from "@/utils/database";
import { revalidatePath } from "next/cache";
import { NotificationService } from "../../utils/notificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function sendManagerNotification(formData) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'manager') {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const title = formData.get("title");
    const message = formData.get("message");
    const type = formData.get("type");
    const priority = formData.get("priority") || "medium";
    const target = formData.get("target");
    const senderId = formData.get("senderId");
    const branchId = formData.get("branchId");

    let result;

    if (target === "all_branch") {
      // إرسال لجميع موظفي الفرع
      result = await NotificationService.sendToBranch(
        branchId,
        title,
        message,
        { type, priority, category: "general" }
      );
    } else if (target === "employees") {
      // إرسال للموظفين فقط في الفرع
      result = await NotificationService.broadcastNotification(
        title,
        message,
        {
          type,
          priority,
          category: "general",
          targetRole: 'employee',
          senderId,
          senderRole: 'manager'
        }
      );
    } else if (target === "cashiers") {
      // إرسال للكاشيرز فقط في الفرع
      result = await NotificationService.broadcastNotification(
        title,
        message,
        {
          type,
          priority,
          category: "general",
          targetRole: 'cashier',
          senderId,
          senderRole: 'manager'
        }
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
      revalidatePath("/manager/notifications");
      return { 
        success: true, 
        message: `تم إرسال الإشعار بنجاح لـ ${result.count || 1} ${result.count > 1 ? 'موظف' : 'موظف'}` 
      };
    } else {
      return { success: false, error: result.error };
    }

  } catch (error) {
    console.error("Error sending manager notification:", error);
    return { success: false, error: "فشل في إرسال الإشعار" };
  }
}