"use client";

import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Users, BarChart3 } from 'lucide-react';

// دالة لتنسيق الأرقام بشكل عالمي
const formatNumber = (amount) => {
    if (!amount && amount !== 0) return '0';
    
    if (Math.abs(amount) >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(amount) >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return Math.round(amount).toLocaleString();
};

// --- مكون بطاقة الإحصائيات المحسن ---
function StatCard({ title, value, icon: Icon, color = 'blue', trend, description }) {
    const colorConfig = {
        green: {
            bg: 'bg-green-50',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            text: 'text-green-600'
        },
        red: {
            bg: 'bg-red-50',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            text: 'text-red-600'
        },
        blue: {
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            text: 'text-blue-600'
        },
        yellow: {
            bg: 'bg-yellow-50',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            text: 'text-yellow-600'
        },
        purple: {
            bg: 'bg-purple-50',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            text: 'text-purple-600'
        }
    };

    const { bg, iconBg, iconColor, text } = colorConfig[color];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className={iconColor} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        trend === 'up' ? 'text-green-600' : 
                        trend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                        {trend === 'up' ? <TrendingUp size={16} /> : 
                         trend === 'down' ? <TrendingDown size={16} /> : null}
                    </div>
                )}
            </div>
            
            <div>
                <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                {description && (
                    <p className="text-xs text-gray-500">{description}</p>
                )}
            </div>
        </div>
    );
}

// --- المكون الرئيسي للكروت ---
export default function StatCards({ stats }) {
    // بيانات افتراضية للاتجاهات (يمكن استبدالها ببيانات حقيقية)
    const trends = {
        revenue: 'up',
        expenses: 'down',
        profit: 'up',
        invoices: 'up'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="إجمالي الإيرادات" 
                value={formatNumber(stats.totalRevenue)}
                icon={TrendingUp}
                color="green"
                trend={trends.revenue}
                description="إجمالي الدخل الشهري"
            />
            <StatCard 
                title="إجمالي المصروفات" 
                value={formatNumber(stats.totalExpenses)}
                icon={TrendingDown}
                color="red"
                trend={trends.expenses}
                description="إجمالي النفقات الشهرية"
            />
            <StatCard 
                title="صافي الربح" 
                value={formatNumber(stats.netProfit)}
                icon={DollarSign}                       

                color="blue"
                trend={trends.profit}
                description="صافي الدخل بعد الخصومات"
            />
            <StatCard 
                title="الفواتير المعلقة" 
                value={Number (stats.pendingInvoices.toLocaleString('en-US'))}
                icon={AlertCircle}
                color="yellow"
                trend={trends.invoices}
                description="فواتير بانتظار الدفع"
            />
        </div>
    );
}