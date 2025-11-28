"use client";

import { Printer, ArrowRight, Truck, Phone, MapPin, Building, DollarSign, ArrowDown, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify'; // (نفترض أن لديك ToastContainer في Layout)

// دالة مساعدة لتنسيق الأرقام كعملة
const formatCurrency = (amount) => {
    return (amount || 0).toFixed(2);
}

export default function SupplierProfileClientUI({ supplier, invoices }) {

    // ✅ دالة طباعة تقرير هذا المورد
    const handlePrintSupplier = () => {
        toast.info(`جاري تجهيز تقرير المورد: ${supplier.name}`);
        // هنا يمكنك استدعاء دالة طباعة مخصصة
        window.print(); // (طباعة مبدئية)
    };
    
    // دالة لتنسيق حالة الفاتورة
    const getStatusChip = (status) => {
        switch (status) {
            case 'paid':
                return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">مدفوعة</span>;
            case 'pending':
                return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">معلقة</span>;
            case 'overdue':
                return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">متأخرة</span>;
            default:
                return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    return (
        <>
            {/* تنسيقات الطباعة */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; }
                    .printable-area { 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 0 !important;
                    }
                }
            `}</style>

            <div className="max-w-5xl mx-auto p-4 md:p-8" dir="rtl">
                
                {/* أزرار الإجراءات (الرجوع والطباعة) */}
                <div className="flex justify-between items-center mb-6 no-print">
                    <Link href="/subscriber/suppliers" className="flex items-center text-sm text-blue-600 hover:underline">
                        <ArrowRight size={18} className="ml-1" />
                        العودة إلى كل الموردين
                    </Link>
                    <button 
                        onClick={handlePrintSupplier} 
                        className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center shadow-md"
                    >
                        <Printer size={18} className="ml-2" />
                        طباعة تقرير المورد
                    </button>
                </div>

                {/* منطقة الطباعة */}
                <div id="printable-area" className="bg-white rounded-lg shadow-lg w-full p-8 md:p-12 border printable-area">
                    
                    {/* 1. رأس البروفايل */}
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-4 border-b">
                        <div className="flex items-center">
                            <div className="p-4 bg-gray-100 rounded-full ml-4">
                                <Truck size={32} className="text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{supplier.name}</h2>
                                <p className="text-gray-500">تقرير المورد التفصيلي</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-4 md:mt-0 md:text-right">
                            <div className="flex items-center md:justify-end">
                                <Phone size={14} className="ml-1" /> {supplier.details?.contact || 'لا يوجد اتصال'}
                            </div>
                            <div className="flex items-center md:justify-end mt-1">
                                <MapPin size={14} className="ml-1" /> {supplier.details?.address || 'لا يوجد عنوان'}
                            </div>
                            <div className="flex items-center md:justify-end mt-1">
                                <Building size={14} className="ml-1" /> الفرع: {supplier.branchId?.name || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* 2. الكروت الإحصائية الخاصة بالمورد */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-blue-700">إجمالي التوريد (المشتريات)</div>
                            <div className="text-2xl font-bold text-blue-900">{formatCurrency(supplier.suply)} ج.م</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="text-sm font-medium text-green-700">إجمالي المدفوع</div>
                            <div className="text-2xl font-bold text-green-900">{formatCurrency(supplier.pay)} ج.م</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="text-sm font-medium text-red-700">الرصيد المتبقي (للمورد)</div>
                            <div className="text-2xl font-bold text-red-900">{formatCurrency(supplier.balnce)} ج.م</div>
                        </div>
                    </div>

                    {/* 3. جدول فواتير المورد */}
                    <h3 className="text-xl font-bold text-gray-800 mb-4">سجل الفواتير (المصروفات)</h3>
                    <div className="overflow-x-auto border rounded-lg">
                        {invoices.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الفاتورة</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفرع</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجمالي</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map(invoice => (
                                        <tr key={invoice._id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{invoice.invoiceNumber}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.branchId?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(invoice.totalInvoice)} ج.م</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{getStatusChip(invoice.status)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center text-gray-500 p-8">
                                <p>لا توجد فواتير مسجلة لهذا المورد حتى الآن.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}