"use client";

import { useState } from 'react';
import { TestTube } from 'lucide-react';

export default function TestNotificationButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestNotification = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/create-test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ تم إنشاء إشعار تجريبي بنجاح! قم بتحديث الصفحة لرؤيته.');
        // تحديث الصفحة بعد ثانيتين
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('❌ خطأ: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={createTestNotification}
        disabled={loading}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg text-sm transition flex items-center gap-2"
      >
        <TestTube size={16} />
        {loading ? 'جاري الإنشاء...' : 'إنشاء إشعار تجريبي'}
      </button>
      
      {message && (
        <p className="text-xs text-gray-300 max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
}