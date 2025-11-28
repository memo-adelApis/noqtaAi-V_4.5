"use client";

import { useState } from 'react';
import { Plus, Trash2, CalendarCheck, Calculator, Calendar, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function InvoiceInstallments({
    installments,
    balanceToSchedule,
    onGenerateInstallments,
    onRemoveInstallment,
    onUpdateInstallment,
    currency
}) {
    const [count, setCount] = useState(3);

    const totalScheduled = installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    
    // التحقق من تطابق المبلغ (مع هامش خطأ بسيط للكسور)
    const isBalanced = Math.abs(totalScheduled - balanceToSchedule) < 0.01;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
            
            {/* رأس القسم */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarCheck className="text-blue-600" size={20} />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-gray-800">جدولة الأقساط</h4>
                    <p className="text-xs text-gray-500">تقسيط المبلغ المتبقي على دفعات زمنية</p>
                </div>
            </div>

            {/* بطاقة الرصيد المتبقي */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl mb-6">
                <span className="text-sm font-medium text-blue-800">المبلغ المطلوب جدولته:</span>
                <span className="text-2xl font-bold text-blue-700">
                    {balanceToSchedule.toLocaleString()} <span className="text-sm font-normal text-blue-600">{currency}</span>
                </span>
            </div>

            {/* أداة التوليد السريع */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
                    <Calculator size={16} className="text-gray-400" />
                    <input 
                        type="number" 
                        value={count} 
                        onChange={(e) => setCount(Number(e.target.value))} 
                        className="w-12 text-center font-semibold text-gray-700 outline-none" 
                        min={1}
                    />
                    <span className="text-xs text-gray-500 font-medium">دفعة</span>
                </div>
                <button
                    type="button"
                    onClick={() => onGenerateInstallments(count)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95"
                >
                    <CalendarCheck size={16} />
                    <span>إنشاء الجدول تلقائياً</span>
                </button>
            </div>
            
            {/* قائمة الأقساط */}
            <div className="space-y-3">
                {installments.map((inst, index) => (
                    <div key={inst.id} className="group relative grid grid-cols-1 md:grid-cols-7 gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all items-center">
                        
                        {/* رقم القسط */}
                        <div className="absolute -right-2 -top-2 w-6 h-6 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm z-10">
                            {index + 1}
                        </div>

                        {/* التاريخ */}
                        <div className="md:col-span-3 relative">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <Calendar size={16} />
                            </div>
                            <input
                                type="date"
                                value={inst.dueDate}
                                onChange={(e) => onUpdateInstallment(inst.id, { dueDate: e.target.value })}
                                className="w-full pr-10 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* المبلغ */}
                        <div className="md:col-span-3 relative">
                            <input
                                type="number"
                                placeholder="المبلغ"
                                value={inst.amount}
                                onChange={(e) => onUpdateInstallment(inst.id, { amount: e.target.value })}
                                className="w-full px-3 py-2 text-sm font-semibold text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">ج.م</span>
                        </div>

                        {/* زر الحذف */}
                        <div className="md:col-span-1 flex justify-end md:justify-center">
                            <button
                                type="button"
                                onClick={() => onRemoveInstallment(inst.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف القسط"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* شريط التحقق النهائي */}
            {installments.length > 0 && (
                <div className={`mt-6 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300 ${
                    isBalanced 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isBalanced ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {isBalanced ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${isBalanced ? 'text-green-800' : 'text-red-800'}`}>
                                {isBalanced ? 'الجدول متطابق تماماً' : 'يوجد فرق في المبالغ!'}
                            </p>
                            {!isBalanced && (
                                <p className="text-xs text-red-600 mt-1">
                                    الفرق: {(balanceToSchedule - totalScheduled).toLocaleString()} {currency}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <span className="text-xs text-gray-500 block">إجمالي الأقساط</span>
                        <span className={`text-xl font-bold ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                            {totalScheduled.toLocaleString()} {currency}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}