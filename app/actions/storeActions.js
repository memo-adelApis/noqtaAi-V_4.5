"use server";

import { connectToDB } from "@/utils/database";
import Store from "@/models/Store";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// الحصول على مخازن الفرع
export async function getBranchStores() {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    if (!branchId) {
      return { success: false, error: "لا يمكن الوصول للمخازن بدون فرع مرتبط" };
    }

    const stores = await Store.find({
      userId: userId,
      branchId: branchId,
      isActive: true
    })
    .sort({ name: 1 })
    .lean();

    return {
      success: true,
      data: stores.map(store => ({
        _id: store._id.toString(),
        name: store.name,
        description: store.description,
        location: store.location,
        isActive: store.isActive
      }))
    };

  } catch (error) {
    console.error("Error fetching branch stores:", error);
    return { success: false, error: "فشل في جلب المخازن: " + error.message };
  }
}

// إنشاء مخزن جديد
export async function createStore(storeData) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    if (!branchId) {
      return { success: false, error: "لا يمكن إنشاء مخزن بدون فرع مرتبط" };
    }

    // التحقق من عدم تكرار الاسم
    const existingStore = await Store.findOne({
      name: storeData.name,
      userId: userId,
      branchId: branchId
    });

    if (existingStore) {
      return { success: false, error: "اسم المخزن موجود بالفعل" };
    }

    const finalStoreData = {
      ...storeData,
      userId: userId,
      branchId: branchId,
      isActive: true
    };

    const store = await Store.create(finalStoreData);

    revalidatePath("/subuser/stores");
    revalidatePath("/stores");
    
    return { 
      success: true, 
      message: "تم إنشاء المخزن بنجاح",
      data: {
        _id: store._id.toString(),
        name: store.name,
        description: store.description,
        location: store.location,
        isActive: store.isActive
      }
    };

  } catch (error) {
    console.error("Error creating store:", error);
    return { success: false, error: "فشل في إنشاء المخزن: " + error.message };
  }
}

// تحديث مخزن موجود
export async function updateStore(storeId, storeData) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    // التحقق من وجود المخزن والصلاحية
    const existingStore = await Store.findOne({
      _id: storeId,
      userId: userId,
      branchId: branchId
    });

    if (!existingStore) {
      return { success: false, error: "المخزن غير موجود أو غير مصرح بالوصول إليه" };
    }

    // التحقق من عدم تكرار الاسم (باستثناء المخزن الحالي)
    const duplicateName = await Store.findOne({
      name: storeData.name,
      userId: userId,
      branchId: branchId,
      _id: { $ne: storeId }
    });

    if (duplicateName) {
      return { success: false, error: "اسم المخزن موجود بالفعل" };
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      storeData,
      { new: true, runValidators: true }
    );

    revalidatePath("/subuser/stores");
    revalidatePath("/stores");
    
    return { 
      success: true, 
      message: "تم تحديث المخزن بنجاح",
      data: {
        _id: updatedStore._id.toString(),
        name: updatedStore.name,
        description: updatedStore.description,
        location: updatedStore.location,
        isActive: updatedStore.isActive
      }
    };

  } catch (error) {
    console.error("Error updating store:", error);
    return { success: false, error: "فشل في تحديث المخزن: " + error.message };
  }
}

// حذف مخزن
export async function deleteStore(storeId) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    // التحقق من وجود المخزن والصلاحية
    const store = await Store.findOne({
      _id: storeId,
      userId: userId,
      branchId: branchId
    });

    if (!store) {
      return { success: false, error: "المخزن غير موجود أو غير مصرح بالوصول إليه" };
    }

    // التحقق من وجود منتجات في هذا المخزن
    const Item = require("@/models/Items").default;
    const itemsCount = await Item.countDocuments({
      storeId: storeId,
      userId: userId,
      branchId: branchId
    });

    if (itemsCount > 0) {
      return { success: false, error: "لا يمكن حذف المخزن لأنه يحتوي على منتجات" };
    }

    await Store.findByIdAndDelete(storeId);

    revalidatePath("/subuser/stores");
    revalidatePath("/stores");
    
    return { 
      success: true, 
      message: "تم حذف المخزن بنجاح"
    };

  } catch (error) {
    console.error("Error deleting store:", error);
    return { success: false, error: "فشل في حذف المخزن: " + error.message };
  }
}

// تغيير حالة النشاط
export async function toggleStoreStatus(storeId) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    const store = await Store.findOne({
      _id: storeId,
      userId: userId,
      branchId: branchId
    });

    if (!store) {
      return { success: false, error: "المخزن غير موجود أو غير مصرح بالوصول إليه" };
    }

    store.isActive = !store.isActive;
    await store.save();

    revalidatePath("/subuser/stores");
    revalidatePath("/stores");
    
    return { 
      success: true, 
      message: `تم ${store.isActive ? 'تفعيل' : 'إلغاء تفعيل'} المخزن بنجاح`,
      data: {
        _id: store._id.toString(),
        isActive: store.isActive
      }
    };

  } catch (error) {
    console.error("Error toggling store status:", error);
    return { success: false, error: "فشل في تغيير حالة المخزن: " + error.message };
  }
}