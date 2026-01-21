import { Suspense } from 'react';
import CheckoutPage from '@/components/shop/checkout/CheckoutPage';
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
        title: `إتمام الطلب - ${shop.name}`,
        description: `أكمل طلبك من ${shop.name} بأمان وسهولة`,
      };
    }
  } catch (error) {
    console.error('خطأ في جلب metadata:', error);
  }
  
  return {
    title: 'إتمام الطلب - متجر إلكتروني',
    description: 'أكمل طلبك بأمان وسهولة'
  };
}

export default async function CheckoutPageRoute({ params }) {
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutPage shopName={resolvedParams.shopName} />
    </Suspense>
  );
}

function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 w-32 bg-gray-300 rounded mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Skeleton */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="h-6 w-24 bg-gray-300 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}