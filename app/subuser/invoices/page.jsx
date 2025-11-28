// المسار: app/dashboard/invoices/page.jsx

import Link from "next/link";
import { getBranchInvoices } from "@/app/actions/invoiceActions";
import InvoicesTable from "@/components/subuser/invoicesList/InvoicesTable"; // ستقوم بإنشائه
import InvoiceFilters from "@/components/subuser/invoicesList/InvoiceFilters"; // ستقوم بإنشائه
import Pagination from "@/components/ui/Pagination"; // ستقوم بإنشائه

// هذه الصفحة هي Server Component
export default async function InvoicesPage({ searchParams }) {
    
    // قراءة searchParams لتمريرها إلى دالة الجلب
    const page = searchParams.page ?? "1";
    const status = searchParams.status ?? "";
    const type = searchParams.type ?? "";
    const paymentType = searchParams.paymentType ?? "";
    const dateFrom = searchParams.dateFrom ?? "";
    const dateTo = searchParams.dateTo ?? "";
    const q = searchParams.q ?? ""; // للبحث

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
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">فواتير الفرع</h1>
                <Link href="/dashboard/invoices/new" className="btn btn-primary">
                    إنشاء فاتورة جديدة
                </Link>
            </div>

            {/* مكون الفلاتر (Client Component) */}
            <InvoiceFilters />

            {/* جدول عرض الفواتير */}
            {result.success && invoices.length > 0 ? (
                <InvoicesTable invoices={invoices} />
            ) : (
                <p>لا توجد فواتير لعرضها.</p>
            )}

            {/* مكون الترقيم (Client Component) */}
            <Pagination 
                currentPage={Number(page)} 
                totalPages={totalPages} 
            />
        </div>
    );
}