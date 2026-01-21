import ProductDetailsClient from '@/components/shop/ProductDetailsClient';

export async function generateMetadata({ params }) {
  try {
    const { productId } = await params;
    
    // يمكن جلب معلومات المنتج هنا لتحسين SEO
    return {
      title: 'تفاصيل المنتج',
      description: 'عرض تفاصيل المنتج مع التقييمات والتعليقات'
    };
  } catch (error) {
    return {
      title: 'تفاصيل المنتج',
      description: 'عرض تفاصيل المنتج'
    };
  }
}

export default async function ProductDetailsPage({ params }) {
  const { shopName, productId } = await params;
  
  return (
    <ProductDetailsClient 
      shopName={shopName} 
      productId={productId} 
    />
  );
}