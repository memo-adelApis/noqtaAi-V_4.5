"use server";

import User from "@/models/User";
import Branch from "@/models/Branches";
import Notification from "@/models/Notification";
import { connectToDB } from "@/utils/database";
import { revalidatePath } from "next/cache";

// 1. دالة جلب المشتركين (مع البحث والـ Pagination)
export async function getSubscribers({ query, page = 1, limit = 10 }) {
  await connectToDB();

  try {
    const skip = (page - 1) * limit;
    const filter = { role: 'subscriber' };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }

    const subscribers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // تسوية البيانات (Serialization)
    const serializedSubscribers = subscribers.map(sub => ({
      ...sub,
      _id: sub._id.toString(),
      createdAt: sub.createdAt.toISOString(),
      subscription: {
        ...sub.subscription,
        startDate: sub.subscription?.startDate ? sub.subscription.startDate.toISOString() : null,
        endDate: sub.subscription?.endDate ? sub.subscription.endDate.toISOString() : null,
      }
    }));

    return { success: true, data: serializedSubscribers, totalPages, totalCount };

  } catch (error) {
    return { success: false, error: "فشل في جلب قائمة المشتركين. يرجى المحاولة لاحقاً." };
  }
}

// 2. دالة جلب البروفايل الكامل (المشترك + الفروع + الموظفين)
export async function getSubscriberFullProfile(subscriberId) {
  await connectToDB();

  try {
    const targetId = subscriberId; 

    // أ) بيانات المشترك
    const subscriber = await User.findById(targetId).select("-password").lean();
    if (!subscriber) return { success: false, error: "المستخدم غير موجود" };

    // ب) الفروع
    const branches = await Branch.find({ userId: targetId }).lean();

    // ج) الموظفين
    const subusers = await User.find({ 
      mainAccountId: targetId, 
      role: { $in: ['employee', 'manager'] } 
    })
    .select("-password")
    .populate("branchId", "name")
    .lean();

    return {
      success: true,
      data: {
        subscriber: {
            ...subscriber,
            _id: subscriber._id.toString(),
            createdAt: subscriber.createdAt.toISOString(),
             subscription: {
                ...subscriber.subscription,
                endDate: subscriber.subscription?.endDate ? subscriber.subscription.endDate.toISOString() : null,
            }
        },
        branches: branches.map(b => ({ ...b, _id: b._id.toString() })),
        subusers: subusers.map(u => ({
             ...u, 
             _id: u._id.toString(),
             createdAt: u.createdAt.toISOString(),
             branchName: u.branchId?.name || "غير محدد"
        }))
      }
    };

  } catch (error) {
    return { success: false, error: "حدث خطأ أثناء جلب تفاصيل المستخدم." };
  }
}

// 3. تفعيل/إيقاف المستخدم (يدوياً من صفحة المستخدمين)
export async function toggleSubscriberStatus(formData) {
  const userId = formData.get("userId");
  const currentStatus = formData.get("currentStatus") === "true";
  
  await connectToDB();

  try {
    if (!currentStatus) { 
        // تفعيل (Activate)
        const user = await User.findById(userId);
        
        // منح فترة تجريبية إذا لم يكن لديه تاريخ انتهاء
        if (!user.subscription || !user.subscription.endDate) {
            const defaultEndDate = new Date();
            defaultEndDate.setDate(defaultEndDate.getDate() + 40); // 40 يوم

            await User.findByIdAndUpdate(userId, {
                $set: { 
                    "subscription.isActive": true,
                    "subscription.endDate": defaultEndDate,
                    "subscription.plan": "trial"
                }
            });
        } else {
            // تفعيل عادي
            await User.findByIdAndUpdate(userId, {
                $set: { "subscription.isActive": true }
            });
        }
    } else {
        // إيقاف (Deactivate)
        await User.findByIdAndUpdate(userId, {
            $set: { "subscription.isActive": false }
        });
    }

    revalidatePath("/admin/users");
    return { success: true, message: "تم تحديث حالة المستخدم بنجاح" };
  } catch (error) {
    return { success: false, error: "فشل تغيير حالة المستخدم" };
  }
}

// 4. حذف إشعار
export async function deleteNotification(formData) {
  const id = formData.get("id");
  
  await connectToDB();
  
  try {
    await Notification.findByIdAndDelete(id);
    revalidatePath("/admin/notifications/inbox");
    return { success: true };
  } catch (error) {
    return { success: false, error: "فشل حذف الإشعار" };
  }
}

// 5. التجديد السريع (من صفحة الإشعارات أو المستخدمين)
export async function quickRenewSubscription(formData) {
  const userId = formData.get("userId");
  const notificationId = formData.get("notificationId");

  if (!userId) return { success: false, error: "بيانات المستخدم غير صحيحة" };

  await connectToDB();

  try {
    // 1. تجديد الاشتراك لمدة 30 يوم
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);

    await User.findByIdAndUpdate(userId, {
      $set: {
        "subscription.isActive": true,
        "subscription.plan": "premium",
        "subscription.endDate": newEndDate
      }
    });

    // 2. تحديث حالة الإشعار إلى "تمت الاستجابة"
    if (notificationId) {
        await Notification.findByIdAndUpdate(notificationId, {
            $set: { isHandled: true }
        });
    }

    // تحديث الصفحات ذات الصلة
    revalidatePath("/admin/users"); 
    revalidatePath("/admin/notifications/inbox");
    
    return { success: true, message: "تم تجديد الاشتراك وتفعيل الحساب بنجاح ✅" };
  } catch (error) {
    return { success: false, error: "حدث خطأ أثناء تجديد الاشتراك" };
  }
}