import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Invoice from '@/models/Invoices';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 });
    }

    // جلب بيانات المستخدم الحالي
    const currentUser = await User.findById(session.user.id).lean();
    
    if (!currentUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // تحديد userId المستهدف
    let targetUserId;
    if (currentUser.role === 'owner') {
      if (currentUser.mainAccountId) {
        targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
      } else {
        targetUserId = new mongoose.Types.ObjectId(currentUser._id);
      }
    } else {
      targetUserId = new mongoose.Types.ObjectId(currentUser.mainAccountId || currentUser._id);
    }

    // جلب الفواتير
    const invoices = await Invoice.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // إحصائيات
    const totalInvoices = await Invoice.countDocuments({ userId: targetUserId });

    return NextResponse.json({
      success: true,
      debug: {
        currentUser: {
          _id: currentUser._id.toString(),
          name: currentUser.name,
          role: currentUser.role,
          mainAccountId: currentUser.mainAccountId?.toString() || null
        },
        targetUserId: targetUserId.toString(),
        totalInvoices,
        sampleInvoices: invoices.map(inv => ({
          _id: inv._id.toString(),
          invoiceNumber: inv.invoiceNumber,
          type: inv.type,
          totalInvoice: inv.totalInvoice,
          userId: inv.userId.toString(),
          createdAt: inv.createdAt
        }))
      }
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}