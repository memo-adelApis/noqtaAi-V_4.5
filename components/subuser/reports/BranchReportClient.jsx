// components/subuser/reports/BranchReportClient.jsx
"use client";

import { usePerformanceAI } from "@/app/hooks/usePerformanceAI";
import BranchReportUI from "@/components/subuser/reports/BranchReportUI";
import PerformanceSummary from "@/components/subuser/reports/PerformanceSummary";
import AIPredictions from "@/components/subuser/reports/AIPredictions";
import { Sparkles } from "lucide-react";

export default function BranchReportClient({ initialData }) {
    
    // 1. ✅ فك تغليف البيانات (التعامل مع success: true, data: {...})
    const reportData = initialData?.data || initialData || {};
    console.log("reportData" ,reportData)

    // 2. ✅ تجهيز الفواتير للذكاء الاصطناعي
    // بما أن allInvoices غير موجودة في الرد الحالي، سنستخدم recentInvoices مؤقتاً
    // (للحصول على دقة أعلى، يجب تعديل Server Action لإرسال allInvoices)
    const invoicesForAI = reportData.recentInvoices ;

    // 3. تشغيل التحليل
    const aiAnalysis = usePerformanceAI(invoicesForAI);

    // 4. ✅ دمج البيانات بذكاء
    const combinedReportData = {
        ...reportData, // نأخذ stats و recentInvoices من السيرفر
        
        // الأولوية لبيانات الـ AI إذا نجح، وإلا نستخدم chartData القادم من السيرفر، وإلا مصفوفة فارغة
        chartData: aiAnalysis?.chartData || reportData.chartData || [],
        
        // حل مشكلة عداد المعاملات
        transactionCounts: aiAnalysis?.transactionCounts || { 
            current: reportData.stats?.invoicesCount || 0, 
            previous: 0 
        }
    };

    return (
        <div className="p-6 space-y-8 bg-gray-900 min-h-screen" dir="rtl">
            

            {/* يظهر قسم الذكاء الاصطناعي فقط لو كان هناك تحليل ناجح */}
            {aiAnalysis && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Sparkles className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">التحليلات الذكية & التوقعات</h2>
                            <p className="text-gray-400 text-sm">تحليل الأداء بناءً على البيانات التاريخية</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PerformanceSummary data={aiAnalysis} />
                        <AIPredictions data={aiAnalysis} />
                    </div>
                </div>
            )}
            <BranchReportUI reportData={combinedReportData} />

        </div>
    );
}