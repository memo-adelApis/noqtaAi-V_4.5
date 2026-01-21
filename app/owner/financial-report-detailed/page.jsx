import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getAccurateFinancialReport, getInstallmentDetails } from '@/app/actions/financialCalculations';
import DetailedFinancialReportClient from '@/components/owner/DetailedFinancialReportClient';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'التقرير المالي المفصل - نظام إدارة المخزون',
  description: 'تقرير مالي دقيق يفصل بين المدفوع والأقساط والمديونية'
};

export default async function DetailedFinancialReportPage({ searchParams }) {
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

  // جلب البيانات المالية
  const [financialResult, installmentResult] = await Promise.all([
    getAccurateFinancialReport(filters),
    getInstallmentDetails(filters)
  ]);

  if (!financialResult.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في تحميل التقرير</h2>
          <p className="text-gray-400">{financialResult.error}</p>
        </div>
      </div>
    );
  }

  if (!installmentResult.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في تحميل بيانات الأقساط</h2>
          <p className="text-gray-400">{installmentResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <DetailedFinancialReportClient 
      financialData={financialResult.data}
      installmentData={installmentResult.data}
      initialFilters={filters}
    />
  );
}