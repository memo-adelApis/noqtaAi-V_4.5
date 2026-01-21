import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ShopUserDetailsClient from '@/components/subscriber/ShopUserDetailsClient';

export const metadata = {
  title: 'تفاصيل العميل - نقطة AI',
  description: 'تفاصيل عميل المتجر الإلكتروني'
};

export default async function ShopUserDetailsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  const { id } = await params;

  return <ShopUserDetailsClient userId={id} />;
}