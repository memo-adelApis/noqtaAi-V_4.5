import { Suspense } from 'react';
import ShopPage from '@/components/shop/ShopPage';
import { connectToDB } from '@/utils/database';
import Shop from '@/models/Shop';

export async function generateMetadata({ params }) {
  const { shopName } = await params;
  
  try {
    await connectToDB();
    
    const shop = await Shop.findOne({ 
      uniqueName: shopName.toLowerCase(),
      status: 'active'
    }).lean();
    
    if (shop) {
      return {
        title: `${shop.name} - متجر إلكتروني`,
        description: shop.description || `تسوق من ${shop.name} - أفضل المنتجات بأفضل الأسعار`,
        keywords: shop.keywords?.join(', ') || 'تسوق, منتجات, متجر إلكتروني',
        openGraph: {
          title: shop.name,
          description: shop.description,
          images: shop.logo ? [shop.logo] : [],
          type: 'website'
        }
      };
    }
  } catch (error) {
    console.error('خطأ في جلب metadata:', error);
  }
  
  return {
    title: 'متجر إلكتروني - نقطة AI',
    description: 'تسوق أفضل المنتجات بأفضل الأسعار'
  };
}

export default async function ShopPageRoute({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopPage shopName={resolvedParams.shopName} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

function ShopPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-64">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <div className="h-8 bg-white/20 rounded mb-4 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded mb-6 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Products Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="h-6 w-48 bg-gray-300 rounded mb-8 animate-pulse"></div>
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