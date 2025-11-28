"use client";

import { useState } from 'react';
import { createBranch, updateBranch, deleteBranch } from '@/app/actions/branchActions';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, MapPin, Building, AlertTriangle, X } from 'lucide-react';
import { z } from "zod";
import { toast } from 'react-toastify';

// مخطط التحقق
const branchSchemaClient = z.object({
    name: z.string().min(2, "اسم الفرع قصير جداً"),
    location: z.string().optional(),
});

// 1. المكون المنبثق (Modal) للإضافة والتعديل - (تصميم داكن)
function BranchFormModal({ isOpen, onClose, branchToEdit, onSave }) {
    const [formData, setFormData] = useState(
        branchToEdit 
        ? { name: branchToEdit.name, location: branchToEdit.location || '' }
        : { name: '', location: '' }
    );
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = Boolean(branchToEdit);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        const validation = branchSchemaClient.safeParse(formData);
        if (!validation.success) {
            const newErrors = {};
            validation.error.errors.forEach(err => {
                newErrors[err.path[0]] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        const action = isEditMode ? updateBranch : createBranch;
        const args = isEditMode ? [branchToEdit._id, formData] : [formData];
        
        const toastId = toast.loading(isEditMode ? 'جاري تعديل الفرع...' : 'جاري إضافة الفرع...');

        const result = await action(...args);

        toast.dismiss(toastId);

        if (result.success) {
            toast.success(isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
            onSave();
        } else {
            toast.error(result.error || 'حدث خطأ ما');
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#1c1d22] border border-gray-800 rounded-lg shadow-2xl w-full max-w-lg p-6" dir="rtl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {isEditMode ? 'تعديل الفرع' : 'إضافة فرع جديد'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">اسم الفرع *</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-4 py-2.5 bg-[#252830] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                                ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700'}`}
                            placeholder="مثال: الفرع الرئيسي"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1 font-medium">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">الموقع (اختياري)</label>
                        <input
                            type="text"
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#252830] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="مثال: القاهرة، مدينة نصر"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 space-x-reverse pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="py-2.5 px-5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="py-2.5 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70 transition-colors font-medium shadow-lg shadow-blue-900/20"
                        >
                            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// 2. المكون المنبثق لتأكيد الحذف - (تصميم داكن)
function DeleteBranchAlert({ isOpen, onClose, branchToDelete, onConfirm }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        const toastId = toast.loading('جاري حذف الفرع...');
        
        const result = await deleteBranch(branchToDelete._id);

        toast.dismiss(toastId);
        
        if (result.success) {
            toast.success('تم حذف الفرع بنجاح');
            onConfirm();
        } else {
            toast.error(result.error || 'فشل الحذف');
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#1c1d22] border border-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6" dir="rtl">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right w-full">
                        <h3 className="text-lg leading-6 font-bold text-white">
                            حذف الفرع: {branchToDelete.name}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-400 leading-relaxed">
                                هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء. 
                                <br />
                                <strong className="block mt-2 text-red-400 bg-red-900/10 p-2 rounded border border-red-900/30">
                                    ملاحظة: لن يتم الحذف إذا كان هناك موظفون مرتبطون بالفرع.
                                </strong>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleConfirm}
                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-colors"
                    >
                        {isLoading ? 'جاري الحذف...' : 'نعم، قم بالحذف'}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-600 shadow-sm px-4 py-2 bg-transparent text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}

// 3. المكون الرئيسي (Client UI) - (تصميم داكن)
export default function BranchClientUI({ initialBranches }) {
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const handleSave = () => {
        setIsFormOpen(false);
        setSelectedBranch(null);
        router.refresh();
    };

    const handleDelete = () => {
        setIsDeleteAlertOpen(false);
        setSelectedBranch(null);
        router.refresh();
    };

    return (
        <div className="space-y-8" dir="rtl">
            
            {/* الهيدر وزر الإضافة */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1c1d22] p-6 rounded-xl border border-gray-800 shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">إدارة الفروع</h1>
                    <p className="text-gray-400 text-sm">قم بإدارة وتحديث بيانات فروع الشركة من هنا.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedBranch(null);
                        setIsFormOpen(true);
                    }}
                    className="inline-flex items-center py-2.5 px-5 bg-blue-600 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} className="ml-2" />
                    إضافة فرع جديد
                </button>
            </div>

            {/* قائمة الفروع */}
            <div className="bg-[#1c1d22] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-gray-800 bg-[#252830]">
                    <div className="flex items-center gap-2">
                        <Building className="text-blue-500" size={20} />
                        <h2 className="text-lg font-bold text-white">الفروع الحالية ({initialBranches.length})</h2>
                    </div>
                </div>
                
                {initialBranches.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {initialBranches.map(branch => (
                            <div key={branch._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-800/50 transition-colors duration-200 group">
                                <div className="flex items-center w-full">
                                    <div className="p-3 bg-gray-800 rounded-lg ml-4 border border-gray-700 group-hover:border-gray-600 transition-colors">
                                        <Building className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-100 mb-1">{branch.name}</h3>
                                        {branch.location ? (
                                            <p className="text-sm text-gray-400 flex items-center bg-gray-900/50 px-2 py-1 rounded w-fit">
                                                <MapPin size={14} className="ml-1 text-gray-500" />
                                                {branch.location}
                                            </p>
                                        ) : (
                                            <span className="text-xs text-gray-600 italic">لا يوجد موقع محدد</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex space-x-2 space-x-reverse w-full sm:w-auto justify-end">
                                    <button
                                        onClick={() => {
                                            setSelectedBranch(branch);
                                            setIsFormOpen(true);
                                        }}
                                        className="p-2.5 bg-blue-900/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-900/30 hover:border-blue-500 transition-all"
                                        title="تعديل"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedBranch(branch);
                                            setIsDeleteAlertOpen(true);
                                        }}
                                        className="p-2.5 bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg border border-red-900/30 hover:border-red-500 transition-all"
                                        title="حذف"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4">
                        <div className="bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                            <Building size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">لا توجد فروع مضافة</h3>
                        <p className="text-gray-400 mb-6">ابدأ بإضافة أول فرع لشركتك الآن.</p>
                        <button
                            onClick={() => {
                                setSelectedBranch(null);
                                setIsFormOpen(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                        >
                            + إضافة فرع جديد
                        </button>
                    </div>
                )}
            </div>

            {/* النماذج المنبثقة */}
            <BranchFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                branchToEdit={selectedBranch}
                onSave={handleSave}
            />
            
            <DeleteBranchAlert 
                isOpen={isDeleteAlertOpen}
                onClose={() => setIsDeleteAlertOpen(false)}
                branchToDelete={selectedBranch}
                onConfirm={handleDelete}
            />
        </div>
    );
}