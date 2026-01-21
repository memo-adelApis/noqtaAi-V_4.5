"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Filter, ShoppingCart, Star, Heart, 
  Phone, Mail, MapPin, Clock, Facebook, Instagram, 
  Twitter, MessageCircle, Plus, Minus, Eye, Share2, User
} from 'lucide-react';
import { toast } from 'react-toastify';
import ShopAuthModal from './auth/ShopAuthModal';

export default function ShopPage({ shopName, searchParams }) {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.category || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showCart, setShowCart] = useState(false);

  // جلب بيانات المتجر
  useEffect(() => {
    fetchShopData();
  }, [shopName, selectedCategory, searchQuery, currentPage]);

  // تحميل بيانات المستخدم من localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('shop_user');
    const savedCart = localStorage.getItem('shop_cart');
    const savedWishlist = localStorage.getItem('shop_wishlist');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // تحميل السلة والمفضلة من الخادم للمستخدمين المسجلين
        loadUserCartAndWishlist(userData);
      } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
        localStorage.removeItem('shop_user');
        localStorage.removeItem('shop_token');
      }
    } else {
      // تحميل السلة والمفضلة من localStorage للزوار
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('خطأ في تحميل السلة:', error);
          localStorage.removeItem('shop_cart');
        }
      }
      
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (error) {
          console.error('خطأ في تحميل المفضلة:', error);
          localStorage.removeItem('shop_wishlist');
        }
      }
    }
  }, []);

  // حفظ السلة والمفضلة في localStorage للزوار
  useEffect(() => {
    if (!user) {
      localStorage.setItem('shop_cart', JSON.stringify(cart));
      localStorage.setItem('shop_wishlist', JSON.stringify(wishlist));
    }
  }, [cart, wishlist, user]);

  // تحميل السلة والمفضلة من الخادم
  const loadUserCartAndWishlist = async (userData) => {
    try {
      const token = localStorage.getItem('shop_token');
      if (!token) return;

      // تحميل السلة
      const cartResponse = await fetch('/api/shop/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setCart(cartData.cart || []);
      }

      // تحميل المفضلة
      const wishlistResponse = await fetch('/api/shop/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        setWishlist(wishlistData.wishlist || []);
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات المستخدم:', error);
    }
  };

  // دمج البيانات المحلية مع الخادم عند تسجيل الدخول
  const syncLocalDataWithServer = async (userData, token) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
      const localWishlist = JSON.parse(localStorage.getItem('shop_wishlist') || '[]');

      // دمج السلة
      if (localCart.length > 0) {
        for (const item of localCart) {
          await fetch('/api/shop/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              itemId: item._id,
              quantity: item.quantity
            })
          });
        }
      }

      // دمج المفضلة
      if (localWishlist.length > 0) {
        for (const itemId of localWishlist) {
          await fetch('/api/shop/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              itemId: itemId
            })
          });
        }
      }

      // مسح البيانات المحلية
      localStorage.removeItem('shop_cart');
      localStorage.removeItem('shop_wishlist');

      // تحميل البيانات المحدثة من الخادم
      await loadUserCartAndWishlist(userData);

    } catch (error) {
      console.error('خطأ في دمج البيانات:', error);
    }
  };

  // الاستماع لأحداث تسجيل الدخول
  useEffect(() => {
    const handleUserLogin = async (event) => {
      const { user: userData, token } = event.detail;
      setUser(userData);
      
      // دمج البيانات المحلية مع الخادم
      await syncLocalDataWithServer(userData, token);
      
      setShowAuthModal(false);
    };

    window.addEventListener('shopUserLogin', handleUserLogin);
    return () => window.removeEventListener('shopUserLogin', handleUserLogin);
  }, []);

  const fetchShopData = async () => {
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        search: searchQuery,
        page: currentPage.toString(),
        limit: '12'
      });

      const response = await fetch(`/api/shop/${shopName}?${params}`);
      const data = await response.json();

      if (response.ok) {
        setShopData(data);
      } else {
        toast.error(data.error || 'حدث خطأ في تحميل المتجر');
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المتجر:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  // إضافة منتج للسلة
  const addToCart = async (product) => {
    if (user) {
      // مستخدم مسجل - إضافة عبر API
      try {
        const token = localStorage.getItem('shop_token');
        const response = await fetch('/api/shop/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            itemId: product._id,
            quantity: 1
          })
        });

        if (response.ok) {
          await loadUserCartAndWishlist(user);
          toast.success('تم إضافة المنتج للسلة');
        } else {
          const data = await response.json();
          toast.error(data.error || 'حدث خطأ في إضافة المنتج');
        }
      } catch (error) {
        console.error('خطأ في إضافة المنتج للسلة:', error);
        toast.error('حدث خطأ في الاتصال');
      }
    } else {
      // زائر - إضافة محلياً
      const existingItem = cart.find(item => item._id === product._id);
      
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          setCart(cart.map(item => 
            item._id === product._id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ));
          toast.success('تم زيادة الكمية في السلة');
        } else {
          toast.error('الكمية المتوفرة غير كافية');
        }
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
        toast.success('تم إضافة المنتج للسلة');
      }
    }
  };

  // تسجيل خروج المستخدم
  const handleLogout = () => {
    localStorage.removeItem('shop_user');
    localStorage.removeItem('shop_token');
    setUser(null);
    toast.success('تم تسجيل الخروج بنجاح');
  };

  // فتح نافذة تسجيل الدخول
  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  // فتح نافذة التسجيل
  const handleRegisterClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  // تحديث كمية المنتج في السلة
  const updateCartQuantity = async (productId, newQuantity) => {
    if (user) {
      // مستخدم مسجل - تحديث عبر API
      try {
        const token = localStorage.getItem('shop_token');
        const response = await fetch('/api/shop/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            itemId: productId,
            quantity: newQuantity
          })
        });

        if (response.ok) {
          await loadUserCartAndWishlist(user);
          if (newQuantity === 0) {
            toast.success('تم حذف المنتج من السلة');
          } else {
            toast.success('تم تحديث الكمية');
          }
        } else {
          const data = await response.json();
          toast.error(data.error || 'حدث خطأ في التحديث');
        }
      } catch (error) {
        console.error('خطأ في تحديث السلة:', error);
        toast.error('حدث خطأ في الاتصال');
      }
    } else {
      // زائر - تحديث محلياً
      if (newQuantity <= 0) {
        setCart(cart.filter(item => item._id !== productId));
        toast.success('تم حذف المنتج من السلة');
      } else {
        setCart(cart.map(item => 
          item._id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        ));
        toast.success('تم تحديث الكمية');
      }
    }
  };

  // إضافة/إزالة من المفضلة
  const toggleWishlist = async (product) => {
    if (user) {
      // مستخدم مسجل - تحديث عبر API
      try {
        const token = localStorage.getItem('shop_token');
        const isInWishlist = wishlist.some(item => item._id === product._id);
        
        const response = await fetch('/api/shop/wishlist', {
          method: isInWishlist ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            itemId: product._id
          })
        });

        if (response.ok) {
          await loadUserCartAndWishlist(user);
          toast.success(isInWishlist ? 'تم حذف المنتج من المفضلة' : 'تم إضافة المنتج للمفضلة');
        } else {
          const data = await response.json();
          toast.error(data.error || 'حدث خطأ');
        }
      } catch (error) {
        console.error('خطأ في المفضلة:', error);
        toast.error('حدث خطأ في الاتصال');
      }
    } else {
      // زائر - تحديث محلياً
      const isInWishlist = wishlist.includes(product._id);
      
      if (isInWishlist) {
        setWishlist(wishlist.filter(id => id !== product._id));
        toast.success('تم حذف المنتج من المفضلة');
      } else {
        setWishlist([...wishlist, product._id]);
        toast.success('تم إضافة المنتج للمفضلة');
      }
    }
  };

  // التحقق من وجود المنتج في المفضلة
  const isInWishlist = (productId) => {
    if (user) {
      return wishlist.some(item => item._id === productId);
    } else {
      return wishlist.includes(productId);
    }
  };

  // إتمام الطلب
  const handleCheckout = () => {
    if (!user) {
      toast.info('يجب تسجيل الدخول أولاً لإتمام الطلب');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }
    
    // الانتقال لصفحة إتمام الطلب
    window.location.href = `/shop/${shopName}/checkout`;
  };

  // حساب إجمالي السلة
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!shopData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">المتجر غير موجود</h1>
          <p className="text-gray-600">تأكد من صحة رابط المتجر</p>
        </div>
      </div>
    );
  }

  const { shop, products, categories, pagination } = shopData;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      
      {/* Header */}
      <ShopHeader 
        shop={shop} 
        user={user}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <ShopHero shop={shop} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن المنتجات..."
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الفئات</option>
            {categories.map(category => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist(product._id)}
              cartItem={cart.find(item => item._id === product._id)}
              onUpdateQuantity={updateCartQuantity}
              shopName={shopName}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination 
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">جرب البحث بكلمات أخرى أو تصفح فئة مختلفة</p>
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
        cartTotal={cartTotal}
        onUpdateQuantity={updateCartQuantity}
        onCheckout={handleCheckout}
        shop={shop}
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />

      {/* Footer */}
      <ShopFooter shop={shop} />

      {/* Auth Modal */}
      <ShopAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        shopName={shopName}
        initialMode={authMode}
      />
      
    </div>
  );
}

