"use client";

import { toast as reactToast } from 'react-toastify';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// دالة مساعدة لإنشاء Toast مخصص
const createToast = (type, message, options = {}) => {
  const defaultOptions = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    rtl: true,
    ...options
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const CustomToast = ({ closeToast }) => (
    <div className="flex items-center gap-3 p-2">
      {icons[type]}
      <span className="flex-1 text-sm">{message}</span>
    </div>
  );

  return reactToast[type](CustomToast, defaultOptions);
};

// Toast API محسن
export const toast = {
  success: (message, options) => createToast('success', message, options),
  error: (message, options) => createToast('error', message, options),
  warning: (message, options) => createToast('warning', message, options),
  info: (message, options) => createToast('info', message, options),
  
  // دالة عامة
  show: (message, type = 'info', options) => createToast(type, message, options),
  
  // دوال إضافية
  dismiss: (toastId) => reactToast.dismiss(toastId),
  dismissAll: () => reactToast.dismiss(),
  
  // Toast للعمليات الطويلة
  promise: (promise, messages, options = {}) => {
    return reactToast.promise(
      promise,
      {
        pending: messages.pending || 'جاري المعالجة...',
        success: messages.success || 'تمت العملية بنجاح',
        error: messages.error || 'حدث خطأ'
      },
      {
        position: "top-center",
        theme: "dark",
        rtl: true,
        ...options
      }
    );
  }
};

export default toast;