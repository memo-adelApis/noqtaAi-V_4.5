import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ItemsManagementClient from '@/components/subuser/items/ItemsManagementClient';

export const metadata = {
  title: 'إدارة الأصناف - نقطة',
  description: 'إدارة أصناف الفرع وتحديث بياناتها'
};

export default async function ItemsManagementPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  if (!['employee', 'manager', 'subscriber'].includes(session.user.role)) {
    redirect('/');
  }

  return <ItemsManagementClient user={session.user} />;
}