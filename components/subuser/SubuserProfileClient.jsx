"use client";

import { useState } from "react";
import { User, Mail, Shield, Building, Calendar, Save, Key } from "lucide-react";
import { toast } from "react-toastify";

export default function SubuserProfileClient({ user }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/subuser/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('تم تحديث الملف الشخصي بنجاح');
                setIsEditing(false);
                window.location.reload();
            } else {
                toast.error(result.error || 'حدث خطأ في التحديث');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ في التحديث');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        const roles = {
            owner: 'مالك',
            manager: 'مدير',
            employee: 'موظف',
            cashier: 'كاشير'
        };
        return roles[role] || role;
    };

    return (
        <div className="min-h-screen bg-gray-950 py-8 px-4" dir="rtl">
            <div className="max-w-4xl mx-auto">
                
                {/* رأس الصفحة */}
                <div className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl">
                                <User className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">الملف الشخصي</h1>
                                <p className="text-gray-400 mt-1">إدارة معلوماتك الشخصية</p>
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                            >
                                تعديل البيانات
                            </button>
                        )}
                    </div>
                </div>

                {/* بطاقة المعلومات */}
                <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
                    
                    {/* معلومات الحساب */}
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-blue-400" />
                            معلومات الحساب
                        </h2>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        الاسم الكامل
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-all"
                                    >
                                        <Save size={18} />
                                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: user.name, email: user.email });
                                        }}
                                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-all"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                                    <User size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">الاسم</p>
                                        <p className="text-white font-medium">{user.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                                    <Mail size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                                        <p className="text-white font-medium">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                                    <Shield size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">الدور</p>
                                        <p className="text-white font-medium">{getRoleLabel(user.role)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                                    <Calendar size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">تاريخ الانضمام</p>
                                        <p className="text-white font-medium">
                                            {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* الأمان */}
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Key size={20} className="text-purple-400" />
                            الأمان
                        </h2>

                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <Key size={18} />
                            تغيير كلمة المرور
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal تغيير كلمة المرور */}
            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
            )}
        </div>
    );
}

function ChangePasswordModal({ onClose }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('كلمات المرور غير متطابقة');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/subuser/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('تم تغيير كلمة المرور بنجاح');
                onClose();
            } else {
                toast.error(result.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ في تغيير كلمة المرور');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h3 className="text-xl font-semibold text-white">تغيير كلمة المرور</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            كلمة المرور الحالية
                        </label>
                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            كلمة المرور الجديدة
                        </label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            تأكيد كلمة المرور
                        </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                        >
                            {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
