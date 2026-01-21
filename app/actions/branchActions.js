'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Branch from '@/models/Branches';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// إضافة فرع جديد (للاستخدام من Server Actions)
export async function addBranch(formData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return { success: false, error: 'غير مصرح لك بهذا الإجراء' };
    }

    const name = formData.get('name');
    const location = formData.get('location') || '';

    // التحقق من البيانات المطلوبة
    if (!name) {
      return { success: false, error: 'اسم الفرع مطلوب' };
    }

    // التحقق من عدم وجود فرع بنفس الاسم للمستخدم
    const existingBranch = await Branch.findOne({ 
      name, 
      userId: session.user.id 
    });
    
    if (existingBranch) {
      return { success: false, error: 'يوجد فرع بهذا الاسم مسبقاً' };
    }

    // إنشاء الفرع الجديد
    const newBranch = await Branch.create({
      name,
      location,
      userId: session.user.id
    });

    // تحويل إلى plain object
    const plainBranch = {
      _id: newBranch._id.toString(),
      name: newBranch.name,
      location: newBranch.location,
      userId: newBranch.userId.toString(),
      createdAt: newBranch.createdAt,
      updatedAt: newBranch.updatedAt
    };

    revalidatePath('/subscriber/branches');
    
    return { success: true, branch: plainBranch, message: 'تم إضافة الفرع بنجاح' };

  } catch (error) {
    console.error('خطأ في إضافة الفرع:', error);
    return { success: false, error: 'حدث خطأ في النظام' };
  }
}

// إضافة فرع جديد (للاستخدام من Client Components)
export async function createBranch(branchData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return { success: false, error: 'غير مصرح لك بهذا الإجراء' };
    }

    const { name, location = '' } = branchData;

    // التحقق من البيانات المطلوبة
    if (!name) {
      return { success: false, error: 'اسم الفرع مطلوب' };
    }

    // التحقق من عدم وجود فرع بنفس الاسم للمستخدم
    const existingBranch = await Branch.findOne({ 
      name, 
      userId: session.user.id 
    });
    
    if (existingBranch) {
      return { success: false, error: 'يوجد فرع بهذا الاسم مسبقاً' };
    }

    // إنشاء الفرع الجديد
    const newBranch = await Branch.create({
      name,
      location,
      userId: session.user.id
    });

    // تحويل إلى plain object
    const plainBranch = {
      _id: newBranch._id.toString(),
      name: newBranch.name,
      location: newBranch.location,
      userId: newBranch.userId.toString(),
      createdAt: newBranch.createdAt,
      updatedAt: newBranch.updatedAt
    };

    revalidatePath('/subscriber/branches');
    
    return { success: true, branch: plainBranch };

  } catch (error) {
    console.error('خطأ في إضافة الفرع:', error);
    return { success: false, error: 'حدث خطأ في النظام' };
  }
}

// تحديث فرع (للاستخدام من Server Actions)
export async function updateBranchForm(formData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return { success: false, error: 'غير مصرح لك بهذا الإجراء' };
    }

    const branchId = formData.get('branchId');
    const name = formData.get('name');
    const location = formData.get('location') || '';

    // التحقق من البيانات المطلوبة
    if (!branchId || !name) {
      return { success: false, error: 'البيانات المطلوبة مفقودة' };
    }

    // التحقق من ملكية الفرع
    const branch = await Branch.findOne({ 
      _id: branchId, 
      userId: session.user.id 
    });
    
    if (!branch) {
      return { success: false, error: 'الفرع غير موجود أو غير مصرح لك بتعديله' };
    }

    // التحقق من عدم وجود فرع آخر بنفس الاسم
    const existingBranch = await Branch.findOne({ 
      name, 
      userId: session.user.id,
      _id: { $ne: branchId }
    });
    
    if (existingBranch) {
      return { success: false, error: 'يوجد فرع آخر بهذا الاسم' };
    }

    // تحديث الفرع
    const updatedBranch = await Branch.findByIdAndUpdate(branchId, {
      name,
      location
    }, { new: true });

    // تحويل إلى plain object
    const plainBranch = {
      _id: updatedBranch._id.toString(),
      name: updatedBranch.name,
      location: updatedBranch.location,
      userId: updatedBranch.userId.toString(),
      createdAt: updatedBranch.createdAt,
      updatedAt: updatedBranch.updatedAt
    };

    revalidatePath('/subscriber/branches');
    
    return { success: true, branch: plainBranch, message: 'تم تحديث الفرع بنجاح' };

  } catch (error) {
    console.error('خطأ في تحديث الفرع:', error);
    return { success: false, error: 'حدث خطأ في النظام' };
  }
}

