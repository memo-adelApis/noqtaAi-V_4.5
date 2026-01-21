"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function AutoRedirect({ 
  message, 
  redirectTo, 
  redirectText = "انتقال تلقائي",
  delay = 3000,
  showButton = true 
}) {
  const router = useRouter();

  useEffect(() => {
    if (redirectTo && delay > 0) {
      const timer = setTimeout(() => {
        router.push(redirectTo);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [redirectTo, delay, router]);

  const handleManualRedirect = () => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="bg-gray-800 border border-yellow-500 rounded-lg p-8 max-w-md w-full text-center" dir="rtl">
        <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">توجيه تلقائي</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        
        {delay > 0 && (
          <p className="text-sm text-gray-400 mb-4">
            سيتم التوجيه تلقائياً خلال {Math.ceil(delay / 1000)} ثواني...
          </p>
        )}
        
        {showButton && redirectTo && (
          <button
            onClick={handleManualRedirect}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {redirectText}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}