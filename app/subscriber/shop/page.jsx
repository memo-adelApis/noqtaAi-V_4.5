import { Suspense } from 'react';
import ShopManagement from '@/components/subscriber/ShopManagement';

export const metadata = {
  title: 'إدارة المتجر الإلكتروني - نقطة AI',
  description: 'إدارة متجرك الإلكتروني وعرض منتجاتك للعملاء'
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* العنوان الرئيسي */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            إدارة المتجر الإلكتروني
          </h1>
          <p className="text-gray-400">
            أنشئ متجرك الإلكتروني واعرض منتجاتك للعملاء مقابل 70 جنيه شهرياً
          </p>
        </div>

        {/* محتوى الصفحة */}
        <Suspense fallback={<ShopPageSkeleton />}>
          <ShopManagement />
        </Suspense>
        
      </div>
    </div>
  );
}

function ShopPageSkeleton() {
  return (
    <div className="space-y-6">
      
      {/* بطاقة المتجر */}
      <div className="bg-[#1a1d29] rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1a1d29] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-20 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-24 bg-gray-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* الطلبات الأخيرة */}
      <div className="bg-[#1a1d29] rounded-xl p-6 border border-gray-800">
        <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#0f111a] rounded-lg">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="h-10 w-10 bg-gray-700 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="text-left space-y-2">
                <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}