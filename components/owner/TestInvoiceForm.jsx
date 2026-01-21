"use client";

import { useState } from 'react';
import { createInvoice } from '@/app/actions/invoiceActions';
import { toast } from 'react-toastify';

export default function TestInvoiceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const createTestInvoice = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const testInvoiceData = {
        type: 'revenue',
        invoiceKind: 'normal',
        customerId: null,
        supplierId: null,
        items: [
          {
            name: 'منتج تجريبي',
            price: 100,
            quantity: 2,
            unit: null,
            storeId: null,
            categoryId: null,
            description: 'منتج تجريبي للاختبار'
          }
        ],
        discount: 0,
        extra: 0,
        taxRate: 0,
        paymentType: 'cash',
        pays: [
          {
            date: new Date().toISOString().split('T')[0],
            amount: 200,
            method: 'cash'
          }
        ],
        installments: [],
        currencyCode: 'EGP',
        notes: 'فاتورة تجريبية للاختبار'
      };

      const response = await createInvoice(testInvoiceData);
      setResult(response);

      if (response.success) {
        toast.success('تم إنشاء الفاتورة التجريبية بنجاح!');
      } else {
        toast.error(response.error || 'فشل في إنشاء الفاتورة');
      }
    } catch (error) {
      console.error('Error creating test invoice:', error);
      toast.error('حدث خطأ غير متوقع');
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const debugUserInfo = async () => {
    try {
      const response = await fetch('/api/debug-owner');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Debug error:', error);
      setResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">أدوات الاختبار</h2>
      
      <div className="space-y-4">
        <button
          onClick={debugUserInfo}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          عرض معلومات المستخدم والفواتير
        </button>

        <button
          onClick={createTestInvoice}
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'جاري إنشاء الفاتورة...' : 'إنشاء فاتورة تجريبية'}
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">النتيجة:</h3>
          <pre className="text-sm text-gray-300 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}