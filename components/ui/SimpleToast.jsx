"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Context للتحكم في Toast
const ToastContext = createContext();

// Hook لاستخدام Toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// مكون Toast الفردي
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // إظهار Toast
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // إخفاء Toast تلقائياً
    const hideTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const bgColors = {
    success: 'bg-green-900 border-green-700',
    error: 'bg-red-900 border-red-700',
    warning: 'bg-yellow-900 border-yellow-700',
    info: 'bg-blue-900 border-blue-700'
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-2
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${bgColors[toast.type]} border rounded-lg p-4 shadow-lg
        flex items-center gap-3 min-w-80 max-w-md
      `}
      dir="rtl"
    >
      {icons[toast.type]}
      <div className="flex-1">
        {toast.title && (
          <div className="font-semibold text-white text-sm mb-1">
            {toast.title}
          </div>
        )}
        <div className="text-gray-200 text-sm">
          {toast.message}
        </div>
      </div>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-white transition-colors p-1"
        aria-label="إغلاق"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// مكون Toast Container
export const SimpleToastContainer = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, options = {}) => addToast({ 
      type: 'success', 
      message, 
      ...options 
    }),
    error: (message, options = {}) => addToast({ 
      type: 'error', 
      message, 
      ...options 
    }),
    warning: (message, options = {}) => addToast({ 
      type: 'warning', 
      message, 
      ...options 
    }),
    info: (message, options = {}) => addToast({ 
      type: 'info', 
      message, 
      ...options 
    })
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-4 z-50 pointer-events-none">
        <div className="flex flex-col-reverse">
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

// Toast API للاستخدام المباشر
let toastInstance = null;

export const simpleToast = {
  success: (message, options) => toastInstance?.success(message, options),
  error: (message, options) => toastInstance?.error(message, options),
  warning: (message, options) => toastInstance?.warning(message, options),
  info: (message, options) => toastInstance?.info(message, options)
};

// Hook لتسجيل Toast instance
export const useToastInstance = () => {
  const toast = useToast();
  useEffect(() => {
    toastInstance = toast;
    return () => {
      toastInstance = null;
    };
  }, [toast]);
};