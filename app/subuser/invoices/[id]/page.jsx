// المسار: app/dashboard/invoices/[id]/page.jsx

import { getInvoiceDetails } from "@/app/actions/invoiceActions";
import { notFound } from "next/navigation";
import InvoicePrintButton from "@/components/ui/InvoicePrintButton";
import Link from "next/link";
import { ArrowRight, Calendar, User, FileText, CreditCard, Box } from "lucide-react";

// دالة مساعدة لتنسيق العملة
const formatCurrency = (amount, currency = 'EGP') => {
    // التحقق من صحة رمز العملة
    if (!currency || currency.trim() === '') {
        currency = 'EGP';
    }
    
    try {
        return new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    } catch (error) {
        // في حالة فشل تنسيق العملة، نعرض الرقم مع رمز العملة
        return `${Number(amount).toLocaleString('ar-EG')} ${currency}`;
    }
};

// دالة مساعدة لتنسيق التاريخ
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// دالة لتحديد لون الحالة
const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
        case 'paid': return 'bg-green-100 text-green-700 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default async function InvoiceDetailPage({ params }) {
    // يجب انتظار params في النسخ الحديثة من Next.js
    const { id } = await params;
    
    const result = await getInvoiceDetails(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const invoice = result.data;
    const statusStyle = getStatusStyles(invoice.status);

    return (
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 font-sans" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* 1. شريط التنقل العلوي */}
                <div className="flex items-center justify-between">
                    <Link 
                        href="/dashboard/invoices" 
                        className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors gap-2"
                    >
                        <ArrowRight size={20} />
                        <span>العودة للفواتير</span>
                    </Link>
                    <div className="flex gap-3">
                        {/* مررنا الفاتورة لمكون الطباعة */}
                        <InvoicePrintButton invoice={invoice} />
                    </div>
                </div>

                {/* 2. بطاقة الفاتورة الرئيسية */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                    
                    {/* شريط علوي ملون (جمالي) */}
                    <div className="h-2 w-full bg-gradient-to-l from-indigo-500 to-purple-600"></div>

                    <div className="p-8 md:p-10">
                        {/* رأس الفاتورة */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="text-indigo-600" size={28} />
                                    <h1 className="text-3xl font-bold text-gray-900">فاتورة</h1>
                                </div>
                                <p className="text-gray-500 text-sm">رقم المعاملة: <span className="font-mono text-gray-900 font-medium">#{invoice.invoiceNumber}</span></p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusStyle} shadow-sm`}>
                                    {invoice.status === 'paid' ? 'مدفوعة' : 
                                     invoice.status === 'pending' ? 'معلقة' : 
                                     invoice.status === 'overdue' ? 'متأخرة' : invoice.status}
                                </span>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar size={14} />
                                    تاريخ الإصدار: {formatDate(invoice.createdAt)}
                                </p>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-8" />

                        {/* معلومات العميل والفاتورة */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                            {/* بيانات العميل */}
                            <div>
                                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">بيانات العميل</h3>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <User className="text-gray-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{invoice.customerId?.name || 'عميل غير مسجل'}</p>
                                        <p className="text-gray-500 text-sm mt-1">{invoice.customerId?.email || 'لا يوجد بريد إلكتروني'}</p>
                                        <p className="text-gray-500 text-sm">{invoice.customerId?.phone || 'لا يوجد هاتف'}</p>
                                        <p className="text-gray-500 text-sm mt-1">{invoice.customerId?.address || ''}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ملخص الدفع */}
                            <div className="md:border-r md:border-gray-100 md:pr-10">
                                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">تفاصيل الدفع</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">طريقة الدفع:</span>
                                        <span className="font-medium text-gray-900 flex items-center gap-2">
                                            <CreditCard size={14} /> {invoice.paymentMethod || 'نقدي'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">العملة:</span>
                                        <span className="font-medium text-gray-900">{invoice.currencyCode || 'EGP'}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center mt-2">
                                        <span className="text-gray-600 font-medium">المبلغ المستحق:</span>
                                        <span className="text-xl font-bold text-indigo-600">
                                            {formatCurrency(invoice.totalInvoice, invoice.currencyCode)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* جدول الأصناف */}
                        <div className="mb-8">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <Box size={18} className="text-indigo-500" />
                                الأصناف والخدمات
                            </h3>
                            
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="py-3 px-4 font-semibold">#</th>
                                            <th className="py-3 px-4 font-semibold w-1/2">الوصـف</th>
                                            <th className="py-3 px-4 font-semibold text-center">الكمية</th>
                                            <th className="py-3 px-4 font-semibold text-center">سعر الوحدة</th>
                                            <th className="py-3 px-4 font-semibold text-left">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {invoice.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                                                <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                                                <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                                                <td className="py-3 px-4 text-center text-gray-600">{formatCurrency(item.price, invoice.currencyCode)}</td>
                                                <td className="py-3 px-4 text-left font-bold text-gray-900">
                                                    {formatCurrency(item.price * item.quantity, invoice.currencyCode)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* الفوتر / الإجماليات */}
                        <div className="flex flex-col md:flex-row justify-end items-end gap-6">
                            <div className="w-full md:w-1/3 space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>المجموع الفرعي:</span>
                                    <span>{formatCurrency(invoice.totalInvoice, invoice.currencyCode)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>الضريبة (0%):</span>
                                    <span>{formatCurrency(0, invoice.currencyCode)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-lg">الإجمالي النهائي:</span>
                                    <span className="font-bold text-2xl text-indigo-600">
                                        {formatCurrency(invoice.totalInvoice, invoice.currencyCode)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ملاحظات إضافية (اختياري) */}
                        {invoice.notes && (
                            <div className="mt-10 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">ملاحظات:</h4>
                                <p className="text-sm text-gray-600">{invoice.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center text-gray-400 text-sm">
                    رقم الفاتورة المرجعي: {invoice._id}
                </div>
            </div>
        </div>
    );
}