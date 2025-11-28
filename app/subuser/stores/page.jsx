// المسار: app/(subuser)/stores/page.js
import { getMyBranchData } from "@/app/actions/subuserActions";
import SubStoreClientUI from "@/components/subuser/SubStoreClientUI";
import { AlertCircle } from 'lucide-react';

// هذا "Server Component"
export default async function SubuserStoresPage() {
    
const result = await getMyBranchData();
const stores = result?.data?.stores || [];

const serializedStores = stores.map(store => ({
    ...store,
    _id: store._id.toString(),
    userId: store.userId.toString(),
    branchId: store.branchId.toString(),
    createdAt: store.createdAt.toISOString(),
}));

    // 2. التحقق من النجاح
    if (!result.success) {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-8 rounded-lg" dir="rtl">
                <AlertCircle size={24} className="ml-2" />
                <div>
                    <h2 className="font-semibold text-black ">خطأ في جلب بيانات الفرع</h2>
                    <p>{result.error}</p>
                </div>
            </div>
        );
    }
    
    // 3. تمرير "بيانات المخازن" فقط إلى الواجهة
    return (
        <SubStoreClientUI initialStores={serializedStores} />
    );
}
