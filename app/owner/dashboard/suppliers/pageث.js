import { getSubscriberSuppliers } from "@/app/actions/subscriberActions";
import SubscriberSupplierListUI from "@/components/subscriber/SubscriberSupplierListUI";
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: "إدارة الموردين - المشترك",
};

// هذا "Server Component"
export default async function SubscriberSuppliersPage() {
    
    // 1. جلب البيانات على الخادم
    const result = await getSubscriberSuppliers();

    // 2. ✅ التحقق من النجاح (هذا هو الإصلاح)
    if (!result.success) {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-8 rounded-lg" dir="rtl">
                <AlertCircle size={24} className="ml-2" />
                <div>
                    <h2 className="font-semibold">خطأ في جلب بيانات الموردين</h2>
                    <p>{result.error}</p>
                </div>
            </div>
        );
    }
    
    // 3. تمرير البيانات إلى الواجهة (الآن هي آمنة)
    return (
        <div className=" mx-auto p-5" dir="rtl" >

        <SubscriberSupplierListUI 
            initialSuppliers={result.data.suppliers} 
        />
        </div>
    );
}