"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function BranchRevenuePieChart({ data }) {
  // حماية إضافية: إذا لم تكن هناك بيانات صالحة، لا ترسم شيئاً
  if (!data || data.length === 0) return null;

  return (
    // هام جداً: هذا الـ div يضمن أن الرسم يأخذ المساحة المتاحة بالكامل
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} 
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            nameKey="name" // مهم جداً لربط الاسم بالمفتاح في الـ Legend
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            // تنسيق القيمة لتظهر بشكل مالي (اختياري)
            formatter={(value) => [`${Number(value).toLocaleString()} ج.م`, 'الإيراد']}
          />
          
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span style={{ color: '#d1d5db', marginRight: '5px', fontSize: '12px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}