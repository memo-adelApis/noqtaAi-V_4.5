"use client";

import { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Plus, Upload, Tag, FileText, Globe, Image, Hash, Search } from 'lucide-react';
import { createCategory, updateCategory, getCategoryDetails } from '@/app/actions/categoryActions';

export default function CategoryModal({ mode, category, onClose, onSave, categories = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: '',
        image: '',
        seoTitle: '',
        seoDescription: '',
        slug: '',
        sortOrder: 0,
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState('');

    // تحميل بيانات الفئة للتعديل أو العرض
    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && category?._id) {
            loadCategoryDetails();
        }
    }, [mode, category]);

    const loadCategoryDetails = async () => {
        try {
            setLoading(true);
            const result = await getCategoryDetails(category._id);
            if (result.success) {
                setFormData(result.data);
                setImagePreview(result.data.image || '');
            }
        } catch (error) {
            console.error('Error loading category:', error);
        } finally {
            setLoading(false);
        }
    };

    // تحديث الحقول
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // إنشاء slug تلقائياً من الاسم
        if (name === 'name' && !formData.slug) {
            const autoSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            
            setFormData(prev => ({
                ...prev,
                slug: autoSlug
            }));
        }

        // مسح الأخطاء عند التعديل
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // رفع الصورة
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // التحقق من نوع الملف
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    image: 'يرجى اختيار ملف صورة صحيح'
                }));
                return;
            }

            // التحقق من حجم الملف (2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    image: 'حجم الصورة يجب أن يكون أقل من 2 ميجابايت'
                }));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                setImagePreview(imageUrl);
                setFormData(prev => ({
                    ...prev,
                    image: imageUrl
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // التحقق من صحة البيانات
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'اسم الفئة مطلوب';
        }

        if (formData.name.length > 100) {
            newErrors.name = 'اسم الفئة يجب أن يكون أقل من 100 حرف';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'الوصف يجب أن يكون أقل من 500 حرف';
        }

        if (formData.seoTitle && formData.seoTitle.length > 60) {
            newErrors.seoTitle = 'عنوان SEO يجب أن يكون أقل من 60 حرف';
        }

        if (formData.seoDescription && formData.seoDescription.length > 160) {
            newErrors.seoDescription = 'وصف SEO يجب أن يكون أقل من 160 حرف';
        }

        if (formData.slug && !/^[a-z0-9\u0600-\u06FF-]+$/.test(formData.slug)) {
            newErrors.slug = 'الرابط الودي يجب أن يحتوي على أحرف وأرقام وشرطات فقط';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // حفظ البيانات
    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            let result;

            if (mode === 'create') {
                result = await createCategory(formData);
            } else if (mode === 'edit') {
                result = await updateCategory(category._id, formData);
            }

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

    // فلترة الفئات الرئيسية (استبعاد الفئة الحالية لمنع التكرار)
    const parentCategories = categories.filter(cat => 
        !cat.parentId && cat._id !== category?._id
    );

    const isReadOnly = mode === 'view';
    const title = mode === 'create' ? 'إضافة فئة جديدة' : 
                  mode === 'edit' ? 'تعديل الفئة' : 'عرض الفئة';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                
                {/* رأس النافذة */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Tag size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{title}</h2>
                            <p className="text-blue-100 text-sm">إدارة فئات المنتجات</p>
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
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="mr-3 text-gray-600">جاري التحميل...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* العمود الأيسر - المعلومات الأساسية */}
                            <div className="space-y-6">
                                
                                {/* المعلومات الأساسية */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileText size={18} />
                                        المعلومات الأساسية
                                    </h3>
                                    
                                    {/* اسم الفئة */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            اسم الفئة *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={isReadOnly}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isReadOnly ? 'bg-gray-100' : 'bg-white'
                                            } ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="أدخل اسم الفئة"
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
                                            disabled={isReadOnly}
                                            rows={3}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isReadOnly ? 'bg-gray-100' : 'bg-white'
                                            } ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="وصف مختصر للفئة"
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    {/* الفئة الرئيسية */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الفئة الرئيسية
                                        </label>
                                        <select
                                            name="parentId"
                                            value={formData.parentId}
                                            onChange={handleInputChange}
                                            disabled={isReadOnly}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isReadOnly ? 'bg-gray-100' : 'bg-white'
                                            } border-gray-300`}
                                        >
                                            <option value="">فئة رئيسية</option>
                                            {parentCategories.map(cat => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ترتيب العرض */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ترتيب العرض
                                        </label>
                                        <input
                                            type="number"
                                            name="sortOrder"
                                            value={formData.sortOrder}
                                            onChange={handleInputChange}
                                            disabled={isReadOnly}
                                            min="0"
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isReadOnly ? 'bg-gray-100' : 'bg-white'
                                            } border-gray-300`}
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* حالة النشاط */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            disabled={isReadOnly}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="mr-2 text-sm font-medium text-gray-700">
                                            فئة نشطة
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* العمود الأيمن - الصورة و SEO */}
                            <div className="space-y-6">
                                
                                {/* صورة الفئة */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Image size={18} />
                                        صورة الفئة
                                    </h3>
                                    
                                    {/* معاينة الصورة */}
                                    <div className="mb-4">
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="معاينة الصورة"
                                                    className="w-full h-48 object-cover rounded-lg border"
                                                />
                                                {!isReadOnly && (
                                                    <button
                                                        onClick={() => {
                                                            setImagePreview('');
                                                            setFormData(prev => ({ ...prev, image: '' }));
                                                        }}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                <div className="text-center">
                                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                                    <p className="text-gray-500">لا توجد صورة</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* رفع الصورة */}
                                    {!isReadOnly && (
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <Upload size={18} />
                                                اختيار صورة
                                            </label>
                                            {errors.image && (
                                                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* إعدادات SEO */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Globe size={18} />
                                        تحسين محركات البحث (SEO)
                                    </h3>
                                    
                                    {/* عنوان SEO */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            عنوان SEO
                                        </label>
                                        <input
                                            type="text"
                                            name="seoTitle"
                                            value={formData.seoTitle}
                                            onChange={handleInputChange}
                                            disabled={isReadOnly}
                                            maxLength={60}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isReadOnly ? 'bg-gray-100' : 'bg-white'
                                            } ${errors.seoTitle ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="عنوان محسن لمحركات البحث"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{errors.seoTitle || ''}</span>
                                            <span>{formData.seoTitle.length}/60</span>
                                        </div>
                                    </div>

                                    {/* وصف SEO */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            وصف SEO
                                        </label>
                                        <textarea
                                            name="seoDescription"
                                            value={formData.seoDescription}
                                            onChange={handleInputChange}
                                            disabled={isReadOnly}
                                            maxLength={160}
                                            rows={3}
                                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isReadOnly ? 'bg-gray-100' : 'bg-white'
                                            } ${errors.seoDescription ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="وصف محسن لمحركات البحث"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{errors.seoDescription || ''}</span>
                                            <span>{formData.seoDescription.length}/160</span>
                                        </div>
                                    </div>

                                    {/* الرابط الودي */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الرابط الودي (Slug)
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                <Hash size={16} />
                                            </span>
                                            <input
                                                type="text"
                                                name="slug"
                                                value={formData.slug}
                                                onChange={handleInputChange}
                                                disabled={isReadOnly}
                                                className={`flex-1 p-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    isReadOnly ? 'bg-gray-100' : 'bg-white'
                                                } ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="رابط-ودي-للفئة"
                                            />
                                        </div>
                                        {errors.slug && (
                                            <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* رسالة خطأ عامة */}
                    {errors.general && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}
                </div>

                {/* أزرار التحكم */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        إلغاء
                    </button>
                    
                    {!isReadOnly && (
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
                            {mode === 'create' ? 'إضافة الفئة' : 'حفظ التغييرات'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}