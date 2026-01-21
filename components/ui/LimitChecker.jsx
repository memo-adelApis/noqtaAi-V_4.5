"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

/**
 * مكون للتحقق من الحدود وعرض تحذيرات
 * @param {string} userId - معرف المستخدم
 * @param {string} limitType - نوع الحد المراد التحقق منه
 * @param {function} onLimitExceeded - دالة يتم استدعاؤها عند تجاوز الحد
 * @param {React.ReactNode} children - المحتوى الذي سيتم عرضه
 */
export default function LimitChecker({ userId, limitType, onLimitExceeded, children }) {
  const [limitStatus, setLimitStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLimit = async () => {
      try {
        const response = await fetch('/api/check-limit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, limitType }),
        });

        const data = await response.json();
        setLimitStatus(data);

        if (!data.allowed && onLimitExceeded) {
          onLimitExceeded(data);
        }
      } catch (error) {
        console.error('Error checking limit:', error);
        setLimitStatus({ allowed: false, message: 'خطأ في التحقق من الحدود' });
      } finally {
        setLoading(false);
      }
    };

    if (userId && limitType) {
      checkLimit();
    }
  }, [userId, limitType, onLimitExceeded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!limitStatus?.allowed) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-red-400">
          <XCircle size={20} />
          <span className="font-medium">تم الوصول للحد الأقصى</span>
        </div>
        <p className="text-red-300 text-sm mt-1">{limitStatus.message}</p>
        <div className="text-xs text-red-400 mt-2">
          الاستخدام الحالي: {limitStatus.current} / {limitStatus.limit}
        </div>
      </div>
    );
  }

  // عرض تحذير إذا كان قريب من الحد (80% أو أكثر)
  if (limitStatus?.percentage >= 80) {
    return (
      <div>
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle size={20} />
            <span className="font-medium">تحذير: قريب من الحد الأقصى</span>
          </div>
          <p className="text-yellow-300 text-sm mt-1">
            أنت تستخدم {limitStatus.percentage}% من الحد المسموح
          </p>
          <div className="text-xs text-yellow-400 mt-2">
            الاستخدام الحالي: {limitStatus.current} / {limitStatus.limit}
          </div>
        </div>
        {children}
      </div>
    );
  }

  return children;
}

/**
 * مكون لعرض شريط تقدم الاستخدام
 */
export function UsageBar({ current, limit, label, color = 'blue' }) {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return `bg-${color}-500`;
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium">{current} / {limit}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {percentage.toFixed(1)}% مستخدم
      </div>
    </div>
  );
}