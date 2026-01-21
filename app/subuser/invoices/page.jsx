// المسار: app/dashboard/invoices/page.jsx

import Link from "next/link";
import { getBranchInvoices } from "@/app/actions/invoiceActions";
import InvoicesTable from "@/components/subuser/invoicesList/InvoicesTable"; // ستقوم بإنشائه
import InvoiceFilters from "@/components/subuser/invoicesList/InvoiceFilters"; // ستقوم بإنشائه
import Pagination from "@/components/ui/Pagination"; // ستقوم بإنشائه
import { Plus, FileText } from "lucide-react";

// هذه الصفحة هي Server Component
export default async function InvoicesPage({ searchParams }) {
    
    // قراءة searchParams لتمريرها إلى دالة الجلب (Next.js 15 يتطلب await)
    const params = await searchParams;
    const page = params.page ?? "1";
    const status = params.status ?? "";
    const type = params.type ?? "";
    const paymentType = params.paymentType ?? "";
    const dateFrom = params.dateFrom ?? "";
    const dateTo = params.dateTo ?? "";
    const q = params.q ?? ""; // للبحث

    const result = await getBranchInvoices({ 
        page, 
        status, 
        type, 
        paymentType,
        dateFrom, 
        dateTo,
        searchQuery: q
    });

    const invoices = result.data?.invoices || [];
    const totalPages = result.data?.totalPages || 1;

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <FileText className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">فواتير الفرع</h1>
                                <p className="text-gray-300 text-sm">إدارة ومتابعة جميع فواتير الفرع</p>
                            </div>
                        </div>
                        <Link 
                            href="/subuser/invoices/add" 
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            إنشاء فاتورة جديدة
                        </Link>
                    </div>
                </div>

                {/* مكون الفلاتر (Client Component) */}
                <InvoiceFilters />

                {/* جدول عرض الفواتير */}
                {result.success && invoices.length > 0 ? (
                    <InvoicesTable invoices={invoices} />
                ) : (
                    <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-700">
                        <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">لا توجد فواتير</h3>
                        <p className="text-gray-300 mb-6">لم يتم العثور على فواتير مطابقة للبحث</p>
                        <Link 
                            href="/subuser/invoices/add" 
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            إنشاء أول فاتورة
                        </Link>
                    </div>
                )}

                {/* مكون الترقيم (Client Component) */}
                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination 
                            currentPage={Number(page)} 
                            totalPages={totalPages} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}