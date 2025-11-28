"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import InputField from "@/components/ui/InputField";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
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

  return (
    <>
      <ToastContainer position="top-center" reverseOrder={false} />

      <form onSubmit={handleSubmit} className="space-y-5">

        <InputField
          label="الاسم الكامل"
          placeholder="أدخل اسمك"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />

        <InputField
          type="email"
          label="البريد الإلكتروني"
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <InputField
          type="password"
          label="كلمة المرور"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <InputField
          type="password"
          label="تأكيد كلمة المرور"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full py-3 rounded-lg text-white 
            bg-blue-600 hover:bg-blue-700 
            focus:ring-2 focus:ring-blue-500 
            disabled:bg-gray-400 transition
          "
        >
          {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
        </button>

        {/* 🔗 Login Link */}
        <p className="text-center text-sm text-gray-600 mt-3">
          لديك حساب بالفعل؟{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            تسجيل الدخول
          </a>
        </p>

      </form>
    </>
  );
}
