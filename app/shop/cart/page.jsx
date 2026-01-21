import { Suspense } from 'react';
import ShopLayout from '@/components/shop/ui/ShopLayout';
import CartClient from '@/components/shop/ui/CartClient';

export const metadata = {
  title: 'عربة التسوق - متجري',
  description: 'راجع منتجاتك المختارة واتمم عملية الشراء',
};

export default function CartPage() {
  return (
    <ShopLayout>
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<CartSkeleton />}>
          <CartClient />
        </Suspense>
      </div>
    </ShopLayout>
  );
}

function CartSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="h-8 w-48 bg-gray-300 rounded mb-8 animate-pulse"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm mb-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="h-6 bg-gray-300 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-300 rounded mt-6 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}