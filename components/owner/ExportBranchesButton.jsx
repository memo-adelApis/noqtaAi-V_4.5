"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportBranchesButton({ data, filename }) {
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
      ['تقرير الفروع'],
      [],
      ['الإحصائيات العامة'],
      ['البيان', 'القيمة'],
      ['عدد الفروع', data.totalBranches],
      ['إجمالي الإيرادات', formatCurrency(data.totalRevenue) + ' ج.م'],
      ['صافي الأرباح', formatCurrency(data.totalProfit) + ' ج.م'],
      ['إجمالي المخازن', data.totalStores],
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsSheet, 'الإحصائيات');
    
    // ورقة تفاصيل الفروع
    const branchHeaders = [['الفرع', 'الإيرادات (ج.م)', 'المصروفات (ج.م)', 'الربح (ج.م)', 'هامش الربح (%)', 'الفواتير', 'المخازن', 'المستحقات (ج.م)']];
    const branchRows = data.branches.map(branch => [
      branch.name,
      formatCurrency(branch.revenue),
      formatCurrency(branch.expenses),
      formatCurrency(branch.profit),
      branch.profitMargin.toFixed(1),
      branch.invoiceCount,
      branch.storeCount,
      formatCurrency(branch.balance)
    ]);
    
    const branchSheet = XLSX.utils.aoa_to_sheet([...branchHeaders, ...branchRows]);
    XLSX.utils.book_append_sheet(wb, branchSheet, 'تفاصيل الفروع');
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToCSV = () => {
    let csvContent = "\uFEFF";
    
    csvContent += "تقرير الفروع\n\n";
    
    csvContent += "الإحصائيات العامة\n";
    csvContent += "البيان,القيمة\n";
    csvContent += `عدد الفروع,${data.totalBranches}\n`;
    csvContent += `إجمالي الإيرادات,${formatCurrency(data.totalRevenue)} ج.م\n`;
    csvContent += `صافي الأرباح,${formatCurrency(data.totalProfit)} ج.م\n`;
    csvContent += `إجمالي المخازن,${data.totalStores}\n\n`;
    
    csvContent += "تفاصيل الفروع\n";
    csvContent += "الفرع,الإيرادات (ج.م),المصروفات (ج.م),الربح (ج.م),هامش الربح (%),الفواتير,المخازن,المستحقات (ج.م)\n";
    
    data.branches.forEach(branch => {
      csvContent += `${branch.name},${formatCurrency(branch.revenue)},${formatCurrency(branch.expenses)},${formatCurrency(branch.profit)},${branch.profitMargin.toFixed(1)},${branch.invoiceCount},${branch.storeCount},${formatCurrency(branch.balance)}\n`;
    });
    
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
