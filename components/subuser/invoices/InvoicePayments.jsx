"use client";

import { Plus, Trash2, Calendar, CreditCard, Banknote, Building2, FileText } from 'lucide-react';

// دالة مساعدة لاختيار أيقونة بناءً على طريقة الدفع
const getPaymentIcon = (method) => {
    switch (method) {
        case 'cash': return <Banknote size={18} className="text-green-400" />;
        case 'bank': return <Building2 size={18} className="text-blue-400" />;
        case 'check': return <FileText size={18} className="text-orange-400" />;
        case 'credit': return <CreditCard size={18} className="text-purple-400" />;
        default: return <Banknote size={18} className="text-gray-400" />;
    }
};

export default function InvoicePayments({ pays, onAddPayment, onRemovePayment, onUpdatePayment }) {
    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-800">
            
            {/* رأس القسم */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-900/50 rounded-lg">
                        <Banknote className="text-green-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">المدفوعات (المقدم)</h3>
                        <p className="text-xs text-gray-400">إضافة دفعات نقدية أو بنكية أولية</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onAddPayment}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700 transition-all active:scale-95"
                >
                    <Plus size={16} />
                    <span>إضافة دفعة</span>
                </button>
            </div>

            {/* قائمة الدفعات */}
            <div className="space-y-4">
                {pays.length === 0 ? (
                    <div className="text-center py-8 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                        <Banknote className="mx-auto text-gray-500 mb-2" size={32} />
                        <p className="text-gray-400 text-sm">لم تتم إضافة أي دفعات حتى الآن</p>
                    </div>
                ) : (
                    pays.map((pay, index) => (
                        <div 
                            key={pay.id} 
                            className="group relative flex flex-col md:flex-row gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-sm hover:shadow-md hover:border-green-600 transition-all items-start md:items-center"
                        >
                            {/* رقم الدفعة */}
                            <div className="absolute -right-2 -top-2 w-6 h-6 flex items-center justify-center bg-green-600 text-white text-xs font-bold rounded-full shadow-sm">
                                {index + 1}
                            </div>

                            {/* التاريخ */}
                            <div className="flex-1 w-full md:w-auto">
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <Calendar size={16} />
                                    </div>
                                    <input
                                        type="date"
                                        value={pay.date}
                                        onChange={(e) => onUpdatePayment(pay.id, { date: e.target.value })}
                                        className="w-full pr-10 pl-3 py-2 text-sm border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* المبلغ */}
                            <div className="flex-1 w-full md:w-auto">
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="المبلغ المدفوع"
                                        value={pay.amount}
                                        onChange={(e) => onUpdatePayment(pay.id, { amount: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 text-sm font-semibold text-white border border-gray-600 rounded-lg bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:font-normal placeholder-gray-500"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">ج.م</span>
                                </div>
                            </div>

                            {/* طريقة الدفع */}
                            <div className="flex-1 w-full md:w-auto">
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        {getPaymentIcon(pay.method)}
                                    </div>
                                    <select
                                        value={pay.method}
                                        onChange={(e) => onUpdatePayment(pay.id, { method: e.target.value })}
                                        className="w-full pr-10 pl-3 py-2 text-sm bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="cash">نقداً (Cash)</option>
                                        <option value="bank">تحويل بنكي (Bank)</option>
                                        <option value="check">شيك (Check)</option>
                                        <option value="credit">بطاقة (Card)</option>
                                    </select>
                                </div>
                            </div>

                            {/* زر الحذف */}
                            <button
                                type="button"
                                onClick={() => onRemovePayment(pay.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors self-end md:self-center"
                                title="حذف الدفعة"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}