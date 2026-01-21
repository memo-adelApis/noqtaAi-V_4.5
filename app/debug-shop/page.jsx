"use client";

import { useState, useEffect } from 'react';

export default function DebugShopPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/test-shop');
      const data = await response.json();
      
      if (response.ok) {
        setShops(data.shops || []);
      } else {
        setError(data.error || 'خطأ في جلب البيانات');
      }
    } catch (err) {
      setError('خطأ في الاتصال: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🔍 صفحة تشخيص المتاجر الإلكترونية
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">اختبار التوجيه</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span>صفحة التشخيص تعمل ✅</span>
                </div>
                <div>
                  <a href="/shop/test" target="_blank" className="text-blue-600 hover:underline">
                    اختبار: /shop/test
                  </a>
                </div>
                <div>
                  <a href="/shop/megashop" target="_blank" className="text-blue-600 hover:underline">
                    اختبار: /shop/megashop
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">اختبار API</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <a href="/api/test-shop" target="_blank" className="text-green-600 hover:underline">
                    API: /api/test-shop
                  </a>
                </div>
                <div>
                  <a href="/api/shop/megashop" target="_blank" className="text-green-600 hover:underline">
                    API: /api/shop/megashop
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            المتاجر الموجودة في قاعدة البيانات
          </h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">جاري التحميل...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">❌ خطأ: {error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {shops.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">لا توجد متاجر في قاعدة البيانات</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 mb-2">💡 لإنشاء متاجر تجريبية:</p>
                    <code className="bg-yellow-100 px-2 py-1 rounded text-sm">npm run seed</code>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    تم العثور على {shops.length} متجر:
                  </p>
                  
                  {shops.map((shop, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{shop.name}</h3>
                          <p className="text-sm text-gray-600">/{shop.uniqueName}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            shop.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {shop.status}
                          </span>
                        </div>
                        
                        <div className="space-x-2 space-x-reverse">
                          <a
                            href={shop.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            زيارة المتجر
                          </a>
                          <a
                            href={`/api/shop/${shop.uniqueName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                          >
                            API
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">معلومات مفيدة:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• الرابط الصحيح للمتجر: <code>/shop/[uniqueName]</code></p>
            <p>• إدارة المتجر: <code>/subscriber/shop</code></p>
            <p>• API المتجر: <code>/api/shop/[uniqueName]</code></p>
            <p>• إنشاء بيانات تجريبية: <code>npm run seed</code></p>
          </div>
        </div>
        
      </div>
    </div>
  );
}