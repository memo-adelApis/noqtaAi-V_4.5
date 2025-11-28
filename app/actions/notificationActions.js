"use server";

import Notification from "@/models/Notification";
import User from "@/models/User";
import { connectToDB } from "@/utils/database";
import { revalidatePath } from "next/cache";



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
            type: "info",
            isRead: false
        });
    }

    revalidatePath("/subscriber/billing");
    return { success: true, message: "تم إرسال تفاصيل الدفع للإدارة" };

  } catch (error) {
    // console.error("Error requesting renewal:");
    return { success: false, error: "فشل إرسال الطلب" };
  }
}