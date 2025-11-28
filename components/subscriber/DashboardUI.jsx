"use client"; // هذا الملف يعمل في المتصفح

import { useMemo } from 'react';
import { useAnalyticsData } from "@/app/hooks/useAnalyticsData";
import AnalyticsCharts from "@/components/subscriber/AnalyticsCharts";
import { DollarSign, Users, Building, AlertCircle, AlertTriangle, UserCheck, Truck } from "lucide-react";
import { MoonLoader } from "react-spinners";
import SubscriptionAlert from '@/components/subscriber/SubscriptionAlert';

// دالة تنسيق الأرقام
const formatNumber = (num) => new Intl.NumberFormat("ar-EG").format(num || 0);

// --- المكونات الفرعية (StatCard, TopPerformersCard, BranchLeaderboard) ---
// (ضع هنا نفس المكونات التي كتبتها في كودك السابق كما هي تماماً)
function StatCard({ title, value, icon: Icon, iconBgClass, iconTextClass, details }) {
  return (
    <div className="bg-[#1c1d22] p-6 rounded-2xl border border-[#2e2f33] shadow-lg flex items-center gap-4 hover:border-gray-600 transition-colors">
      <div className={`p-3 rounded-full ${iconBgClass}`}>
        <Icon className={iconTextClass} size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{formatNumber(value)}</p>
        {details && <p className="text-xs text-gray-500 mt-1">{details}</p>}
      </div>
    </div>
  );
}

function TopPerformersCard({ title, data = [], icon: Icon, barColor = "bg-blue-600" }) {
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item.total || 0));
  }, [data]);

  return (
    <div className="bg-[#1c1d22] p-6 rounded-2xl border border-[#2e2f33] shadow-lg flex flex-col h-full">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-[#2e2f33]">
        <div className="p-2 bg-[#2e2f33] rounded-lg text-gray-300">
            <Icon size={20} /> 
        </div>
        {title}
      </h3>

      <div className="space-y-6 flex-1">
        {(!data || data.length === 0) && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <p>لا توجد بيانات حالياً.</p>
            </div>
        )}

        {data && data.map((item, index) => {
          const percentage = ((item.total || 0) / maxValue) * 100;
          return (
            <div key={item._id || index} className="group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded-full ${index < 3 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatNumber(item.total ?? 0)} 
                  <span className="text-[10px] font-normal text-gray-500 mr-1">ج.م</span>
                </span>
              </div>
              <div className="w-full bg-[#2e2f33] rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out relative`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BranchLeaderboard({ data = [] }) {
  return (
    <div className="bg-[#1c1d22] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-gray-800 bg-[#252830]/50">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Building size={20} className="text-orange-500" />
          ملخص أداء الفروع
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#252830]">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الفرع</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الإيرادات</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المصروفات</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">صافي الربح</th>
            </tr>
          </thead>
          <tbody className="bg-[#1c1d22] divide-y divide-gray-800">
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">لا توجد بيانات لعرضها.</td>
              </tr>
            ) : (
              data.map((branch, index) => (
                <tr key={branch.name || index} className="hover:bg-[#292a30] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{branch.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-semibold">{formatNumber(branch.revenue || branch.value)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">{formatNumber(branch.expenses)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${(branch.profit || 0) >= 0 ? "text-blue-400" : "text-red-500"}`}>
                    {formatNumber(branch.profit)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- المكون الرئيسي للعميل ---
export default function DashboardUI({ subscription }) {
  const { stats, analytics, isLoading, error } = useAnalyticsData();

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#0f0f11] text-gray-400"><MoonLoader /></div>;
  if (error) return <div className="p-8 text-center text-red-400 bg-[#0f0f11] h-screen">{error}</div>;

  const safeStats = stats || { netProfit: 0, totalReceivables: 0, totalPayables: 0, totalEmployees: 0, totalBranches: 0 };
  const safeAnalytics = analytics || { topCustomers: [], topSuppliers: [], branchPerformance: [] };

  return (
    <div className="bg-[#0f0f11] min-h-screen md:p-8 space-y-8" dir="rtl">
      
      {/* تمرير الاشتراك للتنبيه */}
      <SubscriptionAlert subscription={subscription} />

      {/* شريط التنقل السريع */}
      <div className="flex gap-3 overflow-x-auto py-2 pb-4 no-scrollbar border-b border-gray-800">
        <a href="#stats" className="px-4 py-1.5 bg-[#1c1d22] text-gray-300 border border-gray-700 rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all text-sm whitespace-nowrap">📊 الإحصائيات</a>
        <a href="#charts" className="px-4 py-1.5 bg-[#1c1d22] text-gray-300 border border-gray-700 rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all text-sm whitespace-nowrap">📈 الرسوم البيانية</a>
        <a href="#top-performers" className="px-4 py-1.5 bg-[#1c1d22] text-gray-300 border border-gray-700 rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all text-sm whitespace-nowrap">🏆 الأفضل أداءً</a>
        <a href="#branches" className="px-4 py-1.5 bg-[#1c1d22] text-gray-300 border border-gray-700 rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all text-sm whitespace-nowrap">🏢 تفاصيل الفروع</a>
      </div>

      {/* 1. قسم الإحصائيات */}
      <section id="stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="صافي الربح" value={safeStats.netProfit} icon={DollarSign} iconBgClass={safeStats.netProfit >= 0 ? "bg-blue-900/20" : "bg-red-900/20"} iconTextClass={safeStats.netProfit >= 0 ? "text-blue-400" : "text-red-400"} />
        <StatCard title="مستحقات (لك)" value={safeStats.totalReceivables} icon={AlertTriangle} iconBgClass="bg-yellow-900/20" iconTextClass="text-yellow-400" details="لدى العملاء" />
        <StatCard title="مستحقات (عليك)" value={safeStats.totalPayables} icon={AlertCircle} iconBgClass="bg-red-900/20" iconTextClass="text-red-400" details="للموردين" />
        <StatCard title="الموظفين" value={safeStats.totalEmployees} icon={Users} iconBgClass="bg-purple-900/20" iconTextClass="text-purple-400" />
        <StatCard title="الفروع" value={safeStats.totalBranches} icon={Building} iconBgClass="bg-orange-900/20" iconTextClass="text-orange-400" />
      </section>

      {/* 2. الرسوم البيانية */}
      <section id="charts">
        <AnalyticsCharts />
      </section>

      {/* 3. الأفضل أداءً */}
      <section id="top-performers" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformersCard title="أفضل 5 عملاء" data={safeAnalytics.topCustomers} icon={UserCheck} barColor="bg-blue-600" />
        <TopPerformersCard title="أعلى 5 موردين" data={safeAnalytics.topSuppliers} icon={Truck} barColor="bg-orange-500" />
      </section>

      {/* 4. أداء الفروع */}
      <section id="branches">
        <BranchLeaderboard data={safeAnalytics.branchPerformance} />
      </section>
    </div>
  );
}