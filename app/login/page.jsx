import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 lg:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h1>
          <p className="text-sm text-gray-500 mt-2">
            مرحباً بعودتك! الرجاء إدخال بياناتك.
          </p>
        </div>

        {/* Client Component */}
        <LoginForm />
      </div>
    </div>
  );
}