// المسار: app/(subuser)/invoices/add/page.js
import { getInvoiceFormData } from '@/app/actions/invoiceDataActions';
import CreateInvoiceForm from '@/components/subuser/invoices/CreateInvoiceForm';
import { AlertCircle } from 'lucide-react';

// هذا "Server Component"
export default async function AddInvoicePage() {
    
    // 1. جلب البيانات الأولية (المخازن، الوحدات) على الخادم
    const result = await getInvoiceFormData();

    // 2. التحقق من النجاح (هنا يتم عرض الخطأ بوضوح)
    if (!result.success) {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-8 rounded-lg" dir="rtl">
                <AlertCircle size={24} className="ml-2" />
                <div>
                    <h2 className="font-semibold">خطأ في تحميل بيانات الفورم</h2>
                    <p className="font-bold">{result.error}</p>
                </div>
            </div>
        );
    }

    console.log("result.data" , result.data)

     const serializedData = {
        ...result.data,
        stores: result.data.stores.map(s => ({ ...s, _id: s._id.toString() })),
        units: result.data.units.map(u => ({ ...u, _id: u._id.toString() })),
         // إذا كان هناك حقول تاريخية، يمكنك تحويلها:
        // createdAt: result.data.createdAt?.toISOString(),
    };

    
    // 3. تمرير البيانات إلى "Client Component" (فقط في حالة النجاح)
    return (
        <CreateInvoiceForm initialData={serializedData} />
    );
}