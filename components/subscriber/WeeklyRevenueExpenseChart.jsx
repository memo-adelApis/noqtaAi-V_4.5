"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WeeklyRevenueExpenseChart({ trendData }) {
  // إذا لم تكن هناك بيانات، لا نرسم شيئاً لتجنب الأخطاء
  if (!trendData || trendData.length === 0) return null;

  return (
    // تأكد من أن الارتفاع هنا 100% وأن الحاوية الأب في الصفحة الرئيسية لها ارتفاع محدد (h-96 مثلاً)
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={trendData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          
          <XAxis 
            dataKey="name" 
            stroke="#4b5563" 
            tick={{ fill: '#9ca3af', fontSize: 11 }} 
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            // هذا التنسيق مهم جداً للأرقام الكبيرة
            tickFormatter={(value) => value > 0 ? `${(value / 1000).toFixed(0)}k` : 0} 
          />
          
          <Tooltip 
            cursor={{ fill: '#374151', opacity: 0.2 }}
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          
          {/* تأكدنا من أن barSize مناسب */}
          <Bar dataKey="income" name="الإيرادات" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="expense" name="المصروفات" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}