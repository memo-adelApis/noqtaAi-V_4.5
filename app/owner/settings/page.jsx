import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import { redirect } from 'next/navigation';
import SettingsClient from '@/components/owner/SettingsClient';
import User from '@/models/User';
import Branch from '@/models/Branches';

export default async function SettingsPage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  // if (!session || session.user.role !== 'owner') {
  //   redirect('/login');
  // }

  // جلب بيانات المستخدم الكاملة
  const user = await User.findById(session.user.id).lean();
  
  // جلب الفروع
  const branches = await Branch.find({ userId: session.user.id }).lean();

  // تحويل بيانات المستخدم إلى كائن بسيط
  const userData = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role
  };

  // تحويل بيانات الفروع إلى كائنات بسيطة
  const branchesData = branches.map(b => ({
    _id: b._id.toString(),
    name: b.name,
    location: b.location || ''
  }));

  return (
    <SettingsClient 
      user={userData}
      branches={branchesData}
    />
  );
}
