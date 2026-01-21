import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ShopUsersClient from '@/components/subscriber/ShopUsersClient';

export const metadata = {
  title: 'إدارة عملاء المتجر - نقطة AI',
  description: 'إدارة عملاء المتجر الإلكتروني'
};

export default async function ShopUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  return <ShopUsersClient />;
}