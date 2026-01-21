import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Store from '@/models/Store';
import Branch from '@/models/Branches';
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
    const { name, branchId, location } = body;

    // التحقق من أن الفرع تابع للمشترك
    const branch = await Branch.findOne({ _id: branchId, userId });
    if (!branch) {
      return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 400 });
    }

    // إنشاء المخزن الجديد
    const newStore = await Store.create({
      name,
      branchId,
      location: location || '',
      userId
    });

    return NextResponse.json({ 
      success: true, 
      store: {
        _id: newStore._id.toString(),
        name: newStore.name,
        location: newStore.location
      }
    });

  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
