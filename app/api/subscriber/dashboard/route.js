import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import Branch from '@/models/Branches';
import Store from '@/models/Store';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'subscriber') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // جلب بيانات المشترك
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // جلب المستخدمين الفرعيين
    const users = await User.find({ 
      mainAccountId: userId,
      role: { $in: ['owner', 'manager', 'employee'] }
    })
    .populate('branchId', 'name')
    .select('-password')
    .lean();

    // جلب الفروع
    const branches = await Branch.find({ userId }).lean();

    // جلب المخازن
    const stores = await Store.find({ userId })
      .populate('branchId', 'name')
      .lean();

    // تحويل ObjectId إلى string
    const formatData = (data) => {
      if (Array.isArray(data)) {
        return data.map(item => ({
          ...item,
          _id: item._id.toString(),
          userId: item.userId?.toString(),
          branchId: item.branchId ? {
            _id: item.branchId._id?.toString() || item.branchId.toString(),
            name: item.branchId.name
          } : null,
          mainAccountId: item.mainAccountId?.toString(),
          createdAt: item.createdAt?.toISOString(),
          updatedAt: item.updatedAt?.toISOString()
        }));
      }
      return {
        ...data,
        _id: data._id.toString(),
        userId: data.userId?.toString(),
        mainAccountId: data.mainAccountId?.toString(),
        subscriptionStart: data.subscriptionStart?.toISOString(),
        subscriptionEnd: data.subscriptionEnd?.toISOString(),
        createdAt: data.createdAt?.toISOString(),
        updatedAt: data.updatedAt?.toISOString()
      };
    };

    return NextResponse.json({
      user: formatData(user),
      users: formatData(users),
      branches: formatData(branches),
      stores: formatData(stores)
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
