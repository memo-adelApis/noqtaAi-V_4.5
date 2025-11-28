// المسار: app/(subscriber)/employees/page.js
import { getMyEmployees, getMyBranches } from "@/app/actions/employeeActions";
import AddEmployeeForm from "@/components/subscriber/AddEmployeeForm";
import { User, Mail, Building, Users, AlertCircle } from 'lucide-react';

// هذا "Server Component"
export default async function ManageEmployeesPage() {
    
    // جلب البيانات على الخادم
    const employeesResult = await getMyEmployees();
    const branchesResult = await getMyBranches();

    // التعامل مع الأخطاء المحتملة
    if (!employeesResult.success || !branchesResult.success) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center text-red-400 bg-red-900/20 p-8 rounded-xl border border-red-900/30">
                    <h1 className="text-xl font-bold mb-2">خطأ في جلب البيانات</h1>
                    <p className="text-sm opacity-80">{employeesResult.error || branchesResult.error}</p>
                </div>
            </div>
        );
    }

    const employees = employeesResult.data;
    const branches = branchesResult.data;

    return (
        <div className="space-y-8" dir="rtl">
            
            {/* الهيدر */}
            <div className="flex items-center gap-4 bg-[#1c1d22] p-6 rounded-xl border border-gray-800 shadow-lg">
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-900/30">
                    <Users size={32} className="text-blue-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">إدارة الموظفين</h1>
                    <p className="text-gray-400 text-sm">أضف موظفين جدد وقم بإدارة صلاحياتهم وتوزيعهم على الفروع.</p>
                </div>
            </div>

            {/* قسم إضافة موظف جديد */}
            <div className="bg-[#1c1d22] p-6 rounded-xl border border-gray-800 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
                    إضافة موظف جديد
                </h2>
                
                {branches.length > 0 ? (
                    // تأكد أن مكون AddEmployeeForm يدعم الوضع الداكن أيضاً
                    <AddEmployeeForm branches={branches} />
                ) : (
                    <div className="flex items-start gap-4 p-4 bg-yellow-900/20 text-yellow-200 rounded-lg border border-yellow-900/30">
                        <AlertCircle className="shrink-0 text-yellow-500" />
                        <div>
                            <strong className="block mb-1 text-yellow-400">تنبيه هام</strong>
                            <p className="text-sm opacity-90">
                                لا يمكن إضافة موظفين حالياً لأنك لم تقم بإنشاء أي فروع بعد.
                                <br />
                                يرجى الذهاب إلى صفحةإدارة الفروع أولاً.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* قسم قائمة الموظفين الحاليين */}
            <div className="bg-[#1c1d22] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-gray-800 bg-[#252830]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-gray-400" />
                            قائمة الموظفين
                        </h2>
                        <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full border border-gray-700">
                            {employees.length} موظف
                        </span>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {employees.length > 0 ? (
                        employees.map(emp => (
                            <div key={emp._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-[#252830] border border-gray-700/50 rounded-xl hover:border-gray-600 transition-all group">
                                
                                {/* معلومات الموظف الأساسية */}
                                <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                                    <div className="p-3 bg-gray-800 rounded-full border border-gray-700 group-hover:border-blue-500/50 transition-colors">
                                        <User className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-100">{emp.name}</h3>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                                                emp.role === 'manager' 
                                                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' 
                                                : 'bg-blue-900/30 text-blue-400 border-blue-800'
                                            }`}>
                                                {emp.role === 'manager' ? 'مدير' : 'موظف'}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Mail size={12} className="ml-1.5" />
                                            {emp.email}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* تفاصيل إضافية (الفرع) */}
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-700 pt-3 md:pt-0 mt-2 md:mt-0">
                                    <div className="flex items-center text-sm text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-lg">
                                        <Building size={14} className="ml-2 text-gray-500" />
                                        <span className="text-gray-300">
                                            {emp.branchId ? emp.branchId.name : 'غير معين'}
                                        </span>
                                    </div>
                                    
                                    {/* مساحة لأزرار التحكم مستقبلاً */}
                                    {/* <button className="text-gray-400 hover:text-white transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button> */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                <Users size={32} className="text-gray-600" />
                            </div>
                            <p className="text-gray-400">لا يوجد موظفون مضافون حالياً.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}