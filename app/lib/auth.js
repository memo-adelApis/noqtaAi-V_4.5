import { getServerSession } from "next-auth";
// استيراد الإعدادات التي أنشأناها في ملف next-auth
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import User from "@/models/User";
import { connectToDB } from "@/utils/database";

/**
 * دالة لجلب الجلسة الآمنة (Server-Side)
 * هذه الدالة ستُستخدم في كل مكان (Server Components/Actions)
 * للتأكد من أن المستخدم مسجل دخوله
 */
export const getSafeSession = async () => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        // throw new Error("401 - غير مصرح به: المستخدم غير مسجل");
    }
    return session;
};

/**
 * دالة لجلب بيانات المستخدم الكاملة من قاعدة البيانات
 * تستخدم في (Server Actions) التي تحتاج لبيانات المستخدم
 */
export const getCurrentUser = async () => {
    try {
        // أولاً، نتأكد أن المستخدم مسجل دخوله
        const session = await getSafeSession();
        
        await connectToDB();
        
        const currentUser = await User.findById(session.user.id);
        // console.log("currentUser" , currentUser)
        // 
        if (!currentUser) {
            throw new Error("المستخدم غير موجود في قاعدة البيانات");
        }
        
        // لا نريد إرجاع كلمة المرور أبداً
        currentUser.password = undefined; 
        
        return currentUser;

    } catch (error) {
       /// console.error("Error fetching current user:", error.message);
        return null; // أو أعد رمي الخطأ حسب الحاجة
    }
}