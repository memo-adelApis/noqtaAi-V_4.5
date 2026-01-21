import { Suspense } from 'react';
import ShopHomepage from '@/components/shop/ui/ShopHomepage';
import ShopLayout from '@/components/shop/ui/ShopLayout';

export const metadata = {
  title: 'المتجر الإلكتروني - تسوق أفضل المنتجات',
  description: 'اكتشف مجموعة واسعة من المنتجات عالية الجودة بأفضل الأسعار',
  keywords: 'تسوق, منتجات, عروض, متجر إلكتروني'
};

export default function ShopPage({ searchParams }) {
  return (
    <ShopLayout>
      <Suspense fallback={<ShopPageSkeleton />}>
        <ShopHomepage searchParams={searchParams} />
      </Suspense>
    </ShopLayout>
  );
}

function ShopPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-96">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <div className="h-12 bg-white/20 rounded mb-4 animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded mb-6 animate-pulse"></div>
            <div className="h-12 w-40 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-gray-300 rounded mb-8 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-gray-300 rounded mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-300 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded mb-3 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}