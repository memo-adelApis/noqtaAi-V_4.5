"use server";

import Notification from "@/models/Notification";
import User from "@/models/User";
import { connectToDB } from "@/utils/database";
import { NotificationService } from "@/utils/notificationService";
import { revalidatePath } from "next/cache";

// دالة إرسال الإشعارات
export async function sendNotification(formData) {
  await connectToDB();
  
  const title = formData.get("title");
  const message = formData.get("message");
  const type = formData.get("type");
  const target = formData.get("target");
  const priority = formData.get("priority") || "medium";

  try {
    if (target === "all") {
      // إرسال لجميع المشتركين
      const result = await NotificationService.broadcastNotification(
        title,
        message,
        {
          type,
          priority,
          category: "general",
          targetRole: "subscriber"
        }
      );

      if (result.success) {
        revalidatePath("/admin/notifications");
        return { success: true, message: `تم إرسال الإشعار لـ ${result.count} مشترك` };
      } else {
        return { success: false, error: result.error };
      }
    } else {
      // إرسال لمستخدم محدد
      const result = await NotificationService.sendNotification(
        target,
        title,
        message,
        {
          type,
          priority,
          category: "general"
        }
      );

      if (result.success) {
        revalidatePath("/admin/notifications");
        return { success: true, message: "تم إرسال الإشعار بنجاح" };
      } else {
        return { success: false, error: result.error };
      }
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: "فشل في إرسال الإشعار" };
  }
}

// دالة تحديد الإشعار كمقروء
export async function markNotificationAsRead(notificationId) {
  await connectToDB();
  
  try {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.markAsRead();
      revalidatePath("/notifications");
      return { success: true };
    }
    return { success: false, error: "الإشعار غير موجود" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "فشل في تحديث الإشعار" };
  }
}

// دالة تحديد جميع الإشعارات كمقروءة
export async function markAllNotificationsAsRead(userId) {
  await connectToDB();
  
  try {
    await Notification.markAllAsRead(userId);
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "فشل في تحديث الإشعارات" };
  }
}

// دالة أرشفة الإشعار
export async function archiveNotification(notificationId) {
  await connectToDB();
  
  try {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.archive();
      revalidatePath("/notifications");
      return { success: true };
    }
    return { success: false, error: "الإشعار غير موجود" };
  } catch (error) {
    console.error("Error archiving notification:", error);
    return { success: false, error: "فشل في أرشفة الإشعار" };
  }
}

// دالة حذف الإشعار
export async function deleteNotification(notificationId) {
  await connectToDB();
  
  try {
    await Notification.findByIdAndDelete(notificationId);
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "فشل في حذف الإشعار" };
  }
}

// دالة تفعيل اشتراك المستخدم
export async function activateUserSubscription(formData) {
  await connectToDB();
  
  const userId = formData.get("userId");
  const plan = formData.get("plan") || "premium";
  const months = parseInt(formData.get("months")) || 1;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    // تحديث الاشتراك
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    await User.findByIdAndUpdate(userId, {
      "subscription.plan": plan,
      "subscription.isActive": true,
      "subscription.isExpired": false,
      "subscription.startDate": new Date(),
      "subscription.endDate": endDate
    });

    // إرسال إشعار تفعيل الاشتراك
    await NotificationService.notifySubscriptionActivated(userId, {
      plan,
      endDate: endDate.toLocaleDateString('ar-EG'),
      features: []
    });

    revalidatePath("/admin/users");
    return { success: true, message: "تم تفعيل الاشتراك وإرسال الإشعار" };
  } catch (error) {
    console.error("Error activating subscription:", error);
    return { success: false, error: "فشل في تفعيل الاشتراك" };
  }
}

// دالة طلب التجديد
export async function requestRenewal(formData) {
  await connectToDB();
  
  const userId = formData.get("userId");
  // استلام رقم العملية أو تفاصيل التحويل
  const transactionId = formData.get("transactionId") || "غير محدد"; 

  try {
    const user = await User.findById(userId);
    const admin = await User.findOne({ role: "admin" });
    
    if (admin) {
        // تنسيق رسالة واضحة للأدمن تحتوي على بيانات الدفع
        const message = `
          قام المشترك ${user.name} بطلب تجديد الباقة.
          ---------------------------
          📧 البريد: ${user.email}
          💰 تفاصيل التحويل/رقم العملية: ${transactionId}
          ---------------------------
          يرجى مراجعة الحساب البنكي/المحفظة وتفعيل المستخدم.
        `;

        await Notification.create({
            userId: admin._id,
            title: "طلب تجديد اشتراك (دفعة جديدة) 💸",
            message: message.trim(), // إزالة المسافات الزائدة
            type: "payment",
            priority: "high",
            category: "billing",
            isRead: false,
            metadata: {
              transactionId,
              paymentMethod: "تحويل بنكي",
              requesterId: userId
            }
        });
    }

    revalidatePath("/subscriber/billing");
    return { success: true, message: "تم إرسال تفاصيل الدفع للإدارة" };

  } catch (error) {
    // console.error("Error requesting renewal:");
    return { success: false, error: "فشل إرسال الطلب" };
  }
}
