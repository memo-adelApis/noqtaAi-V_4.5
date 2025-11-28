"use client";

import { useInvoiceForm } from '@/app/hooks/useInvoiceForm';
import EntitySearch from './EntitySearch';
import InvoiceItems from './InvoiceItems';
import InvoicePayments from './InvoicePayments';
import InvoiceInstallments from './InvoiceInstallments';
import InvoiceSummary from './InvoiceSummary';
import { Save, Settings2, ShoppingCart, Truck } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import InputField from '@/components/ui/InputField';
import UIButton from '@/components/ui/UIButton';

export default function CreateInvoiceForm({ initialData }) {
    const {
        isLoading,
        state,
        setters,
        handlers,
        summary,
    } = useInvoiceForm(initialData);

    const { invoiceType, invoiceKind, selectedEntity, paymentType } = state;

    return (
        <>
            <ToastContainer position="top-center" reverseOrder={false} />
            <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
                
                {/* رأس الصفحة وزر الحفظ */}
                <div className="flex justify-between items-center pb-4 border-b">
                    <h1 className="text-3xl font-bold text-gray-100">إنشاء فاتورة جديدة</h1>
                    <UIButton
                        onClick={handlers.handleSubmit}
                        disabled={isLoading}
                        label={isLoading ? "جاري الحفظ..." : "حفظ الفاتورة"}
                        icon={Save}
                        gradientFrom="blue-600" // استخدام درجات ألوان واضحة
                        gradientTo="indigo-700"
                        className="text-white shadow-lg" // تثبيت النص الأبيض
                    />
                </div>

                {/* اختيار نوع الفاتورة - (تم التصحيح هنا) */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => handlers.handleInvoiceTypeChange('revenue')}
                        className={`
                            flex items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 shadow-sm font-semibold
                            ${invoiceType === 'revenue' 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-md scale-[1.02]' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        <ShoppingCart size={20} />
                        فاتورة إيراد (مبيعات)
                    </button>

                    <button
                        type="button"
                        onClick={() => handlers.handleInvoiceTypeChange('expense')}
                        className={`
                            flex items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 shadow-sm font-semibold
                            ${invoiceType === 'expense' 
                                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-transparent shadow-md scale-[1.02]' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Truck size={20} />
                        فاتورة مصروف (مشتريات)
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* البيانات الأساسية */}
                        <div className="bg-white p-5 rounded-lg shadow-md border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                <Settings2 size={18} className="ml-2 text-blue-500" />
                                البيانات الأساسية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EntitySearch
                                    invoiceType={invoiceType}
                                    selectedEntity={selectedEntity}
                                    onSelectEntity={handlers.handleSelectEntity}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">نوع الفاتورة</label>
                                    <select
                                        value={invoiceKind}
                                        onChange={(e) => setters.setInvoiceKind(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="normal">عادية</option>
                                        <option value="tax">ضريبية</option>
                                    </select>
                                </div>
                                {invoiceKind === 'tax' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">نسبة الضريبة (%)</label>
                                        <input
                                            type="number"
                                            value={state.taxRate}
                                            onChange={(e) => setters.setTaxRate(Number(e.target.value))}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">رقم الفاتورة (اختياري)</label>
                                    <InputField
                                        type="text"
                                        value={state.invoiceNumber}
                                        onChange={(e) => setters.setInvoiceNumber(e.target.value)}
                                        placeholder="سيتم إنشاؤه تلقائياً"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <InvoiceItems
                            items={state.items}
                            onAddItem={handlers.addItem}
                            onRemoveItem={handlers.removeItem}
                            onUpdateItem={handlers.updateItem}
                            currency={state.currencyCode}
                            initialData={initialData}
                            currentItem={state.currentItem} 
                            onCurrentItemChange={handlers.handleCurrentItemChange}
                        />

                        <InvoicePayments
                            pays={state.pays}
                            onAddPayment={handlers.addPayment}
                            onRemovePayment={handlers.removePayment}
                            onUpdatePayment={handlers.updatePayment}
                        />

                        <div className="bg-white p-5 rounded-lg shadow-md border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">نوع السداد</h3>
                            <select
                                value={paymentType}
                                onChange={(e) => setters.setPaymentType(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md bg-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="cash">نقداً (مدفوعة بالكامل)</option>
                                <option value="credit">آجل (دفعات لاحقة)</option>
                                <option value="installment">أقساط مجدولة</option>
                            </select>

                            {paymentType === 'installment' && (
                                <InvoiceInstallments
                                    installments={state.installments}
                                    balanceToSchedule={summary.balance} 
                                    onGenerateInstallments={handlers.generateInstallments}
                                    onRemoveInstallment={handlers.removeInstallment}
                                    onUpdateInstallment={handlers.updateInstallment}
                                    currency={state.currencyCode}
                                />
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <InvoiceSummary
                            summary={summary}
                            discount={state.discount}
                            onDiscountChange={(val) => setters.setDiscount(Number(val))}
                            extra={state.extra}
                            onExtraChange={(val) => setters.setExtra(Number(val))}
                            currency={state.currencyCode}
                            onCurrencyChange={(val) => setters.setCurrencyCode(val)}
                        />

                        <div className="bg-white p-5 rounded-lg shadow-md border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">ملاحظات</h3>
                            <textarea
                                value={state.notes}
                                onChange={(e) => setters.setNotes(e.target.value)}
                                rows={4}
                                placeholder="اكتب أي ملاحظات إضافية هنا..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}