// تحديث فرع (للاستخدام من Client Components)
export async function updateBranch(branchId, branchData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return { success: false, error: 'غير مصرح لك بهذا الإجراء' };
    }

    const { name, location = '' } = branchData;

    // التحقق من البيانات المطلوبة
    if (!branchId || !name) {
      return { success: false, error: 'البيانات المطلوبة مفقودة' };
    }

    // التحقق من ملكية الفرع
    const branch = await Branch.findOne({ 
      _id: branchId, 
      userId: session.user.id 
    });
    
    if (!branch) {
      return { success: false, error: 'الفرع غير موجود أو غير مصرح لك بتعديله' };
    }

    // التحقق من عدم وجود فرع آخر بنفس الاسم
    const existingBranch = await Branch.findOne({ 
      name, 
      userId: session.user.id,
      _id: { $ne: branchId }
    });
    
    if (existingBranch) {
      return { success: false, error: 'يوجد فرع آخر بهذا الاسم' };
    }

    // تحديث الفرع
    const updatedBranch = await Branch.findByIdAndUpdate(branchId, {
      name,
      location
    }, { new: true });

    // تحويل إلى plain object
    const plainBranch = {
      _id: updatedBranch._id.toString(),
      name: updatedBranch.name,
      location: updatedBranch.location,
      userId: updatedBranch.userId.toString(),
      createdAt: updatedBranch.createdAt,
      updatedAt: updatedBranch.updatedAt
    };

    revalidatePath('/subscriber/branches');
    
    return { success: true, branch: plainBranch };

  } catch (error) {
    console.error('خطأ في تحديث الفرع:', error);
    return { success: false, error: 'حدث خطأ في النظام' };
  }
}

// حذف فرع
export async function deleteBranch(branchId) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return { success: false, error: 'غير مصرح لك بهذا الإجراء' };
    }

    // التحقق من ملكية الفرع
    const branch = await Branch.findOne({ 
      _id: branchId, 
      userId: session.user.id 
    });
    
    if (!branch) {
      return { success: false, error: 'الفرع غير موجود أو غير مصرح لك بحذفه' };
    }

    // يمكن إضافة فحص للتأكد من عدم وجود بيانات مرتبطة بالفرع
    // مثل المستخدمين أو المخازن أو الفواتير

    // حذف الفرع
    await Branch.findByIdAndDelete(branchId);

    revalidatePath('/subscriber/branches');
    
    return { success: true, message: 'تم حذف الفرع بنجاح' };

  } catch (error) {
    console.error('خطأ في حذف الفرع:', error);
    return { success: false, error: 'حدث خطأ في النظام' };
  }
}

// جلب فروع المستخدم
export async function getUserBranches() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const branches = await Branch.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, branches };

  } catch (error) {
    console.error('خطأ في جلب الفروع:', error);
    return { success: false, message: error.message };
  }
}

// جلب فروع المستخدم (اسم بديل)
export async function getMyBranches() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    const branches = await Branch.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: branches };

  } catch (error) {
    console.error('خطأ في جلب الفروع:', error);
    return { success: false, error: 'حدث خطأ في النظام' };
  }
}