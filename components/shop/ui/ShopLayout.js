'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShopLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchCartCount();
    fetchWishlistCount();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/shop/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/shop/cart/count');
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const response = await fetch('/api/shop/wishlist/count');
      if (response.ok) {
        const data = await response.json();
        setWishlistCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  const navigation = [
    { name: 'الرئيسية', href: '/shop' },
    { name: 'المنتجات', href: '/shop/products' },
    { name: 'الفئات', href: '/shop/categories' },
    { name: 'العروض', href: '/shop/offers' },
    { name: 'من نحن', href: '/shop/about' },
    { name: 'اتصل بنا', href: '/shop/contact' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-gray-900 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>+966 50 123 4567</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>info@shop.com</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span>شحن مجاني للطلبات فوق 200 ريال</span>
                <div className="flex gap-2">
                  <Facebook className="h-4 w-4 hover:text-blue-400 cursor-pointer" />
                  <Twitter className="h-4 w-4 hover:text-blue-400 cursor-pointer" />
                  <Instagram className="h-4 w-4 hover:text-pink-400 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/shop" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">متجري</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist */}
              <Link href="/shop/wishlist" className="relative p-2 text-gray-600 hover:text-red-600 transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/shop/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              <div className="relative">
                {user ? (
                  <Link href="/shop/account" className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">{user.name}</span>
                  </Link>
                ) : (
                  <Link href="/shop/login" className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">تسجيل الدخول</span>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">متجري</span>
              </div>
              <p className="text-gray-400 mb-4">
                متجرك الإلكتروني المفضل للحصول على أفضل المنتجات بأسعار منافسة وجودة عالية.
              </p>
              <div className="flex gap-4">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
                <Instagram className="h-5 w-5 text-gray-400 hover:text-pink-400 cursor-pointer" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li><Link href="/shop/about" className="text-gray-400 hover:text-white">من نحن</Link></li>
                <li><Link href="/shop/contact" className="text-gray-400 hover:text-white">اتصل بنا</Link></li>
                <li><Link href="/shop/privacy" className="text-gray-400 hover:text-white">سياسة الخصوصية</Link></li>
                <li><Link href="/shop/terms" className="text-gray-400 hover:text-white">الشروط والأحكام</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-4">خدمة العملاء</h3>
              <ul className="space-y-2">
                <li><Link href="/shop/help" className="text-gray-400 hover:text-white">مركز المساعدة</Link></li>
                <li><Link href="/shop/returns" className="text-gray-400 hover:text-white">الإرجاع والاستبدال</Link></li>
                <li><Link href="/shop/shipping" className="text-gray-400 hover:text-white">معلومات الشحن</Link></li>
                <li><Link href="/shop/track" className="text-gray-400 hover:text-white">تتبع الطلب</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">معلومات التواصل</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">الرياض، المملكة العربية السعودية</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">+966 50 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">info@shop.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 متجري. جميع الحقوق محفوظة.
              </p>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <span className="text-gray-400 text-sm">طرق الدفع المقبولة:</span>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-blue-600 rounded text-xs text-white flex items-center justify-center">VISA</div>
                  <div className="w-8 h-5 bg-red-600 rounded text-xs text-white flex items-center justify-center">MC</div>
                  <div className="w-8 h-5 bg-green-600 rounded text-xs text-white flex items-center justify-center">MADA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}