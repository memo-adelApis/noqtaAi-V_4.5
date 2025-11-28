"use client";

import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';

/**
 * هذا "Client Component"
 * مسؤول عن عرض الرسم البياني فقط
 * يتلقى البيانات (data) كـ prop من (Server Component)
 */
export default function DashboardChart({ data }) {

    // التأكد من أن البيانات موجودة قبل محاولة العرض
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <PieChart size={48} className="text-gray-400 mb-4" />
                <p className="text-lg font-medium">لا توجد بيانات كافية</p>
                <p className="text-sm text-gray-400">سيظهر الرسم البياني هنا عندما تتوفر البيانات</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">نظرة عامة على الأداء</h3>
                        <p className="text-sm text-gray-500">مقارنة الإيرادات والمصروفات</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">بيانات حية</span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 0,
                            left: 0,
                            bottom: 10,
                        }}
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
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis 
                            tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                            axisLine={{ stroke: '#e5e5e5' }}
                            tickLine={{ stroke: '#e5e5e5' }}
                            width={45}
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 min-w-[180px]">
                                            <p className="font-bold text-gray-900 mb-2 text-sm">{label}</p>
                                            <div className="space-y-2">
                                                {payload.map((entry, index) => (
                                                    <div key={index} className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-sm"
                                                                style={{ backgroundColor: entry.color }}
                                                            />
                                                            <span className="text-sm text-gray-600 font-medium">
                                                                {entry.name}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-gray-900 text-sm">
                                                            {entry.value.toLocaleString()}
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
                        <Legend 
                            wrapperStyle={{ 
                                paddingTop: '20px',
                                fontSize: '14px'
                            }}
                            iconType="circle"
                            iconSize={10}
                            formatter={(value) => (
                                <span className="text-sm font-medium text-gray-700">{value}</span>
                            )}
                        />
                        <Bar 
                            dataKey="revenue" 
                            name="الإيرادات" 
                            fill="#4f46e5" 
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar 
                            dataKey="expense" 
                            name="المصروفات" 
                            fill="#10b981" 
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Chart Stats */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#4f46e5] rounded-sm"></div>
                    <span className="text-sm text-gray-600">الإيرادات</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#10b981] rounded-sm"></div>
                    <span className="text-sm text-gray-600">المصروفات</span>
                </div>
            </div>
        </div>
    );
}