"use server";

import { connectToDB } from "@/utils/database";
import Category from "@/models/Category";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// إنشاء فئة جديدة
export async function createCategory(categoryData) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    if (!branchId) {
      return { success: false, error: "لا يمكن إنشاء فئة بدون فرع مرتبط" };
    }

    // التحقق من عدم تكرار الاسم
    const existingCategory = await Category.findOne({
      name: categoryData.name,
      userId: userId,
      branchId: branchId
    });

    if (existingCategory) {
      return { success: false, error: "اسم الفئة موجود بالفعل" };
    }

    // التحقق من عدم تكرار الـ slug
    if (categoryData.slug) {
      const existingSlug = await Category.findOne({
        slug: categoryData.slug,
        userId: userId,
        branchId: branchId
      });

      if (existingSlug) {
        return { success: false, error: "الرابط الودي موجود بالفعل" };
      }
    }

    const finalCategoryData = {
      ...categoryData,
      userId: userId,
      branchId: branchId
    };

    const category = await Category.create(finalCategoryData);

    revalidatePath("/subuser/categories");
    revalidatePath("/categories");
    
    return { 
      success: true, 
      message: "تم إنشاء الفئة بنجاح",
      data: {
        _id: category._id.toString(),
        name: category.name,
        description: category.description,
        parentId: category.parentId?.toString() || null,
        image: category.image,
        slug: category.slug,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        seoTitle: category.seoTitle,
        seoDescription: category.seoDescription,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    };

  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "فشل في إنشاء الفئة: " + error.message };
  }
}

// تحديث فئة موجودة
export async function updateCategory(categoryId, categoryData) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    if (!branchId) {
      return { success: false, error: "لا يمكن تحديث الفئة بدون فرع مرتبط" };
    }

    // التحقق من وجود الفئة والصلاحية
    const existingCategory = await Category.findOne({
      _id: categoryId,
      userId: userId,
      branchId: branchId
    });

    if (!existingCategory) {
      return { success: false, error: "الفئة غير موجودة أو غير مصرح بالوصول إليها" };
    }

    // التحقق من عدم تكرار الاسم (باستثناء الفئة الحالية)
    const duplicateName = await Category.findOne({
      name: categoryData.name,
      userId: userId,
      branchId: branchId,
      _id: { $ne: categoryId }
    });

    if (duplicateName) {
      return { success: false, error: "اسم الفئة موجود بالفعل" };
    }

    // التحقق من عدم تكرار الـ slug (باستثناء الفئة الحالية)
    if (categoryData.slug) {
      const duplicateSlug = await Category.findOne({
        slug: categoryData.slug,
        userId: userId,
        branchId: branchId,
        _id: { $ne: categoryId }
      });

      if (duplicateSlug) {
        return { success: false, error: "الرابط الودي موجود بالفعل" };
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      categoryData,
      { new: true, runValidators: true }
    );

    revalidatePath("/subuser/categories");
    revalidatePath("/categories");
    
    return { 
      success: true, 
      message: "تم تحديث الفئة بنجاح",
      data: {
        _id: updatedCategory._id.toString(),
        name: updatedCategory.name,
        description: updatedCategory.description,
        parentId: updatedCategory.parentId?.toString() || null,
        image: updatedCategory.image,
        slug: updatedCategory.slug,
        isActive: updatedCategory.isActive,
        sortOrder: updatedCategory.sortOrder,
        seoTitle: updatedCategory.seoTitle,
        seoDescription: updatedCategory.seoDescription,
        createdAt: updatedCategory.createdAt,
        updatedAt: updatedCategory.updatedAt
      }
    };

  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "فشل في تحديث الفئة: " + error.message };
  }
}

// حذف فئة
export async function deleteCategory(categoryId) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    // التحقق من وجود الفئة والصلاحية
    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
      branchId: branchId
    });

    if (!category) {
      return { success: false, error: "الفئة غير موجودة أو غير مصرح بالوصول إليها" };
    }

    // التحقق من وجود فئات فرعية
    const subcategories = await Category.countDocuments({
      parentId: categoryId,
      userId: userId,
      branchId: branchId
    });

    if (subcategories > 0) {
      return { success: false, error: "لا يمكن حذف الفئة لأنها تحتوي على فئات فرعية" };
    }

    // التحقق من وجود منتجات في هذه الفئة
    const Item = require("@/models/Items").default;
    const itemsCount = await Item.countDocuments({
      categoryId: categoryId,
      userId: userId,
      branchId: branchId
    });

    if (itemsCount > 0) {
      return { success: false, error: "لا يمكن حذف الفئة لأنها تحتوي على منتجات" };
    }

    await Category.findByIdAndDelete(categoryId);

    revalidatePath("/subuser/categories");
    revalidatePath("/categories");
    
    return { 
      success: true, 
      message: "تم حذف الفئة بنجاح"
    };

  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "فشل في حذف الفئة: " + error.message };
  }
}

// الحصول على تفاصيل فئة
export async function getCategoryDetails(categoryId) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
      branchId: branchId
    }).lean();

    if (!category) {
      return { success: false, error: "الفئة غير موجودة أو غير مصرح بالوصول إليها" };
    }

    // جلب الفئات الفرعية يدوياً
    const subcategories = await Category.find({
      parentId: categoryId,
      userId: userId,
      branchId: branchId
    }).lean();

    return {
      success: true,
      data: {
        _id: category._id.toString(),
        name: category.name,
        description: category.description || '',
        parentId: category.parentId?.toString() || '',
        image: category.image || '',
        slug: category.slug || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder || 0,
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
        subcategories: subcategories.map(sub => ({
          _id: sub._id.toString(),
          name: sub.name,
          description: sub.description
        })),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    };

  } catch (error) {
    console.error("Error fetching category details:", error);
    return { success: false, error: "فشل في جلب تفاصيل الفئة: " + error.message };
  }
}

// الحصول على جميع الفئات
export async function getAllCategories(filters = {}) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    const query = {
      userId: userId,
      branchId: branchId,
      ...filters
    };

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // جلب الفئات الفرعية يدوياً لكل فئة رئيسية
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await Category.find({
          parentId: category._id,
          userId: userId,
          branchId: branchId
        }).lean();

        return {
          _id: category._id.toString(),
          name: category.name,
          description: category.description,
          parentId: category.parentId?.toString() || null,
          image: category.image,
          slug: category.slug,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          subcategories: subcategories.map(sub => ({
            _id: sub._id.toString(),
            name: sub.name,
            description: sub.description
          })),
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        };
      })
    );

    return {
      success: true,
      data: categoriesWithSubcategories
    };

  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "فشل في جلب الفئات: " + error.message };
  }
}

// تغيير حالة النشاط
export async function toggleCategoryStatus(categoryId) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
      branchId: branchId
    });

    if (!category) {
      return { success: false, error: "الفئة غير موجودة أو غير مصرح بالوصول إليها" };
    }

    category.isActive = !category.isActive;
    await category.save();

    revalidatePath("/subuser/categories");
    revalidatePath("/categories");
    
    return { 
      success: true, 
      message: `تم ${category.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الفئة بنجاح`,
      data: {
        _id: category._id.toString(),
        isActive: category.isActive
      }
    };

  } catch (error) {
    console.error("Error toggling category status:", error);
    return { success: false, error: "فشل في تغيير حالة الفئة: " + error.message };
  }
}