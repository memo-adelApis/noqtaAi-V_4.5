import { getMyBranchData } from "@/app/actions/subuserActions";
import SubCustomerClientUI from "@/components/subuser/SubCustomerClientUI";
import { AlertCircle } from 'lucide-react';

// هذا "Server Component"
export default async function SubuserCustomersPage() {
    
const result = await getMyBranchData();
const customers = result?.data?.customers || [];

const serializedCustomers = customers.map(customer => ({
    ...customer,
    _id: customer._id.toString(),
    userId: customer.userId.toString(),
    branchId: customer.branchId.toString(),
    createdAt: customer.createdAt.toISOString(),
}));


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
    
    // 3. تمرير البيانات إلى الواجهة
    return (
        <SubCustomerClientUI 
            initialCustomers={serializedCustomers} 
        />
    );
}
