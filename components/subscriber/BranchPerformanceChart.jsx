"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BranchPerformanceChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          
          <XAxis 
            dataKey="name" 
            stroke="#4b5563" 
            tick={{ fill: '#e5e7eb', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            stroke="#4b5563"
            tick={{ fill: '#e5e7eb', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
            cursor={{ fill: '#374151', opacity: 0.4 }}
          />
          
          <Bar dataKey="value" name="الإيرادات" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40}>
             {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#7c3aed'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}