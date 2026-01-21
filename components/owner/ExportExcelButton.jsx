"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportExcelButton({ data, filename, year }) {
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
      // محاولة استخدام مكتبة xlsx إذا كانت متوفرة
      try {
        const XLSX = await import('xlsx');
        exportWithXLSX(XLSX);
      } catch (error) {
        // إذا لم تكن المكتبة متوفرة، استخدم CSV
        exportToCSV();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportWithXLSX = (XLSX) => {
    // إنشاء workbook
    const wb = XLSX.utils.book_new();
    
    // ورقة الإحصائيات الرئيسية
    const statsData = [
      ['تقرير الأرباح - ' + year],
      [],
      ['الإحصائيات الرئيسية'],
      ['البيان', 'القيمة'],
      ['إجمالي الإيرادات', formatCurrency(data.totalRevenue) + ' ج.م'],
      ['إجمالي المصروفات', formatCurrency(data.totalExpenses) + ' ج.م'],
      ['صافي الربح', formatCurrency(data.totalProfit) + ' ج.م'],
      ['هامش الربح', data.profitMargin.toFixed(2) + '%'],
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsSheet, 'الإحصائيات');
    
    // ورقة البيانات الشهرية
    const monthlyHeaders = [['الشهر', 'الإيرادات (ج.م)', 'المصروفات (ج.م)', 'الربح/الخسارة (ج.م)', 'هامش الربح (%)']];
    const monthlyRows = data.monthlyData.map(month => {
      const margin = month.revenue > 0 ? ((month.profit / month.revenue) * 100).toFixed(1) : 0;
      return [
        month.monthName,
        formatCurrency(month.revenue),
        formatCurrency(month.expenses),
        formatCurrency(month.profit),
        margin
      ];
    });
    
    // إضافة صف الإجمالي
    monthlyRows.push([
      'الإجمالي',
      formatCurrency(data.totalRevenue),
      formatCurrency(data.totalExpenses),
      formatCurrency(data.totalProfit),
      data.profitMargin.toFixed(1)
    ]);
    
    const monthlySheet = XLSX.utils.aoa_to_sheet([...monthlyHeaders, ...monthlyRows]);
    XLSX.utils.book_append_sheet(wb, monthlySheet, 'البيانات الشهرية');
    
    // ورقة الأرباح حسب الفرع
    if (data.branchProfits && data.branchProfits.length > 0) {
      const branchHeaders = [['الفرع', 'الإيرادات (ج.م)', 'المصروفات (ج.م)', 'الربح (ج.م)']];
      const branchRows = data.branchProfits.map(branch => [
        branch.name,
        formatCurrency(branch.revenue),
        formatCurrency(branch.expenses),
        formatCurrency(branch.profit)
      ]);
      
      const branchSheet = XLSX.utils.aoa_to_sheet([...branchHeaders, ...branchRows]);
      XLSX.utils.book_append_sheet(wb, branchSheet, 'الأرباح حسب الفرع');
    }
    
    // تحميل الملف
    XLSX.writeFile(wb, `${filename}_${year}.xlsx`);
  };

  const exportToCSV = () => {
    // إنشاء محتوى CSV (يمكن فتحه في Excel)
    let csvContent = "\uFEFF"; // BOM for UTF-8
    
    // العنوان
    csvContent += `تقرير الأرباح - ${year}\n\n`;
    
    // الإحصائيات الرئيسية
    csvContent += "الإحصائيات الرئيسية\n";
    csvContent += "البيان,القيمة\n";
    csvContent += `إجمالي الإيرادات,${formatCurrency(data.totalRevenue)} ج.م\n`;
    csvContent += `إجمالي المصروفات,${formatCurrency(data.totalExpenses)} ج.م\n`;
    csvContent += `صافي الربح,${formatCurrency(data.totalProfit)} ج.م\n`;
    csvContent += `هامش الربح,${data.profitMargin.toFixed(2)}%\n\n`;
    
    // البيانات الشهرية
    csvContent += "التفاصيل الشهرية\n";
    csvContent += "الشهر,الإيرادات (ج.م),المصروفات (ج.م),الربح/الخسارة (ج.م),هامش الربح (%)\n";
    
    data.monthlyData.forEach(month => {
      const margin = month.revenue > 0 ? ((month.profit / month.revenue) * 100).toFixed(1) : 0;
      csvContent += `${month.monthName},${formatCurrency(month.revenue)},${formatCurrency(month.expenses)},${formatCurrency(month.profit)},${margin}\n`;
    });
    
    // صف الإجمالي
    csvContent += `الإجمالي,${formatCurrency(data.totalRevenue)},${formatCurrency(data.totalExpenses)},${formatCurrency(data.totalProfit)},${data.profitMargin.toFixed(1)}\n`;
    
    // الأرباح حسب الفرع
    if (data.branchProfits && data.branchProfits.length > 0) {
      csvContent += "\nالأرباح حسب الفرع\n";
      csvContent += "الفرع,الإيرادات (ج.م),المصروفات (ج.م),الربح (ج.م)\n";
      
      data.branchProfits.forEach(branch => {
        csvContent += `${branch.name},${formatCurrency(branch.revenue)},${formatCurrency(branch.expenses)},${formatCurrency(branch.profit)}\n`;
      });
    }
    
    // إنشاء Blob وتحميله
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${year}.csv`);
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
