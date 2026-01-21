import Link from "next/link";
import { Eye, FileX, ArrowUpRight, ArrowDownLeft, Edit } from "lucide-react";

// ✅ تنسيق العملة
const formatCurrency = (amount, currency = "EGP") => {
    // التحقق من صحة رمز العملة
    if (!currency || currency.trim() === '') {
        currency = 'EGP';
    }
    
    try {
        return new Intl.NumberFormat("ar-EG", {
            style: "currency",
            currency,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        // في حالة فشل تنسيق العملة، نعرض الرقم مع رمز العملة
        return `${Number(amount).toLocaleString('ar-EG')} ${currency}`;
    }
};

// ✅ تنسيق التاريخ
const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("ar-EG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        numberingSystem: 'latn'
    });

// ✅ شارة حالة احترافية (Dark Mode Optimized)
const StatusBadge = ({ status }) => {
    const styles = {
        paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        overdue: "bg-red-500/10 text-red-400 border-red-500/20",
        draft: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };

    const text = {
        paid: "مدفوعة",
        pending: "معلقة",
        cancelled: "ملغاة",
        overdue: "متأخرة",
        draft: "مسودة",
    };

    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
            {text[status] || status}
        </span>
    );
};

export default function InvoicesTable({ invoices = [] }) {
    return (
        <div className="overflow-hidden bg-gray-800 rounded-lg shadow-sm border border-gray-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    
                    {/* 🧩 رأس الجدول */}
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="py-4 px-6 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">رقم الفاتورة</th>
                            <th className="py-4 px-6 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">العميل / المورد</th>
                            <th className="py-4 px-6 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">النوع</th>
                            <th className="py-4 px-6 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">التاريخ</th>
                            <th className="py-4 px-6 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الإجمالي</th>
                            <th className="py-4 px-6 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الحالة</th>
                            <th className="py-4 px-6 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">إجراءات</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700 bg-gray-800">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="p-4 bg-gray-700 rounded-full">
                                            <FileX size={32} className="text-gray-500" />
                                        </div>
                                        <p>لا توجد فواتير مطابقة للبحث</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => {
                                const isRevenue = invoice.type === 'revenue';
                                
                                return (
                                    <tr key={invoice._id} className="hover:bg-gray-750 transition-colors group">
                                        
                                        {/* رقم الفاتورة */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="font-mono text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {invoice.invoiceNumber}
                                            </span>
                                        </td>

                                        {/* الاسم */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-200">
                                                {invoice.customerId?.name || invoice.supplierId?.name || <span className="text-red-400 italic text-xs">غير معرف</span>}
                                            </div>
                                        </td>

                                        {/* النوع */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className={`flex items-center gap-1 text-xs font-bold ${isRevenue ? 'text-green-400' : 'text-red-400'}`}>
                                                {isRevenue ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                {isRevenue ? "إيراد" : "مصروف"}
                                            </div>
                                        </td>

                                        {/* التاريخ */}
                                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-300 font-mono">
                                            {formatDate(invoice.createdAt)}
                                        </td>

                                        {/* الإجمالي */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="text-sm font-bold text-white">
                                                {formatCurrency(invoice.totalInvoice, invoice.currencyCode)}
                                            </span>
                                        </td>

                                        {/* الحالة */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <StatusBadge status={invoice.status} />
                                        </td>

                                        {/* الإجراءات */}
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/subuser/invoices/${invoice._id}`}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition-all border border-transparent hover:border-gray-500"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <Link
                                                    href={`/subuser/invoices/edit/${invoice._id}`}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 transition-all border border-transparent hover:border-blue-600"
                                                    title="تعديل الفاتورة"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}