// المسار: app/actions/employeeActions.js
"use server";

import { connectToDB } from "@/utils/database";
import { getCurrentUser } from "@/app/lib/auth";
import User from "@/models/User";
import Branch from "@/models/Branches"; // نموذج الفروع
import { z } from "zod"; // للتحقق من البيانات
import bcrypt from 'bcryptjs';

// مخطط التحقق من بيانات الموظف
const employeeSchema = z.object({
    name: z.string().min(3, "الاسم قصير جداً"),
    email: z.string().email("بريد إلكتروني غير صالح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    role: z.enum(["employee", "manager", "owner", "cashier", "accountant", "supervisor"]),
    branchId: z.string().optional(), // اختياري للمالك
});

/**
 * دالة لإنشاء موظف جديد
 * (يتم استدعاؤها بواسطة المشترك فقط)
 */
export async function createEmployee(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        // 1. التحقق من صحة البيانات
        const validation = employeeSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }
        
        const { name, email, password, role, branchId } = validation.data;
        
        await connectToDB();

        // 2. التحقق من عدم تكرار الإيميل
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("هذا البريد الإلكتروني مستخدم بالفعل");
        }

        // 3. التحقق من أن الفرع يتبع المشترك (أمان) - إلا إذا كان المالك بدون فرع
        if (branchId && branchId.trim() !== '') {
            const branch = await Branch.findOne({ 
                _id: branchId, 
                userId: currentUser._id // التأكد أن الفرع يخص هذا المشترك
            });
            if (!branch) {
                throw new Error("الفرع المحدد غير صالح أو لا تملكه");
            }
        } else if (role !== 'owner') {
            // إذا لم يكن مالك ولم يحدد فرع، فهذا خطأ
            throw new Error("يجب تحديد فرع للموظف");
        }

        // 4. إنشاء الموظف
        // (ملاحظة: الـ pre-save hook في User.js سيهتم بالهاش لكلمة المرور)
        const newEmployee = new User({
            name,
            email,
            password, // الـ Hook سيقوم بالهاش
            role,
            branchId: (branchId && branchId.trim() !== '') ? branchId : null, // null إذا كان فارغ
            mainAccountId: currentUser._id, // ربط الموظف بحساب المشترك
            provider: 'credentials',
            isActive: true,
        });

        await newEmployee.save();

        return { success: true, data: JSON.parse(JSON.stringify(newEmployee)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لجلب قائمة موظفي المشترك
 */
export async function getMyEmployees() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        await connectToDB();

        // جلب كل المستخدمين التابعين لهذا المشترك (ما عدا هو نفسه)
        const employees = await User.find({
            mainAccountId: currentUser._id,
            _id: { $ne: currentUser._id } // استبعاد المشترك نفسه
        }).populate('branchId', 'name'); // جلب اسم الفرع

        return { success: true, data: JSON.parse(JSON.stringify(employees)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لجلب قائمة فروع المشترك (لاستخدامها في القائمة المنسدلة)
 */
export async function getMyBranches() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'subscriber') {
            throw new Error("403 - غير مصرح لك");
        }
        
        await connectToDB();

        // جلب فروع هذا المشترك فقط
        const branches = await Branch.find({ 
            userId: currentUser._id 
        }).select('name _id'); // جلب الاسم والـ ID فقط

        return { success: true, data: JSON.parse(JSON.stringify(branches)) };

    } catch (error) {
        return { success: false, error: error.message };
    }
}