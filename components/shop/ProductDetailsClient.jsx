"use client";

import { useState, useEffect } from 'react';
import { 
  Star, Heart, ShoppingCart, Share2, Plus, Minus, 
  ArrowLeft, MessageCircle, ThumbsUp, Shield, Truck,
  RotateCcw, Award, User, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import ShopAuthModal from './auth/ShopAuthModal';

export default function ProductDetailsClient({ shopName, productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsSortBy, setReviewsSortBy] = useState('newest');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // جلب تفاصيل المنتج
  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // تحميل بيانات المستخدم
  useEffect(() => {
    const savedUser = localStorage.getItem('shop_user');
    const savedCart = localStorage.getItem('shop_cart');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        localStorage.removeItem('shop_user');
        localStorage.removeItem('shop_token');
      }
    }

    // تحميل السلة من localStorage للزوار
    if (savedCart && !savedUser) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('خطأ في تحميل السلة:', error);
        localStorage.removeItem('shop_cart');
      }
    }
  }, []);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('shop_token');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/shop/products/${productId}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        setReviews(data.recentReviews || []);
      } else {
        toast.error('فشل في تحميل تفاصيل المنتج');
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل المنتج:', error);
      toast.error('حدث خطأ في تحميل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (page = 1, sortBy = 'newest') => {
    try {
      setReviewsLoading(true);
      const response = await fetch(
        `/api/shop/products/${productId}/reviews?page=${page}&sortBy=${sortBy}&limit=10`
      );

      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setReviews(data.reviews);
        } else {
          setReviews(prev => [...prev, ...data.reviews]);
        }
        return data;
      }
    } catch (error) {
      console.error('خطأ في جلب التقييمات:', error);
    } finally {
      setReviewsLoading(false);
    }
  };
  const handleAddToCart = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('shop_token');
      const response = await fetch('/api/shop/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: productId,
          quantity
        })
      });

      if (response.ok) {
        toast.success('تم إضافة المنتج إلى السلة');
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل في إضافة المنتج إلى السلة');
      }
    } catch (error) {
      console.error('خطأ في إضافة المنتج إلى السلة:', error);
      toast.error('حدث خطأ في إضافة المنتج');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('shop_token');
      const response = await fetch('/api/shop/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: productId
        })
      });

      if (response.ok) {
        toast.success('تم إضافة المنتج إلى المفضلة');
        fetchProductDetails(); // إعادة تحميل لتحديث حالة المفضلة
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل في إضافة المنتج إلى المفضلة');
      }
    } catch (error) {
      console.error('خطأ في إضافة المنتج إلى المفضلة:', error);
      toast.error('حدث خطأ في إضافة المنتج');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    if (!reviewForm.comment.trim() || reviewForm.comment.trim().length < 10) {
      toast.error('التعليق يجب أن يكون 10 أحرف على الأقل');
      return;
    }

    try {
      const token = localStorage.getItem('shop_token');
      const response = await fetch(`/api/shop/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm)
      });

      if (response.ok) {
        toast.success('تم إضافة التقييم بنجاح');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: '' });
        fetchProductDetails(); // إعادة تحميل لتحديث التقييمات
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل في إضافة التقييم');
      }
    } catch (error) {
      console.error('خطأ في إضافة التقييم:', error);
      toast.error('حدث خطأ في إضافة التقييم');
    }
  };

  const renderStars = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">المنتج غير موجود</h2>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة إلى المتجر
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* صور المنتج */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index 
                        ? 'border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* معلومات المنتج */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                {renderStars(product.rating?.average || 0, 'w-5 h-5')}
                <span className="text-gray-600">
                  ({product.rating?.count || 0} تقييم)
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.sellingPrice)} جنيه
                </span>
                {product.stockStatus === 'in_stock' ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    متوفر ({product.quantity_Remaining} قطعة)
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    غير متوفر
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">وصف المنتج</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
              <div>
                <span className="text-sm text-gray-500">الفئة</span>
                <p className="font-medium">{product.categoryId?.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">الوحدة</span>
                <p className="font-medium">{product.unitId?.name}</p>
              </div>
              {product.sku && (
                <div>
                  <span className="text-sm text-gray-500">رقم المنتج</span>
                  <p className="font-medium">{product.sku}</p>
                </div>
              )}
              {product.weight > 0 && (
                <div>
                  <span className="text-sm text-gray-500">الوزن</span>
                  <p className="font-medium">{product.weight} كجم</p>
                </div>
              )}
            </div>

            {/* إضافة إلى السلة */}
            {product.canSell && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">الكمية:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity_Remaining, quantity + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    إضافة إلى السلة
                  </button>
                  
                  <button
                    onClick={handleAddToWishlist}
                    className={`p-3 rounded-lg border transition-colors ${
                      product.userStatus?.isInWishlist
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${product.userStatus?.isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button className="p-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ضمانات المتجر */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-green-600" />
                <span>ضمان الجودة</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>توصيل سريع</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                <span>إمكانية الإرجاع</span>
              </div>
            </div>
          </div>
        </div>
        {/* قسم التقييمات */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">التقييمات والمراجعات</h2>
            {product.userStatus?.canReview && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                إضافة تقييم
              </button>
            )}
          </div>

          {/* إحصائيات التقييم */}
          {product.rating && product.rating.count > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {product.rating.average.toFixed(1)}
                </div>
                {renderStars(product.rating.average, 'w-6 h-6')}
                <p className="text-gray-600 mt-2">
                  بناءً على {product.rating.count} تقييم
                </p>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = product.rating.ratingBreakdown?.[rating] || 0;
                  const percentage = product.rating.count > 0 
                    ? (count / product.rating.count) * 100 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-8">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* نموذج إضافة تقييم */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة تقييم جديد</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التقييم
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= reviewForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التعليق (10 أحرف على الأقل)
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="شاركنا رأيك في هذا المنتج..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {reviewForm.comment.length}/1000 حرف
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إرسال التقييم
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
          {/* قائمة التقييمات */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {review.reviewer?.name || 'مستخدم'}
                        </span>
                        {review.reviewer?.verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            مشتري مؤكد
                          </span>
                        )}
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {review.timeAgo}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">({review.rating}/5)</span>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed mb-3">
                        {review.comment}
                      </p>
                      
                      {review.helpful?.count > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.helpful.count} شخص وجد هذا التقييم مفيداً</span>
                        </div>
                      )}
                      
                      {review.shopReply && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">رد المتجر</span>
                          </div>
                          <p className="text-blue-700 text-sm">{review.shopReply.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {!showAllReviews && product.rating?.count > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowAllReviews(true);
                      fetchReviews(1, reviewsSortBy);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mx-auto"
                  >
                    عرض جميع التقييمات ({product.rating.count})
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تقييمات بعد</h3>
              <p className="text-gray-600 mb-4">كن أول من يقيم هذا المنتج</p>
              {product.userStatus?.canReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إضافة تقييم
                </button>
              )}
            </div>
          )}
        </div>
        {/* منتجات مشابهة */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={relatedProduct.images?.[0] || '/placeholder-product.jpg'}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(relatedProduct.rating?.average || 0, 'w-3 h-3')}
                      <span className="text-xs text-gray-500">
                        ({relatedProduct.rating?.count || 0})
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPrice(relatedProduct.sellingPrice)} جنيه
                    </p>
                    <button
                      onClick={() => window.location.href = `/shop/${shopName}/product/${relatedProduct._id}`}
                      className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton 
        cart={cart}
        onCartClick={() => setShowCart(true)}
      />

      {/* Shopping Cart Sidebar */}
      <ShoppingCartSidebar 
        cart={cart}
        cartTotal={cart.reduce((total, item) => total + (item.price * item.quantity), 0)}
        onUpdateQuantity={() => {}} // يمكن إضافة الوظيفة لاحقاً
        onCheckout={() => {}} // يمكن إضافة الوظيفة لاحقاً
        shop={{ name: shopName }}
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />

      {/* نافذة تسجيل الدخول */}
      {showAuthModal && (
        <ShopAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSuccess={(userData) => {
            setUser(userData);
            setShowAuthModal(false);
            fetchProductDetails(); // إعادة تحميل لتحديث حالة المستخدم
          }}
        />
      )}
    </div>
  );
}

// مكون زر السلة العائم
function FloatingCartButton({ cart, onCartClick }) {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (itemCount === 0) return null;

  return (
    <button
      onClick={onCartClick}
      className="floating-cart-button fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 group"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="cart-badge absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {itemCount}
          </span>
        </div>
        <div className="hidden group-hover:block transition-all duration-200">
          <div className="text-sm font-medium whitespace-nowrap">السلة</div>
          <div className="text-xs opacity-90 whitespace-nowrap">{cartTotal.toLocaleString('en-US')} جنيه</div>
        </div>
      </div>
    </button>
  );
}

// مكون سلة التسوق المحسن
function ShoppingCartSidebar({ cart, cartTotal, onUpdateQuantity, onCheckout, shop, isOpen, onClose }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">سلة التسوق</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            {cart.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {cart.reduce((total, item) => total + item.quantity, 0)} منتج
              </p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">السلة فارغة</h4>
                <p className="text-gray-500 text-sm">ابدأ بإضافة المنتجات التي تعجبك</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="text-center text-gray-500">
                  عرض السلة قريباً...
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t bg-gray-50 p-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">الإجمالي:</span>
                <span className="text-xl font-bold text-blue-600">
                  {cartTotal.toLocaleString('en-US')} جنيه
                </span>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={onCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                إتمام الطلب
              </button>
              
              {/* Continue Shopping */}
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
              >
                متابعة التسوق
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}