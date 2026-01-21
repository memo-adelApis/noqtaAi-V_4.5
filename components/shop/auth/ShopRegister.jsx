"use client";

import { useState } from 'react';
import { Phone, User, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShopRegister({ onSuccess, onSwitchToLogin, shopName }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('register'); // 'register', 'verification'
  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.password.trim()) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shop/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          shopName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setStep('verification');
        toast.success(data.message);
      } else {
        if (response.status === 400 && data.error.includes('مسجل مسبقاً')) {
          toast.error('رقم الهاتف مسجل مسبقاً. هل تريد تسجيل الدخول؟');
          setTimeout(() => {
            onSwitchToLogin?.();
          }, 2000);
        } else {
          toast.error(data.error || 'حدث خطأ في التسجيل');
        }
      }
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
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
        toast.success('تم إنشاء الحساب بنجاح!');
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-green-600" />
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'تأكيد وإنشاء الحساب'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              إعادة إرسال الرمز
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('register')}
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
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">إنشاء حساب جديد</h2>
        <p className="text-gray-600">أنشئ حسابك للبدء في التسوق</p>
      </div>

      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الكامل
          </label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="أدخل اسمك الكامل"
              required
            />
          </div>
        </div>

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
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="6 أحرف على الأقل"
              minLength="6"
              required
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            📱 سنرسل لك رمز تحقق عبر الرسائل النصية لتأكيد رقم هاتفك
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
        </button>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            لديك حساب بالفعل؟{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}