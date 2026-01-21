"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BarChart3, Mail, Lock, User, Loader2, Chrome, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { registerSubscriber } from "@/app/actions/authActions";

const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // حالة قوة كلمة المرور
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // تحديث قوة كلمة المرور عند التغيير
  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 10,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    // التحقق من طول كلمة المرور
    if (password.length < 10) {
      toast.error("كلمة المرور يجب أن تكون 10 أحرف على الأقل");
      return;
    }

    // التحقق من قوة كلمة المرور
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      toast.error("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل (A-Z)");
      return;
    }

    if (!hasLowerCase) {
      toast.error("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل (a-z)");
      return;
    }

    if (!hasNumber) {
      toast.error("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل (0-9)");
      return;
    }

    if (!hasSpecialChar) {
      toast.error("كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*)");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("جاري إنشاء الحساب...");

    try {
      const result = await registerSubscriber({ name, email, password });

      toast.dismiss(toastId);

      if (!result.success) {
        toast.error(result.error || "حدث خطأ أثناء التسجيل");
        setIsLoading(false);
        return;
      }

      toast.success("تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");

      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (loginResult.error) {
        toast.error("حدث خطأ أثناء تسجيل الدخول التلقائي");
        setIsLoading(false);
      } else {
        router.push("/subscriber/dashboard");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("حدث خطأ أثناء التسجيل");
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
      
      {/* خلفية جمالية */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      {/* بطاقة التسجيل */}
      <div className="w-full max-w-md bg-[#12141c] border border-gray-800/50 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        
        {/* الشعار والعنوان */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4 shadow-indigo-500/20">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            إنشاء حساب جديد
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            انضم إلينا وابدأ رحلتك في إدارة أعمالك بذكاء
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
              التسجيل بواسطة Google
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
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* حقل الاسم */}
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-400 mb-1.5 mr-1">
              الاسم الكامل
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                <User size={20} />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="أدخل اسمك الكامل"
                className="w-full bg-[#0a0b0f] border border-gray-800 text-white rounded-xl py-3.5 pr-12 pl-4 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                disabled={isLoading}
              />
            </div>
          </div>

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
                disabled={isLoading}
              />
            </div>
          </div>

          {/* حقل كلمة المرور */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5 mr-1">
              كلمة المرور
            </label>
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
                autoComplete="new-password"
                required
                placeholder="••••••••••"
                className="w-full bg-[#0a0b0f] border border-gray-800 text-white rounded-xl py-3.5 pr-12 pl-4 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                disabled={isLoading}
              />
            </div>
            
            {/* مؤشر قوة كلمة المرور */}
            {password && (
              <div className="mt-3 space-y-2 bg-[#0a0b0f] p-3 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-400 mb-2">متطلبات كلمة المرور:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.length ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                      <XCircle size={14} className="text-gray-600" />
                    )}
                    <span className={passwordStrength.length ? "text-green-400" : "text-gray-500"}>
                      10 أحرف على الأقل
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.uppercase ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                      <XCircle size={14} className="text-gray-600" />
                    )}
                    <span className={passwordStrength.uppercase ? "text-green-400" : "text-gray-500"}>
                      حرف كبير واحد (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.lowercase ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                      <XCircle size={14} className="text-gray-600" />
                    )}
                    <span className={passwordStrength.lowercase ? "text-green-400" : "text-gray-500"}>
                      حرف صغير واحد (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.number ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                      <XCircle size={14} className="text-gray-600" />
                    )}
                    <span className={passwordStrength.number ? "text-green-400" : "text-gray-500"}>
                      رقم واحد (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.special ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                      <XCircle size={14} className="text-gray-600" />
                    )}
                    <span className={passwordStrength.special ? "text-green-400" : "text-gray-500"}>
                      رمز خاص (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* حقل تأكيد كلمة المرور */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-400 mb-1.5 mr-1">
              تأكيد كلمة المرور
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="••••••••••"
                className="w-full bg-[#0a0b0f] border border-gray-800 text-white rounded-xl py-3.5 pr-12 pl-4 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* زر التسجيل */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                جاري إنشاء الحساب...
              </>
            ) : (
              'إنشاء حساب'
            )}
          </button>
        </form>

        {/* التذييل */}
        <div className="text-center mt-8 pt-6 border-t border-gray-800/50">
          <p className="text-sm text-gray-500">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
              تسجيل الدخول
            </Link>
          </p>
        </div>
        
      </div>

      <ToastContainer position="top-center" theme="dark" />
    </div>
  );
}
