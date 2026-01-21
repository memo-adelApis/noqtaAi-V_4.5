import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { FileText, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { redirect } from 'next/navigation';
import { getOwnerInvoices } from '@/app/actions/ownerDashboardActions';

export default async function OwnerInvoicesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  // جلب الفواتير من الـ action
  const result = await getOwnerInvoices({ page: 1, limit: 50 });
  
  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في تحميل الفواتير</h2>
          <p className="text-gray-400">{result.error}</p>
        </div>
      </div>
    );
  }
  
  const { invoices, totalCount } = result.data;

  // إحصائيات سريعة
  const totalInvoices = invoices.length;
  const revenueInvoices = invoices.filter(inv => inv.type === 'revenue').length;
  const expenseInvoices = invoices.filter(inv => inv.type === 'expense').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { color: 'bg-green-500', text: 'مدفوعة' },
      pending: { color: 'bg-yellow-500', text: 'معلقة' },
      overdue: { color: 'bg-red-500', text: 'متأخرة' },
      cancelled: { color: 'bg-gray-500', text: 'ملغاة' }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="text-blue-500" />
          إدارة الفواتير
        </h1>
        <p className="text-gray-400 mt-2">
          عرض وإدارة جميع فواتير المؤسسة
        </p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-blue-400">{totalInvoices}</p>
            </div>
            <FileText className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">فواتير الإيرادات</p>
              <p className="text-2xl font-bold text-green-400">{revenueInvoices}</p>
            </div>
            <TrendingUp className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">فواتير المصروفات</p>
              <p className="text-2xl font-bold text-red-400">{expenseInvoices}</p>
            </div>
            <DollarSign className="text-red-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">معلقة</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingInvoices}</p>
            </div>
            <AlertCircle className="text-yellow-400" size={24} />
          </div>
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">آخر الفواتير</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">رقم الفاتورة</th>
                <th className="text-right p-4 text-gray-300">النوع</th>
                <th className="text-right p-4 text-gray-300">الفرع</th>
                <th className="text-right p-4 text-gray-300">المبلغ</th>
                <th className="text-right p-4 text-gray-300">الحالة</th>
                <th className="text-right p-4 text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      invoice.type === 'revenue' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {invoice.type === 'revenue' ? 'إيراد' : 'مصروف'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{invoice.branchId?.name || 'غير محدد'}</td>
                  <td className="p-4 font-semibold">{formatCurrency(invoice.totalInvoice)}</td>
                  <td className="p-4">{getStatusBadge(invoice.status)}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}