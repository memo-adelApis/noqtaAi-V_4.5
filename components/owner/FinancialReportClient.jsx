"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Download, TrendingUp, DollarSign, FileText, Users, ChevronDown, ChevronUp } from "lucide-react";
import ExportFinancialReportButton from "./ExportFinancialReportButton";

export default function FinancialReportClient({ userId }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [monthlyData, setMonthlyData] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState(null);

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 'all', label: 'جميع الأشهر' },
    { value: '1', label: 'يناير' },
    { value: '2', label: 'فبراير' },
    { value: '3', label: 'مارس' },
    { value: '4', label: 'أبريل' },
    { value: '5', label: 'مايو' },
    { value: '6', label: 'يونيو' },
    { value: '7', label: 'يوليو' },
    { value: '8', label: 'أغسطس' },
    { value: '9', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching financial report:', { year: selectedYear, month: selectedMonth });
      const response = await fetch(`/api/owner/financial-report?year=${selectedYear}&month=${selectedMonth}`);
      const data = await response.json();
      
      console.log('Financial Report Response:', {
        success: data.success,
        monthlyDataCount: data.monthlyData?.length || 0,
        invoicesCount: data.invoices?.length || 0,
        employeeStatsCount: data.employeeStats?.length || 0
      });
      
      if (data.monthlyData && data.monthlyData.length > 0) {
        console.log('Sample Monthly Data:', data.monthlyData[0]);
      }
      
      setMonthlyData(data.monthlyData || []);
      setInvoices(data.invoices || []);
      setEmployeeStats(data.employeeStats || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0) + ' ج.م';
  };

  const toggleMonth = (monthIndex) => {
    setExpandedMonth(expandedMonth === monthIndex ? null : monthIndex);
  };

  const getMonthInvoices = (monthNumber) => {
    return invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate.getMonth() + 1 === monthNumber;
    });
  };

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-blue-500" />
            التقرير المالي المفصل
          </h1>
          <p className="text-gray-400 mt-2">
            تحليل شامل للأداء المالي مع إمكانية التصفية والتصدير
          </p>
        </div>

        <ExportFinancialReportButton 
          data={{
            year: selectedYear,
            month: selectedMonth,
            monthlyData,
            invoices,
            employeeStats,
            totalRevenue,
            totalExpenses,
            totalProfit
          }}
          filename={`التقرير_المالي_${selectedYear}${selectedMonth !== 'all' ? `_${selectedMonth}` : ''}`}
        />
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} />
            <span className="text-gray-400">الفلاتر:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">السنة:</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">الشهر:</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalExpenses)}</p>
            </div>
            <DollarSign className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">صافي الربح</p>
              <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
            <TrendingUp className={totalProfit >= 0 ? 'text-blue-400' : 'text-red-400'} size={32} />
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {monthlyData.length === 0 && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <FileText className="text-yellow-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">لا توجد بيانات للفترة المحددة</h3>
              <p className="text-gray-400 mb-2">
                لم يتم العثور على فواتير للسنة {selectedYear}
                {selectedMonth !== 'all' && ` - ${months.find(m => m.value === selectedMonth)?.label}`}
              </p>
              <p className="text-sm text-gray-500">
                تأكد من:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 mt-1 space-y-1">
                <li>وجود فواتير مسجلة في النظام</li>
                <li>أن الفواتير مرتبطة بالمشترك الصحيح</li>
                <li>اختيار السنة والشهر الصحيحين</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Data Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="text-blue-500" />
            البيانات الشهرية
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">الشهر</th>
                <th className="text-right p-4 text-gray-300">الإيرادات</th>
                <th className="text-right p-4 text-gray-300">المصروفات</th>
                <th className="text-right p-4 text-gray-300">الربح/الخسارة</th>
                <th className="text-right p-4 text-gray-300">هامش الربح</th>
                <th className="text-right p-4 text-gray-300">عدد الفواتير</th>
                <th className="text-center p-4 text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => {
                const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0;
                const monthInvoices = getMonthInvoices(data.month);
                const isExpanded = expandedMonth === data.month;
                
                return (
                  <React.Fragment key={data.month}>
                    <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4 font-medium">{data.monthName}</td>
                      <td className="p-4 font-semibold text-green-400">{formatCurrency(data.revenue)}</td>
                      <td className="p-4 font-semibold text-red-400">{formatCurrency(data.expenses)}</td>
                      <td className={`p-4 font-semibold ${data.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {formatCurrency(data.profit)}
                      </td>
                      <td className={`p-4 font-semibold ${margin >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                        {margin}%
                      </td>
                      <td className="p-4 text-gray-400">{monthInvoices.length}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleMonth(data.month)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>
                    
                    {isExpanded && monthInvoices.length > 0 && (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <div className="bg-gray-800/50 p-4">
                            <h4 className="text-sm font-semibold mb-3 text-gray-300">فواتير {data.monthName}</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-700">
                                  <tr>
                                    <th className="text-right p-2 text-gray-300">رقم الفاتورة</th>
                                    <th className="text-right p-2 text-gray-300">النوع</th>
                                    <th className="text-right p-2 text-gray-300">الفرع</th>
                                    <th className="text-right p-2 text-gray-300">المبلغ</th>
                                    <th className="text-right p-2 text-gray-300">الحالة</th>
                                    <th className="text-right p-2 text-gray-300">التاريخ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {monthInvoices.map((invoice) => (
                                    <tr key={invoice._id} className="border-b border-gray-700">
                                      <td className="p-2 font-mono">{invoice.invoiceNumber}</td>
                                      <td className="p-2">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                          invoice.type === 'revenue' 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                          {invoice.type === 'revenue' ? 'إيراد' : 'مصروف'}
                                        </span>
                                      </td>
                                      <td className="p-2 text-gray-400">{invoice.branchName || 'غير محدد'}</td>
                                      <td className="p-2 font-semibold">{formatCurrency(invoice.totalInvoice)}</td>
                                      <td className="p-2">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                          invoice.status === 'paid' 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : invoice.status === 'pending'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                          {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'pending' ? 'معلقة' : 'متأخرة'}
                                        </span>
                                      </td>
                                      <td className="p-2 text-gray-400">
                                        {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Performance */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="text-purple-500" />
            مقارنة أداء الفروع
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">الفرع</th>
                <th className="text-right p-4 text-gray-300">عدد الفواتير</th>
                <th className="text-right p-4 text-gray-300">إجمالي الإيرادات</th>
                <th className="text-right p-4 text-gray-300">إجمالي المصروفات</th>
                <th className="text-right p-4 text-gray-300">صافي المساهمة</th>
                <th className="text-right p-4 text-gray-300">الأداء</th>
              </tr>
            </thead>
            <tbody>
              {employeeStats.map((branch, index) => {
                const maxContribution = Math.max(...employeeStats.map(e => e.contribution));
                const performance = maxContribution > 0 ? (branch.contribution / maxContribution) * 100 : 0;
                
                return (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium">{branch.name || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-blue-400">{branch.invoiceCount}</td>
                    <td className="p-4 font-semibold text-green-400">{formatCurrency(branch.revenue)}</td>
                    <td className="p-4 font-semibold text-red-400">{formatCurrency(branch.expenses)}</td>
                    <td className={`p-4 font-semibold ${branch.contribution >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatCurrency(branch.contribution)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${branch.contribution >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${performance}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400 min-w-[40px]">
                          {performance.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {employeeStats.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    لا توجد بيانات فروع للفترة المحددة
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
