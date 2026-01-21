import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
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
    const { name, location } = body;

    // إنشاء الفرع الجديد
    const newBranch = await Branch.create({
      name,
      location: location || '',
      userId
    });

    return NextResponse.json({ 
      success: true, 
      branch: {
        _id: newBranch._id.toString(),
        name: newBranch.name,
        location: newBranch.location
      }
    });

  } catch (error) {
    console.error('Error creating branch:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'اسم الفرع موجود بالفعل' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
