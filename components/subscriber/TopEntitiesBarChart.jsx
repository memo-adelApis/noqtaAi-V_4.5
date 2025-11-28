"use client";

import { useMemo } from 'react';

// هذا المكون لا يستخدم Recharts للأعمدة الأفقية لتجنب مشاكل العرض
// بدلاً من ذلك، نستخدم تصميم "شريط التقدم" (Progress Bar) الأنيق والمضمون
export default function TopEntitiesBarChart({ data, label, color = "#3b82f6" }) {
  
  // 1. حساب القيمة القصوى لنسبة الشريط
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(d => d.value));
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="flex flex-col gap-4">
        {data.map((item, index) => {
          // حساب النسبة المئوية لطول الشريط
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="w-full group">
              {/* الصف العلوي: الاسم والقيمة */}
              <div className="flex justify-between items-end mb-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-gray-400 text-xs font-bold border border-gray-700">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-200 truncate max-w-[150px]" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">
                  {Number(item.value).toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
                </span>
              </div>

              {/* شريط التقدم (الخلفية + القيمة) */}
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-80"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}