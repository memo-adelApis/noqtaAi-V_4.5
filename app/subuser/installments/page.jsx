import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Calendar, DollarSign, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { getSubuserInvoicesWithPendingInstallments } from '@/app/actions/subuserActions';
import SubuserInstallmentActions from '@/components/subuser/InstallmentActions';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default async function SubuserInstallmentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !['subuser', 'manager', 'employee'].includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">غير مصرح بالوصول</h2>
          <p className="text-gray-400">هذه الصفحة مخصصة للموظفين فقط</p>
        </div>
      </div>
    );
  }

  const result = await getSubuserInvoicesWithPendingInstallments();
  
  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في تحميل الأقساط</h2>
          <p className="text-gray-400">{result.error}</p>
        </div>
      </div>
    );
  }
  
  const { invoices, stats } = result.data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      overdue: { color: 'bg-red-500', text: 'متأخر', icon: AlertTriangle },
      due_soon: { color: 'bg-yellow-500', text: 'مستحق قريباً', icon: Clock },
      current: { color: 'bg-blue-500', text: 'جاري', icon: Calendar }
    };
    
    const badge = badges[status] || badges.current;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const getInstallmentStatusBadge = (installment) => {
    const today = new Date();
    const dueDate = new Date(installment.dueDate);
    const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (installment.status === 'paid') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-green-500">
        <CheckCircle size={12} />
        مدفوع
      </span>;
    }
    
    if (daysDiff < 0) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-red-500">
        <AlertTriangle size={12} />
        متأخر {Math.abs(daysDiff)} يوم
      </span>;
    }
    
    if (daysDiff <= 7) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-yellow-500">
        <Clock size={12} />
        مستحق خلال {daysDiff} يوم
      </span>;
    }
    
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500">
      <Calendar size={12} />
      مستحق في {formatDate(installment.dueDate)}
    </span>
  };

  // الفواتير مفلترة مسبقاً حسب فرع الموظف من الدالة
  const branchInvoices = invoices;

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="text-blue-500" />
          الأقساط المتبقية - {session.user.branchName || 'الفرع'}
        </h1>
        <p className="text-gray-400 mt-2">
          متابعة وإدارة الأقساط المستحقة والمتأخرة في فرعك
        </p>
      </div>

      {/* إحصائيات سريعة للفرع */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">فواتير الفرع</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalInvoices}</p>
            </div>
            <Calendar className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المبلغ المتبقي</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(stats.totalPendingAmount)}
              </p>
            </div>
            <DollarSign className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">أقساط متأخرة</p>
              <p className="text-2xl font-bold text-red-400">
                {stats.overdueCount}
              </p>
            </div>
            <AlertTriangle className="text-red-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">مستحقة قريباً</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.dueSoonCount}
              </p>
            </div>
            <Clock className="text-yellow-400" size={24} />
          </div>
        </div>
      </div>

      {/* قائمة الفواتير والأقساط */}
      <div className="space-y-6">
        {branchInvoices.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-green-500 mb-2">ممتاز!</h3>
            <p className="text-gray-400">لا توجد أقساط متبقية في فرعك حالياً</p>
          </div>
        ) : (
          branchInvoices.map((invoice) => (
            <div key={invoice._id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {/* رأس الفاتورة */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      فاتورة رقم: {invoice.invoiceNumber}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span>النوع: {invoice.type === 'revenue' ? 'إيراد' : 'مصروف'}</span>
                      <span>
                        {invoice.type === 'revenue' ? 'العميل' : 'المورد'}: {
                          invoice.customerId?.name || invoice.supplierId?.name || 'غير محدد'
                        }
                      </span>
                      <span>التاريخ: {formatDate(invoice.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(invoice.overdueStatus)}
                    <div className="text-right">
                      <p className="text-sm text-gray-400">المبلغ المتبقي</p>
                      <p className="text-lg font-bold text-green-400">
                        {formatCurrency(invoice.totalPendingAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* جدول الأقساط */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-right p-4 text-gray-300">رقم القسط</th>
                      <th className="text-right p-4 text-gray-300">المبلغ</th>
                      <th className="text-right p-4 text-gray-300">تاريخ الاستحقاق</th>
                      <th className="text-right p-4 text-gray-300">الحالة</th>
                      <th className="text-center p-4 text-gray-300">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.pendingInstallments.map((installment, index) => (
                      <tr key={installment._id || index} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-4 font-mono text-sm">#{index + 1}</td>
                        <td className="p-4 font-semibold">{formatCurrency(installment.amount)}</td>
                        <td className="p-4 text-sm">{formatDate(installment.dueDate)}</td>
                        <td className="p-4">{getInstallmentStatusBadge(installment)}</td>
                        <td className="p-4 text-center">
                          <SubuserInstallmentActions 
                            invoiceId={invoice._id}
                            installment={installment}
                            installmentIndex={index}
                            invoiceNumber={invoice.invoiceNumber}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </>
  );
}