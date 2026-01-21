// المسار: app/(subuser)/invoices/add/page.js
import { getInvoiceFormData } from '@/app/actions/invoiceDataActions';
import CreateInvoiceForm from '@/components/subuser/invoices/CreateInvoiceForm';
import { redirect } from 'next/navigation';
import AutoRedirect from '@/components/ui/AutoRedirect';

// هذا "Server Component"
export default async function AddInvoicePage() {
    
    // 1. جلب البيانات الأولية (المخازن، الوحدات) على الخادم
    const result = await getInvoiceFormData();

    // 2. التحقق من النجاح والتوجيه التلقائي في حالة عدم وجود مخازن
    if (!result.success) {
        // إذا كان هناك توجيه محدد، نستخدمه
        if (result.redirectTo) {
            redirect(result.redirectTo);
        }
        
        // في حالة أخطاء أخرى، نعرض مكون التوجيه التلقائي
        return (
            <AutoRedirect
              message={result.error}
              redirectTo="/subuser/stores"
              redirectText="إدارة المخازن"
              delay={0} // بدون تأخير، فقط زر يدوي
            />
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