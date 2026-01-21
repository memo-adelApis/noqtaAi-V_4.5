import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Invoice from "@/models/Invoices";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { AlertCircle, TrendingUp, TrendingDown, Calendar, FileText } from "lucide-react";
import { redirect } from 'next/navigation';
import ExportOutstandingButton from '@/components/owner/ExportOutstandingButton';

export default async function OutstandingReportPage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  // جلب المستخدم الحالي للحصول على mainAccountId
  const { getCurrentUser } = await import('@/app/lib/auth');
  const currentUser = await getCurrentUser();
  
  if (!currentUser?.mainAccountId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">خطأ في الوصول</h2>
          <p className="text-gray-400">المالك غير مرتبط بحساب مشترك. يرجى التواصل مع الإدارة.</p>
        </div>
      </div>
    );
  }

  const userId = new mongoose.Types.ObjectId(currentUser.mainAccountId);
  
  console.log('=== Outstanding Report Debug ===');
  console.log('Owner ID:', currentUser._id);
  console.log('Main Account ID (Subscriber):', userId);

  // جلب الفواتير المستحقة (لها رصيد متبقي)
  const outstandingInvoices = await Invoice.find({
    userId: userId,
    balance: { $gt: 0 }
  })
    .populate('branchId', 'name')
    .populate('customerId', 'name')
    .populate('supplierId', 'name')
    .sort({ createdAt: -1 })
    .lean();
  
  console.log('Total Outstanding Invoices:', outstandingInvoices.length);

  // تصنيف المستحقات
  const receivables = outstandingInvoices.filter(inv => inv.type === 'revenue'); // مستحقات لنا
  const payables = outstandingInvoices.filter(inv => inv.type === 'expense'); // مستحقات علينا

  // إحصائيات
  const totalReceivables = receivables.reduce((sum, inv) => sum + inv.balance, 0);
  const totalPayables = payables.reduce((sum, inv) => sum + inv.balance, 0);
  const netOutstanding = totalReceivables - totalPayables;

  // المستحقات المتأخرة (أكثر من 30 يوم)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const overdueReceivables = receivables.filter(inv => new Date(inv.createdAt) < thirtyDaysAgo);
  const overduePayables = payables.filter(inv => new Date(inv.createdAt) < thirtyDaysAgo);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  const getDaysOverdue = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    return days;
  };

  // تحضير البيانات للتصدير
  const exportData = {
    totalReceivables,
    totalPayables,
    netOutstanding,
    receivablesCount: receivables.length,
    payablesCount: payables.length,
    overdueCount: overdueReceivables.length + overduePayables.length,
    receivables: receivables.map(inv => ({
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerId?.name || 'غير محدد',
      branchName: inv.branchId?.name || 'غير محدد',
      total: inv.totalInvoice,
      paid: inv.totalPays,
      balance: inv.balance,
      daysOverdue: getDaysOverdue(inv.createdAt),
      date: new Date(inv.createdAt).toLocaleDateString('en-GB')
    })),
    payables: payables.map(inv => ({
      invoiceNumber: inv.invoiceNumber,
      supplierName: inv.supplierId?.name || 'غير محدد',
      branchName: inv.branchId?.name || 'غير محدد',
      total: inv.totalInvoice,
      paid: inv.totalPays,
      balance: inv.balance,
      daysOverdue: getDaysOverdue(inv.createdAt),
      date: new Date(inv.createdAt).toLocaleDateString('en-GB')
    }))
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertCircle className="text-yellow-500" />
            تقرير المستحقات
          </h1>
          <p className="text-gray-400 mt-2">
            المبالغ المستحقة والمدفوعات المعلقة
          </p>
        </div>

        <ExportOutstandingButton 
          data={exportData}
          filename="تقرير_المستحقات"
        />
      </div>

      {/* إحصائيات رئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مستحقات لنا</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalReceivables)}</p>
              <p className="text-xs text-gray-400 mt-1">{receivables.length} فاتورة</p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مستحقات علينا</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalPayables)}</p>
              <p className="text-xs text-gray-400 mt-1">{payables.length} فاتورة</p>
            </div>
            <TrendingDown className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">صافي المستحقات</p>
              <p className={`text-2xl font-bold mt-1 ${netOutstanding >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(netOutstanding)}
              </p>
            </div>
            <FileText className={netOutstanding >= 0 ? 'text-blue-400' : 'text-red-400'} size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 p-6 rounded-xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">متأخرة (+30 يوم)</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {overdueReceivables.length + overduePayables.length}
              </p>
            </div>
            <Calendar className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {outstandingInvoices.length === 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <FileText className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">لا توجد مستحقات حالياً</h3>
              <p className="text-gray-400 mb-2">
                جميع الفواتير مدفوعة بالكامل أو لا توجد فواتير معلقة.
              </p>
              <p className="text-sm text-gray-500">
                المستحقات تظهر عندما يكون هناك رصيد متبقي على الفواتير (balance {'>'} 0)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* المستحقات لنا (من العملاء) */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 bg-green-900/10">
          <h2 className="text-xl font-semibold text-green-400">المستحقات لنا (من العملاء)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">رقم الفاتورة</th>
                <th className="text-right p-4 text-gray-300">العميل</th>
                <th className="text-right p-4 text-gray-300">الفرع</th>
                <th className="text-right p-4 text-gray-300">إجمالي الفاتورة</th>
                <th className="text-right p-4 text-gray-300">المدفوع</th>
                <th className="text-right p-4 text-gray-300">المتبقي</th>
                <th className="text-right p-4 text-gray-300">الأيام</th>
                <th className="text-right p-4 text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((invoice) => {
                const daysOverdue = getDaysOverdue(invoice.createdAt);
                const isOverdue = daysOverdue > 30;
                
                return (
                  <tr key={invoice._id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${isOverdue ? 'bg-yellow-900/10' : ''}`}>
                    <td className="p-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                    <td className="p-4">{invoice.customerId?.name || 'غير محدد'}</td>
                    <td className="p-4 text-sm text-gray-400">{invoice.branchId?.name || 'غير محدد'}</td>
                    <td className="p-4 font-semibold">{formatCurrency(invoice.totalInvoice)}</td>
                    <td className="p-4 text-blue-400">{formatCurrency(invoice.totalPays)}</td>
                    <td className="p-4 font-semibold text-green-400">{formatCurrency(invoice.balance)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isOverdue ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {daysOverdue} يوم
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                );
              })}
              {receivables.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    لا توجد مستحقات من العملاء
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* المستحقات علينا (للموردين) */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 bg-red-900/10">
          <h2 className="text-xl font-semibold text-red-400">المستحقات علينا (للموردين)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">رقم الفاتورة</th>
                <th className="text-right p-4 text-gray-300">المورد</th>
                <th className="text-right p-4 text-gray-300">الفرع</th>
                <th className="text-right p-4 text-gray-300">إجمالي الفاتورة</th>
                <th className="text-right p-4 text-gray-300">المدفوع</th>
                <th className="text-right p-4 text-gray-300">المتبقي</th>
                <th className="text-right p-4 text-gray-300">الأيام</th>
                <th className="text-right p-4 text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {payables.map((invoice) => {
                const daysOverdue = getDaysOverdue(invoice.createdAt);
                const isOverdue = daysOverdue > 30;
                
                return (
                  <tr key={invoice._id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${isOverdue ? 'bg-yellow-900/10' : ''}`}>
                    <td className="p-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                    <td className="p-4">{invoice.supplierId?.name || 'غير محدد'}</td>
                    <td className="p-4 text-sm text-gray-400">{invoice.branchId?.name || 'غير محدد'}</td>
                    <td className="p-4 font-semibold">{formatCurrency(invoice.totalInvoice)}</td>
                    <td className="p-4 text-blue-400">{formatCurrency(invoice.totalPays)}</td>
                    <td className="p-4 font-semibold text-red-400">{formatCurrency(invoice.balance)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isOverdue ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {daysOverdue} يوم
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                );
              })}
              {payables.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    لا توجد مستحقات للموردين
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
