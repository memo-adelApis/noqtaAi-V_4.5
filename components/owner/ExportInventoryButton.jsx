"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportInventoryButton({ data, filename }) {
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
      ['تقرير المخزون'],
      [],
      ['الإحصائيات الرئيسية'],
      ['البيان', 'القيمة'],
      ['إجمالي الأصناف', data.totalItems],
      ['القيمة الإجمالية', formatCurrency(data.totalValue) + ' ج.م'],
      ['الكمية الإجمالية', data.totalQuantity],
      ['مخزون جيد', data.goodStock],
      ['مخزون منخفض', data.lowStock],
      ['نفذ المخزون', data.outOfStock],
    ];
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsSheet, 'الإحصائيات');
    
    // ورقة الأصناف منخفضة المخزون
    if (data.lowStockItems && data.lowStockItems.length > 0) {
      const lowStockHeaders = [['الصنف', 'المخزن', 'الكمية المتبقية', 'القيمة (ج.م)']];
      const lowStockRows = data.lowStockItems.map(item => [
        item.name,
        item.storeName,
        item.quantity,
        formatCurrency(item.value)
      ]);
      
      const lowStockSheet = XLSX.utils.aoa_to_sheet([...lowStockHeaders, ...lowStockRows]);
      XLSX.utils.book_append_sheet(wb, lowStockSheet, 'مخزون منخفض');
    }
    
    // ورقة الأصناف النافذة
    if (data.outOfStockItems && data.outOfStockItems.length > 0) {
      const outOfStockHeaders = [['الصنف', 'المخزن', 'الفئة', 'آخر كمية']];
      const outOfStockRows = data.outOfStockItems.map(item => [
        item.name,
        item.storeName,
        item.category,
        item.lastQuantity
      ]);
      
      const outOfStockSheet = XLSX.utils.aoa_to_sheet([...outOfStockHeaders, ...outOfStockRows]);
      XLSX.utils.book_append_sheet(wb, outOfStockSheet, 'نفذ المخزون');
    }
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToCSV = () => {
    let csvContent = "\uFEFF";
    
    csvContent += "تقرير المخزون\n\n";
    
    csvContent += "الإحصائيات الرئيسية\n";
    csvContent += "البيان,القيمة\n";
    csvContent += `إجمالي الأصناف,${data.totalItems}\n`;
    csvContent += `القيمة الإجمالية,${formatCurrency(data.totalValue)} ج.م\n`;
    csvContent += `الكمية الإجمالية,${data.totalQuantity}\n`;
    csvContent += `مخزون جيد,${data.goodStock}\n`;
    csvContent += `مخزون منخفض,${data.lowStock}\n`;
    csvContent += `نفذ المخزون,${data.outOfStock}\n\n`;
    
    if (data.lowStockItems && data.lowStockItems.length > 0) {
      csvContent += "الأصناف منخفضة المخزون\n";
      csvContent += "الصنف,المخزن,الكمية المتبقية,القيمة (ج.م)\n";
      data.lowStockItems.forEach(item => {
        csvContent += `${item.name},${item.storeName},${item.quantity},${formatCurrency(item.value)}\n`;
      });
      csvContent += "\n";
    }
    
    if (data.outOfStockItems && data.outOfStockItems.length > 0) {
      csvContent += "الأصناف النافذة\n";
      csvContent += "الصنف,المخزن,الفئة,آخر كمية\n";
      data.outOfStockItems.forEach(item => {
        csvContent += `${item.name},${item.storeName},${item.category},${item.lastQuantity}\n`;
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
