"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from "next/dynamic";
import { BarChart3, Mail, Lock, Loader2, Chrome } from "lucide-react";

// استيراد Toast بشكل ديناميكي
const ToastContainer = dynamic(
  () => import("react-toastify").then(mod => mod.ToastContainer),
  { ssr: false }
);

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!result || result.error) {
        toast.error(result?.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        setIsLoading(false);
        return;
      }

      toast.success('تم تسجيل الدخول بنجاح!');
      router.push('/'); 
      
    } catch (error) {
      toast.error('حدث خطأ غير متوقع أثناء تسجيل الدخول.');
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // تعطيل مؤقت - يمكن تفعيله لاحقاً
    toast.info("هذا الخيار غير متوفر حالياً. يرجى استخدام البريد الإلكتروني وكلمة المرور.");
    return;
    
    /* 
    // الكود الأصلي - سيتم تفعيله عند إعداد Google OAuth
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الدخول بواسطة Google");
      setIsGoogleLoading(false);
    }
    */
  };

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      
      {/* 1. خلفية جمالية (Gradients) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      {/* 2. بطاقة تسجيل الدخول */}
      <div className="w-full max-w-md bg-[#12141c] border border-gray-800/50 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        
        {/* الشعار والعنوان */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4 shadow-indigo-500/20">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            نقطة<span className="text-indigo-500">.ai</span>
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            قم بتسجيل الدخول لمتابعة أعمالك بذكاء
          </p>
        </div>

        {/* زر Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-700 rounded-xl text-sm font-medium text-white bg-[#0a0b0f] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-6"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="animate-spin ml-2 h-5 w-5" />
              جاري الاتصال بـ Google...
            </>
          ) : (
            <>
              <Chrome className="ml-2 h-5 w-5 text-red-500" />
              تسجيل الدخول بواسطة Google
            </>
          )}
        </button>

        {/* فاصل */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#12141c] text-gray-500">أو</span>
          </div>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* حقل البريد الإلكتروني */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5 mr-1">
              البريد الإلكتروني
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                <Mail size={20} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="name@example.com"
                className="w-full bg-[#0a0b0f] border border-gray-800 text-white rounded-xl py-3.5 pr-12 pl-4 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                disabled={isLoading || isGoogleLoading}
              />
            </div>
          </div>

          {/* حقل كلمة المرور */}
          <div>
            <div className="flex justify-between items-center mb-1.5 mr-1">
              <label htmlFor="password" className="block text-xs font-medium text-gray-400">
                كلمة المرور
              </label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full bg-[#0a0b0f] border border-gray-800 text-white rounded-xl py-3.5 pr-12 pl-4 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                disabled={isLoading || isGoogleLoading}
              />
            </div>
          </div>

          {/* زر الدخول */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                جاري التحقق...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* التذييل */}
        <div className="text-center mt-8 pt-6 border-t border-gray-800/50">
          <p className="text-sm text-gray-500">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
              أنشئ حساباً جديداً
            </Link>
          </p>
        </div>
        
      </div>

      <ToastContainer position="top-center" theme="dark" />
    </div>
  );
}