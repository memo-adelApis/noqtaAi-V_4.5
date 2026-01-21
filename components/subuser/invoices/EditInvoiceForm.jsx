"use client";

import { useInvoiceForm } from '@/app/hooks/useInvoiceForm';
import EntitySearch from './EntitySearch';
import InvoiceItems from './InvoiceItems';
import InvoicePayments from './InvoicePayments';
import InvoiceInstallments from './InvoiceInstallments';
import InvoiceSummary from './InvoiceSummary';
import { Save, Settings2, ShoppingCart, Truck, FileText, ArrowRight } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import InputField from '@/components/ui/InputField';
import UIButton from '@/components/ui/UIButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function EditInvoiceForm({ invoice, initialData }) {
    const router = useRouter();
    
    const {
        isLoading,
        state,
        setters,
        handlers,
        summary,
    } = useInvoiceForm(initialData, invoice);

    const { invoiceType, invoiceKind, selectedEntity, paymentType } = state;

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/subuser/invoices/${invoice._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceNumber: state.invoiceNumber,
                    type: invoiceType,
                    kind: invoiceKind,
                    taxRate: state.taxRate,
                    customerId: invoiceType === 'revenue' ? selectedEntity?._id : null,
                    supplierId: invoiceType === 'expense' ? selectedEntity?._id : null,
                    items: state.items,
                    pays: state.pays,
                    installments: state.installments,
                    paymentType,
                    discount: state.discount,
                    extra: state.extra,
                    currencyCode: state.currencyCode,
                    notes: state.notes,
                })
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('تم تحديث الفاتورة بنجاح');
                router.push('/subuser/invoices');
            } else {
                toast.error(result.error || 'حدث خطأ في التحديث');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ في التحديث');
        }
    };

    return (
        <>
            <ToastContainer position="top-center" reverseOrder={false} />
            <div className="min-h-screen bg-gray-950 py-8 px-4" dir="rtl">
                <div className="max-w-7xl mx-auto space-y-6">
                
                {/* رأس الصفحة المحسّن - داكن */}
                <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/subuser/invoices"
                                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all"
                            >
                                <ArrowRight className="text-white" size={24} />
                            </Link>
                            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                                <FileText className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">تعديل الفاتورة</h1>
                                <p className="text-sm text-gray-400 mt-1">رقم الفاتورة: {invoice.invoiceNumber}</p>
                            </div>
                        </div>
                        <UIButton
                            onClick={handleUpdate}
                            disabled={isLoading}
                            label={isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                            icon={Save}
                            gradientFrom="green-600"
                            gradientTo="emerald-700"
                            className="text-white shadow-lg hover:shadow-xl transition-all px-8 py-3 text-lg font-semibold"
                        />
                    </div>
                </div>

                {/* اختيار نوع الفاتورة - محسّن داكن */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => handlers.handleInvoiceTypeChange('revenue')}
                        className={`
                            group relative overflow-hidden flex items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 shadow-md hover:shadow-xl
                            ${invoiceType === 'revenue' 
                                ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white border-transparent scale-105 shadow-green-900/50' 
                                : 'bg-gray-900 text-gray-300 border-gray-800 hover:border-green-600 hover:bg-gray-800'
                            }
                        `}
                    >
                        <div className={`p-3 rounded-xl ${invoiceType === 'revenue' ? 'bg-white/20' : 'bg-green-900/30'}`}>
                            <ShoppingCart size={28} className={invoiceType === 'revenue' ? 'text-white' : 'text-green-500'} />
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">فاتورة إيراد</p>
                            <p className={`text-sm ${invoiceType === 'revenue' ? 'text-green-100' : 'text-gray-500'}`}>مبيعات للعملاء</p>
                        </div>
                        {invoiceType === 'revenue' && (
                            <div className="absolute top-2 left-2 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                                محدد ✓
                            </div>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => handlers.handleInvoiceTypeChange('expense')}
                        className={`
                            group relative overflow-hidden flex items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 shadow-md hover:shadow-xl
                            ${invoiceType === 'expense' 
                                ? 'bg-gradient-to-br from-orange-600 to-red-700 text-white border-transparent scale-105 shadow-orange-900/50' 
                                : 'bg-gray-900 text-gray-300 border-gray-800 hover:border-orange-600 hover:bg-gray-800'
                            }
                        `}
                    >
                        <div className={`p-3 rounded-xl ${invoiceType === 'expense' ? 'bg-white/20' : 'bg-orange-900/30'}`}>
                            <Truck size={28} className={invoiceType === 'expense' ? 'text-white' : 'text-orange-500'} />
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">فاتورة مصروف</p>
                            <p className={`text-sm ${invoiceType === 'expense' ? 'text-orange-100' : 'text-gray-500'}`}>مشتريات من الموردين</p>
                        </div>
                        {invoiceType === 'expense' && (
                            <div className="absolute top-2 left-2 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                                محدد ✓
                            </div>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* البيانات الأساسية - محسّنة داكنة */}
                        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2 pb-3 border-b border-gray-800">
                                <div className="p-2 bg-blue-900/50 rounded-lg">
                                    <Settings2 size={20} className="text-blue-400" />
                                </div>
                                البيانات الأساسية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <EntitySearch
                                    invoiceType={invoiceType}
                                    selectedEntity={selectedEntity}
                                    onSelectEntity={handlers.handleSelectEntity}
                                />
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">نوع الفاتورة</label>
                                    <select
                                        value={invoiceKind}
                                        onChange={(e) => setters.setInvoiceKind(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-700 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                    >
                                        <option value="normal">عادية</option>
                                        <option value="tax">ضريبية</option>
                                    </select>
                                </div>
                                {invoiceKind === 'tax' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">نسبة الضريبة (%)</label>
                                        <input
                                            type="number"
                                            value={state.taxRate}
                                            onChange={(e) => setters.setTaxRate(Number(e.target.value))}
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            className="w-full p-3 border-2 border-gray-700 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">رقم الفاتورة</label>
                                    <InputField
                                        type="text"
                                        value={state.invoiceNumber}
                                        onChange={(e) => setters.setInvoiceNumber(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-700 rounded-xl bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        disabled
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
                            invoiceType={invoiceType}
                        />

                        <InvoicePayments
                            pays={state.pays}
                            onAddPayment={handlers.addPayment}
                            onRemovePayment={handlers.removePayment}
                            onUpdatePayment={handlers.updatePayment}
                        />

                        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-5">نوع السداد</h3>
                            <select
                                value={paymentType}
                                onChange={(e) => setters.setPaymentType(e.target.value)}
                                className="w-full p-3 border-2 border-gray-700 rounded-xl bg-gray-800 text-white mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
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

                        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
                            <h3 className="text-lg font-bold text-white mb-3">ملاحظات</h3>
                            <textarea
                                value={state.notes}
                                onChange={(e) => setters.setNotes(e.target.value)}
                                rows={5}
                                placeholder="اكتب أي ملاحظات إضافية هنا..."
                                className="w-full p-3 border-2 border-gray-700 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}
