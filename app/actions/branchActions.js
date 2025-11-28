// المسار: app/actions/branchActions.js (ملف جديد)
"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import Branch from "@/models/Branches";
import User from "@/models/User"; // لاستخدامه في فحص الحذف
import { z } from "zod";
import { revalidatePath } from "next/cache";

// مخطط التحقق من بيانات الفرع
const branchSchema = z.object({
    name: z.string().min(2, "اسم الفرع قصير جداً"),
    location: z.string().optional(),
});

/**
 * دالة لجلب فروع المشترك (التي يملكها)
 */
export async function getMyBranches() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        await connectToDB();
        const branches = await Branch.find({ userId: currentUser._id }).sort({ createdAt: -1 });
        return { success: true, data: JSON.parse(JSON.stringify(branches)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لإنشاء فرع جديد
 */
export async function createBranch(data) {
    try {
                const currentUser = await getCurrentUser();

        // 1. جلب بيانات المشترك صاحب الحساب
  // إذا كان الموظف هو من يضيف، يجب أن نجلب بيانات "صاحب العمل" (mainAccountId)
  const ownerId = currentUser.role === "subscriber" ? currentUser.id : currentUser.mainAccountId;
  
  const owner = await User.findById(ownerId);
  const subscription = owner.subscription || {};

  // 2. التحقق من انتهاء الاشتراك كلياً
  if (!subscription.isActive || (subscription.endDate && new Date() > new Date(subscription.endDate))) {
      return { success: false, error: "عفواً، اشتراكك منتهي. لا يمكنك إضافة فروع جديدة." };
  }

  // 3. التحقق من الحد الأقصى للفروع
  const currentBranchesCount = await Branch.countDocuments({ userId: ownerId }); // تأكد أن الحقل في الـ Schema هو userId
  
  // تحديد الحد المسموح (مثلاً: 1 للتجريبي، ولا نهائي للمدفوع)
  // يمكنك تخزين limit داخل الـ subscription في الداتابيس لتكون ديناميكية
  const BRANCH_LIMIT = subscription.plan === "trial" ? 1 : 999; 

  if (currentBranchesCount >= BRANCH_LIMIT) {
      return { 
          success: false, 
          error: `لقد وصلت للحد الأقصى من الفروع المسموحة لباقة (${subscription.plan}). يرجى الترقية لإضافة المزيد.` 
      };
  }
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        const validation = branchSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }
        
        await connectToDB();

        // التحقق من عدم تكرار الاسم لنفس المشترك
        const existingBranch = await Branch.findOne({ 
            name: validation.data.name, 
            userId: currentUser._id 
        });
        if (existingBranch) {
            throw new Error("اسم الفرع هذا مستخدم بالفعل");
        }

        const newBranch = new Branch({
            ...validation.data,
            userId: currentUser._id // ربط الفرع بالمشترك
        });
        await newBranch.save();

        revalidatePath("/subscriber/branches");
        revalidatePath("/subscriber/employees"); // لتحديث قائمة الفروع في صفحة الموظفين
        return { success: true, data: JSON.parse(JSON.stringify(newBranch)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لتعديل فرع
 */
export async function updateBranch(branchId, data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        const validation = branchSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }
        
        await connectToDB();

        // البحث عن الفرع والتأكد أنه ملك للمستخدم
        const branch = await Branch.findOne({ _id: branchId, userId: currentUser._id });
        if (!branch) {
            throw new Error("404 - الفرع غير موجود أو لا تملكه");
        }

        // التحقق من تكرار الاسم (باستثناء الفرع الحالي)
        const existingBranch = await Branch.findOne({ 
            name: validation.data.name, 
            userId: currentUser._id,
            _id: { $ne: branchId } // $ne = Not Equal
        });
        if (existingBranch) {
            throw new Error("اسم الفرع هذا مستخدم بالفعل لفرع آخر");
        }

        branch.name = validation.data.name;
        branch.location = validation.data.location;
        await branch.save();
        
        revalidatePath("/subscriber/branches");
        revalidatePath("/subscriber/employees");
        return { success: true, data: JSON.parse(JSON.stringify(branch)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لحذف فرع
 */
export async function deleteBranch(branchId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        await connectToDB();
        
        // 1. التأكد أن الفرع ملك للمستخدم
        const branch = await Branch.findOne({ _id: branchId, userId: currentUser._id });
        if (!branch) {
            throw new Error("404 - الفرع غير موجود أو لا تملكه");
        }

        // 2. (الأمان) التأكد عدم وجود موظفين مرتبطين بهذا الفرع
        const employeeCount = await User.countDocuments({ 
            branchId: branchId,
            mainAccountId: currentUser._id 
        });
        
        if (employeeCount > 0) {
            throw new Error(`لا يمكن حذف الفرع. هناك ${employeeCount} موظف(ين) مرتبطين به.`);
        }

        // 3. الحذف
        await Branch.deleteOne({ _id: branchId, userId: currentUser._id });

        revalidatePath("/subscriber/branches");
        revalidatePath("/subscriber/employees");
        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
}