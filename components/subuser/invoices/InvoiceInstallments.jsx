"use client";

import { useState } from 'react';
import { Plus, Trash2, CalendarCheck, Calculator, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function InvoiceInstallments({
    installments = [],
    balanceToSchedule = 0,
    onGenerateInstallments,
    onRemoveInstallment,
    onUpdateInstallment,
    currency = 'EGP'
}) {
    const [count, setCount] = useState(3);

    const totalScheduled = installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    
    // التحقق من تطابق المبلغ (مع هامش خطأ بسيط للكسور)
    const isBalanced = Math.abs(totalScheduled - balanceToSchedule) < 0.01;
    const difference = balanceToSchedule - totalScheduled;

    const handleCountChange = (e) => {
        const value = Number(e.target.value);
        if (value >= 1 && value <= 12) { // حد أقصى 12 قسط
            setCount(value);
        }
    };

    const handleAmountChange = (id, value) => {
        const numValue = Number(value);
        if (numValue >= 0) {
            onUpdateInstallment(id, { amount: numValue });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-EG').format(amount || 0);
    };

    if (balanceToSchedule <= 0) {
        return (
            <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-800 mt-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-900/50 rounded-lg">
                        <CheckCircle2 className="text-green-400" size={20} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white">الفاتورة مدفوعة بالكامل</h4>
                        <p className="text-xs text-gray-400">لا يوجد رصيد متبقي لجدولته</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-800 mt-6">
            
            {/* رأس القسم */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                <div className="p-2 bg-blue-900/50 rounded-lg">
                    <CalendarCheck className="text-blue-400" size={20} />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-white">جدولة الأقساط</h4>
                    <p className="text-xs text-gray-400">تقسيط المبلغ المتبقي على دفعات زمنية</p>
                </div>
            </div>

            {/* بطاقة الرصيد المتبقي */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800/50 rounded-xl mb-6">
                <span className="text-sm font-medium text-blue-300">المبلغ المطلوب جدولته:</span>
                <span className="text-2xl font-bold text-blue-400">
                    {formatCurrency(balanceToSchedule)} <span className="text-sm font-normal text-blue-500">{currency}</span>
                </span>
            </div>

            {/* أداة التوليد السريع */}
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700 mb-6">
                <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-700 shadow-sm">
                    <Calculator size={16} className="text-gray-400" />
                    <input 
                        type="number" 
                        value={count} 
                        onChange={handleCountChange}
                        className="w-12 text-center font-semibold text-white bg-transparent outline-none"
                        min="1"
                        max="12"
                        step="1"
                    />
                    <span className="text-xs text-gray-400 font-medium">قسط</span>
                </div>
                <button
                    type="button"
                    onClick={() => onGenerateInstallments(count)}
                    disabled={!onGenerateInstallments}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CalendarCheck size={16} />
                    <span>إنشاء الجدول تلقائياً</span>
                </button>
            </div>
            
            {/* قائمة الأقساط */}
            <div className="space-y-3">
                {installments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <CalendarCheck size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">لم يتم إنشاء أي أقساط بعد</p>
                        <p className="text-xs mt-1">استخدم الأداة أعلاه لإنشاء جدول الأقساط</p>
                    </div>
                ) : (
                    installments.map((inst, index) => (
                        <div key={inst.id} className="group relative grid grid-cols-1 md:grid-cols-7 gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-sm hover:border-blue-600 transition-all items-center">
                            
                            {/* رقم القسط */}
                            <div className="absolute -right-2 -top-2 w-6 h-6 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm z-10">
                                {index + 1}
                            </div>

                            {/* التاريخ */}
                            <div className="md:col-span-3 relative">
                                <label className="block text-xs text-gray-400 mb-1">تاريخ الاستحقاق</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <Calendar size={16} />
                                    </div>
                                    <input
                                        type="date"
                                        value={inst.dueDate || ''}
                                        onChange={(e) => onUpdateInstallment(inst.id, { dueDate: e.target.value })}
                                        className="w-full pr-10 pl-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* المبلغ */}
                            <div className="md:col-span-3 relative">
                                <label className="block text-xs text-gray-400 mb-1">مبلغ القسط</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={inst.amount || ''}
                                        onChange={(e) => handleAmountChange(inst.id, e.target.value)}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 pr-12 text-sm font-semibold text-white border border-gray-600 rounded-lg bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{currency}</span>
                                </div>
                            </div>

                            {/* زر الحذف */}
                            <div className="md:col-span-1 flex justify-end md:justify-center">
                                <button
                                    type="button"
                                    onClick={() => onRemoveInstallment(inst.id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="حذف القسط"
                                    disabled={!onRemoveInstallment}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* زر إضافة قسط يدوي */}
            {installments.length > 0 && installments.length < 12 && (
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            // يمكن إضافة دالة لإضافة قسط يدوي إذا كانت متوفرة
                            console.log('إضافة قسط يدوي');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-400 transition-colors"
                    >
                        <Plus size={16} />
                        <span className="text-sm">إضافة قسط يدوي</span>
                    </button>
                </div>
            )}

            {/* شريط التحقق النهائي */}
            {installments.length > 0 && (
                <div className={`mt-6 p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300 ${
                    isBalanced 
                    ? 'bg-green-900/20 border-green-700/50' 
                    : 'bg-red-900/20 border-red-700/50'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isBalanced ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                            {isBalanced ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                                {isBalanced ? 'الجدول متطابق تماماً ✓' : 'يوجد فرق في المبالغ!'}
                            </p>
                            {!isBalanced && (
                                <p className="text-xs text-red-400 mt-1">
                                    {difference > 0 ? 'نقص' : 'زيادة'}: {formatCurrency(Math.abs(difference))} {currency}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <span className="text-xs text-gray-400 block">إجمالي الأقساط</span>
                        <span className={`text-xl font-bold ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(totalScheduled)} {currency}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                            من أصل {formatCurrency(balanceToSchedule)} {currency}
                        </div>
                    </div>
                </div>
            )}

            {/* نصائح مفيدة */}
            {installments.length === 0 && (
                <div className="mt-6 p-4 bg-blue-900/10 border border-blue-800/30 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-900/50 rounded">
                            <AlertCircle size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <h5 className="text-sm font-semibold text-blue-400 mb-1">نصائح لجدولة الأقساط:</h5>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• استخدم التوليد التلقائي لتوزيع المبلغ بالتساوي</li>
                                <li>• يمكنك تعديل تواريخ ومبالغ الأقساط بعد الإنشاء</li>
                                <li>• تأكد من تطابق إجمالي الأقساط مع المبلغ المطلوب</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}