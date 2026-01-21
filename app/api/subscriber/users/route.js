import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { name, email, password, role, branchId, isActive } = body;

    // التحقق من عدم وجود البريد مسبقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
    }

    // إنشاء المستخدم الجديد
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      branchId: branchId || null,
      mainAccountId: userId,
      isActive: isActive !== undefined ? isActive : true,
      provider: 'credentials'
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
