import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getProfitLossStatement } from '@/app/actions/inventoryValuation';
import ProfitLossStatementClient from '@/components/owner/ProfitLossStatementClient';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'ميزان الأرباح والخسائر - نظام إدارة المخزون',
  description: 'ميزان شامل للأرباح والخسائر مع تقييم المخزون'
};

export default async function ProfitLossStatementPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  // استخراج الفلاتر من URL
  const filters = {
    dateFrom: searchParams.dateFrom || '',
    dateTo: searchParams.dateTo || '',
    branchId: searchParams.branchId || ''
  };

  // جلب بيانات ميزان الأرباح والخسائر
  const result = await getProfitLossStatement(filters);

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-400">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <ProfitLossStatementClient 
      data={result.data}
      initialFilters={filters}
    />
  );
}