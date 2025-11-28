"use client";

import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";
import { PieChart, BarChart3, TrendingUp, Users, Truck, Activity } from "lucide-react";
import BranchRevenuePieChart from "@/components/subscriber/BranchRevenuePieChart";
import WeeklyRevenueExpenseChart from "@/components/subscriber/WeeklyRevenueExpenseChart";
import TopEntitiesBarChart from "@/components/subscriber/TopEntitiesBarChart";
import BranchPerformanceChart from "@/components/subscriber/BranchPerformanceChart";
import OverallTrendChart from "@/components/subscriber/OverallTrendChart";

// 1. مكون البطاقة
const ChartCard = ({ title, subtitle, icon: Icon, children, className = "" }) => (
  <div className={`bg-[#1c1d22] border border-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col ${className}`}>
    <div className="px-6 py-4 border-b border-gray-800 bg-[#252830]/50 flex justify-between items-center shrink-0">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {Icon && <Icon size={20} className="text-blue-500" />}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-gray-400 mt-1 mr-7">{subtitle}</p>}
      </div>
    </div>
    <div className="w-full h-96 p-4">
        {children}
    </div>
  </div>
);

// 2. مكون العنصر النائب (Placeholder)
const NoDataPlaceholder = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-[#1c1d22]/50 rounded-lg border border-dashed border-gray-700 m-2">
    <Activity size={48} className="mb-4 opacity-30" />
    <p className="text-sm font-medium">{message || "لا توجد بيانات كافية للعرض"}</p>
  </div>
);

export default function AnalyticsChartsDark() {
  const { analytics, isLoading } = useAnalyticsData();

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 animate-pulse">جاري تحميل البيانات التحليلية...</div>
        </div>
    );
  }

  // --- 🛠️ 3. تنظيف البيانات (Data Normalization) 🛠️ ---
  // سنقوم بطباعة البيانات في الكونسول للتأكد منها

  // دالة مساعدة لتحويل الأرقام بأمان
  const safeNumber = (val) => {
    if (!val) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // أ) بيانات الفروع
  const branchData = analytics?.branchPerformance?.map(item => ({
    name: item.name || item.branchName || "فرع", 
    value: safeNumber(item.value || item.totalRevenue || item.revenue) 
  })) || [];

  // ب) بيانات الاتجاه العام (الخط) والأداء الأسبوعي (الأعمدة)
  const trendData = analytics?.overallTrend?.map(item => ({
    name: item.name || item.date || "",
    income: safeNumber(item.income || item.revenue),
    expense: safeNumber(item.expense)
  })) || [];

  // ج) بيانات العملاء
  const customerData = analytics?.topCustomers?.map(item => ({
    name: item.name || item.customerName || "عميل",
    value: safeNumber(item.value || item.totalPaid || item.amount)
  })) || [];

  // د) بيانات الموردين
  const supplierData = analytics?.topSuppliers?.map(item => ({
    name: item.name || item.supplierName || "مورد",
    value: safeNumber(item.value || item.totalPaid || item.amount)
  })) || [];

 

  // --- 4. شروط العرض (أكثر تساهلاً) ---
  // سنعرض الرسم حتى لو البيانات قليلة، بشرط وجود المصفوفة
  const hasBranchData = branchData.length > 0;
  const hasTrendData = trendData.length > 0;
  const hasCustomers = customerData.length > 0;
  const hasSuppliers = supplierData.length > 0;

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      
      {/* الصف الأول */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartCard 
          title="توزيع الإيرادات" 
          subtitle="نسبة مساهمة كل فرع"
          icon={PieChart}
          className="lg:col-span-2"
        >
          {hasBranchData ? <BranchRevenuePieChart data={branchData} /> : <NoDataPlaceholder message="لا توجد بيانات فروع" />}
        </ChartCard>

        <ChartCard 
          title="الأداء الأسبوعي" 
          subtitle="الإيرادات vs المصروفات"
          icon={BarChart3}
          className="lg:col-span-3"
        >
          {hasTrendData ? <WeeklyRevenueExpenseChart trendData={trendData} /> : <NoDataPlaceholder message="لا توجد بيانات مالية" />}
        </ChartCard>
      </div>

      {/* الصف الثاني */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="أعلى 5 عملاء" subtitle="الأكثر دفعاً" icon={Users}>
           {hasCustomers ? <TopEntitiesBarChart data={customerData} label="المدفوع" color="#3b82f6" /> : <NoDataPlaceholder message="لا توجد مدفوعات عملاء" />}
        </ChartCard>

        <ChartCard title="أعلى 5 موردين" subtitle="الأكثر توريداً" icon={Truck}>
           {hasSuppliers ? <TopEntitiesBarChart data={supplierData} label="المدفوع" color="#10b981" /> : <NoDataPlaceholder message="لا توجد مدفوعات موردين" />}
        </ChartCard>
      </div> */}

      {/* الصف الثالث */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartCard 
          title="أداء الفروع" 
          subtitle="مقارنة الإيرادات"
          icon={Activity}
          className="lg:col-span-3"
        >
           {hasBranchData ? <BranchPerformanceChart data={branchData} /> : <NoDataPlaceholder message="لا توجد بيانات فروع" />}
        </ChartCard>

        <ChartCard 
          title="الاتجاه العام" 
          subtitle="آخر 30 يوم"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
           {hasTrendData ? <OverallTrendChart data={trendData} /> : <NoDataPlaceholder message="لا توجد بيانات اتجاه" />}
        </ChartCard>
      </div>

    </div>
  );
}