import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import User from '@/models/User';
import Branch from '@/models/Branches';
import { getCurrentUser } from '@/app/lib/auth';
import { sendOwnerNotification } from '@/app/actions/ownerNotificationActions';
import { Send, BellRing, Users, Building, UserCheck, Briefcase } from "lucide-react";

export default async function OwnerNotificationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  await connectToDB();
  
  // جلب المستخدم الحالي للحصول على mainAccountId
  const currentUser = await getCurrentUser();
  
  if (!currentUser || !currentUser.mainAccountId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في الوصول</h2>
          <p className="text-gray-400">المالك غير مرتبط بحساب مشترك</p>
        </div>
      </div>
    );
  }

  // جلب جميع الموظفين والفروع التابعة للمؤسسة
  const employees = await User.find({ 
    mainAccountId: currentUser.mainAccountId,
    role: { $in: ['manager', 'employee', 'cashier'] }
  }).populate('branchId', 'name').lean();

  const branches = await Branch.find({ 
    userId: currentUser.mainAccountId 
  }).lean();

  // تجميع الموظفين حسب الدور
  const managers = employees.filter(emp => emp.role === 'manager');
  const regularEmployees = employees.filter(emp => emp.role === 'employee');
  const cashiers = employees.filter(emp => emp.role === 'cashier');

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
            إرسال إشعارات للموظفين والفروع
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
          
          <form action={sendOwnerNotification} className="space-y-6">
            <input type="hidden" name="senderId" value={currentUser._id.toString()} />
            <input type="hidden" name="mainAccountId" value={currentUser.mainAccountId.toString()} />
            
            {/* عنوان الإشعار */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">عنوان الرسالة</label>
              <input 
                name="title" 
                type="text" 
                required 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white" 
                placeholder="مثال: اجتماع طارئ اليوم" 
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
                  <option value="success">✅ إعلان مهم</option>
                  <option value="system">🔧 تحديث نظام</option>
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
                <option value="all_employees">👥 جميع الموظفين</option>
                <option value="managers">👔 المديرين فقط ({managers.length})</option>
                <option value="employees">👤 الموظفين فقط ({regularEmployees.length})</option>
                <option value="cashiers">💰 الكاشيرز فقط ({cashiers.length})</option>
                
                <optgroup label="الفروع">
                  {branches.map(branch => (
                    <option key={branch._id.toString()} value={`branch_${branch._id.toString()}`}>
                      🏢 {branch.name}
                    </option>
                  ))}
                </optgroup>
                
                <optgroup label="موظف محدد">
                  {employees.map(emp => (
                    <option key={emp._id.toString()} value={`user_${emp._id.toString()}`}>
                      {emp.role === 'manager' ? '👔' : emp.role === 'cashier' ? '💰' : '👤'} {emp.name} - {emp.branchId?.name || 'بدون فرع'}
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

        {/* إحصائيات سريعة */}
        <div className="space-y-6">
          {/* إحصائيات الموظفين */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="text-green-500" />
              إحصائيات الموظفين
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-blue-400" size={16} />
                  <span>المديرين</span>
                </div>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm">
                  {managers.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="text-green-400" size={16} />
                  <span>الموظفين</span>
                </div>
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm">
                  {regularEmployees.length}
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

          {/* إحصائيات الفروع */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="text-orange-500" />
              الفروع ({branches.length})
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {branches.map(branch => {
                const branchEmployees = employees.filter(emp => 
                  emp.branchId?._id.toString() === branch._id.toString()
                );
                
                return (
                  <div key={branch._id.toString()} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm">{branch.name}</span>
                    <span className="text-xs text-gray-400">
                      {branchEmployees.length} موظف
                    </span>
                  </div>
                );
              })}
              
              {branches.length === 0 && (
                <p className="text-center text-gray-500 py-4">لا توجد فروع</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">ملاحظات مهمة</h3>
        <div className="space-y-2 text-sm text-blue-300">
          <p>• يمكنك إرسال إشعارات لجميع الموظفين أو لفرع محدد أو لدور معين</p>
          <p>• الإشعارات العاجلة ستظهر بشكل بارز في واجهة الموظف</p>
          <p>• سيتم إرسال الإشعار فوراً لجميع المستهدفين</p>
          <p>• يمكن للموظفين قراءة وأرشفة الإشعارات من لوحة التحكم</p>
        </div>
      </div>
    </div>
  );
}