// مكون Header المتجر
function ShopHeader({ shop, user, onLoginClick, onRegisterClick, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo & Name */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} className="w-10 h-10 rounded-lg" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {shop.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{shop.name}</h1>
              <p className="text-sm text-gray-600">/{shop.uniqueName}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 space-x-reverse">
            
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 space-x-reverse bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.phone}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // يمكن إضافة صفحة الملف الشخصي هنا
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      الملف الشخصي
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // يمكن إضافة صفحة الطلبات هنا
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      طلباتي
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <button
                  onClick={onLoginClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={onRegisterClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  إنشاء حساب
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </header>
  );
}

// مكون Hero Section
function ShopHero({ shop }) {
  return (
    <div 
      className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600"
      style={{
        backgroundImage: shop.coverImage ? `url(${shop.coverImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <h2 className="text-4xl font-bold mb-4">{shop.name}</h2>
          {shop.description && (
            <p className="text-lg mb-6 opacity-90">{shop.description}</p>
          )}
          <div className="flex items-center space-x-4 space-x-reverse text-sm">
            {shop.rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                <span>{shop.rating.average.toFixed(1)}</span>
              </div>
            )}
            <span>•</span>
            <span>{shop.stats?.totalProducts || 0} منتج</span>
            <span>•</span>
            <span>{shop.stats?.totalVisitors || 0} زائر</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون بطاقة المنتج
function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist, cartItem, onUpdateQuantity, shopName }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleProductClick = () => {
    window.location.href = `/shop/${shopName}/product/${product._id}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      
      {/* Product Image */}
      <div 
        className="relative h-48 bg-gray-100 cursor-pointer"
        onClick={handleProductClick}
      >
        {product.image && product.image !== '/images/no-image.jpg' ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Eye className="w-12 h-12" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 space-y-1">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              جديد
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 left-2 space-y-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-2 rounded-full transition-colors ${
              isInWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 hover:bg-white text-gray-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick();
            }}
            className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
        
        <h3 
          className="font-semibold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center ml-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-gray-800">
              {product.price.toLocaleString('en-US')} جنيه
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through mr-2">
                {product.originalPrice.toLocaleString('en-US')}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            متوفر: {product.stock}
          </span>
        </div>

        {/* Add to Cart / Quantity Controls */}
        {cartItem ? (
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
            <button
              onClick={() => onUpdateQuantity(product._id, cartItem.quantity - 1)}
              className="bg-white hover:bg-gray-50 p-1 rounded"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-medium">{cartItem.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(product._id, cartItem.quantity + 1)}
              className="bg-white hover:bg-gray-50 p-1 rounded"
              disabled={cartItem.quantity >= product.stock}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium transition-colors"
          >
            {product.stock === 0 ? 'غير متوفر' : 'إضافة للسلة'}
          </button>
        )}
      </div>
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
                {cart.map(item => (
                  <CartItem 
                    key={item._id} 
                    item={item} 
                    onUpdateQuantity={onUpdateQuantity}
                  />
                ))}
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

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
}

// مكون عنصر السلة
function CartItem({ item, onUpdateQuantity }) {
  return (
    <div className="flex items-center space-x-3 space-x-reverse bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
      
      {/* Product Image */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.image && item.image !== '/images/no-image.jpg' ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
          {item.name}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-blue-600 font-semibold text-sm">
            {item.price.toLocaleString('en-US')} جنيه
          </span>
          <span className="text-xs text-gray-500">
            متوفر: {item.item?.quantity_Remaining || item.stock || 0}
          </span>
        </div>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center bg-gray-100 rounded-lg">
          <button
            onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
            className="p-1 hover:bg-gray-200 rounded-r-lg transition-colors"
            disabled={item.quantity <= 1}
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
            className="p-1 hover:bg-gray-200 rounded-l-lg transition-colors"
            disabled={item.quantity >= (item.item?.quantity_Remaining || item.stock || 0)}
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Remove Button */}
        <button
          onClick={() => onUpdateQuantity(item._id, 0)}
          className="text-red-500 hover:text-red-700 text-xs"
        >
          حذف
        </button>
      </div>
    </div>
  );
}

// مكون Pagination
function Pagination({ pagination, onPageChange }) {
  const { currentPage, totalPages, hasPrev, hasNext } = pagination;

  return (
    <div className="flex items-center justify-center space-x-2 space-x-reverse">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        السابق
      </button>
      
      <span className="px-4 py-2 text-sm text-gray-600">
        صفحة {currentPage} من {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        التالي
      </button>
    </div>
  );
}

// مكون Footer المتجر
function ShopFooter({ shop }) {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Shop Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{shop.name}</h3>
            {shop.description && (
              <p className="text-gray-300 mb-4">{shop.description}</p>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات التواصل</h3>
            <div className="space-y-2 text-gray-300">
              {shop.contact?.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 ml-2" />
                  <span>{shop.contact.phone}</span>
                </div>
              )}
              {shop.contact?.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 ml-2" />
                  <span>{shop.contact.email}</span>
                </div>
              )}
              {shop.contact?.address && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 ml-2" />
                  <span>{shop.contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">تابعنا</h3>
            <div className="flex space-x-4 space-x-reverse">
              {shop.socialMedia?.facebook && (
                <a href={shop.socialMedia.facebook} className="text-gray-300 hover:text-white">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {shop.socialMedia?.instagram && (
                <a href={shop.socialMedia.instagram} className="text-gray-300 hover:text-white">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {shop.socialMedia?.whatsapp && (
                <a href={`https://wa.me/${shop.socialMedia.whatsapp}`} className="text-gray-300 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>&copy; 2024 {shop.name}. جميع الحقوق محفوظة.</p>
          <p className="text-sm mt-1">مدعوم بواسطة نقطة AI</p>
        </div>
      </div>
    </footer>
  );
}