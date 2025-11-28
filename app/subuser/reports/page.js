export const dynamic = 'force-dynamic';
import { getMyBranchReportData } from "@/app/actions/getMyBranchReportData";
import BranchReportClient from "@/components/subuser/reports/BranchReportClient";
import { AlertCircle } from 'lucide-react';

// هذا Server Component
export default async function BranchReportPage() {
    
    // 1. جلب البيانات الأساسية والفواتير من السيرفر دفعة واحدة
    const result = await getMyBranchReportData();
    console.log( "getMyBranchReportData result: ", result )

    // 2. التعامل مع الأخطاء
    if (!result.success) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-red-400 gap-4" dir="rtl">
                <div className="bg-red-900/20 p-4 rounded-full">
                    <AlertCircle size={48} />
                </div>
                <h2 className="text-xl font-bold">عذراً، حدث خطأ في جلب البيانات</h2>
                <p className="text-gray-500">{result.error}</p>
            </div>
        );
    }
    
    // 3. تمرير البيانات إلى المكون التفاعلي (Client Component)
    return (
        <BranchReportClient initialData={result.data} />
    );
}
