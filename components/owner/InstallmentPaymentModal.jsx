"use client";

import { useState } from 'react';
import { X, DollarSign, Calendar, User, AlertTriangle } from 'lucide-react';
import { updateInstallmentStatus } from '@/app/actions/financialCalculations';
import { toast } from 'react-toastify';

export default function InstallmentPaymentModal({ 
  isOpen, 
  onClose, 
  installment, 
  onSuccess 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [paidAmount, setPaidAmount] = useState(installment?.remainingAmount || 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!installment) return;
    
    if (paidAmount <= 0) {
      toast.error('يجب إدخال مبلغ صحيح');
      return;
    }
    
    if (paidAmount > installment.remainingAmount) {
      toast.error('المبلغ المدخل أكبر من المبلغ المستحق');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await updateInstallmentStatus(
        installment.invoiceId,
        installment.installmentId || installment.installmentIndex,
        'paid',
        paidAmount
      );

      if (result.success) {
        toast.success('تم تسجيل الدفع بنجاح');
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'حدث خطأ في تسجيل الدفع');
      }
    } catch (error) {
      console.error('Error updating installment:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !installment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" dir="rtl">
        
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            تسجيل دفع قسط
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* محتوى النافذة */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* معلومات القسط */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span>العميل/المورد: {installment.client}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>تاريخ الاستحقاق: {formatDate(installment.dueDate)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign size={16} />
              <span>المبلغ الأصلي: {formatCurrency(installment.amount)}</span>
            </div>
            
            {installment.paidAmount > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <DollarSign size={16} />
                <span>المدفوع سابقاً: {formatCurrency(installment.paidAmount)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <DollarSign size={16} />
              <span>المبلغ المستحق: {formatCurrency(installment.remainingAmount)}</span>
            </div>
          </div>

          {/* مبلغ الدفع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مبلغ الدفع <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute right-3 top-3 text-gray-400" />
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                min="0"
                max={installment.remainingAmount}
                step="0.01"
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل مبلغ الدفع"
                required
              />
            </div>
            {paidAmount > installment.remainingAmount && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                المبلغ أكبر من المستحق
              </p>
            )}
          </div>

          {/* تاريخ الدفع */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الدفع
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أضف أي ملاحظات حول الدفع..."
            />
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || paidAmount <= 0 || paidAmount > installment.remainingAmount}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign size={16} />
              {isLoading ? 'جاري التسجيل...' : 'تسجيل الدفع'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}