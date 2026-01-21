"use client";

import { useState } from 'react';
import { CheckCircle, DollarSign, Eye, Phone } from 'lucide-react';
import { updateInstallmentStatusSubuser } from '@/app/actions/subuserActions';
import { toast } from 'react-toastify';

export default function SubuserInstallmentActions({ invoiceId, installment, installmentIndex, invoiceNumber }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paidAmount, setPaidAmount] = useState(installment.amount);

  const handleMarkAsPaid = async () => {
    setIsLoading(true);
    try {
      // Use _id if available, otherwise use the array index
      const installmentId = installment._id || installmentIndex;
      
      // Debug: Log what we're sending
      console.log("Debug - Subuser calling updateInstallmentStatus with:", {
        invoiceId,
        installmentId,
        installment: installment,
        installmentIndex,
        status: 'paid',
        paidAmount
      });

      const result = await updateInstallmentStatusSubuser(
        invoiceId, 
        installmentId,
        'paid', 
        paidAmount
      );
      
      if (result.success) {
        toast.success(`تم تسجيل دفع القسط بنجاح - ${formatCurrency(paidAmount)}`);
        setShowPaymentModal(false);
        // إعادة تحميل الصفحة لتحديث البيانات
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.error || 'حدث خطأ في تسجيل الدفع');
      }
    } catch (error) {
      console.error('Error in handleMarkAsPaid:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  if (installment.status === 'paid') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-green-400 text-xs">
          مدفوع في {new Date(installment.paidDate).toLocaleDateString('ar-EG')}
        </span>
        <CheckCircle className="text-green-400" size={16} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowPaymentModal(true)}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        <DollarSign size={14} />
        تسجيل دفع
      </button>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              تسجيل دفع القسط - فاتورة #{invoiceNumber}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">معلومات القسط</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">المبلغ الأصلي:</span>
                  <span className="font-semibold text-blue-400">{formatCurrency(installment.amount)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-300">تاريخ الاستحقاق:</span>
                  <span className="text-sm text-gray-300">{new Date(installment.dueDate).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  المبلغ المدفوع <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  min="0"
                  max={installment.amount}
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل المبلغ المدفوع"
                />
                {paidAmount > installment.amount && (
                  <p className="text-red-400 text-xs mt-1">المبلغ المدفوع لا يمكن أن يكون أكبر من مبلغ القسط</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleMarkAsPaid}
                disabled={isLoading || paidAmount <= 0 || paidAmount > installment.amount}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={16} />
                {isLoading ? 'جاري التسجيل...' : 'تأكيد الدفع'}
              </button>
              
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}