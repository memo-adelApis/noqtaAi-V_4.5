import Link from "next/link";
import { Eye } from "lucide-react";

// ✅ تنسيق العملة
const formatCurrency = (amount, currency = "SAR") =>
    new Intl.NumberFormat("ar-SA", {
        style: "currency",
        currency,
    }).format(amount);

// ✅ تنسيق التاريخ
const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("ar-EG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        numberingSystem: 'latn' // <--- هذا السطر يجبر الأرقام الإنجليزية (123)
    });

// ✅ شارة حالة احترافية
const StatusBadge = ({ status }) => {
    const styles = {
        paid: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        cancelled: "bg-gray-200 text-gray-700",
        overdue: "bg-red-100 text-red-700",
        draft: "bg-blue-100 text-blue-700",
    };

    const text = {
        paid: "مدفوعة",
        pending: "قيد الانتظار",
        cancelled: "ملغاة",
        overdue: "متأخرة",
        draft: "مسودة",
    };

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || "bg-gray-100 text-gray-700"}`}>
            {text[status] || status}
        </span>
    );
};

export default function InvoicesTable({ invoices = [] }) {
    return (
        <div className="overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                
                {/* 🧩 رأس الجدول */}
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-right text-gray-600 dark:text-gray-300 text-sm font-semibold">
                        <th className="py-3 px-4">رقم الفاتورة</th>
                        <th className="py-3 px-4">العميل / المورد</th>
                        <th className="py-3 px-4">النوع</th>
                        <th className="py-3 px-4">التاريخ</th>
                        <th className="py-3 px-4">الإجمالي</th>
                        <th className="py-3 px-4">الحالة</th>
                        <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {invoices.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-6 text-center text-gray-500 dark:text-gray-400">
                                لا توجد فواتير مطابقة لخيارات البحث
                            </td>
                        </tr>
                    ) : (
                        invoices.map((invoice) => (
                            <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-200">
                                    {invoice.invoiceNumber}
                                </td>

                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                    {invoice.customerId?.name || invoice.supplierId?.name || "N/A"}
                                </td>

                                <td className="py-3 px-4">
                                    {invoice.type === "revenue" ? "إيرادات" : "مصروفات"}
                                </td>

                                <td className="py-3 px-4">
                                    {formatDate(invoice.createdAt)}
                                </td>

                                <td className="py-3 px-4 font-semibold">
                                    {formatCurrency(invoice.totalInvoice, invoice.currencyCode)}
                                </td>

                                <td className="py-3 px-4">
                                    <StatusBadge status={invoice.status} />
                                </td>

                                <td className="py-3 px-4 text-center">
                                    <Link
                                        href={`/subuser/invoices/${invoice._id}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    >
                                        <Eye className="w-4 h-4" />
                                        عرض
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
