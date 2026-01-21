'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Star, 
  Heart, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Tag,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import UIButton from '@/components/ui/UIButton';

export default function ShopHomepage({ searchParams }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.category || '');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slides
  const heroSlides = [
    {
      title: 'عروض حصرية تصل إلى 50%',
      subtitle: 'اكتشف أفضل المنتجات بأسعار لا تُقاوم',
      image: '/api/placeholder/800/400',
      cta: 'تسوق الآن',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      title: 'منتجات جديدة وصلت حديثاً',
      subtitle: 'كن أول من يحصل على أحدث المنتجات',
      image: '/api/placeholder/800/400',
      cta: 'اكتشف الجديد',
      gradient: 'from-green-600 to-teal-600'
    },
    {
      title: 'شحن مجاني للطلبات فوق 200 ريال',
      subtitle: 'استمتع بالتسوق مع شحن مجاني سريع',
      image: '/api/placeholder/800/400',
      cta: 'ابدأ التسوق',
      gradient: 'from-orange-600 to-red-600'
    }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchTerm, fetchData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await fetch(`/api/shop/products?category=${selectedCategory}&search=${searchTerm}`);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
        setFeaturedProducts(productsData.featured || []);
      }

      // Fetch categories
      const categoriesResponse = await fetch('/api/shop/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: productId,
          quantity: 1
        }),
      });

      if (response.ok) {
        toast.success('تم إضافة المنتج إلى السلة');
      } else {
        toast.error('فشل في إضافة المنتج إلى السلة');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ في إضافة المنتج');
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const response = await fetch('/api/shop/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: productId
        }),
      });

      if (response.ok) {
        toast.success('تم إضافة المنتج إلى المفضلة');
      } else {
        toast.error('فشل في إضافة المنتج إلى المفضلة');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('حدث خطأ في إضافة المنتج');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="text-white max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {slide.title}
                </h1>
                <p className="text-xl mb-8 opacity-90">
                  {slide.subtitle}
                </p>
                <UIButton
                  label={slide.cta}
                  gradientFrom="white"
                  gradientTo="gray-100"
                  className="text-gray-800 hover:scale-105"
                  size="lg"
                />
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ابحث عن المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">جميع الفئات</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                فلترة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">شحن سريع ومجاني</h3>
                <p className="text-gray-600 text-sm">للطلبات فوق 200 ريال</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ضمان الجودة</h3>
                <p className="text-gray-600 text-sm">منتجات أصلية 100%</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">إرجاع سهل</h3>
                <p className="text-gray-600 text-sm">خلال 14 يوم</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">تسوق حسب الفئة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Tag className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.itemCount || 0} منتج</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">المنتجات المميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Products */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">جميع المنتجات</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تصفح الفئات</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, onAddToWishlist, formatPrice }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className="relative">
        <Image
          src={product.image || '/api/placeholder/300/200'}
          alt={product.name}
          width={300}
          height={192}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={() => onAddToWishlist(product._id)}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
        >
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
        </button>
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            -{product.discount}%
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-500 mr-1">({product.reviewCount || 0})</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        <UIButton
          label="إضافة للسلة"
          onClick={() => onAddToCart(product._id)}
          icon={ShoppingBag}
          gradientFrom="blue-500"
          gradientTo="blue-600"
          className="w-full"
          size="sm"
        />
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-48 bg-gray-300 animate-pulse"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-3 animate-pulse"></div>
        <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  );
}