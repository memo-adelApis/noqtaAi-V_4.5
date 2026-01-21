"use client";

import { useState } from 'react';
import { X, Plus, Tag, Image, FileText } from 'lucide-react';
import UIButton from './UIButton';

export default function CategoryModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    categories = [], 
    editingCategory = null 
}) {
    const [formData, setFormData] = useState({
        name: editingCategory?.name || '',
        description: editingCategory?.description || '',
        parentId: editingCategory?.parentId || '',
        image: editingCategory?.image || '',
        seoTitle: editingCategory?.seoTitle || '',
        seoDescription: editingCategory?.seoDescription || '',
        sortOrder: editingCategory?.sortOrder || 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // إزالة الخطأ عند التعديل
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
            newErrors.name = 'اسم الفئة مطلوب';
        }
        
        if (formData.name.trim().length < 2) {
            newErrors.name = 'اسم الفئة يجب أن يكون أكثر من حرفين';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            await onSubmit(formData);
            // إعادة تعيين النموذج
            setFormData({
                name: '',
                description: '',
                parentId: '',
                image: '',
                seoTitle: '',
                seoDescription: '',
                sortOrder: 0
            });
            onClose();
        } catch (error) {
            console.error('Error submitting category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            parentId: '',
            image: '',
            seoTitle: '',
            seoDescription: '',
            sortOrder: 0
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    // فلترة الفئات الرئيسية فقط للاختيار كفئة أب
    const parentCategories = categories.filter(cat => !cat.parentId && cat._id !== editingCategory?._id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                
                {/* رأس النافذة */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Tag size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* محتوى النافذة */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* المعلومات الأساسية */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileText size={18} className="text-blue-400" />
                            المعلومات الأساسية
                        </h3>
                        
                        {/* اسم الفئة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                اسم الفئة *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="مثال: إلكترونيات، ملابس، طعام..."
                                className={`w-full p-3 border rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all ${
                                    errors.name ? 'border-red-500' : 'border-gray-700'
                                }`}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* الوصف */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                الوصف
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="وصف مختصر للفئة..."
                                rows={3}
                                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            />
                        </div>

                        {/* الفئة الأب */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                الفئة الرئيسية (اختياري)
                            </label>
                            <select
                                name="parentId"
                                value={formData.parentId}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <option value="">فئة رئيسية</option>
                                {parentCategories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* معلومات إضافية */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Image size={18} className="text-green-400" />
                            معلومات إضافية
                        </h3>

                        {/* رابط الصورة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                رابط الصورة
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        {/* ترتيب العرض */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                ترتيب العرض
                            </label>
                            <input
                                type="number"
                                name="sortOrder"
                                value={formData.sortOrder}
                                onChange={handleChange}
                                min="0"
                                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                الرقم الأقل يظهر أولاً (0 = الأول)
                            </p>
                        </div>
                    </div>

                    {/* SEO للمتجر الإلكتروني */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileText size={18} className="text-purple-400" />
                            تحسين محركات البحث (SEO)
                        </h3>

                        {/* عنوان SEO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                عنوان الصفحة
                            </label>
                            <input
                                type="text"
                                name="seoTitle"
                                value={formData.seoTitle}
                                onChange={handleChange}
                                placeholder="عنوان محسن لمحركات البحث..."
                                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        {/* وصف SEO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                وصف الصفحة
                            </label>
                            <textarea
                                name="seoDescription"
                                value={formData.seoDescription}
                                onChange={handleChange}
                                placeholder="وصف مختصر يظهر في نتائج البحث..."
                                rows={2}
                                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* أزرار التحكم */}
                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                        <UIButton
                            type="submit"
                            label={editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
                            icon={editingCategory ? FileText : Plus}
                            gradientFrom="blue-600"
                            gradientTo="blue-700"
                            className="flex-1"
                            disabled={isSubmitting}
                        />
                        <UIButton
                            type="button"
                            onClick={handleClose}
                            label="إلغاء"
                            variant="secondary"
                            className="px-6"
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}