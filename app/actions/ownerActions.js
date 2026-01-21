"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

// ⚠️ حماية صارمة: التحقق من صلاحيات المالك فقط
async function checkOwnerAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    throw new Error('Unauthorized: Owner access only');
  }
  
  return session.user.id;
}

// تعليق أي مستخدم (للمالك فقط)
export async function suspendUser(formData) {
  try {
    await checkOwnerAuth(); // ✅ حماية المالك
    await connectToDB();
    
    const userId = formData.get('userId');
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // منع المالك من تعليق نفسه
    const session = await getServerSession(authOptions);
    if (user._id.toString() === session.user.id) {
      throw new Error('Cannot suspend yourself');
    }
    
    user.isActive = false;
    await user.save();
    
    revalidatePath('/admin/users');
    return { success: true, message: 'تم تعليق المستخدم بنجاح' };
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
}

// تفعيل أي مستخدم (للمالك فقط)
export async function activateUser(formData) {
  try {
    await checkOwnerAuth(); // ✅ حماية المالك
    await connectToDB();
    
    const userId = formData.get('userId');
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    user.isActive = true;
    await user.save();
    
    revalidatePath('/admin/users');
    return { success: true, message: 'تم تفعيل المستخدم بنجاح' };
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
}

// حذف أي مستخدم (للمالك فقط)
export async function deleteUser(formData) {
  try {
    await checkOwnerAuth(); // ✅ حماية المالك
    await connectToDB();
    
    const userId = formData.get('userId');
    
    // منع المالك من حذف نفسه
    const session = await getServerSession(authOptions);
    if (userId === session.user.id) {
      throw new Error('Cannot delete yourself');
    }
    
    const result = await User.deleteOne({ _id: userId });
    
    if (result.deletedCount === 0) {
      throw new Error('User not found');
    }
    
    revalidatePath('/admin/users');
    return { success: true, message: 'تم حذف المستخدم بنجاح' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// تحديث دور المستخدم (للمالك فقط)
export async function updateUserRole(formData) {
  try {
    await checkOwnerAuth(); // ✅ حماية المالك
    await connectToDB();
    
    const userId = formData.get('userId');
    const newRole = formData.get('role');
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // منع المالك من تغيير دوره
    const session = await getServerSession(authOptions);
    if (user._id.toString() === session.user.id) {
      throw new Error('Cannot change your own role');
    }
    
    user.role = newRole;
    await user.save();
    
    revalidatePath('/admin/users');
    return { success: true, message: 'تم تحديث دور المستخدم بنجاح' };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// تحديث حالة اشتراك المشترك (للمالك فقط)
export async function updateSubscriptionStatus(formData) {
  try {
    await checkOwnerAuth(); // ✅ حماية المالك
    await connectToDB();
    
    const userId = formData.get('userId');
    const status = formData.get('status');
    const type = formData.get('type');
    const endDate = formData.get('endDate');
    
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'subscriber') {
      throw new Error('Subscriber not found');
    }
    
    user.subscriptionStatus = status;
    if (type) user.subscriptionType = type;
    if (endDate) user.subscriptionEnd = new Date(endDate);
    
    await user.save();
    
    revalidatePath('/admin/users');
    return { success: true, message: 'تم تحديث حالة الاشتراك بنجاح' };
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

// إنشاء مستخدم جديد (للمالك فقط)
export async function createUser(formData) {
  try {
    await checkOwnerAuth(); // ✅ حماية المالك
    await connectToDB();
    
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    
    // التحقق من عدم وجود البريد مسبقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      provider: 'credentials',
      isActive: true
    });
    
    revalidatePath('/admin/users');
    return { success: true, message: 'تم إنشاء المستخدم بنجاح' };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
