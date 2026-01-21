"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBranchForm } from '@/app/actions/branchActions';
import { Building, MapPin } from "lucide-react";

export default function EditBranchForm({ branch }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');

    // إضافة معرف الفرع إلى FormData
    formData.append('branchId', branch._id);

    try {
      const result = await updateBranchForm(formData);
      
      if (result.success) {
        // إعادة توجيه بعد النجاح
        router.push('/subscriber/branches');
        router.refresh();
      } else {
        setError(result.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      setError('حدث خطأ في النظام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
      <form action={handleSubmit} className="space-y-6">
        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* اسم الفرع */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            اسم الفرع *
          </label>
          <input 
            name="name" 
            type="text" 
            required
            disabled={isLoading}
            defaultValue={branch.name}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            placeholder="مثال: الفرع الرئيسي، فرع الرياض، فرع جدة"
          />
          <p className="text-xs text-gray-500 mt-1">
            اختر اسماً واضحاً ومميزاً للفرع
          </p>
        </div>

        {/* موقع الفرع */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            الموقع الجغرافي
          </label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 text-gray-500" size={20} />
            <input 
              name="location" 
              type="text"
              disabled={isLoading}
              defaultValue={branch.location || ''}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pr-12 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
              placeholder="مثال: الرياض - حي النخيل، شارع الملك فهد"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            أضف العنوان التفصيلي للفرع (اختياري)
          </p>
        </div>

        {/* معلومات الفرع */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="font-medium text-blue-400 mb-2">معلومات الفرع:</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• تاريخ الإنشاء: {new Date(branch.createdAt).toLocaleDateString('ar-EG')}</p>
            <p>• آخر تحديث: {new Date(branch.updatedAt).toLocaleDateString('ar-EG')}</p>
            <p>• معرف الفرع: {branch._id}</p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Building size={20} />
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          
          <a 
            href="/subscriber/branches"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition text-center"
          >
            إلغاء
          </a>
        </div>
      </form>
    </div>
  );
}