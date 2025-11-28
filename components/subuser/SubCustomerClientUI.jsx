"use client";

import { useState } from 'react';
import { createMyCustomer, updateMyCustomer, deleteMyCustomer } from '@/app/actions/subuserActions'; 
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Phone, MapPin, User, AlertTriangle } from 'lucide-react';
import { z } from "zod";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// --- (1) المكون المنبثق (Modal) للنموذج ---
function CustomerFormModal({ isOpen, onClose, customerToEdit, onSave }) {
    const [formData, setFormData] = useState(
        customerToEdit 
        ? { 
            name: customerToEdit.name, 
            contact: customerToEdit.details?.contact || '', 
            address: customerToEdit.details?.address || '' 
          }
        : { name: '', contact: '', address: '' }
    );
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = Boolean(customerToEdit);
    
    const customerSchemaClient = z.object({
        name: z.string().min(2, "اسم العميل قصير جداً"),
        contact: z.string().optional(),
        address: z.string().optional(),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        // const validation = customerSchemaClient.safeParse(formData);
        // if (!validation.success) {
        //     const newErrors = {};
        //     validation.error.errors.forEach(err => newErrors[err.path[0]] = err.message);
        //     setErrors(newErrors);
        //     return;
        // }

        setIsLoading(true);
        const toastId = toast.loading(isEditMode ? 'جاري تعديل العميل...' : 'جاري إضافة العميل...');
        
        try {
            let result;
            if (isEditMode) {
                // استخدام updateMyCustomer للتعديل
                result = await updateMyCustomer(customerToEdit._id, formData);
            } else {
                console.log(formData)
                // استخدام createMyCustomer للإضافة
                result = await createMyCustomer(formData);
            }

            toast.dismiss(toastId);

            if (result.success) {
                toast.success(isEditMode ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
                onSave(); 
            } else {
                console.log(result.error)
                toast.error(result.error || 'حدث خطأ ما');
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" dir="rtl">
                <h2 className="text-xl font-semibold mb-4">
                    {isEditMode ? `تعديل العميل: ${customerToEdit.name}` : 'إضافة عميل جديد للفرع'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">اسم العميل *</label>
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
                            {isLoading ? 'جاري الحفظ...' : isEditMode ? 'تحديث' : 'إضافة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- (2) المكون المنبثق لتأكيد الحذف ---
function DeleteCustomerAlert({ isOpen, onClose, customerToDelete, onConfirm }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        const toastId = toast.loading('جاري حذف العميل...');
        
        try {
            const result = await deleteMyCustomer(customerToDelete._id);
            toast.dismiss(toastId);
            
            if (result.success) {
                toast.success('تم حذف العميل بنجاح');
                onConfirm();
            } else {
                toast.error(result.error || 'فشل الحذف');
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('حدث خطأ غير متوقع أثناء الحذف');
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
                            حذف العميل: {customerToDelete.name}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                هل أنت متأكد؟ (ملاحظة: لن يتم الحذف إذا كان هناك فواتير مرتبطة بهذا العميل).
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
export default function SubCustomerClientUI({ initialCustomers }) {
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleSave = () => {
        setIsFormOpen(false);
        setSelectedCustomer(null);
        router.refresh(); // إعادة تحميل البيانات من الخادم
    };

    const handleDelete = () => {
        setIsDeleteAlertOpen(false);
        setSelectedCustomer(null);
        router.refresh(); // إعادة تحميل البيانات من الخادم
    };

    return (
        <div className="space-y-6">
            <ToastContainer position="top-center" />
            
            {/* الهيدر مع زر الإضافة */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">إدارة عملاء الفرع</h1>
                <button
                    onClick={() => {
                        setSelectedCustomer(null);
                        setIsFormOpen(true);
                    }}
                    className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} className="ml-2" />
                    إضافة عميل جديد
                </button>
            </div>

            {/* قائمة العملاء */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">عملاء الفرع ({initialCustomers.length})</h2>
                </div>
                {initialCustomers.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {initialCustomers.map(customer => (
                            <div key={customer._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition-colors">
                                <div className="flex items-center mb-3 sm:mb-0">
                                    <div className="p-3 bg-gray-100 rounded-full ml-4">
                                        <User className="text-gray-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0 text-sm text-gray-600 mt-1">
                                            {customer.details?.contact && (
                                                <div className="flex items-center">
                                                    <Phone size={14} className="ml-1 text-gray-400" />
                                                    {customer.details.contact}
                                                </div>
                                            )}
                                            {customer.details?.address && (
                                                <div className="flex items-center">
                                                    <MapPin size={14} className="ml-1 text-gray-400" />
                                                    {customer.details.address}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex space-x-2 space-x-reverse mt-3 sm:mt-0">
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setIsFormOpen(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" 
                                        title="تعديل"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setIsDeleteAlertOpen(true);
                                        }}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" 
                                        title="حذف"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 p-8">
                        <User size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>لم تقم بإضافة أي عملاء لهذا الفرع بعد.</p>
                    </div>
                )}
            </div>

            {/* المودالات */}
            <CustomerFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                customerToEdit={selectedCustomer}
                onSave={handleSave}
            />
            
            <DeleteCustomerAlert 
                isOpen={isDeleteAlertOpen}
                onClose={() => setIsDeleteAlertOpen(false)}
                customerToDelete={selectedCustomer}
                onConfirm={handleDelete}
            />
        </div>
    );
}
