import { getSubscriberSupplierDetails } from "@/app/actions/subscriberActions";
import SupplierProfileClientUI from "@/components/subscriber/SupplierProfileClientUI";
import { AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// هذا "Server Component"
export default async function SubscriberSupplierDetailsPage({ params }) {
    const { supplierId } = params;
    
    // 1. جلب البيانات على الخادم
    const result = await getSubscriberSupplierDetails(supplierId);

    // 2. التحقق من النجاح
    if (!result.success) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-red-50 text-red-700 p-8 rounded-lg" dir="rtl">
                <AlertCircle size={48} className="mb-4" />
                <h2 className="font-semibold text-xl mb-2">خطأ في جلب بيانات المورد</h2>
                <p className="mb-4">{result.error}</p>
                <Link href="/subscriber/suppliers" className="flex items-center text-blue-600 hover:underline">
                    <ArrowRight size={18} className="ml-1" />
                    العودة إلى قائمة الموردين
                </Link>
            </div>
        );
    }
    
    // 3. تمرير البيانات (المورد والفواتير) إلى الواجهة
    return (
        <SupplierProfileClientUI 
            supplier={result.data.supplier} 
            invoices={result.data.invoices}
        />
    );
}