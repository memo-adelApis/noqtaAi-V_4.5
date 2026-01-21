"use client";

import { useState } from 'react';
import { Database, Trash2, Plus, AlertTriangle } from 'lucide-react';

export default function SeedCategoriesButton({ onCategoriesUpdated }) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [action, setAction] = useState('');

    const handleSeedCategories = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/seed-categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'seed' })
            });

            const result = await response.json();

            if (result.success) {
                alert('تم إنشاء الفئات الرئيسية بنجاح!');
                if (onCategoriesUpdated) {
                    onCategoriesUpdated();
                }
            } else {
                alert('خطأ: ' + result.error);
            }

        } catch (error) {
            console.error('Error seeding categories:', error);
            alert('حدث خطأ أثناء إنشاء الفئات');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    const handleClearCategories = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/seed-categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'clear' })
            });

            const result = await response.json();

            if (result.success) {
                alert('تم حذف جميع الفئات بنجاح!');
                if (onCategoriesUpdated) {
                    onCategoriesUpdated();
                }
            } else {
                alert('خطأ: ' + result.error);
            }

        } catch (error) {
            console.error('Error clearing categories:', error);
            alert('حدث خطأ أثناء حذف الفئات');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    const handleConfirm = () => {
        if (action === 'seed') {
            handleSeedCategories();
        } else if (action === 'clear') {
            handleClearCategories();
        }
    };

    const showSeedConfirm = () => {
        setAction('seed');
        setShowConfirm(true);
    };

    const showClearConfirm = () => {
        setAction('clear');
        setShowConfirm(true);
    };

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={showSeedConfirm}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading && action === 'seed' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Database size={18} />
                    )}
                    إنشاء الفئات الرئيسية
                </button>

                <button
                    onClick={showClearConfirm}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading && action === 'clear' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Trash2 size={18} />
                    )}
                    حذف جميع الفئات
                </button>
            </div>

            {/* نافذة التأكيد */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        
                        {/* رأس النافذة */}
                        <div className={`p-6 rounded-t-2xl ${
                            action === 'seed' ? 'bg-green-600' : 'bg-red-600'
                        } text-white`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    {action === 'seed' ? (
                                        <Database size={24} />
                                    ) : (
                                        <AlertTriangle size={24} />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {action === 'seed' ? 'إنشاء الفئات الرئيسية' : 'حذف جميع الفئات'}
                                    </h2>
                                    <p className="text-white/80 text-sm">
                                        {action === 'seed' ? 'تأكيد العملية' : 'تحذير: عملية غير قابلة للتراجع'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* محتوى النافذة */}
                        <div className="p-6">
                            {action === 'seed' ? (
                                <div>
                                    <p className="text-gray-700 mb-4">
                                        سيتم إنشاء الفئات الرئيسية التالية مع فئاتها الفرعية:
                                    </p>
                                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                        <li>• الإلكترونيات (3 فئات فرعية)</li>
                                        <li>• الملابس والأزياء (3 فئات فرعية)</li>
                                        <li>• المواد الغذائية (4 فئات فرعية)</li>
                                        <li>• الصحة والجمال (3 فئات فرعية)</li>
                                        <li>• المنزل والحديقة (3 فئات فرعية)</li>
                                        <li>• الرياضة واللياقة (3 فئات فرعية)</li>
                                        <li>• الكتب والقرطاسية (3 فئات فرعية)</li>
                                        <li>• السيارات والمركبات (3 فئات فرعية)</li>
                                    </ul>
                                    <p className="text-sm text-gray-500">
                                        ملاحظة: الفئات الموجودة مسبقاً لن تتأثر
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-red-600 font-medium mb-4">
                                        ⚠️ تحذير: هذا الإجراء سيحذف جميع الفئات نهائياً!
                                    </p>
                                    <p className="text-gray-700 mb-4">
                                        سيتم حذف جميع الفئات الرئيسية والفرعية من حسابك. 
                                        هذا الإجراء غير قابل للتراجع.
                                    </p>
                                    <p className="text-sm text-red-500">
                                        تأكد من أنك تريد المتابعة قبل الضغط على "تأكيد"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* أزرار التحكم */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                                    action === 'seed' 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : action === 'seed' ? (
                                    <Plus size={16} />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                                {action === 'seed' ? 'إنشاء الفئات' : 'تأكيد الحذف'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}