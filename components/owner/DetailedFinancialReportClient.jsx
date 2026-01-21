"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  CreditCard,
  PieChart,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import InstallmentPaymentModal from './InstallmentPaymentModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DetailedFinancialReportClient({ 
  financialData, 
  installmentData, 
  initialFilters 
}) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // تحديث URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    
    router.push(`/owner/financial-report-detailed?${params.toString()}`);
  };

  const handlePaymentClick = (installment) => {
    setSelectedInstallment(installment);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    // إعادة تحميل الصفحة لتحديث البيانات
    router.refresh();
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { color: 'bg-green-100 text-green-800', text: 'مدفوع', icon: CheckCircle },
      pending: { color: 'bg-blue-100 text-blue-800', text: 'معلق', icon: Clock },
      overdue: { color: 'bg-red-100 text-red-800', text: 'متأخر', icon: AlertTriangle }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      
      {/* رأس الصفحة */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <PieChart className="text-blue-600" />
            التقرير المالي المفصل
          </h1>
          <p className="text-gray-600 mt-2">
            تحليل دقيق للأرباح والمصروفات مع تفصيل الأقساط والمديونية
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            تحديث
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={16} />
            تصدير
          </button>
        </div>
      </div>

      {/* فلاتر البحث */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">فلاتر التقرير</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفرع</label>
            <select
              value={filters.branchId}
              onChange={(e) => handleFilterChange('branchId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الفروع</option>
              {/* يمكن إضافة قائمة الفروع هنا */}
            </select>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: PieChart },
              { id: 'revenue', label: 'الإيرادات', icon: TrendingUp },
              { id: 'expense', label: 'المصروفات', icon: TrendingDown },
              { id: 'installments', label: 'الأقساط', icon: Calendar },
              { id: 'credit', label: 'الائتمان', icon: CreditCard }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* نظرة عامة */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* البطاقات الرئيسية */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* صافي الأرباح المدفوعة فعلياً */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">صافي الأرباح المدفوعة</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(financialData.netProfit.actualPaid)}
                      </p>
                    </div>
                    <DollarSign size={32} className="text-green-200" />
                  </div>
                </div>

                {/* الأرباح الآجلة (مستحق لي) */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">أرباح آجلة (مستحق لي)</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(financialData.debtAnalysis.profitsDeferred)}
                      </p>
                    </div>
                    <TrendingUp size={32} className="text-blue-200" />
                  </div>
                </div>

                {/* المديونية (مستحق عليا) */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">مديونية (مستحق عليا)</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(financialData.debtAnalysis.debtOnUs)}
                      </p>
                    </div>
                    <TrendingDown size={32} className="text-red-200" />
                  </div>
                </div>

                {/* صافي المركز المالي */}
                <div className={`bg-gradient-to-r p-6 rounded-xl text-white ${
                  financialData.debtAnalysis.netDebtPosition >= 0 
                    ? 'from-emerald-500 to-emerald-600' 
                    : 'from-orange-500 to-orange-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${
                        financialData.debtAnalysis.netDebtPosition >= 0 
                          ? 'text-emerald-100' 
                          : 'text-orange-100'
                      }`}>صافي المركز المالي</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(Math.abs(financialData.debtAnalysis.netDebtPosition))}
                      </p>
                      <p className="text-xs mt-1">
                        {financialData.debtAnalysis.netDebtPosition >= 0 ? 'في صالحنا' : 'علينا'}
                      </p>
                    </div>
                    <AlertTriangle size={32} className={
                      financialData.debtAnalysis.netDebtPosition >= 0 
                        ? 'text-emerald-200' 
                        : 'text-orange-200'
                    } />
                  </div>
                </div>
              </div>

              {/* تفاصيل الإيرادات والمصروفات */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* الإيرادات */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-green-600" size={20} />
                    تفاصيل الإيرادات
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">إجمالي المفوتر:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(financialData.revenue.totalInvoiced)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">المدفوع فعلياً:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(financialData.revenue.totalPaid)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">المعلق (أقساط + ائتمان):</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(financialData.revenue.totalPending)}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">نسبة التحصيل:</span>
                        <span className="font-medium text-blue-600">
                          {financialData.percentages.revenuePaidPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* المصروفات */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="text-red-600" size={20} />
                    تفاصيل المصروفات
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">إجمالي المفوتر:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(financialData.expense.totalInvoiced)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">المدفوع فعلياً:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(financialData.expense.totalPaid)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">المعلق (أقساط + ائتمان):</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(financialData.expense.totalPending)}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">نسبة السداد:</span>
                        <span className="font-medium text-blue-600">
                          {financialData.percentages.expensePaidPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* إحصائيات الأقساط */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  تحليل الأقساط
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {financialData.installmentAnalysis.totalInstallments}
                    </div>
                    <div className="text-sm text-gray-600">إجمالي الأقساط</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {financialData.installmentAnalysis.paidInstallments}
                    </div>
                    <div className="text-sm text-gray-600">مدفوعة</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {financialData.installmentAnalysis.pendingInstallments}
                    </div>
                    <div className="text-sm text-gray-600">معلقة</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {financialData.installmentAnalysis.overdueInstallments}
                    </div>
                    <div className="text-sm text-gray-600">متأخرة</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تبويب الأقساط */}
          {activeTab === 'installments' && (
            <div className="space-y-6">
              
              {/* إحصائيات الأقساط المحدثة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* الأقساط المستحقة لي (الإيرادات) */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    الأقساط المستحقة لي (أرباح آجلة)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatCurrency(financialData.revenue.installments.pending + financialData.revenue.installments.overdue)}
                      </div>
                      <div className="text-sm text-blue-100">إجمالي المستحق</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-200">
                        {installmentData.installments.filter(inst => inst.invoiceType === 'revenue' && inst.status !== 'paid').length}
                      </div>
                      <div className="text-sm text-blue-100">عدد الأقساط</div>
                    </div>
                  </div>
                </div>

                {/* الأقساط المستحقة عليا (المصروفات) */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingDown size={20} />
                    الأقساط المستحقة عليا (مديونية)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatCurrency(financialData.expense.installments.pending + financialData.expense.installments.overdue)}
                      </div>
                      <div className="text-sm text-red-100">إجمالي المستحق</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-200">
                        {installmentData.installments.filter(inst => inst.invoiceType === 'expense' && inst.status !== 'paid').length}
                      </div>
                      <div className="text-sm text-red-100">عدد الأقساط</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* إحصائيات تفصيلية */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="text-2xl font-bold text-blue-600">
                    {installmentData.stats.total}
                  </div>
                  <div className="text-sm text-blue-700">إجمالي الأقساط</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(installmentData.stats.paidAmount)}
                  </div>
                  <div className="text-sm text-green-700">المدفوع</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(installmentData.stats.pendingAmount)}
                  </div>
                  <div className="text-sm text-orange-700">المعلق</div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <div className="text-2xl font-bold text-red-600">
                    {installmentData.stats.overdue}
                  </div>
                  <div className="text-sm text-red-700">متأخرة</div>
                </div>
              </div>

              {/* جدول الأقساط المحدث */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          النوع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الفاتورة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العميل/المورد
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاريخ الاستحقاق
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {installmentData.installments.slice(0, 20).map((installment, index) => (
                        <tr 
                          key={`${installment.invoiceId}-${installment.installmentIndex}`} 
                          className={`hover:bg-gray-50 ${
                            installment.invoiceType === 'revenue' 
                              ? 'border-r-4 border-blue-400 bg-blue-50/30' 
                              : 'border-r-4 border-red-400 bg-red-50/30'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              installment.invoiceType === 'revenue' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {installment.invoiceType === 'revenue' ? (
                                <>
                                  <TrendingUp size={12} />
                                  مستحق لي
                                </>
                              ) : (
                                <>
                                  <TrendingDown size={12} />
                                  مستحق عليا
                                </>
                              )}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {installment.invoiceNumber}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{installment.client}</div>
                            {installment.clientPhone && (
                              <div className="text-sm text-gray-500">{installment.clientPhone}</div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(installment.amount)}
                            </div>
                            {installment.paidAmount > 0 && (
                              <div className="text-sm text-green-600">
                                مدفوع: {formatCurrency(installment.paidAmount)}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(installment.dueDate)}
                            </div>
                            {installment.daysDiff < 0 && (
                              <div className="text-sm text-red-600">
                                متأخر {Math.abs(installment.daysDiff)} يوم
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(installment.status)}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {installment.status !== 'paid' && (
                              <button 
                                onClick={() => handlePaymentClick(installment)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                              >
                                تسجيل دفع
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {installmentData.installments.length > 20 && (
                  <div className="bg-gray-50 px-6 py-3 text-center">
                    <span className="text-sm text-gray-600">
                      عرض 20 من {installmentData.installments.length} قسط
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* باقي التبويبات يمكن إضافتها لاحقاً */}
          {activeTab !== 'overview' && activeTab !== 'installments' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <PieChart size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
              <p className="text-gray-500">سيتم إضافة هذا القسم قريباً</p>
            </div>
          )}
        </div>
      </div>

      {/* معلومات التقرير */}
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          تم إنشاء التقرير في: {formatDate(financialData.generatedAt)}
        </p>
      </div>

      {/* نافذة تسجيل الدفع */}
      <InstallmentPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        installment={selectedInstallment}
        onSuccess={handlePaymentSuccess}
      />

      {/* Toast Container */}
      <ToastContainer position="top-center" rtl />
    </div>
  );
}