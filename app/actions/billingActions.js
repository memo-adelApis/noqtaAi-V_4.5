"use server";

import Notification from "@/models/Notification"; // الموديل الذي أنشأناه سابقاً
import User from "@/models/User";
import { connectToDB } from "@/utils/database";
import { revalidatePath } from "next/cache";

// ... (الاستيرادات السابقة)

export async function requestRenewal(formData) {
  await connectToDB();
  
  const userId = formData.get("userId");
  const transactionId = formData.get("transactionId") || "غير محدد"; 

  try {
    const user = await User.findById(userId);
    
    // لم نعد بحاجة لوضع كل التفاصيل في الـ message النصية لأننا سنحفظها في metadata
    // لكن يمكن ترك رسالة مختصرة
    const message = `طلب تجديد من: ${user.name} (${user.email})`;

    await Notification.create({
        userId: user._id, 
        title: "طلب تجديد اشتراك 💰",
        message: message,
        type: "info",
        
        // ✅ حفظ البيانات بشكل منظم
        isHandled: false,
        metadata: {
            transactionId: transactionId,
            paymentMethod: "تحويل إلكتروني/محفظة",
            amount: 60
        }
    });

    revalidatePath("/subscriber/billing");
    return { success: true, message: "تم إرسال الطلب بنجاح" };

  } catch (error) {
    console.error("Error requesting renewal:");
    return { success: false, error: "فشل إرسال الطلب" };
  }
}