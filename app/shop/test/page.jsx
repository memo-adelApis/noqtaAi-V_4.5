export default function TestShopPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          اختبار صفحة المتجر
        </h1>
        <p className="text-gray-600">
          إذا ظهرت هذه الصفحة، فإن التوجيه يعمل بشكل صحيح
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">✅ النظام يعمل بشكل صحيح</p>
        </div>
      </div>
    </div>
  );
}