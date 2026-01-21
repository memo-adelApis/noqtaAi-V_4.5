"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, Activity, AlertTriangle, 
  CheckCircle, Target, Zap, BarChart3, LineChart, 
  DollarSign, Calendar, ArrowUp, ArrowDown
} from "lucide-react";

export default function FinancialInsightsClient({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('12'); // آخر 12 شهر

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/owner/financial-insights?months=${timeframe}`);
      const result = await response.json();
      
      if (result.error === 'no_data') {
        setData(null);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' ج.م';
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'from-green-900/20 to-green-800/10 border-green-500/30';
    if (score >= 60) return 'from-yellow-900/20 to-yellow-800/10 border-yellow-500/30';
    return 'from-red-900/20 to-red-800/10 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">جاري تحليل البيانات المالية...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.kpis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="text-yellow-500 mx-auto mb-4" size={48} />
          <p className="text-xl text-gray-300 mb-2">لا توجد بيانات كافية</p>
          <p className="text-gray-400">يرجى إضافة فواتير لتتمكن من رؤية التحليل المالي</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="text-blue-500" />
            المؤشرات المالية والتنبؤات
          </h1>
          <p className="text-gray-400 mt-2">
            تحليل ذكي للأداء المالي مع توقعات مستقبلية
          </p>
        </div>

        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="6">آخر 6 أشهر</option>
          <option value="12">آخر 12 شهر</option>
          <option value="24">آخر 24 شهر</option>
        </select>
      </div>

      {/* الصحة المالية العامة */}
      <div className={`bg-gradient-to-br ${getHealthBg(data.healthScore)} p-8 rounded-xl border`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">الصحة المالية للمؤسسة</h2>
            <p className="text-gray-400">تقييم شامل بناءً على {timeframe} شهر الماضية</p>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getHealthColor(data.healthScore)}`}>
              {data.healthScore}
            </div>
            <p className="text-sm text-gray-400 mt-2">من 100</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {data.healthStatus === 'excellent' ? (
                <CheckCircle className="text-green-400" size={20} />
              ) : data.healthStatus === 'good' ? (
                <Target className="text-yellow-400" size={20} />
              ) : (
                <AlertTriangle className="text-red-400" size={20} />
              )}
              <span className="font-semibold">الحالة</span>
            </div>
            <p className={`text-lg font-bold ${getHealthColor(data.healthScore)}`}>
              {data.healthStatus === 'excellent' ? 'ممتازة' : 
               data.healthStatus === 'good' ? 'جيدة' : 'تحتاج تحسين'}
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-400" size={20} />
              <span className="font-semibold">الاتجاه</span>
            </div>
            <p className="text-lg font-bold text-blue-400">
              {data.trend === 'up' ? 'تصاعدي ↗' : 
               data.trend === 'stable' ? 'مستقر →' : 'تنازلي ↘'}
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-purple-400" size={20} />
              <span className="font-semibold">التوصية</span>
            </div>
            <p className="text-sm text-gray-300">
              {data.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* المؤشرات المالية الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* هامش الربح */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">هامش الربح</h3>
            <BarChart3 className="text-green-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {data.kpis.profitMargin.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 text-sm">
            {data.kpis.profitMarginChange >= 0 ? (
              <ArrowUp className="text-green-400" size={16} />
            ) : (
              <ArrowDown className="text-red-400" size={16} />
            )}
            <span className={data.kpis.profitMarginChange >= 0 ? 'text-green-400' : 'text-red-400'}>
              {Math.abs(data.kpis.profitMarginChange).toFixed(1)}%
            </span>
            <span className="text-gray-400">عن الفترة السابقة</span>
          </div>
        </div>

        {/* معدل النمو */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">معدل النمو</h3>
            <TrendingUp className="text-blue-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {data.kpis.growthRate.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">نمو الإيرادات الشهري</span>
          </div>
        </div>

        {/* نسبة السيولة */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">نسبة السيولة</h3>
            <DollarSign className="text-purple-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {data.kpis.liquidityRatio.toFixed(2)}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">
              {data.kpis.liquidityRatio >= 1.5 ? 'ممتازة' : 
               data.kpis.liquidityRatio >= 1 ? 'جيدة' : 'منخفضة'}
            </span>
          </div>
        </div>

        {/* كفاءة التشغيل */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">كفاءة التشغيل</h3>
            <Target className="text-yellow-400" size={20} />
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {data.kpis.operationalEfficiency.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">نسبة المصروفات للإيرادات</span>
          </div>
        </div>
      </div>

      {/* التنبؤات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* توقعات الإيرادات */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <LineChart className="text-green-500" />
            توقعات الإيرادات (3 أشهر قادمة)
          </h3>
          
          <div className="space-y-4">
            {data.predictions.revenue.map((pred, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">{pred.month}</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(pred.predicted)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">الثقة:</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${pred.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400">{pred.confidence}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 التوقع بناءً على: الاتجاه التاريخي، الموسمية، معدل النمو
            </p>
          </div>
        </div>

        {/* توقعات المصروفات */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <LineChart className="text-red-500" />
            توقعات المصروفات (3 أشهر قادمة)
          </h3>
          
          <div className="space-y-4">
            {data.predictions.expenses.map((pred, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">{pred.month}</span>
                  <span className="text-red-400 font-semibold">
                    {formatCurrency(pred.predicted)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">الثقة:</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${pred.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400">{pred.confidence}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ توقع زيادة في المصروفات بنسبة {data.predictions.expensesGrowth.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* التحليل التفصيلي */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold mb-6">التحليل التفصيلي</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* نقاط القوة */}
          <div>
            <h4 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              نقاط القوة
            </h4>
            <ul className="space-y-2">
              {data.analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* نقاط الضعف */}
          <div>
            <h4 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              نقاط تحتاج تحسين
            </h4>
            <ul className="space-y-2">
              {data.analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-red-400 mt-1">!</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* التوصيات */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30 p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Zap className="text-yellow-500" />
          التوصيات الاستراتيجية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recommendations.map((rec, index) => (
            <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                  <Target className="text-blue-400" size={20} />
                </div>
                <div>
                  <h5 className="font-semibold text-white mb-1">{rec.title}</h5>
                  <p className="text-sm text-gray-400">{rec.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {rec.priority === 'high' ? 'أولوية عالية' :
                       rec.priority === 'medium' ? 'أولوية متوسطة' :
                       'أولوية منخفضة'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">ملاحظات هامة</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>• التنبؤات مبنية على البيانات التاريخية وقد تختلف النتائج الفعلية</p>
          <p>• يُنصح بمراجعة المؤشرات بشكل دوري (شهرياً على الأقل)</p>
          <p>• التوصيات مبنية على تحليل آلي ويُفضل استشارة خبير مالي للقرارات الكبرى</p>
          <p>• نسبة الثقة في التنبؤات تعتمد على استقرار البيانات التاريخية</p>
        </div>
      </div>
    </div>
  );
}
