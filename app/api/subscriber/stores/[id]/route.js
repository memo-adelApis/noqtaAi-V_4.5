import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Store from '@/models/Store';
import Branch from '@/models/Branches';
import mongoose from 'mongoose';

export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { id: storeId } = await params; // ✅ استخدام await params
    const body = await request.json();
    const { name, branchId, location } = body;

    // التحقق من أن المخزن تابع للمشترك
    const store = await Store.findOne({ 
      _id: storeId,
      userId
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // التحقق من أن الفرع الجديد تابع للمشترك
    const branch = await Branch.findOne({ _id: branchId, userId });
    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 400 });
    }

    // تحديث البيانات
    store.name = name;
    store.branchId = branchId;
    store.location = location || '';

    await store.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating store:', error);
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
    const { id: storeId } = await params; // ✅ استخدام await params

    // حذف المخزن فقط إذا كان تابعاً للمشترك
    const result = await Store.deleteOne({ 
      _id: storeId,
      userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
