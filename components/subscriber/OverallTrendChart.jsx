"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OverallTrendChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncomeUnique" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          
          <XAxis 
            dataKey="name" 
            stroke="#4b5563" 
            tick={{ fill: '#e5e7eb', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            stroke="#4b5563"
            tick={{ fill: '#e5e7eb', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
          />
          
          <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorIncomeUnique)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}