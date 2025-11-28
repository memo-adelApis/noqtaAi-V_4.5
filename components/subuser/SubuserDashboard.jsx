"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardChart from './DashboardChart';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    AlertTriangle,
    FileText,
    Users,
    BarChart3,
    Download,
    Eye,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

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

// دالة لحساب النسبة المئوية للتغيير
const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { percentage: 0, trend: 'neutral' };
    const percentage = ((current - previous) / previous) * 100;
    return {
        percentage: Math.abs(percentage).toFixed(1),
        trend: percentage >= 0 ? 'up' : 'down'
    };
};

// بطاقة إحصائيات محسنة
function StatCard({ title, value, icon: Icon, change, description, color = 'blue' }) {
    const colorClasses = {
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
        green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-600' },
        red: { bg: 'bg-red-50', icon: 'text-red-600', text: 'text-red-600' },
        yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-600' },
        purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' }
    };

    const { bg, icon, text } = colorClasses[color];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${bg} group-hover:scale-105 transition-transform`}>
                    <Icon size={24} className={icon} />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        change.trend === 'up' ? 'text-green-600' : 
                        change.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                        {change.trend === 'up' ? <ArrowUpRight size={16} /> : 
                         change.trend === 'down' ? <ArrowDownRight size={16} /> : null}
                        <span>{change.percentage}%</span>
                    </div>
                )}
            </div>
            
            <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
                {description && (
                    <p className="text-xs text-gray-500">{description}</p>
                )}
            </div>
        </div>
    );
}

// بطاقة فاتورة محسنة
function InvoiceCard({ invoice }) {
    const statusConfig = {
        paid: { color: 'bg-green-100 text-green-700', text: 'مدفوعة' },
        pending: { color: 'bg-yellow-100 text-yellow-700', text: 'معلقة' },
        overdue: { color: 'bg-red-100 text-red-700', text: 'متأخرة' }
    };

    const { color, text } = statusConfig[invoice.status] || statusConfig.pending;

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 group">
            <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${
                    invoice.type === 'revenue' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                    {invoice.type === 'revenue' ? 
                        <TrendingUp size={16} className="text-green-600" /> : 
                        <TrendingDown size={16} className="text-red-600" />
                    }
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                        {invoice.type === 'revenue' 
                            ? invoice.customerId?.name || 'عميل محذوف'
                            : invoice.supplierId?.name || 'مورد محذوف'
                        }
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <Calendar size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-500">
                            {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                            {text}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="text-left ml-4">
                <p className="font-bold text-gray-900 text-lg">
                    {formatNumber(invoice.totalInvoice)}
                </p>
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye size={14} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                        <Download size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// المكون الرئيسي
export default function SubuserDashboard({ initialData, error }) {
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(!initialData);

    useEffect(() => {
        if (!initialData) {
            // يمكن إضافة جلب البيانات هنا إذا لزم الأمر
            setIsLoading(false);
        }
    }, [initialData]);

    if (error && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 p-8 text-center">
                <AlertTriangle size={48} className="text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
                <p className="text-gray-600 mb-4">{error || "تعذر تحميل بيانات لوحة التحكم"}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    if (isLoading || !data) {
        return <div>جاري التحميل...</div>;
    }

    const { stats, recentInvoices, chartData } = data;

    // بيانات افتراضية للتغيير (يمكن استبدالها ببيانات حقيقية)
    const changeData = {
        revenue: calculateChange(stats.totalRevenue, stats.totalRevenue * 0.85),
        expenses: calculateChange(stats.totalExpenses, stats.totalExpenses * 1.1),
        profit: calculateChange(stats.netProfit, stats.netProfit * 0.9),
        invoices: { percentage: '12.5', trend: 'up' }
    };

    return (
        <div className="space-y-8">
            {/* الرأس */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-600 mt-2">نظرة عامة على أداء فرعك وأحدث الإحصائيات</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <Calendar size={16} />
                        <span>آخر 30 يوم</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download size={16} />
                        <span>تصدير التقرير</span>
                    </button>
                </div>
            </div>

            {/* 1. بطاقات الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="إجمالي الإيرادات"
                    value={formatNumber(stats.totalRevenue)}
                    icon={TrendingUp}
                    change={changeData.revenue}
                    description="إجمالي الدخل الشهري"
                    color="green"
                />
                <StatCard 
                    title="إجمالي المصروفات"
                    value={formatNumber(stats.totalExpenses)}
                    icon={TrendingDown}
                    change={changeData.expenses}
                    description="إجمالي النفقات الشهرية"
                    color="red"
                />
                <StatCard 
                    title="صافي الربح"
                    value={formatNumber(stats.netProfit)}
                    icon={DollarSign}
                    change={changeData.profit}
                    description="صافي الدخل بعد الخصومات"
                    color="blue"
                />
                <StatCard 
                    title="الفواتير المعلقة"
                    value={stats.pendingInvoices}
                    icon={AlertTriangle}
                    change={changeData.invoices}
                    description="فواتير بانتظار الدفع"
                    color="yellow"
                />
            </div>

            {/* 2. الإجراءات السريعة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link 
                    href="/subuser/invoices/add"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                >
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">إضافة فاتورة</p>
                        <p className="text-sm text-gray-500">إنشاء فاتورة جديدة</p>
                    </div>
                </Link>
                
                <Link 
                    href="/subuser/customers/add"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                >
                    <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                        <Users size={20} className="text-green-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">إضافة عميل</p>
                        <p className="text-sm text-gray-500">تسجيل عميل جديد</p>
                    </div>
                </Link>

                <Link 
                    href="/subuser/reports"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
                >
                    <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                        <BarChart3 size={20} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">التقارير</p>
                        <p className="text-sm text-gray-500">عرض التقارير التفصيلية</p>
                    </div>
                </Link>

                <Link 
                    href="/subuser/invoices"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all group"
                >
                    <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                        <Eye size={20} className="text-orange-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">عرض الكل</p>
                        <p className="text-sm text-gray-500">استعراض جميع الفواتير</p>
                    </div>
                </Link>
            </div>

            {/* 3. المحتوى الرئيسي */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* الرسم البياني */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">الأداء المالي</h3>
                            <p className="text-gray-600">تحليل الإيرادات والمصروفات خلال الفترة</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>الإيرادات</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
                            <span>المصروفات</span>
                        </div>
                    </div>
                    <div className="h-80">
                        <DashboardChart data={chartData} />
                    </div>
                </div>

                {/* أحدث الفواتير */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">أحدث المعاملات</h3>
                            <p className="text-gray-600">آخر الفواتير المسجلة</p>
                        </div>
                        <Link 
                            href="/subuser/invoices"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            عرض الكل
                        </Link>
                    </div>
                    
                    <div className="space-y-3">
                        {recentInvoices.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                                <p>لا توجد فواتير لعرضها</p>
                            </div>
                        ) : (
                            recentInvoices.map((invoice) => (
                                <InvoiceCard key={invoice._id} invoice={invoice} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 4. معلومات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900">ملخص الأداء</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                            <span className="text-gray-700">معدل النمو الشهري</span>
                            <span className="font-semibold text-green-600">+12.5%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                            <span className="text-gray-700">أعلى شهر في الإيرادات</span>
                            <span className="font-semibold text-gray-900">يناير</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-700">متوسط وقت التحصيل</span>
                            <span className="font-semibold text-gray-900">15 يوم</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 size={20} className="text-green-600" />
                        <h3 className="font-semibold text-gray-900">المقارنات</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-green-100">
                            <span className="text-gray-700">مقارنة بالشهر الماضي</span>
                            <span className="font-semibold text-green-600">+8.3%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-green-100">
                            <span className="text-gray-700">مقارنة بالربع الماضي</span>
                            <span className="font-semibold text-green-600">+22.1%</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-700">مقارنة بالعام الماضي</span>
                            <span className="font-semibold text-green-600">+45.7%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}