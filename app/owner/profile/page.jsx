import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import { redirect } from 'next/navigation';
import ProfileClient from '@/components/owner/ProfileClient';
import User from '@/models/User';
import Invoice from '@/models/Invoices';
import Branch from '@/models/Branches';
import mongoose from 'mongoose';

export default async function ProfilePage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  // if (!session || session.user.role !== 'owner') {
  //   redirect('/login');
  // }

  const userId = new mongoose.Types.ObjectId(session.user.id);

  // جلب بيانات المستخدم
  const user = await User.findById(userId).lean();
  
  // إحصائيات المستخدم
  const totalInvoices = await Invoice.countDocuments({ userId });
  const totalBranches = await Branch.countDocuments({ userId });
  
  const totalRevenue = await Invoice.aggregate([
    { $match: { userId, type: 'revenue' } },
    { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
  ]);

  const totalExpenses = await Invoice.aggregate([
    { $match: { userId, type: 'expense' } },
    { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
  ]);

  // جلب الموظفين الفرعيين
  const subusers = await User.find({ 
    role: 'subuser',
    createdBy: userId 
  }).lean();

  const stats = {
    totalInvoices,
    totalBranches,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalExpenses: totalExpenses[0]?.total || 0,
    totalSubusers: subusers.length,
    memberSince: user.createdAt.toISOString()
  };

  // تحويل بيانات المستخدم إلى كائن بسيط
  const userData = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    createdAt: user.createdAt.toISOString()
  };

  return (
    <ProfileClient 
      user={userData}
      stats={stats}
    />
  );
}
