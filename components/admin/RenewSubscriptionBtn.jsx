"use client";

import { useState } from "react";
import { quickRenewSubscription } from "@/app/actions/adminActions";
import { RefreshCw, Loader2, CheckCheck } from "lucide-react"; // أيقونة CheckCheck للطلب المنتهي
import { toast } from "react-toastify";

// ✅ إضافة prop جديد: notificationId و isHandled
export default function RenewSubscriptionBtn({ userId, notificationId, isHandled }) {
  const [isLoading, setIsLoading] = useState(false);

  // إذا كان الطلب قد تم التعامل معه سابقاً، نعرض زر غير فعال
  if (isHandled) {
    return (
        <div className="flex items-center gap-1 text-green-500 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
            <CheckCheck size={16} />
            <span className="text-xs font-bold">تم التجديد</span>
        </div>
    );
  }

  const handleRenew = async () => {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("userId", userId);
    // ✅ تمرير رقم الإشعار
    if (notificationId) formData.append("notificationId", notificationId);

    try {
      const result = await quickRenewSubscription(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRenew}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all
        ${isLoading 
          ? "bg-green-800 text-gray-300 cursor-not-allowed" 
          : "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20"
        }
      `}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
      {isLoading ? "جاري التجديد..." : "تجديد 30 يوم"}
    </button>
  );
}