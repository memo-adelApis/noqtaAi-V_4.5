import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import { getCurrentUser } from '@/app/lib/auth';
import { sendManagerNotification } from '@/app/actions/managerNotificationActions';
import { Send, BellRing, Users, UserCheck } from "lucide-react";

export default async function ManagerNotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'manager') {
    redirect('/login');
  }

  await connectToDB();
  
  // جلب المستخدم الحالي
  const currentUser = await getCurrentUser();
  
  if (!currentUser || !currentUser.branchId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في الوصول</h2>
          <p className="text-gray-400">المدير غير مرتبط بفرع</p>
        </div>
      </div>
    );
  }

  // جلب موظفي الفرع
  const branchEmployees = await User.find({ 
    branchId: currentUser.branchId,
    role: { $in: ['employee', 'cashier'] },
    isActive: true
  }).lean();

  const employees = branchEmployees.filter(emp => emp.role === 'employee');
  const cashiers = branchEmployees.filter(emp => emp.role === 'cashier');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BellRing className="text-indigo-500" />
            إشعارات الفرع
          </h1>
          <p className="text-gray-400 mt-2">
            إرسال إشعارات لموظفي الفرع
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* إرسال إشعار */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Send className="text-blue-500" />
            إرسال إشعار للموظفين
          </h2>
          
          <form action={sendManagerNotification} className="space-y-6">
            <input type="hidden" name="senderId" value={currentUser._id.toString()} />
            <input type="hidden" name="branchId" value={currentUser.branchId.toString()} />
            
            {/* عنوان الإشعار */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">عنوان الرسالة</label>
              <input 
                name="title" 
                type="text" 
                required 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white" 
                placeholder="مثال: تعليمات العمل اليوم" 
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
                  <option value="success">✅ إعلان</option>
                  <option value="system">🔧 تعليمات</option>
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

            {/* المستهدفين */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">المستهدفين</label>
              <select name="target" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                <option value="all_branch">👥 جميع موظفي الفرع</option>
                <option value="employees">👤 الموظفين فقط ({employees.length})</option>
                <option value="cashiers">💰 الكاشيرز فقط ({cashiers.length})</option>
                
                <optgroup label="موظف محدد">
                  {branchEmployees.map(emp => (
                    <option key={emp._id.toString()} value={`user_${emp._id.toString()}`}>
                      {emp.role === 'cashier' ? '💰' : '👤'} {emp.name}
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

        {/* إحصائيات الفرع */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="text-green-500" />
              موظفي الفرع
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="text-green-400" size={16} />
                  <span>الموظفين</span>
                </div>
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm">
                  {employees.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="text-purple-400" size={16} />
                  <span>الكاشيرز</span>
                </div>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm">
                  {cashiers.length}
                </span>
              </div>
            </div>
          </div>

          {/* قائمة الموظفين */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">قائمة الموظفين</h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {branchEmployees.map(emp => (
                <div key={emp._id.toString()} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {emp.role === 'cashier' ? '💰' : '👤'}
                    </span>
                    <span className="text-sm">{emp.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 capitalize">
                    {emp.role === 'employee' ? 'موظف' : 'كاشير'}
                  </span>
                </div>
              ))}
              
              {branchEmployees.length === 0 && (
                <p className="text-center text-gray-500 py-4">لا يوجد موظفين في هذا الفرع</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">ملاحظات</h3>
        <div className="space-y-2 text-sm text-blue-300">
          <p>• يمكنك إرسال إشعارات لجميع موظفي الفرع أو لموظف محدد</p>
          <p>• الإشعارات العاجلة ستظهر بشكل بارز للموظفين</p>
          <p>• سيتم إرسال الإشعار فوراً لجميع المستهدفين</p>
        </div>
      </div>
    </div>
  );
}