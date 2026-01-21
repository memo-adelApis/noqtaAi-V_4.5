"use client";

import { useState } from 'react';
import ShopAuthModal from '@/components/shop/auth/ShopAuthModal';

export default function TestAuthPage() {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null);

  const handleSuccess = (userData, token) => {
    setUser(userData);
    console.log('تسجيل دخول ناجح:', userData);
    console.log('Token:', token);
  };

  const handleLogout = () => {
    localStorage.removeItem('shop_user');
    localStorage.removeItem('shop_token');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            اختبار نظام المصادقة
          </h1>
          <p className="text-gray-600">
            اختبار تسجيل الدخول والتسجيل للمتجر الإلكتروني
          </p>
        </div>

        {/* حالة المستخدم */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">حالة المستخدم</h2>
          
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">مسجل دخول</p>
                  <p className="text-sm text-green-600">الاسم: {user.name}</p>
                  <p className="text-sm text-green-600">الهاتف: {user.phone}</p>
                  <p className="text-sm text-green-600">محقق: {user.isVerified ? 'نعم' : 'لا'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600">غير مسجل دخول</p>
            </div>
          )}
        </div>

        {/* أزرار الاختبار */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* تسجيل الدخول */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">تسجيل الدخول</h3>
            <p className="text-gray-600 mb-4">
              اختبار تسجيل الدخول بالهاتف مع أو بدون كلمة مرور
            </p>
            <button
              onClick={() => {
                setMode('login');
                setShowModal(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              فتح نافذة تسجيل الدخول
            </button>
          </div>

          {/* التسجيل */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">إنشاء حساب</h3>
            <p className="text-gray-600 mb-4">
              اختبار إنشاء حساب جديد بالهاتف والتحقق
            </p>
            <button
              onClick={() => {
                setMode('register');
                setShowModal(true);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              فتح نافذة التسجيل
            </button>
          </div>
          
        </div>

        {/* معلومات الاختبار */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">معلومات الاختبار</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">بيانات اختبار:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>رقم الهاتف:</strong> 0501234567</p>
                <p><strong>الاسم:</strong> أحمد محمد</p>
                <p><strong>رمز التحقق:</strong> سيظهر في console المتصفح</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">API Endpoints:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                <p>• POST /api/shop/auth/register</p>
                <p>• POST /api/shop/auth/login</p>
                <p>• POST /api/shop/auth/verify</p>
                <p>• POST /api/shop/auth/resend-code</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">الميزات:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                <p>✅ تسجيل دخول بالهاتف فقط (بدون كلمة مرور)</p>
                <p>✅ تسجيل دخول بالهاتف + كلمة مرور</p>
                <p>✅ التحقق برمز SMS (محاكاة)</p>
                <p>✅ JWT authentication</p>
                <p>✅ حماية من محاولات الدخول المتكررة</p>
                <p>✅ إدارة السلة للمستخدمين</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <ShopAuthModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          shopName="megashop"
          initialMode={mode}
        />
        
      </div>
    </div>
  );
}