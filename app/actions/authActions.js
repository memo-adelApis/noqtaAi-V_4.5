"use server";

import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, "الاسم قصير جداً"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export async function registerSubscriber(data) {
  try {
    // 1. التحقق من صحة البيانات
    const validation = registerSchema.safeParse(data);
    if (!validation.success) throw new Error(validation.error.errors[0].message);

    const { name, email, password } = validation.data;
    await connectToDB();

    // 2. التحقق من عدم وجود المستخدم سابقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("هذا البريد الإلكتروني مستخدم بالفعل");

    // 3. ✅ حساب تاريخ انتهاء الفترة التجريبية (40 يوم من الآن)
    const trialDays = 40;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // 4. إنشاء كائن المستخدم الجديد
    const newUser = new User({
      name,
      email,
      password, // سيتم تشفيرها تلقائياً بواسطة Mongoose Hooks
      role: "subscriber",
      provider: "credentials",
      isActive: true,
      username: email,
      
      // ✅ تسجيل بيانات الاشتراك بوضوح
      subscription: {
        plan: "trial",
        startDate: new Date(),
        endDate: trialEndDate, // تاريخ الانتهاء المحسوب
        isActive: true,
        isExpired: false
      }
    });

    // 5. تعيين الحساب الرئيسي لنفسه (دون الحاجة للحفظ مرتين)
    // Mongoose يقوم بإنشاء _id بمجرد عمل new User() حتى قبل الحفظ
    newUser.mainAccountId = newUser._id;

    // 6. حفظ المستخدم في قاعدة البيانات
    await newUser.save();

    return { success: true, data: JSON.parse(JSON.stringify(newUser)) };
    
  } catch (error) {
    console.error("❌ Error registering user:");
    // نرجع رسالة الخطأ المحددة إذا كانت من الـ Validation أو Database
    return { 
        success: false, 
        error: error.message || 'حصل خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'
    };
  }
}