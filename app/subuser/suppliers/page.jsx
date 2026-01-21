// المسار: app/(subuser)/suppliers/page.js
export const dynamic = 'force-dynamic';

import { getMyBranchData } from "@/app/actions/subuserEntiAction";
import SubSupplierClientUI from "@/components/subuser/SubSupplierClientUI";
import { AlertCircle } from 'lucide-react';

// هذا "Server Component"
export default async function SubuserSuppliersPage() {
    
const result = await getMyBranchData();
const suppliers = result?.data?.suppliers || [];
    // 2. التحقق من النجاح
    if (!result.success) {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-8 rounded-lg" dir="rtl">
                <AlertCircle size={24} className="ml-2" />
                <div>
                    <h2 className="font-semibold">خطأ في جلب بيانات الفرع</h2>
                    <p>{result.error}</p>
                </div>
            </div>
        );
    }
    
    // 3. تمرير "بيانات الموردين" فقط إلى الواجهة
    return (
        <SubSupplierClientUI initialSuppliers={suppliers} />
    );
}
