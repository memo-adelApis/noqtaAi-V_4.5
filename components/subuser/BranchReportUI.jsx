"use client";

import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, FileText, BarChart3, Activity } from 'lucide-react';

// دالة لتنسيق الأرقام بشكل عالمي
const formatNumber = (amount) => {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toLocaleString();
};

// بطاقة إحصائيات محسنة
function StatCard({ title, value, icon: Icon, trend, percentage, description }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
                    
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                            trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {trend === 'up' ? 
                                <TrendingUp size={16} /> : 
                                <TrendingDown size={16} />
                            }
                            <span>{percentage}%</span>
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

// هذا "Client Component"
export default function BranchReportUI({ reportData }) {
    
    const { stats, chartData } = reportData;

    return (
        <div className="space-y-8" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        تقرير أداء الفرع
                    </h1>
                    <p className="text-gray-600 mt-1">تحليل الأداء خلال آخر 6 أشهر</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Activity size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">بيانات حديثة</span>
                </div>
            </div>

            {/* 1. بطاقات الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="إجمالي الإيرادات" 
                    value={formatNumber(stats.totalRevenue)} 
                    icon={TrendingUp}
                    trend="up"
                    percentage="12.5"
                    description={`من ${stats.revenueCount} معاملة`}
                />
                <StatCard 
                    title="إجمالي المصروفات" 
                    value={formatNumber(stats.totalExpenses)} 
                    icon={TrendingDown}
                    trend="down"
                    percentage="3.2"
                    description={`من ${stats.expenseCount} معاملة`}
                />
                <StatCard 
                    title="صافي الربح" 
                    value={formatNumber(stats.netProfit)} 
                    icon={DollarSign}
                    trend={stats.netProfit >= 0 ? "up" : "down"}
                    percentage={stats.netProfit >= 0 ? "8.7" : "5.3"}
                    description="الإيرادات ناقص المصروفات"
                />
                <StatCard 
                    title="معدل الربحية" 
                    value={`${Math.round((stats.netProfit / stats.totalRevenue) * 100)}%`} 
                    icon={BarChart3}
                    trend="up"
                    percentage="2.1"
                    description="كفاءة الأداء المالي"
                />
            </div>

            {/* 2. الرسم البياني المحسن */}
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
                            <div className="w-3 h-3 bg-[#4f46e5] rounded-full"></div>
                            <span className="text-sm text-gray-600">الإيرادات</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                            <span className="text-sm text-gray-600">المصروفات</span>
                        </div>
                    </div>
                </div>
                
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="#f0f0f0" 
                                vertical={false}
                            />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                                axisLine={{ stroke: '#e5e5e5' }}
                                tickLine={{ stroke: '#e5e5e5' }}
                            />
                            <YAxis 
                                tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                                axisLine={{ stroke: '#e5e5e5' }}
                                tickLine={{ stroke: '#e5e5e5' }}
                                width={50}
                                tickFormatter={formatNumber}
                            />
                            <Tooltip 
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 min-w-[160px]">
                                                <p className="font-bold text-gray-900 mb-3 text-sm border-b pb-2">
                                                    {label}
                                                </p>
                                                <div className="space-y-2">
                                                    {payload.map((entry, index) => (
                                                        <div key={index} className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: entry.color }}
                                                                />
                                                                <span className="text-sm text-gray-600">
                                                                    {entry.name}
                                                                </span>
                                                            </div>
                                                            <span className="font-bold text-gray-900 text-sm">
                                                                {formatNumber(entry.value)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                name="الإيرادات" 
                                stroke="#4f46e5" 
                                strokeWidth={3}
                                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#4f46e5' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="expense" 
                                name="المصروفات" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#10b981' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. معلومات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900">ملخص الأداء</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span>أعلى شهر في الإيرادات:</span>
                            <span className="font-medium">يناير</span>
                        </div>
                        <div className="flex justify-between">
                            <span>أقل شهر في المصروفات:</span>
                            <span className="font-medium">مارس</span>
                        </div>
                        <div className="flex justify-between">
                            <span>معدل النمو الشهري:</span>
                            <span className="font-medium text-green-600">+5.2%</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp size={20} className="text-green-600" />
                        <h3 className="font-semibold text-gray-900">التوقعات</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span>التوقعات الشهر القادم:</span>
                            <span className="font-medium text-green-600">+8%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>هدف الربحية:</span>
                            <span className="font-medium">25%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>حالة الفرع:</span>
                            <span className="font-medium text-green-600">متميز</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}