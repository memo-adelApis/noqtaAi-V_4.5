"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from "next/dynamic";

// استخدام dynamic import لـ react-toastify لتحسين أداء جانب الخادم (SSR)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading('جاري تسجيل الدخول...', { toastId: 'login' });

    try {
      // نستخدم redirect: false للتحكم في عملية التوجيه يدويًا
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      toast.dismiss('login');

      if (!result || result.error) {
        toast.error(result?.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        setIsLoading(false);
        return;
      }

      toast.success('تم تسجيل الدخول بنجاح!');
      
      // *** التعديل الحاسم: توجيه المستخدم يدوياً. ***
      // هذا الإجراء يجبر على تحديث الصفحة، مما يسمح للـ middleware بالعمل
      // وقراءة الدور من الـ token وإعادة توجيهه للمسار الصحيح
            router.push('/'); 

      
    } catch (error) {
      toast.dismiss('login');
      toast.error('حدث خطأ غير متوقع أثناء تسجيل الدخول.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:bg-gray-400"
        >
          {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            سجل الآن
          </Link>
        </p>
      </div>
      <ToastContainer />
    </>
  );
}
