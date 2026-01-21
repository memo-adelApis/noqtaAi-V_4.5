import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import User from '@/models/User';
import Branch from '@/models/Branches';
import Store from '@/models/Store';
import Invoice from '@/models/Invoices';
import dbConnect from '@/app/lib/dbConnect';
import SubscriberProfileClient from '@/components/subscriber/SubscriberProfileClient';
import mongoose from 'mongoose';

export default async function SubscriberProfilePage() {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  const userId = new mongoose.Types.ObjectId(session.user.id);

  // جلب بيانات المشترك
  const user = await User.findById(userId).select('-password').lean();

  // إحصائيات المشترك
  const stats = await Promise.all([
    // عدد المستخدمين الفرعيين
    User.countDocuments({ mainAccountId: userId }),
    
    // عدد الفروع
    Branch.countDocuments({ userId }),
    
    // عدد المخازن
    Store.countDocuments({ userId }),
    
    // إجمالي الفواتير
    Invoice.countDocuments({ userId }),
    
    // إجمالي الإيرادات
    Invoice.aggregate([
      { $match: { userId, type: 'revenue' } },
      { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
    ]),
    
    // إجمالي المصروفات
    Invoice.aggregate([
      { $match: { userId, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$totalInvoice' } } }
    ])
  ]);

  const [usersCount, branchesCount, storesCount, invoicesCount, revenueData, expensesData] = stats;

  const totalRevenue = revenueData[0]?.total || 0;
  const totalExpenses = expensesData[0]?.total || 0;
  const netProfit = totalRevenue - totalExpenses;

  // تحويل البيانات
  const userData = {
    ...user,
    _id: user._id.toString(),
    subscriptionStart: user.subscriptionStart?.toISOString(),
    subscriptionEnd: user.subscriptionEnd?.toISOString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString()
  };

  const statsData = {
    users: usersCount,
    branches: branchesCount,
    stores: storesCount,
    invoices: invoicesCount,
    totalRevenue,
    totalExpenses,
    netProfit
  };

  return <SubscriberProfileClient user={userData} stats={statsData} />;
}
