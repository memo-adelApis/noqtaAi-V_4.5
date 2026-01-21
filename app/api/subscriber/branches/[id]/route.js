import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Branch from '@/models/Branches';
import Store from '@/models/Store';
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
    const { id: branchId } = await params; // ✅ استخدام await params
    const body = await request.json();
    const { name, location } = body;

    // التحقق من أن الفرع تابع للمشترك
    const branch = await Branch.findOne({ 
      _id: branchId,
      userId
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // تحديث البيانات
    branch.name = name;
    branch.location = location || '';

    await branch.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating branch:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'اسم الفرع موجود بالفعل' }, { status: 400 });
    }
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
    const { id: branchId } = await params; // ✅ استخدام await params

    // التحقق من عدم وجود مستخدمين أو مخازن مرتبطة بالفرع
    const usersCount = await User.countDocuments({ branchId });
    const storesCount = await Store.countDocuments({ branchId });

    if (usersCount > 0 || storesCount > 0) {
      return NextResponse.json({ 
        error: 'لا يمكن حذف الفرع لوجود مستخدمين أو مخازن مرتبطة به' 
      }, { status: 400 });
    }

    // حذف الفرع فقط إذا كان تابعاً للمشترك
    const result = await Branch.deleteOne({ 
      _id: branchId,
      userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
