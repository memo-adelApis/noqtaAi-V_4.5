import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import { redirect } from 'next/navigation';
import FinancialInsightsClient from '@/components/owner/FinancialInsightsClient';
import { getCurrentUser } from '@/app/lib/auth';

export default async function FinancialInsightsPage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  // جلب المستخدم الحالي للحصول على mainAccountId
  const currentUser = await getCurrentUser();
  
  // تمرير mainAccountId بدلاً من userId (تحويله إلى string)
  const userId = currentUser?.mainAccountId?.toString() || session.user.id;

  return <FinancialInsightsClient userId={userId} />;
}
