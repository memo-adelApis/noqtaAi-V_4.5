import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['employee', 'manager', 'cashier'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDB();

        const body = await request.json();
        const { name, email } = body;

        const user = await User.findById(session.user.id);
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // التحقق من عدم تكرار البريد الإلكتروني
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
            }
        }

        user.name = name;
        user.email = email;
        await user.save();

        return NextResponse.json({ 
            success: true, 
            message: 'تم تحديث الملف الشخصي بنجاح' 
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
