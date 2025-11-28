// المسار: components/subuser/SubSupplierClientUI.jsx
"use client";

import { useState } from 'react';
import { createMySupplier, updateMySupplier, deleteMySupplier } from '@/app/actions/subuserActions'; 
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Phone, MapPin, Truck, AlertTriangle } from 'lucide-react';
import { z } from "zod";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// --- (1) المكون المنبثق (Modal) للنموذج ---
function SupplierFormModal({ isOpen, onClose, supplierToEdit, onSave }) {
    const [formData, setFormData] = useState(
        supplierToEdit 
        ? { 
            name: supplierToEdit.name, 
            contact: supplierToEdit.details?.contact || '', 
            address: supplierToEdit.details?.address || '' 
          }
        : { name: '', contact: '', address: '' }
    );
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = Boolean(supplierToEdit);
    
    const supplierSchemaClient = z.object({
        name: z.string().min(2, "اسم المورد قصير جداً"),
        contact: z.string().optional(),
        address: z.string().optional(),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const validation = supplierSchemaClient.safeParse(formData);
        if (!validation.success) {
            const newErrors = {};
            validation.error.errors.forEach(err => newErrors[err.path[0]] = err.message);
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading(isEditMode ? 'جاري تعديل المورد...' : 'جاري إضافة المورد...');
        
        const action = isEditMode ? updateMySupplier : createMySupplier;
        const args = isEditMode ? [supplierToEdit._id, formData] : [formData];
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" dir="rtl">
                <h2 className="text-xl font-semibold mb-4">
                    {isEditMode ? `تعديل المورد: ${supplierToEdit.name}` : 'إضافة مورد جديد للفرع'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">اسم المورد *</label>
                        <input
                            type="text" id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">رقم الاتصال (اختياري)</label>
                        <input
                            type="text" id="contact"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">العنوان (اختياري)</label>
                        <input
                            type="text" id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 space-x-reverse">
                        <button type="button" onClick={onClose} disabled={isLoading} className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                            إلغاء
                        </button>
                        <button type="submit" disabled={isLoading} className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- (2) المكون المنبثق لتأكيد الحذف ---
function DeleteSupplierAlert({ isOpen, onClose, supplierToDelete, onConfirm }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        const toastId = toast.loading('جاري حذف المورد...');
        
        const result = await deleteMySupplier(supplierToDelete._id);
        toast.dismiss(toastId);
        
        if (result.success) {
            toast.success('تم حذف المورد بنجاح');
            onConfirm();
        } else {
            toast.error(result.error || 'فشل الحذف');
        }
        setIsLoading(false);
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
                            حذف المورد: {supplierToDelete.name}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                هل أنت متأكد؟ (ملاحظة: لن يتم الحذف إذا كان هناك فواتير مرتبطة بهذا المورد).
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button type="button" disabled={isLoading} onClick={handleConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">
                        {isLoading ? 'جاري الحذف...' : 'نعم، قم بالحذف'}
                    </button>
                    <button type="button" disabled={isLoading} onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- (3) المكون الرئيسي (Client UI) ---
export default function SubSupplierClientUI({ initialSuppliers }) {
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const handleSave = () => {
        setIsFormOpen(false);
        setSelectedSupplier(null);
        router.refresh(); 
    };

    const handleDelete = () => {
        setIsDeleteAlertOpen(false);
        setSelectedSupplier(null);
        router.refresh(); 
    };

    return (
        <div className="space-y-6">
            <ToastContainer position="top-center" />
            <div className="text-left">
                <button
                    onClick={() => {
                        setSelectedSupplier(null);
                        setIsFormOpen(true);
                    }}
                    className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} className="ml-2" />
                    إضافة مورد للفرع
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4">
                    <h2 className="text-xl font-semibold">موردي الفرع ({initialSuppliers.length})</h2>
                </div>
                {initialSuppliers.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {initialSuppliers.map(supplier => (
                            <div key={supplier._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50">
                                <div className="flex items-center mb-3 sm:mb-0">
                                    <div className="p-3 bg-gray-100 rounded-full ml-4">
                                        <Truck className="text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-gray-600">
                                    {supplier.details?.contact && (
                                        <div className="flex items-center">
                                            <Phone size={14} className="ml-1 text-gray-400" />
                                            {supplier.details.contact}
                                        </div>
                                    )}
                                    {supplier.details?.address && (
                                        <div className="flex items-center">
                                            <MapPin size={14} className="ml-1 text-gray-400" />
                                            {supplier.details.address}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex space-x-2 space-x-reverse mt-3 sm:mt-0">
                                    <button
                                        onClick={() => {
                                            setSelectedSupplier(supplier);
                                            setIsFormOpen(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="تعديل"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedSupplier(supplier);
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
                        لم تقم بإضافة أي موردين لهذا الفرع بعد.
                    </p>
                )}
            </div>

            <SupplierFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                supplierToEdit={selectedSupplier}
                onSave={handleSave}
            />
            
            <DeleteSupplierAlert 
                isOpen={isDeleteAlertOpen}
                onClose={() => setIsDeleteAlertOpen(false)}
                supplierToDelete={selectedSupplier}
                onConfirm={handleDelete}
            />
        </div>
    );
}
