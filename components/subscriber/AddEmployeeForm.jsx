// المسار: components/subscriber/AddEmployeeForm.jsx
"use client";

import { useState } from 'react';
import { createEmployee } from '@/app/actions/employeeActions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UserPlus, Mail, Lock, User, Building, Shield } from 'lucide-react';

export default function AddEmployeeForm({ branches }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        branchId: '' // فارغ بشكل افتراضي
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('جاري إضافة الموظف...');

        const result = await createEmployee(formData);

        toast.dismiss(toastId);

        if (result.success) {
            toast.success(`تم إضافة الموظف "${result.data.name}" بنجاح!`);
            // إعادة تعيين النموذج
            setFormData({
                name: '', email: '', password: '', 
                role: 'employee', branchId: '' 
            });
            router.refresh(); 
        } else {
            toast.error(result.error || "فشل إنشاء الموظف");
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* اسم الموظف */}
                <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <User size={16} className="text-blue-500" />
                        الاسم الكامل
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="أدخل اسم الموظف"
                        className="w-full px-4 py-2.5 bg-[#252830] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* البريد الإلكتروني */}
                <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Mail size={16} className="text-blue-500" />
                        البريد الإلكتروني
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="example@company.com"
                        className="w-full px-4 py-2.5 bg-[#252830] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* كلمة المرور */}
                <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Lock size={16} className="text-blue-500" />
                        كلمة المرور
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="********"
                        className="w-full px-4 py-2.5 bg-[#252830] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* الدور */}
                <div className="space-y-2">
                    <label htmlFor="role" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Shield size={16} className="text-blue-500" />
                        الدور
                    </label>
                    <select
                        name="role"
                        id="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#252830] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        <option value="employee">👤 موظف - صلاحيات أساسية</option>
                        <option value="manager">👔 مدير فرع - إدارة الفرع والموظفين</option>
                        <option value="owner">👑 مالك - صلاحيات كاملة</option>
                        <option value="cashier">💰 كاشير - إدارة المبيعات والمدفوعات</option>
                        <option value="accountant">📊 محاسب - إدارة الحسابات والتقارير</option>
                        <option value="supervisor">🔍 مشرف - مراقبة العمليات</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                        {formData.role === 'employee' && '• عرض البيانات الأساسية • إنشاء فواتير بسيطة'}
                        {formData.role === 'manager' && '• إدارة الفرع • إدارة الموظفين • عرض التقارير'}
                        {formData.role === 'owner' && '• جميع الصلاحيات • إدارة النظام • إعدادات الشركة'}
                        {formData.role === 'cashier' && '• إدارة المبيعات • معالجة المدفوعات • إدارة الخزينة'}
                        {formData.role === 'accountant' && '• إدارة الحسابات • التقارير المالية • المراجعة'}
                        {formData.role === 'supervisor' && '• مراقبة العمليات • إشراف على الموظفين • تقارير الأداء'}
                    </div>
                </div>

                {/* الفرع */}
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="branchId" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Building size={16} className="text-blue-500" />
                        الفرع
                    </label>
                    <select
                        name="branchId"
                        id="branchId"
                        value={formData.branchId}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#252830] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                        <option value="">بدون فرع محدد</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.role === 'owner' ? 'المالك لا يحتاج لفرع محدد' : 'اختر الفرع الذي سيعمل به الموظف'}
                    </p>
                </div>
            </div>

            {/* زر الإرسال */}
            <div className="flex justify-end pt-4 border-t border-gray-800 mt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-800 disabled:opacity-70 transition-all shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95"
                >
                    <UserPlus size={18} className="ml-2" />
                    {isLoading ? 'جاري الحفظ...' : 'حفظ الموظف'}
                </button>
            </div>
        </form>
    );
}