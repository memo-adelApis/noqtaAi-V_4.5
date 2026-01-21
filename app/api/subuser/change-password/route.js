import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['employee', 'manager', 'cashier'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDB();

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // جلب المستخدم مع كلمة المرور
        const user = await User.findById(session.user.id).select('+password');
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // التحقق من كلمة المرور الحالية
        const isPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
        }

        // تحديث كلمة المرور
        user.password = newPassword;
        await user.save();

        return NextResponse.json({ 
            success: true, 
            message: 'تم تغيير كلمة المرور بنجاح' 
        });

    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
