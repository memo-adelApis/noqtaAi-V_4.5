import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { id: targetUserId } = await params; // ✅ استخدام await params
    const body = await request.json();
    const { name, email, role, branchId, isActive } = body;

    // التحقق من أن المستخدم المستهدف تابع للمشترك
    const targetUser = await User.findOne({ 
      _id: targetUserId,
      mainAccountId: userId
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // تحديث البيانات
    targetUser.name = name;
    targetUser.email = email;
    targetUser.role = role;
    targetUser.branchId = branchId || null;
    targetUser.isActive = isActive;

    await targetUser.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { id: targetUserId } = await params; // ✅ استخدام await params

    // حذف المستخدم فقط إذا كان تابعاً للمشترك
    const result = await User.deleteOne({ 
      _id: targetUserId,
      mainAccountId: userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
