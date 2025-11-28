import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 lg:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-sm text-gray-500 mt-2">
            أدخل بياناتك لإنشاء حساب جديد والانضمام إلينا.
          </p>
        </div>

        {/* Client Component */}
        <RegisterForm />
      </div>
    </div>
  );
}
