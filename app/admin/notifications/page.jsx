import {  activateUserSubscription, sendNotification } from "@/app/actions/notificationActions";

import User from "@/models/User";
import { connectToDB } from "@/utils/database";
import { Send, BellRing, UserCheck } from "lucide-react";

export default async function NotificationPage() {
  await connectToDB();
  
  const users = await User.find({ role: "subscriber" }).select("name _id email subscription").lean();
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BellRing className="text-indigo-500" />
            مركز الإشعارات
          </h1>
          <p className="text-gray-400 mt-2">
            إرسال تنبيهات، تحديثات، أو تحذيرات للمشتركين
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* إرسال إشعار عام */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Send className="text-blue-500" />
            إرسال إشعار عام
          </h2>
          
          <form action={sendNotification} className="space-y-6">
            
            {/* عنوان الإشعار */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">عنوان الرسالة</label>
              <input 
                name="title" 
                type="text" 
                required 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white" 
                placeholder="مثال: تنبيه بخصوص الفواتير" 
              />
            </div>

            {/* نص الرسالة */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">نص الإشعار</label>
              <textarea 
                name="message" 
                rows="4" 
                required 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white" 
                placeholder="اكتب رسالتك هنا..."
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* نوع الإشعار */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">النوع</label>
                <select name="type" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                  <option value="info">ℹ️ معلومة</option>
                  <option value="warning">⚠️ تحذير</option>
                  <option value="success">✅ نجاح/تهنئة</option>
                  <option value="error">❌ خطأ</option>
                  <option value="system">🔧 نظام</option>
                  <option value="security">🔒 أمان</option>
                </select>
              </div>

              {/* الأولوية */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الأولوية</label>
                <select name="priority" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </div>
            </div>

            {/* المستلم */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">المستلم</label>
              <select name="target" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                <option value="all">📢 كل المشتركين</option>
                <optgroup label="مستخدم محدد">
                  {users.map(u => (
                    <option key={u._id.toString()} value={u._id.toString()}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* زر الإرسال */}
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
            >
              <Send size={20} /> إرسال الإشعار
            </button>
          </form>
        </div>

        {/* تفعيل اشتراك مستخدم */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserCheck className="text-green-500" />
            تفعيل اشتراك مستخدم
          </h2>
          
          <form action={activateUserSubscription} className="space-y-6">
            
            {/* اختيار المستخدم */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">المستخدم</label>
              <select name="userId" required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                <option value="">اختر المستخدم...</option>
                {users.map(u => (
                  <option key={u._id.toString()} value={u._id.toString()}>
                    {u.name} ({u.email}) - {u.subscription?.plan || 'Trial'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* نوع الخطة */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">نوع الخطة</label>
                <select name="plan" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                  <option value="basic">أساسي</option>
                  <option value="premium">متقدم</option>
                  <option value="enterprise">مؤسسي</option>
                </select>
              </div>

              {/* مدة الاشتراك */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">المدة (أشهر)</label>
                <select name="months" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                  <option value="1">شهر واحد</option>
                  <option value="3">3 أشهر</option>
                  <option value="6">6 أشهر</option>
                  <option value="12">سنة كاملة</option>
                </select>
              </div>
            </div>

            {/* زر التفعيل */}
            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
            >
              <UserCheck size={20} /> تفعيل الاشتراك
            </button>
          </form>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">ملاحظات مهمة</h3>
        <div className="space-y-2 text-sm text-blue-300">
          <p>• سيتم إرسال إشعار تلقائي للمستخدم عند تفعيل اشتراكه</p>
          <p>• الإشعارات العاجلة ستظهر بشكل بارز في واجهة المستخدم</p>
          <p>• يمكن للمستخدمين قراءة وأرشفة الإشعارات من لوحة التحكم الخاصة بهم</p>
          <p>• سيتم تنظيف الإشعارات المنتهية الصلاحية تلقائياً</p>
        </div>
      </div>
    </div>
  );
}
