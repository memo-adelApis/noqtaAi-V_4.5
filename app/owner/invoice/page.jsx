import { getSubscriberInvoices } from "@/app/actions/subscriberDashboardActions";
import InvoicesClientUI from "@/components/subscriber/InvoicesClientUI";
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: "إدارة الفواتير - المشترك",
};

// هذا "Server Component"
export default async function SubscriberInvoicesPage() {
    
    // 1. جلب البيانات على الخادم
    const result = await getSubscriberInvoices();

    // 2. التحقق من النجاح
    if (!result.success) {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-8 rounded-lg" dir="rtl">
                <AlertCircle size={24} className="ml-2" />
                <div>
                    <h2 className="font-semibold">خطأ في جلب البيانات</h2>
                    <p>{result.error}</p>
                </div>
            </div>
        );
    }
    
    // 3. تمرير البيانات إلى الواجهة
    return (
        <div className=" mx-auto p-5" dir="rtl" >
        <InvoicesClientUI 
            initialInvoices={result.data.invoices} 
            branches={result.data.branches}
        />

        </div>
    );
}