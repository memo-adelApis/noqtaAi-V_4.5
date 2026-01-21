"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ShopLogin from './ShopLogin';
import ShopRegister from './ShopRegister';

export default function ShopAuthModal({ isOpen, onClose, shopName, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSuccess = (user, token) => {
    // إشعار المكونات الأخرى بتسجيل الدخول
    window.dispatchEvent(new CustomEvent('shopUserLogin', { 
      detail: { user, token } 
    }));
    
    onClose();
  };

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* محتوى المودال */}
        {mode === 'login' ? (
          <ShopLogin
            onSuccess={handleSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            shopName={shopName}
          />
        ) : (
          <ShopRegister
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
            shopName={shopName}
          />
        )}
      </div>
    </div>
  );
}