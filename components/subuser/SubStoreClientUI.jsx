"use client";

import { useState } from 'react';
import { createMyStore, updateMyStore, deleteMyStore } from '@/app/actions/subuserEntiAction'; 
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, MapPin, Building, AlertTriangle } from 'lucide-react';
import { z } from "zod";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- (1) مكون النموذج (Modal) ---
function StoreFormModal({ isOpen, onClose, storeToEdit, onSave }) {
    const [formData, setFormData] = useState(
        storeToEdit 
        ? { name: storeToEdit.name, location: storeToEdit.location || '' }
        : { name: '', location: '' }
    );
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = Boolean(storeToEdit);

    const storeSchemaClient = z.object({
        name: z.string().min(2, "اسم المخزن قصير جداً"),
        location: z.string().optional(),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // التحقق من البيانات باستخدام Zod
        const validation = storeSchemaClient.safeParse(formData);
        if (!validation.success) {
            validation.error.issues.forEach(err => {
                const field = err.path[0] || "اسم المخزن";
                toast.error(`${field}: ${err.message}`);
            });
            setIsLoading(false);
            return;
        }

        // عرض Toast تحميل
        const toastId = toast.loading(isEditMode ? 'جاري تعديل المخزن...' : 'جاري إضافة المخزن...');

        try {
            const action = isEditMode ? updateMyStore : createMyStore;
            const args = isEditMode ? [storeToEdit._id, formData] : [formData];
            const result = await action(...args);

            toast.dismiss(toastId);

            if (result.success) {
                toast.success(isEditMode ? 'تم تعديل المخزن بنجاح' : 'تمت إضافة المخزن بنجاح');
                onSave();
            } else {
                toast.error(result.error || 'حدث خطأ أثناء العملية');
            }
        } catch (err) {
            toast.dismiss(toastId);
            toast.error('حدث خطأ غير متوقع');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" dir="rtl">
                <h2 className="text-xl font-semibold mb-4">
                    {isEditMode ? `تعديل المخزن: ${storeToEdit.name}` : 'إضافة مخزن جديد للفرع'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">اسم المخزن *</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">الموقع (اختياري)</label>
                        <input
                            type="text"
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 space-x-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- (2) مكون تأكيد الحذف ---
function DeleteStoreAlert({ isOpen, onClose, storeToDelete, onConfirm }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        const toastId = toast.loading('جاري حذف المخزن...');
        
        try {
            const result = await deleteMyStore(storeToDelete._id);
            toast.dismiss(toastId);

            if (result.success) {
                toast.success('تم حذف المخزن بنجاح');
                onConfirm();
            } else {
                toast.error(result.error || 'فشل الحذف');
            }
        } catch (err) {
            toast.dismiss(toastId);
            toast.error('حدث خطأ غير متوقع');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" dir="rtl">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            حذف المخزن: {storeToDelete.name}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                هل أنت متأكد؟ (لن يتم الحذف إذا كان المخزن مستخدماً في أي فواتير).
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleConfirm}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
                    >
                        {isLoading ? 'جاري الحذف...' : 'نعم، قم بالحذف'}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- (3) المكون الرئيسي ---
export default function SubStoreClientUI({ initialStores = [] }) {
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);

    const handleSave = () => {
        setIsFormOpen(false);
        setSelectedStore(null);
        router.refresh(); 
    };

    const handleDelete = () => {
        setIsDeleteAlertOpen(false);
        setSelectedStore(null);
        router.refresh(); 
    };

    return (
        <div className="space-y-6">
            <ToastContainer position="top-center" rtl />

            <div className="text-left">
                <button
                    onClick={() => {
                        setSelectedStore(null);
                        setIsFormOpen(true);
                    }}
                    className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} className="ml-2" />
                    إضافة مخزن للفرع
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4">
                    <h2 className="text-xl font-semibold">مخازن الفرع ({initialStores.length})</h2>
                </div>
                {initialStores.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {initialStores.map(store => (
                            <div key={store._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50">
                                <div className="flex items-center mb-3 sm:mb-0">
                                    <div className="p-3 bg-gray-100 rounded-full ml-4">
                                        <Building className="text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                                        {store.location && (
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <MapPin size={14} className="ml-1" />
                                                {store.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2 space-x-reverse mt-3 sm:mt-0">
                                    <button
                                        onClick={() => {
                                            setSelectedStore(store);
                                            setIsFormOpen(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="تعديل"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedStore(store);
                                            setIsDeleteAlertOpen(true);
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="حذف"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 p-8">
                        لم تقم بإضافة أي مخازن لهذا الفرع بعد.
                    </p>
                )}
            </div>

            <StoreFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                storeToEdit={selectedStore}
                onSave={handleSave}
            />

            <DeleteStoreAlert 
                isOpen={isDeleteAlertOpen}
                onClose={() => setIsDeleteAlertOpen(false)}
                storeToDelete={selectedStore}
                onConfirm={handleDelete}
            />
        </div>
    );
}
