"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// التحقق من صلاحيات المشترك
async function checkSubscriberAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'subscriber') {
    throw new Error('Unauthorized: Subscriber access only');
  }
  
  return session.user.id;
}

// تعليق مستخدم فرعي
export async function suspendSubUser(formData) {
  try {
    const subscriberId = await checkSubscriberAuth();
    await connectToDB();
    
    const userId = formData.get('userId');
    
    // التحقق من أن المستخدم تابع للمشترك
    const user = await User.findOne({
      _id: userId,
      mainAccountId: subscriberId
    });
    
    if (!user) {
      throw new Error('User not found or unauthorized');
    }
    
    user.isActive = false;
    await user.save();
    
    revalidatePath('/subscriber/users');
    return { success: true, message: 'تم تعليق المستخدم بنجاح' };
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
}

// تفعيل مستخدم فرعي
export async function activateSubUser(formData) {
  try {
    const subscriberId = await checkSubscriberAuth();
    await connectToDB();
    
    const userId = formData.get('userId');
    
    // التحقق من أن المستخدم تابع للمشترك
    const user = await User.findOne({
      _id: userId,
      mainAccountId: subscriberId
    });
    
    if (!user) {
      throw new Error('User not found or unauthorized');
    }
    
    user.isActive = true;
    await user.save();
    
    revalidatePath('/subscriber/users');
    return { success: true, message: 'تم تفعيل المستخدم بنجاح' };
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
}

// حذف مستخدم فرعي
export async function deleteSubUser(formData) {
  try {
    const subscriberId = await checkSubscriberAuth();
    await connectToDB();
    
    const userId = formData.get('userId');
    
    // حذف المستخدم فقط إذا كان تابعاً للمشترك
    const result = await User.deleteOne({
      _id: userId,
      mainAccountId: subscriberId
    });
    
    if (result.deletedCount === 0) {
      throw new Error('User not found or unauthorized');
    }
    
    revalidatePath('/subscriber/users');
    return { success: true, message: 'تم حذف المستخدم بنجاح' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// تحديث بيانات مستخدم فرعي
export async function updateSubUser(formData) {
  try {
    const subscriberId = await checkSubscriberAuth();
    await connectToDB();
    
    const userId = formData.get('userId');
    const name = formData.get('name');
    const email = formData.get('email');
    const role = formData.get('role');
    const branchId = formData.get('branchId');
    
    // التحقق من أن المستخدم تابع للمشترك
    const user = await User.findOne({
      _id: userId,
      mainAccountId: subscriberId
    });
    
    if (!user) {
      throw new Error('User not found or unauthorized');
    }
    
    user.name = name;
    user.email = email;
    user.role = role;
    user.branchId = branchId || null;
    
    await user.save();
    
    revalidatePath('/subscriber/users');
    return { success: true, message: 'تم تحديث المستخدم بنجاح' };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
