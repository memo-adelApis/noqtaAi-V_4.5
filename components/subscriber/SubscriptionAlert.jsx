"use client";

import { AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default function SubscriptionAlert({ subscription }) {
  // ✅ حل المشكلة: التحقق من وجود كائن الاشتراك وتاريخ الانتهاء
  if (!subscription || !subscription.endDate) {
    return null; // لا تظهر شيئاً إذا لم تكن هناك بيانات اشتراك
  }

  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const isExpired = now > endDate;
  
  // حساب الأيام المتبقية
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  // الحالة 1: الاشتراك منتهي
  if (isExpired || !subscription.isActive) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500" size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-white">⚠️ اشتراكك متوقف أو منتهي</h3>
                <p className="text-sm text-red-200/80">
                لقد تجاوزت الفترة المسموحة. تم تقييد حسابك (فرع واحد و 20 فاتورة).
                </p>
            </div>
        </div>
        <Link 
            href="/subscriber/billing" 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition whitespace-nowrap"
        >
            تجديد الاشتراك الآن
        </Link>
      </div>
    );
  }

  // الحالة 2: اقتراب الانتهاء (أقل من 5 أيام)
  if (daysLeft <= 5) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-200 p-4 rounded-xl mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Clock className="text-yellow-500" />
            <span>
                <span className="font-bold text-white">تنبيه:</span> باقي {daysLeft} أيام فقط على انتهاء فترتك التجريبية.
            </span>
        </div>
        <Link 
            href="/subscriber/billing"
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition"
        >
            ترقية الباقة
        </Link>
      </div>
    );
  }

  return null; // لا تظهر شيئاً إذا كان الاشتراك سارياً وباقي عليه وقت طويل
}