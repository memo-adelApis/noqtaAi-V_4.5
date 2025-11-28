import Notification from "@/models/Notification";
import { Clock, Bell, CreditCard, CheckCircle } from "lucide-react"; 
import DeleteNotificationBtn from "@/components/admin/DeleteNotificationBtn";
import RenewSubscriptionBtn from "@/components/admin/RenewSubscriptionBtn";
import { connectToDB } from "@/utils/database";

export default async function AdminInbox() {
  // 1. الاتصال بقاعدة البيانات لضمان عدم حدوث أخطاء في الـ Build
  await connectToDB();

  // 2. جلب الإشعارات
  const notifications = await Notification.find({ type: "info" })
    .populate("userId", "name email") // جلب بيانات المشترك
    .sort({ createdAt: -1 }) // الأحدث أولاً
    .lean();

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="text-indigo-500" /> صندوق الوارد (طلبات التجديد)
        </h1>
        <span className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-400">
          العدد: {notifications.length}
        </span>
      </div>

      <div className="space-y-4 max-w-4xl">
        {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                <Bell size={48} className="mb-4 opacity-50" />
                <p>لا توجد إشعارات جديدة حالياً</p>
            </div>
        ) : notifications.map((notif) => {
          
          // تحديد تصميم الكارت بناءً على هل تم التعامل معه أم لا
          const isHandled = notif.isHandled;
          const cardClass = isHandled 
            ? "bg-gray-900/50 border-gray-800 opacity-75" // تصميم باهت للمنتهي
            : "bg-gray-800 border-gray-700 shadow-lg";   // تصميم بارز للجديد

          return (
            <div key={notif._id} className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all ${cardClass}`}>
              
              {/* القسم الأيمن: المحتوى والتفاصيل */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-white">
                        {notif.title}
                    </h3>
                    {isHandled && (
                        <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-900/50 flex items-center gap-1">
                            <CheckCircle size={10} /> مكتمل
                        </span>
                    )}
                </div>

                <p className="text-gray-300 text-sm mb-3">
                  {notif.message}
                </p>
                
                {/* ✅ عرض بيانات الدفع بشكل مميز */}
                {notif.metadata?.transactionId && (
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5 inline-flex flex-col sm:flex-row sm:items-center gap-3 mb-3 min-w-[300px]">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <CreditCard size={16} />
                            <span className="text-xs font-bold">بيانات التحويل:</span>
                        </div>
                        <div className="font-mono text-sm text-white bg-white/10 px-2 py-0.5 rounded select-all">
                            {notif.metadata.transactionId}
                        </div>
                        {notif.metadata.amount && (
                            <span className="text-xs text-gray-400 border-r border-gray-600 pr-3 mr-auto">
                                القيمة: {notif.metadata.amount} ج.م
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  {new Date(notif.createdAt).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}
                </div>
              </div>

              {/* القسم الأيسر: أزرار التحكم */}
              <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 md:border-r border-gray-700 pt-4 md:pt-0 md:pr-4 justify-end md:justify-start">
                  
                  {/* زر التجديد (المكون المفصول) */}
                  {notif.userId && (
                    <RenewSubscriptionBtn 
                        userId={notif.userId._id.toString()} 
                        notificationId={notif._id.toString()}
                        isHandled={isHandled}
                    />
                  )}

                  {/* زر الحذف (المكون المفصول) */}
                  <DeleteNotificationBtn id={notif._id.toString()} />
                  
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}