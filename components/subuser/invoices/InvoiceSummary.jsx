// المسار: components/subuser/invoice/InvoiceSummary.jsx
'use client';

import { DollarSign } from 'lucide-react';

// (تم حذف useState و useEffect - لم نعد بحاجة إليها)
// هذا المكون "أبكم" يعرض الـ props فقط

export default function InvoiceSummary({
    summary,
    discount, onDiscountChange, // (استقبال الدالة)
    extra, onExtraChange,       // (استقبال الدالة)
    currency, onCurrencyChange  // (استقبال الدالة)
}) {

    const formatNumber = (num) => {
        // (يمكننا الآن التنسيق مباشرة)
        return (Number(num) || 0).toLocaleString('ar-EG');
    };

    return (
        <div className="bg-gray-900 p-5 rounded-2xl shadow-xl border border-gray-800 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DollarSign size={18} className="ml-2 text-green-400" />
                ملخص الفاتورة
            </h3>
            
            {/* (هذا هو التصحيح: إضافة حقول الإدخال) */}
            <div className="space-y-3 mb-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">الخصم</label>
                    <input
                        type="number"
                        value={discount}
                        onChange={(e) => onDiscountChange(e.target.value)} // (استخدام الدالة)
                        min="0"
                        step="0.01"
                        className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">إضافات (مثل الشحن)</label>
                    <input
                        type="number"
                        value={extra}
                        onChange={(e) => onExtraChange(e.target.value)} // (استخدام الدالة)
                        min="0"
                        step="0.01"
                        className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">العملة</label>
                    <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500">
                        <option value="EGP">جنيه مصري</option>
                        <option value="SAR">ريال سعودي</option>
                        <option value="USD">دولار أمريكي</option>
                    </select>
                </div>
            </div>

            {/* (هذا هو التصحيح: استخدام summary و props) */}
            <div className="space-y-2 border-t border-gray-800 pt-4">
                <div className="flex justify-between text-gray-300">
                    <span>إجمالي الأصناف:</span>
                    <span className="font-medium">{formatNumber(summary.totalItems)} {currency}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                    <span>الخصم:</span>
                    <span className="font-medium text-red-400">({formatNumber(discount)}) {currency}</span>
                </div>
                {summary.vatAmount > 0 && (
                     <div className="flex justify-between text-gray-300">
                        <span>الضريبة:</span>
                        <span className="font-medium">{formatNumber(summary.vatAmount)} {currency}</span>
                    </div>
                )}
                 <div className="flex justify-between text-gray-300">
                    <span>الإضافات:</span>
                    <span className="font-medium text-green-400">(+{formatNumber(extra)}) {currency}</span>
                </div>
                <hr className="my-2 border-gray-800"/>
                <div className="flex justify-between text-xl font-bold text-white">
                    <span>الإجمالي:</span>
                    <span>{formatNumber(summary.totalInvoice)} {currency}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-blue-400">
                    <span>المدفوع مقدماً:</span>
                    <span>{formatNumber(summary.totalPaid)} {currency}</span>
                </div>
                 <div className="flex justify-between text-2xl font-bold text-red-400 bg-red-900/20 p-3 rounded-md border border-red-800/50">
                    <span>الرصيد المتبقي:</span>
                    <span>{formatNumber(summary.balance)} {currency}</span>
                </div>
            </div>
        </div>
    );
}