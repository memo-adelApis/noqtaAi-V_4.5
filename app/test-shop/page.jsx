export default function TestShopPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">✓</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            اختبار المتجر
          </h1>
          
          <p className="text-gray-600 mb-6">
            صفحة اختبار للتأكد من عمل النظام
          </p>
          
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium">
              ✅ النظام يعمل بشكل صحيح!
            </p>
          </div>
          
          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>الروابط الصحيحة:</strong></p>
            <p>• المتجر: <code className="bg-gray-100 px-2 py-1 rounded">/shop/megashop</code></p>
            <p>• إدارة المتجر: <code className="bg-gray-100 px-2 py-1 rounded">/subscriber/shop</code></p>
            <p>• API المتجر: <code className="bg-gray-100 px-2 py-1 rounded">/api/shop/megashop</code></p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <a 
                href="/shop/megashop" 
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                زيارة المتجر
              </a>
              <a 
                href="/subscriber/shop" 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                إدارة المتجر
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}