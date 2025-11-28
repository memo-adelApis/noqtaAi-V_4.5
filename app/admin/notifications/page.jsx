import { sendNotification } from "@/app/actions/notificationActions";
import User from "@/models/User";
import { Send, BellRing } from "lucide-react";

export default async function NotificationPage() {
const users = await User.find({ role: "subscriber" }).select("name _id").lean();
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BellRing className="text-indigo-500" /> مركز الإشعارات
        </h1>
        <p className="text-gray-400 mt-2">إرسال تنبيهات، تحديثات، أو تحذيرات للمشتركين.</p>
      </div>

      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-lg">
        <form action={sendNotification} className="space-y-6">
          
          {/* عنوان الإشعار */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">عنوان الرسالة</label>
            <input name="title" type="text" required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white" placeholder="مثال: تنبيه بخصوص الفواتير" />
          </div>

          {/* نص الرسالة */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">نص الإشعار</label>
            <textarea name="message" rows="4" required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white" placeholder="اكتب رسالتك هنا..."></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* نوع الإشعار */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">النوع</label>
              <select name="type" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                <option value="info">ℹ️ معلومة</option>
                <option value="warning">⚠️ تحذير</option>
                <option value="success">✅ نجاح/تهنئة</option>
              </select>
            </div>

            {/* المستلم */}
      <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">المستلم</label>
              <select name="target" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                <option value="all">📢 كل المشتركين</option>
                <optgroup label="مستخدم محدد">
                  {users.map(u => (
                    // ✅ تصحيح 2: تحويل _id إلى string
                    <option key={u._id.toString()} value={u._id.toString()}>
                        {u.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* زر الإرسال */}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2">
            <Send size={20} /> إرسال الإشعار
          </button>
        </form>
      </div>
    </div>
  );
}