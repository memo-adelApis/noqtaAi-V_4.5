// components/subuser/reports/BranchReportUI_Enhanced.jsx
"use client";

import { 
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
    TrendingUp, TrendingDown, DollarSign, FileText, BarChart3, Activity, 
    Sparkles, Brain, Target, AlertCircle, CheckCircle, Zap, TrendingUpDown
} from 'lucide-react';

// دالة لتنسيق الأرقام
const formatNumber = (amount) => {
    if (!amount && amount !== 0) return "0";
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toLocaleString('en-US');
};

// ألوان للرسوم البيانية
const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

// بطاقة إحصائيات محسنة - Dark Mode
function StatCard({ title, value, icon: Icon, trend, percentage, description }) {
    return (
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white mb-2" suppressHydrationWarning>{value}</p>
                    
                    {trend && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                            trend === 'up' ? 'text-green-400' : 'text-red-400'
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
                
                <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${
                    title.includes('الإيرادات') ? 'bg-green-900/50' :
                    title.includes('المصروفات') ? 'bg-red-900/50' :
                    title.includes('الربح') ? 'bg-blue-900/50' : 'bg-purple-900/50'
                }`}>
                    <Icon size={24} className={
                        title.includes('الإيرادات') ? 'text-green-400' :
                        title.includes('المصروفات') ? 'text-red-400' :
                        title.includes('الربح') ? 'text-blue-400' : 'text-purple-400'
                    } />
                </div>
            </div>
        </div>
    );
}

// بطاقة تحليل الذكاء الاصطناعي
function AIInsightCard({ title, value, description, icon: Icon, color = 'blue' }) {
    const colorClasses = {
        blue: { bg: 'from-blue-900/50 to-indigo-900/50', border: 'border-blue-800/50', icon: 'text-blue-400' },
        purple: { bg: 'from-purple-900/50 to-fuchsia-900/50', border: 'border-purple-800/50', icon: 'text-purple-400' },
        green: { bg: 'from-green-900/50 to-emerald-900/50', border: 'border-green-800/50', icon: 'text-green-400' },
        orange: { bg: 'from-orange-900/50 to-red-900/50', border: 'border-orange-800/50', icon: 'text-orange-400' }
    };

    const { bg, border, icon: iconColor } = colorClasses[color];

    return (
        <div className={`bg-gradient-to-br ${bg} p-6 rounded-2xl border ${border} hover:shadow-xl transition-all`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-black/20 rounded-lg">
                    <Icon size={20} className={iconColor} />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
            </div>
            <div className="space-y-3">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-gray-300">{description}</p>
            </div>
        </div>
    );
}

export default function BranchReportUI({ reportData }) {
    
    // استخراج البيانات
    const stats = reportData?.stats || {};
    const chartData = reportData?.chartData || [];
    
    // بيانات الذكاء الاصطناعي
    const bestMonth = reportData?.bestMonth?.name || "غير متوفر";
    const bestExpenseMonth = reportData?.bestExpenseMonth?.name || "غير متوفر";
    const growthRate = reportData?.growthRate || "0";
    const nextMonthRevenue = reportData?.prediction?.nextMonthRevenue || 0;
    const branchHealth = reportData?.branchHealth || "جيد";
    
    // حساب بيانات إضافية للذكاء الاصطناعي
    const profitMargin = stats.totalRevenue ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0;
    const avgMonthlyRevenue = chartData.length > 0 ? 
        (chartData.reduce((sum, item) => sum + (item.revenue || 0), 0) / chartData.length).toFixed(0) : 0;
    
    // بيانات للرسم الدائري (توزيع الإيرادات)
    const pieData = [
        { name: 'إيرادات', value: stats.totalRevenue || 0 },
        { name: 'مصروفات', value: stats.totalExpenses || 0 },
    ];

    return (
        <div className="min-h-screen bg-gray-950 py-8 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-xl">
                                <BarChart3 className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">تقرير أداء الفرع</h1>
                                <p className="text-gray-400 mt-1">تحليل شامل مدعوم بالذكاء الاصطناعي</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-800/50 rounded-full">
                            <Activity size={16} className="text-green-400" />
                            <span className="text-sm font-medium text-green-400">بيانات حية</span>
                        </div>
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
                        value={`${profitMargin}%`} 
                        icon={Target}
                        trend="up"
                        percentage="2.1"
                        description="كفاءة الأداء المالي"
                    />
                </div>
                
                {/* 2. تحليلات الذكاء الاصطناعي */}
                <div className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-900/50 rounded-lg">
                            <Brain size={24} className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">تحليلات الذكاء الاصطناعي</h2>
                            <p className="text-sm text-gray-400">رؤى وتوقعات مدعومة بالذكاء الاصطناعي</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AIInsightCard
                            title="التوقع للشهر القادم"
                            value={formatNumber(nextMonthRevenue)}
                            description="إيراد متوقع بناءً على الاتجاه الحالي"
                            icon={Sparkles}
                            color="purple"
                        />
                        <AIInsightCard
                            title="معدل النمو"
                            value={`${growthRate}%`}
                            description={Number(growthRate) > 0 ? "نمو إيجابي مستمر" : "يحتاج تحسين"}
                            icon={TrendingUpDown}
                            color="blue"
                        />
                        <AIInsightCard
                            title="صحة الفرع"
                            value={branchHealth}
                            description="تقييم شامل للأداء العام"
                            icon={branchHealth === "ممتاز" ? CheckCircle : AlertCircle}
                            color="green"
                        />
                        <AIInsightCard
                            title="متوسط الإيراد الشهري"
                            value={formatNumber(avgMonthlyRevenue)}
                            description="المتوسط خلال الفترة المحددة"
                            icon={Zap}
                            color="orange"
                        />
                    </div>
                </div>

                {/* 3. الرسوم البيانية */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* الرسم البياني الخطي */}
                    <div className="lg:col-span-2 bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-900/50 rounded-lg">
                                    <Activity size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">التطور الشهري للأداء</h2>
                                    <p className="text-sm text-gray-400">مقارنة الإيرادات والمصروفات</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#8B5CF6] rounded-full"></div>
                                    <span className="text-sm text-gray-400">الإيرادات</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                                    <span className="text-sm text-gray-400">المصروفات</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-80" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis 
                                        dataKey={chartData[0]?.date ? "date" : "name"} 
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        axisLine={{ stroke: '#374151' }}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1F2937', 
                                            border: '1px solid #374151',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        name="الإيرادات" 
                                        stroke="#8B5CF6" 
                                        strokeWidth={3}
                                        fill="url(#colorRevenue)"
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="expenses" 
                                        name="المصروفات" 
                                        stroke="#10B981" 
                                        strokeWidth={3}
                                        fill="url(#colorExpenses)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* الرسم الدائري */}
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-900/50 rounded-lg">
                                <Target size={20} className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">التوزيع المالي</h2>
                                <p className="text-sm text-gray-400">نسبة الإيرادات للمصروفات</p>
                            </div>
                        </div>
                        
                        <div className="h-64" dir="ltr">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1F2937', 
                                            border: '1px solid #374151',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                                <span className="text-gray-300">نسبة الربح</span>
                                <span className="font-bold text-green-400">{profitMargin}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                                <span className="text-gray-300">أفضل شهر</span>
                                <span className="font-bold text-white">{bestMonth}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. ملخص الأداء والتوصيات */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-6 rounded-2xl border border-blue-800/50">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText size={20} className="text-blue-400" />
                            <h3 className="font-semibold text-white">ملخص الأداء التاريخي</h3>
                        </div>
                        <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex justify-between border-b border-blue-800/30 pb-2">
                                <span>أعلى شهر في الإيرادات:</span>
                                <span className="font-bold text-blue-400">{bestMonth}</span>
                            </div>
                            <div className="flex justify-between border-b border-blue-800/30 pb-2">
                                <span>أفضل شهر (توفير مصروفات):</span>
                                <span className="font-bold text-blue-400">{bestExpenseMonth}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span>معدل النمو الشهري:</span>
                                <span dir="ltr" className={`font-bold ${Number(growthRate) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {growthRate}%
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-900/50 to-fuchsia-900/50 p-6 rounded-2xl border border-purple-800/50">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles size={20} className="text-purple-400" />
                            <h3 className="font-semibold text-white">توصيات الذكاء الاصطناعي</h3>
                        </div>
                        <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex items-start gap-2 p-3 bg-black/20 rounded-lg">
                                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>استمر في الأداء الجيد - النمو إيجابي</span>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-black/20 rounded-lg">
                                <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span>راقب المصروفات في الأشهر القادمة</span>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-black/20 rounded-lg">
                                <Zap size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>فرصة لزيادة الإيرادات بنسبة 15%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
