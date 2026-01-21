import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ShopReportsClient from '@/components/owner/ShopReportsClient';

export const metadata = {
  title: 'تقارير المتجر الإلكتروني - نقطة',
  description: 'تقارير شاملة عن أداء المتجر الإلكتروني والمبيعات'
};

export default async function ShopReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'owner') {
    redirect('/');
  }

  return <ShopReportsClient user={session.user} />;
}