"use client";

import { useState } from 'react';
import { CheckCircle, DollarSign, Eye, Phone } from 'lucide-react';
import { updateInstallmentStatus } from '@/app/actions/ownerDashboardActions';
import { toast } from 'react-toastify';

export default function InstallmentActions({ invoiceId, installment, installmentIndex, invoiceNumber }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paidAmount, setPaidAmount] = useState(installment.amount);

  const handleMarkAsPaid = async () => {
    setIsLoading(true);
    try {
      // Use _id if available, otherwise use the array index
      const installmentId = installment._id || installmentIndex;
      
      // Debug: Log what we're sending
      console.log("Debug - Calling updateInstallmentStatus with:", {
        invoiceId,
        installmentId,
        installment: installment,
        installmentIndex,
        status: 'paid',
        paidAmount
      });

      const result = await updateInstallmentStatus(
        invoiceId, 
        installmentId,
        'paid', 
        paidAmount
      );
      
      if (result.success) {
        toast.success('تم تسجيل دفع القسط بنجاح');
        setShowPaymentModal(false);
        // إعادة تحميل الصفحة لتحديث البيانات
        window.location.reload();
      } else {
        toast.error(result.error || 'حدث خطأ في تسجيل الدفع');
      }
    } catch (error) {
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
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPaymentModal(true)}
          disabled={isLoading}
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          title="تسجيل دفع"
        >
          <DollarSign size={16} />
        </button>
        
        <button
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="عرض تفاصيل الفاتورة"
        >
          <Eye size={16} />
        </button>
        
        <button
          className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          title="تذكير العميل"
        >
          <Phone size={16} />
        </button>
      </div>

      {/* نافذة تسجيل الدفع */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              تسجيل دفع القسط
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  فاتورة رقم: {invoiceNumber}
                </label>
                <p className="text-sm text-gray-400">
                  تاريخ الاستحقاق: {new Date(installment.dueDate).toLocaleDateString('ar-EG')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  مبلغ القسط الأصلي
                </label>
                <p className="text-lg font-semibold text-blue-400">
                  {formatCurrency(installment.amount)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  المبلغ المدفوع
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  min="0"
                  max={installment.amount}
                  step="0.01"
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleMarkAsPaid}
                  disabled={isLoading || paidAmount <= 0}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'جاري التسجيل...' : 'تسجيل الدفع'}
                </button>
                
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}