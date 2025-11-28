// المسار: app/(subscriber)/branches/page.js (ملف جديد)
import { getMyBranches } from "@/app/actions/branchActions";
import BranchClientUI from "@/components/subscriber/BranchClientUI";
import { AlertCircle } from 'lucide-react';

export default async function ManageBranchesPage() {
    
    // جلب البيانات على الخادم
    const result = await getMyBranches();

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
    
    // تمرير البيانات إلى "مكون العميل"
    return (
        <div className="container mx-auto p-4" dir="rtl">
            <h1 className="text-3xl font-bold text-yellow-600 mb-6">إدارة الفروع</h1>
            
            <BranchClientUI initialBranches={result.data} />
            
        </div>
    );
}