"use client";

import { useState } from 'react';
import { X, Save, Warehouse } from 'lucide-react';
import { createStore } from '@/app/actions/storeActions';

export default function QuickStoreModal({ onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // مسح الأخطاء عند التعديل
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'اسم المخزن مطلوب';
        }

        if (formData.name.length > 100) {
            newErrors.name = 'اسم المخزن يجب أن يكون أقل من 100 حرف';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const result = await createStore(formData);

            if (result.success) {
                onSave(result.data);
                onClose();
            } else {
                setErrors({ general: result.error });
            }
        } catch (error) {
            setErrors({ general: 'حدث خطأ أثناء الحفظ' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                
                {/* رأس النافذة */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Warehouse size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">إضافة مخزن جديد</h2>
                            <p className="text-white/80 text-sm">إضافة سريعة للمخزن</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* محتوى النافذة */}
                <div className="p-6">
                    {/* اسم المخزن */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            اسم المخزن *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="أدخل اسم المخزن"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* الوصف */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الوصف
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="وصف مختصر للمخزن (اختياري)"
                        />
                    </div>

                    {/* الموقع */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الموقع
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="موقع المخزن (اختياري)"
                        />
                    </div>

                    {/* رسالة خطأ عامة */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}
                </div>

                {/* أزرار التحكم */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
                    >
                        إلغاء
                    </button>
                    
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Save size={16} />
                        )}
                        إضافة المخزن
                    </button>
                </div>
            </div>
        </div>
    );
}