"use client";

import { useEffect, useState, useCallback } from "react";
import { getStoreAnalyticsData } from "@/app/actions/storeAnalyticsActions";
import { 
  Package, DollarSign, AlertTriangle, Boxes, PieChart, ArrowRight, Printer 
} from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';

const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];

// --- دالة رسم الشكل التفاعلي (Active Shape) ---
const renderActiveShape = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  // ... (نفس كود الدالة السابق بدون تغيير) ...
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff" className="text-lg font-bold fill-current text-gray-900 dark:text-white print:text-black">
        {payload.name}
      </text>
      <Sector
        cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
      />
      <Sector
        cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
        innerRadius={outerRadius + 12} outerRadius={outerRadius + 15} fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-sm font-bold dark:text-white print:text-black">
        {`${value.toLocaleString()} ج.م`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`(النسبة ${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

// مكون البطاقة
const StatCard = ({ title, value, icon: Icon, textColor, bgColor }) => (
  <div className="bg-[#1c1d22] p-5 rounded-xl border border-gray-800 shadow-lg flex items-center justify-between print:border print:border-gray-300 print:bg-white print:shadow-none">
    <div>
      <p className="text-gray-400 text-sm font-medium mb-1 print:text-gray-600">{title}</p>
      <h3 className="text-2xl font-bold text-white print:text-black">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${bgColor} print:bg-gray-100`}>
      <Icon size={24} className={`${textColor} print:text-black`} />
    </div>
  </div>
);

export default function StoreAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback((_, index) => setActiveIndex(index), []);

  // ✅ دالة الطباعة البسيطة والمباشرة
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    async function loadData() {
      const res = await getStoreAnalyticsData();
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f11] text-gray-400">
        جاري تحليل بيانات المخازن...
    </div>
  );

  if (!data) return <div className="text-center p-10 text-red-400">حدث خطأ في تحميل البيانات</div>;

  const { stats, charts, lowStockList } = data;

  return (
    // ✅ إضافة ستايل الطباعة هنا مباشرة
    <div className="min-h-screen bg-[#0f0f11] p-6 space-y-8 print:bg-white print:p-0" dir="rtl">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { background-color: white !important; color: black !important; }
          .no-print { display: none !important; }
          /* إخفاء كل شيء خارج المحتوى الرئيسي */
          header, nav, footer, aside { display: none !important; } 
          /* تحسينات للرسوم */
          .recharts-wrapper { filter: none !important; }
        }
      `}</style>
      
      {/* الهيدر - سيختفي عند الطباعة بفضل no-print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <PieChart className="text-blue-500" /> مركز تحليلات المخزون
            </h1>
            <p className="text-gray-400 text-sm mt-1">نظرة مالية وكمية شاملة على جميع المخازن</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-900/20"
            >
                <Printer size={18} /> طباعة التقرير
            </button>
            <button 
                onClick={() => window.history.back()} 
                className="text-gray-400 hover:text-white flex items-center gap-1 text-sm bg-[#1c1d22] px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 transition-all"
            >
                <ArrowRight size={16} /> العودة
            </button>
        </div>
      </div>

      {/* منطقة التقرير */}
      <div className="space-y-8 print:space-y-6">
        
        {/* عنوان يظهر فقط في الطباعة */}
        <div className="hidden print:block text-center mb-8 border-b border-gray-300 pb-4">
            <h1 className="text-3xl font-bold mb-2 text-black">تقرير جرد المخازن الشامل</h1>
            <p className="text-sm text-gray-500">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        {/* 1. شريط الأرقام القياسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
            <StatCard title="رأس المال (قيمة المخزون)" value={`${stats.totalInventoryValue.toLocaleString()} ج.م`} icon={DollarSign} textColor="text-emerald-500" bgColor="bg-emerald-500/20" />
            <StatCard title="إجمالي المخزون (كميات)" value={`${stats.totalItemsCount.toLocaleString()} قطعة`} icon={Boxes} textColor="text-blue-500" bgColor="bg-blue-500/20" />
            <StatCard title="الأصناف المسجلة" value={`${stats.totalProducts} صنف`} icon={Package} textColor="text-purple-500" bgColor="bg-purple-500/20" />
            <StatCard title="تنبيهات النواقص" value={`${stats.lowStockCount} منتج`} icon={AlertTriangle} textColor="text-red-500" bgColor="bg-red-500/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
            
            {/* 2. الرسم البياني */}
            <div className="bg-[#1c1d22] p-6 rounded-xl border border-gray-800 shadow-lg lg:col-span-2 print:bg-white print:border print:border-gray-300 print:text-black print:mb-6 print:break-inside-avoid">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
                    <DollarSign size={20} className="text-blue-500 print:text-black" />
                    توزيع القيمة المالية حسب المخزن
                </h3>
                <p className="text-xs text-gray-500 mb-6 print:hidden">مرر الماوس فوق القطاعات لعرض التفاصيل</p>
                
                <div className="h-[400px] w-full">
                    {charts.valueByStore.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={charts.valueByStore}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    stroke="none"
                                >
                                    {charts.valueByStore.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                    ))}
                                </Pie>
                            </RePieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">لا توجد بيانات كافية</div>
                    )}
                </div>
            </div>

            {/* 3. جدول النواقص */}
            <div className="bg-[#1c1d22] p-6 rounded-xl border border-gray-800 shadow-lg print:bg-white print:border print:border-gray-300 print:break-inside-avoid">
                <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4 print:border-gray-300">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 print:text-black">
                        <AlertTriangle size={20} className="text-red-500 print:text-black" /> 
                        تقرير النواقص
                    </h3>
                    <span className="text-xs bg-red-900/20 text-red-400 px-2 py-1 rounded border border-red-900/50 print:border-black print:text-black print:bg-gray-200">
                        حرج (أقل من 10)
                    </span>
                </div>
                
                <div className="space-y-4 overflow-y-auto max-h-[320px] custom-scrollbar print:overflow-visible print:max-h-full">
                    {lowStockList.length > 0 ? (
                        lowStockList.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-3 bg-[#252830] rounded-lg border border-gray-700 print:bg-white print:border-b print:border-gray-200 print:rounded-none">
                                <div>
                                    <p className="text-sm font-bold text-white print:text-black">{item.name}</p>
                                    <p className="text-xs text-gray-400 print:text-gray-600">{item.storeName}</p>
                                </div>
                                <div className="text-left">
                                    <span className="block text-lg font-bold text-red-500 print:text-black">{item.quantity}</span>
                                    <span className="text-[10px] text-gray-500 print:text-gray-600">متبقي</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-green-400 font-medium print:text-black">المخزون آمن ومستقر!</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}