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

    const subscriberId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { userId, password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
    }

    // التحقق من أن المستخدم تابع للمشترك
    const user = await User.findOne({ 
      _id: userId,
      mainAccountId: subscriberId
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // تحديث كلمة المرور (سيتم تشفيرها تلقائياً بواسطة pre-save hook)
    user.password = password;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
