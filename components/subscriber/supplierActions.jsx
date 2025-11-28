import { getMySuppliers } from "@/app/actions/supplierActions";
import SupplierClientUI from "@/components/subscriber/SupplierClientUI"; // (سننشئه الآن)
import { AlertCircle } from 'lucide-react';

export default async function ManageSuppliersPage() {
    
    // جلب البيانات على الخادم
    const result = await getMySuppliers();

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
    
    // تمرير البيانات إلى "مكون العميل"
    return (
        <div className="container mx-auto p-4" dir="rtl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة الموردين</h1>
            
            <SupplierClientUI initialSuppliers={result.data} />
            
        </div>
    );
}