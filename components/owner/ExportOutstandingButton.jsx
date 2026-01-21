"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportOutstandingButton({ data, filename }) {
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
    
    // ورقة الإحصائيات
    const statsData = [
      ['تقرير المستحقات'],
      [],
      ['الإحصائيات الرئيسية'],
      ['البيان', 'القيمة'],
      ['مستحقات لنا', formatCurrency(data.totalReceivables) + ' ج.م'],
      ['عدد فواتير المستحقات لنا', data.receivablesCount],
      ['مستحقات علينا', formatCurrency(data.totalPayables) + ' ج.م'],
      ['عدد فواتير المستحقات علينا', data.payablesCount],
      ['صافي المستحقات', formatCurrency(data.netOutstanding) + ' ج.م'],
      ['فواتير متأخرة (+30 يوم)', data.overdueCount],
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsSheet, 'الإحصائيات');
    
    // ورقة المستحقات لنا
    if (data.receivables && data.receivables.length > 0) {
      const receivablesHeaders = [['رقم الفاتورة', 'العميل', 'الفرع', 'إجمالي الفاتورة (ج.م)', 'المدفوع (ج.م)', 'المتبقي (ج.م)', 'الأيام', 'التاريخ']];
      const receivablesRows = data.receivables.map(inv => [
        inv.invoiceNumber,
        inv.customerName,
        inv.branchName,
        formatCurrency(inv.total),
        formatCurrency(inv.paid),
        formatCurrency(inv.balance),
        inv.daysOverdue,
        inv.date
      ]);
      
      const receivablesSheet = XLSX.utils.aoa_to_sheet([...receivablesHeaders, ...receivablesRows]);
      XLSX.utils.book_append_sheet(wb, receivablesSheet, 'مستحقات لنا');
    }
    
    // ورقة المستحقات علينا
    if (data.payables && data.payables.length > 0) {
      const payablesHeaders = [['رقم الفاتورة', 'المورد', 'الفرع', 'إجمالي الفاتورة (ج.م)', 'المدفوع (ج.م)', 'المتبقي (ج.م)', 'الأيام', 'التاريخ']];
      const payablesRows = data.payables.map(inv => [
        inv.invoiceNumber,
        inv.supplierName,
        inv.branchName,
        formatCurrency(inv.total),
        formatCurrency(inv.paid),
        formatCurrency(inv.balance),
        inv.daysOverdue,
        inv.date
      ]);
      
      const payablesSheet = XLSX.utils.aoa_to_sheet([...payablesHeaders, ...payablesRows]);
      XLSX.utils.book_append_sheet(wb, payablesSheet, 'مستحقات علينا');
    }
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToCSV = () => {
    let csvContent = "\uFEFF";
    
    csvContent += "تقرير المستحقات\n\n";
    
    csvContent += "الإحصائيات الرئيسية\n";
    csvContent += "البيان,القيمة\n";
    csvContent += `مستحقات لنا,${formatCurrency(data.totalReceivables)} ج.م\n`;
    csvContent += `عدد فواتير المستحقات لنا,${data.receivablesCount}\n`;
    csvContent += `مستحقات علينا,${formatCurrency(data.totalPayables)} ج.م\n`;
    csvContent += `عدد فواتير المستحقات علينا,${data.payablesCount}\n`;
    csvContent += `صافي المستحقات,${formatCurrency(data.netOutstanding)} ج.م\n`;
    csvContent += `فواتير متأخرة (+30 يوم),${data.overdueCount}\n\n`;
    
    if (data.receivables && data.receivables.length > 0) {
      csvContent += "المستحقات لنا (من العملاء)\n";
      csvContent += "رقم الفاتورة,العميل,الفرع,إجمالي الفاتورة (ج.م),المدفوع (ج.م),المتبقي (ج.م),الأيام,التاريخ\n";
      data.receivables.forEach(inv => {
        csvContent += `${inv.invoiceNumber},${inv.customerName},${inv.branchName},${formatCurrency(inv.total)},${formatCurrency(inv.paid)},${formatCurrency(inv.balance)},${inv.daysOverdue},${inv.date}\n`;
      });
      csvContent += "\n";
    }
    
    if (data.payables && data.payables.length > 0) {
      csvContent += "المستحقات علينا (للموردين)\n";
      csvContent += "رقم الفاتورة,المورد,الفرع,إجمالي الفاتورة (ج.م),المدفوع (ج.م),المتبقي (ج.م),الأيام,التاريخ\n";
      data.payables.forEach(inv => {
        csvContent += `${inv.invoiceNumber},${inv.supplierName},${inv.branchName},${formatCurrency(inv.total)},${formatCurrency(inv.paid)},${formatCurrency(inv.balance)},${inv.daysOverdue},${inv.date}\n`;
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
