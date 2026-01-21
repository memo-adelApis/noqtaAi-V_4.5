"use client";

// تكوين نظام Toast
export const TOAST_CONFIG = {
  // يمكن تغيير هذا إلى 'simple' في حالة مشاكل مع react-toastify
  provider: 'react-toastify', // 'react-toastify' | 'simple'
  
  // إعدادات عامة
  position: 'top-center',
  autoClose: 5000,
  theme: 'dark',
  rtl: true,
  
  // إعدادات التصميم
  style: {
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    border: '1px solid #374151',
    borderRadius: '8px',
    fontFamily: 'Cairo, sans-serif'
  }
};

// دالة للحصول على Toast API المناسب
export const getToastAPI = () => {
  if (TOAST_CONFIG.provider === 'simple') {
    return import('./SimpleToast').then(mod => mod.simpleToast);
  } else {
    return import('react-toastify').then(mod => mod.toast);
  }
};

// Hook للحصول على Toast API
export const useToastAPI = () => {
  if (TOAST_CONFIG.provider === 'simple') {
    const { useToast } = require('./SimpleToast');
    return useToast();
  } else {
    const { toast } = require('react-toastify');
    return toast;
  }
};