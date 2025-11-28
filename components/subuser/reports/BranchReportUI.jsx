// components/subuser/BranchReportUI.jsx
"use client";

import { 
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, FileText, BarChart3, Activity, Sparkles } from 'lucide-react';

// دالة لتنسيق الأرقام بشكل عالمي
const formatNumber = (amount) => {
    if (!amount && amount !== 0) return "0";
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toLocaleString('en-US');
};

// بطاقة إحصائيات محسنة
function StatCard({ title, value, icon: Icon, trend, percentage, description }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-2" suppressHydrationWarning>{value}</p>
                    
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                            trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {trend === 'up' ? 
                                <TrendingUp size={16} /> : 
                                <TrendingDown size={16} />
                            }
                            <span dir="ltr">{percentage}%</span>
                        </div>
                    )}
                    
                    {description && (
                        <p className="text-xs text-gray-500 mt-2">{description}</p>
                    )}
                </div>
                
                <div className={`p-3 rounded-xl ${
                    title.includes('الإيرادات') ? 'bg-green-50' :
                    title.includes('المصروفات') ? 'bg-red-50' :
                    title.includes('الربح') ? 'bg-blue-50' : 'bg-purple-50'
                }`}>
                    <Icon size={24} className={
                        title.includes('الإيرادات') ? 'text-green-600' :
                        title.includes('المصروفات') ? 'text-red-600' :
                        title.includes('الربح') ? 'text-blue-600' : 'text-purple-600'
                    } />
                </div>
            </div>
        </div>
    );
}

export default function BranchReportUI({ reportData }) {
    
    // 1. استخراج البيانات (سواء من السيرفر مباشرة أو من الذكاء الاصطناعي)
    const stats = reportData?.stats || {};
    const chartData = reportData?.chartData || [];
    
    // بيانات الذكاء الاصطناعي (مع قيم افتراضية في حالة عدم توفرها)
    const bestMonth = reportData?.bestMonth?.name || "غير متوفر";
    const bestExpenseMonth = reportData?.bestExpenseMonth?.name || "غير متوفر";
    const growthRate = reportData?.growthRate || "0";
    const nextMonthRevenue = reportData?.prediction?.nextMonthRevenue || 0;
    const branchHealth = reportData?.branchHealth || "يتم التحليل...";

    return (
        <div className="space-y-8" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        تقرير أداء الفرع
                    </h1>
                    <p className="text-gray-600 mt-1">تحليل الأداء المالي والعمليات</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Activity size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">بيانات حية</span>
                </div>
            </div>
            {/* 1. بطاقات الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="إجمالي الإيرادات" 
                    value={formatNumber(stats.totalRevenue)} 
                    icon={TrendingUp}
                    trend="up"
                    percentage="12.5" // يمكنك جعل هذا ديناميكياً لاحقاً
                    description={`من ${stats.invoicesCount || 0} فاتورة`}
                />
                <StatCard 
                    title="إجمالي المصروفات" 
                    value={formatNumber(stats.totalExpenses)} 
                    icon={TrendingDown}
                    trend="down"
                    percentage="3.2"
                    description="مصروفات تشغيلية"
                />
                <StatCard 
                    title="صافي الربح" 
                    value={formatNumber(stats.netProfit)} 
                    icon={DollarSign}
                    trend={stats.netProfit >= 0 ? "up" : "down"}
                    percentage={stats.netProfit >= 0 ? "8.7" : "5.3"}
                    description="الإيرادات - المصروفات"
                />
                <StatCard 
                    title="معدل الربحية" 
                    value={`${stats.totalRevenue ? Math.round((stats.netProfit / stats.totalRevenue) * 100) : 0}%`} 
                    icon={BarChart3}
                    trend="up"
                    percentage="2.1"
                    description="كفاءة الأداء المالي"
                />
            </div>
            
            {/* 3. ملخص الذكاء الاصطناعي (ديناميكي الآن) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* كارت ملخص الأداء */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900">ملخص الأداء التاريخي</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between border-b border-blue-200/50 pb-2">
                            <span>أعلى شهر في الإيرادات:</span>
                            <span className="font-bold text-blue-700">{bestMonth}</span>
                        </div>
                        <div className="flex justify-between border-b border-blue-200/50 pb-2">
                            <span>أفضل شهر (توفير مصروفات):</span>
                            <span className="font-bold text-blue-700">{bestExpenseMonth}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span>معدل النمو الشهري:</span>
                            <span dir="ltr" className={`font-bold ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {growthRate}%
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* كارت التوقعات */}
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles size={20} className="text-purple-600" />
                        <h3 className="font-semibold text-gray-900">توقعات الذكاء الاصطناعي</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between border-b border-purple-200/50 pb-2">
                            <span>الإيراد المتوقع للشهر القادم:</span>
                            <span className="font-bold text-purple-700">{formatNumber(nextMonthRevenue)}</span>
                        </div>
                        <div className="flex justify-between border-b border-purple-200/50 pb-2">
                            <span>اتجاه السوق:</span>
                            <span className="font-medium">
                                {Number(growthRate) > 0 ? "صعودي 📈" : "هبوطي 📉"}
                            </span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span>حالة الفرع العامة:</span>
                            <span className="font-bold text-purple-700">{branchHealth}</span>
                        </div>
                    </div>
                </div>
            </div>

            

       


                 {/* 2. الرسم البياني المحسن (Line Chart) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Activity size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">التطور الشهري للأداء</h2>
                            <p className="text-sm text-gray-600">مقارنة الإيرادات والمصروفات خلال الفترة</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#8B5CF6] rounded-full"></div>
                            <span className="text-sm text-gray-600">الإيرادات</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                            <span className="text-sm text-gray-600">المصروفات</span>
                        </div>
                    </div>
                </div>
                
                <div className="h-80" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis 
                                dataKey={chartData[0]?.date ? "date" : "name"} 
                                tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                                axisLine={{ stroke: '#e5e5e5' }}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis 
                                tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
                            />
                            <Tooltip 
                                cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                name="الإيرادات" 
                                stroke="#8B5CF6" 
                                strokeWidth={3}
                                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, fill: '#8B5CF6' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="expenses" 
                                name="المصروفات" 
                                stroke="#10B981" 
                                strokeWidth={3}
                                dot={{ fill: '#10B981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, fill: '#10B981' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}