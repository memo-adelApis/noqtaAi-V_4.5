"use client";

import { useState } from 'react';
import { Phone, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShopLogin({ onSuccess, onSwitchToRegister, shopName }) {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone', 'password', 'verification'
  const [verificationCode, setVerificationCode] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone.trim()) {
      toast.error('رقم الهاتف مطلوب');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shop/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresVerification) {
          setRequiresVerification(true);
          setStep('verification');
          toast.success(data.message);
        } else {
          // تسجيل دخول ناجح
          localStorage.setItem('shop_token', data.token);
          localStorage.setItem('shop_user', JSON.stringify(data.user));
          toast.success(data.message);
          onSuccess?.(data.user, data.token);
        }
      } else {
        if (response.status === 404) {
          // المستخدم غير موجود - اعرض خيار التسجيل
          toast.error('رقم الهاتف غير مسجل. هل تريد إنشاء حساب جديد؟');
          setTimeout(() => {
            onSwitchToRegister?.();
          }, 2000);
        } else {
          toast.error(data.error || 'حدث خطأ في تسجيل الدخول');
        }
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      toast.error('رمز التحقق مطلوب');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shop/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formData.phone,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('shop_token', data.token);
        localStorage.setItem('shop_user', JSON.stringify(data.user));
        toast.success(data.message);
        onSuccess?.(data.user, data.token);
      } else {
        toast.error(data.error || 'رمز التحقق غير صحيح');
      }
    } catch (error) {
      console.error('خطأ في التحقق:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/shop/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'حدث خطأ في إعادة الإرسال');
      }
    } catch (error) {
      console.error('خطأ في إعادة الإرسال:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verification') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto" dir="rtl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">التحقق من الهاتف</h2>
          <p className="text-gray-600">
            تم إرسال رمز التحقق إلى رقم {formData.phone}
          </p>
        </div>

        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز التحقق
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'تأكيد'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              إعادة إرسال الرمز
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowRight className="w-4 h-4" />
              العودة
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto" dir="rtl">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">تسجيل الدخول</h2>
        <p className="text-gray-600">ادخل رقم هاتفك للمتابعة</p>
      </div>

      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف
          </label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="05xxxxxxxx"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="كلمة المرور"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            للحسابات المؤكدة: كلمة المرور مطلوبة. للحسابات الجديدة: اتركها فارغة لاستخدام رمز التحقق
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            ليس لديك حساب؟{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              إنشاء حساب جديد
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}