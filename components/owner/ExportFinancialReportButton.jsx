"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportFinancialReportButton({ data, filename }) {
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    
    try {
      try {
        const XLSX = await import('xlsx');
        exportWithXLSX(XLSX);
      } catch (error) {
        exportToCSV();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportWithXLSX = (XLSX) => {
    const wb = XLSX.utils.book_new();
    
    // ورقة الملخص
    const summaryData = [
      ['التقرير المالي المفصل'],
      ['السنة: ' + data.year + (data.month !== 'all' ? ' - الشهر: ' + data.month : '')],
      [],
      ['الملخص المالي'],
      ['البيان', 'القيمة'],
      ['إجمالي الإيرادات', formatCurrency(data.totalRevenue) + ' ج.م'],
      ['إجمالي المصروفات', formatCurrency(data.totalExpenses) + ' ج.م'],
      ['صافي الربح', formatCurrency(data.totalProfit) + ' ج.م'],
      ['هامش الربح', data.totalRevenue > 0 ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1) + '%' : '0%'],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'الملخص');
    
    // ورقة البيانات الشهرية
    const monthlyHeaders = [['الشهر', 'الإيرادات (ج.م)', 'المصروفات (ج.م)', 'الربح/الخسارة (ج.م)', 'هامش الربح (%)', 'عدد الفواتير']];
    const monthlyRows = data.monthlyData.map(month => {
      const margin = month.revenue > 0 ? ((month.profit / month.revenue) * 100).toFixed(1) : 0;
      const invoiceCount = data.invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate.getMonth() + 1 === month.month;
      }).length;
      
      return [
        month.monthName,
        formatCurrency(month.revenue),
        formatCurrency(month.expenses),
        formatCurrency(month.profit),
        margin,
        invoiceCount
      ];
    });
    
    const monthlySheet = XLSX.utils.aoa_to_sheet([...monthlyHeaders, ...monthlyRows]);
    XLSX.utils.book_append_sheet(wb, monthlySheet, 'البيانات الشهرية');
    
    // ورقة الفواتير
    if (data.invoices && data.invoices.length > 0) {
      const invoicesHeaders = [['رقم الفاتورة', 'النوع', 'الفرع', 'المبلغ (ج.م)', 'الحالة', 'التاريخ']];
      const invoicesRows = data.invoices.map(inv => [
        inv.invoiceNumber,
        inv.type === 'revenue' ? 'إيراد' : 'مصروف',
        inv.branchName || 'غير محدد',
        formatCurrency(inv.totalInvoice),
        inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة',
        new Date(inv.createdAt).toLocaleDateString('en-GB')
      ]);
      
      const invoicesSheet = XLSX.utils.aoa_to_sheet([...invoicesHeaders, ...invoicesRows]);
      XLSX.utils.book_append_sheet(wb, invoicesSheet, 'الفواتير');
    }
    
    // ورقة أداء الموظفين
    if (data.employeeStats && data.employeeStats.length > 0) {
      const employeeHeaders = [['الموظف', 'الفرع', 'عدد الفواتير', 'الإيرادات (ج.م)', 'المصروفات (ج.م)', 'صافي المساهمة (ج.م)']];
      const employeeRows = data.employeeStats.map(emp => [
        emp.name,
        emp.branchName || 'غير محدد',
        emp.invoiceCount,
        formatCurrency(emp.revenue),
        formatCurrency(emp.expenses),
        formatCurrency(emp.contribution)
      ]);
      
      const employeeSheet = XLSX.utils.aoa_to_sheet([...employeeHeaders, ...employeeRows]);
      XLSX.utils.book_append_sheet(wb, employeeSheet, 'أداء الموظفين');
    }
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToCSV = () => {
    let csvContent = "\uFEFF";
    
    csvContent += "التقرير المالي المفصل\n";
    csvContent += `السنة: ${data.year}${data.month !== 'all' ? ` - الشهر: ${data.month}` : ''}\n\n`;
    
    csvContent += "الملخص المالي\n";
    csvContent += "البيان,القيمة\n";
    csvContent += `إجمالي الإيرادات,${formatCurrency(data.totalRevenue)} ج.م\n`;
    csvContent += `إجمالي المصروفات,${formatCurrency(data.totalExpenses)} ج.م\n`;
    csvContent += `صافي الربح,${formatCurrency(data.totalProfit)} ج.م\n`;
    csvContent += `هامش الربح,${data.totalRevenue > 0 ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1) : '0'}%\n\n`;
    
    csvContent += "البيانات الشهرية\n";
    csvContent += "الشهر,الإيرادات (ج.م),المصروفات (ج.م),الربح/الخسارة (ج.م),هامش الربح (%),عدد الفواتير\n";
    data.monthlyData.forEach(month => {
      const margin = month.revenue > 0 ? ((month.profit / month.revenue) * 100).toFixed(1) : 0;
      const invoiceCount = data.invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate.getMonth() + 1 === month.month;
      }).length;
      
      csvContent += `${month.monthName},${formatCurrency(month.revenue)},${formatCurrency(month.expenses)},${formatCurrency(month.profit)},${margin},${invoiceCount}\n`;
    });
    csvContent += "\n";
    
    if (data.invoices && data.invoices.length > 0) {
      csvContent += "الفواتير\n";
      csvContent += "رقم الفاتورة,النوع,الفرع,المبلغ (ج.م),الحالة,التاريخ\n";
      data.invoices.forEach(inv => {
        csvContent += `${inv.invoiceNumber},${inv.type === 'revenue' ? 'إيراد' : 'مصروف'},${inv.branchName || 'غير محدد'},${formatCurrency(inv.totalInvoice)},${inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة'},${new Date(inv.createdAt).toLocaleDateString('en-GB')}\n`;
      });
      csvContent += "\n";
    }
    
    if (data.employeeStats && data.employeeStats.length > 0) {
      csvContent += "أداء الموظفين\n";
      csvContent += "الموظف,الفرع,عدد الفواتير,الإيرادات (ج.م),المصروفات (ج.م),صافي المساهمة (ج.م)\n";
      data.employeeStats.forEach(emp => {
        csvContent += `${emp.name},${emp.branchName || 'غير محدد'},${emp.invoiceCount},${formatCurrency(emp.revenue)},${formatCurrency(emp.expenses)},${formatCurrency(emp.contribution)}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={isExporting}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
    >
      <Download size={20} className={isExporting ? 'animate-bounce' : ''} />
      {isExporting ? 'جاري التحميل...' : 'تحميل التقرير (Excel)'}
    </button>
  );
}
