import { Suspense } from 'react';
import ShopLayout from '@/components/shop/ui/ShopLayout';
import CheckoutClient from '@/components/shop/ui/CheckoutClient';

export const metadata = {
  title: 'إتمام الطلب - متجري',
  description: 'أكمل طلبك واختر طريقة الدفع والشحن المناسبة',
};

export default function CheckoutPage() {
  return (
    <ShopLayout>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutClient />
        </Suspense>
      </div>
    </ShopLayout>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="h-8 w-48 bg-gray-300 rounded mb-8 animate-pulse"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="h-6 bg-gray-300 rounded mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="h-6 bg-gray-300 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-12 bg-gray-300 rounded mt-6 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}