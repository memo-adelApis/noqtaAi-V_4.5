"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import LimitChecker from '@/components/ui/LimitChecker';
import { createInvoice } from '@/app/actions/invoiceActions';
import { FileText, Save, AlertTriangle } from 'lucide-react';

export default function CreateInvoiceForm() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [limitExceeded, setLimitExceeded] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await createInvoice(formData);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `${result.message}. متبقي من الحد: ${result.remainingLimit} فاتورة`
        });
        // إعادة تعيين النموذج
        document.getElementById('invoice-form').reset();
      } else {
        setMessage({
          type: 'error',
          text: result.error
        });
        
        if (result.limitExceeded) {
          setLimitExceeded(true);
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'حدث خطأ غير متوقع'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimitExceeded = (limitData) => {
    setLimitExceeded(true);
    setMessage({
      type: 'error',
      text: `${limitData.message}. الاستخدام الحالي: ${limitData.current}/${limitData.limit}`
    });
  };

  if (!session) {
    return <div>يرجى تسجيل الدخول أولاً</div>;
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <FileText className="text-blue-500" />
        إنشاء فاتورة جديدة
      </h2>

      {/* التحقق من الحدود */}
      <LimitChecker
        userId={session.user.id}
        limitType="invoice"
        onLimitExceeded={handleLimitExceeded}
      >
        {/* رسائل النظام */}
        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.type === 'success' 
              ? 'bg-green-900/20 border border-green-500/30 text-green-300'
              : 'bg-red-900/20 border border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'error' && <AlertTriangle size={16} />}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <form id="invoice-form" action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                اسم العميل
              </label>
              <input
                type="text"
                name="customerName"
                required
                disabled={limitExceeded || isSubmitting}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 disabled:opacity-50"
                placeholder="أدخل اسم العميل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                المبلغ الإجمالي
              </label>
              <input
                type="number"
                name="totalAmount"
                step="0.01"
                min="0"
                required
                disabled={limitExceeded || isSubmitting}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 disabled:opacity-50"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نوع الفاتورة
            </label>
            <select
              name="type"
              disabled={limitExceeded || isSubmitting}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 disabled:opacity-50"
            >
              <option value="revenue">إيرادات</option>
              <option value="expense">مصروفات</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ملاحظات
            </label>
            <textarea
              name="notes"
              rows="3"
              disabled={limitExceeded || isSubmitting}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 disabled:opacity-50"
              placeholder="ملاحظات إضافية (اختياري)"
            />
          </div>

          <button
            type="submit"
            disabled={limitExceeded || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={16} />
                {limitExceeded ? 'تم الوصول للحد الأقصى' : 'حفظ الفاتورة'}
              </>
            )}
          </button>
        </form>
      </LimitChecker>
    </div>
  );
}