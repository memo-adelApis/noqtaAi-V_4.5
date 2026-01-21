'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight,
  Tag,
  Truck
} from 'lucide-react';
import { toast } from 'react-toastify';
import UIButton from '@/components/ui/UIButton';

export default function CartClient() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shop/cart');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      } else {
        toast.error('فشل في تحميل عربة التسوق');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('حدث خطأ في تحميل العربة');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity
        }),
      });

      if (response.ok) {
        setCartItems(prev => 
          prev.map(item => 
            item.item._id === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        toast.success('تم تحديث الكمية');
      } else {
        toast.error('فشل في تحديث الكمية');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('حدث خطأ في تحديث الكمية');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.item._id !== itemId));
        toast.success('تم حذف المنتج من العربة');
      } else {
        toast.error('فشل في حذف المنتج');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('حدث خطأ في حذف المنتج');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const response = await fetch('/api/shop/coupon/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedCoupon(data.coupon);
        toast.success('تم تطبيق كود الخصم بنجاح');
      } else {
        const error = await response.json();
        toast.error(error.message || 'كود خصم غير صحيح');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('حدث خطأ في تطبيق كود الخصم');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('تم إلغاء كود الخصم');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    return appliedCoupon.type === 'percentage' 
      ? (subtotal * appliedCoupon.value / 100)
      : appliedCoupon.value;
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 200 ? 0 : 25; // شحن مجاني للطلبات فوق 200 ريال
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateShipping();
  };

  if (loading) {
    return <CartSkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">عربة التسوق فارغة</h2>
        <p className="text-gray-600 mb-8">لم تقم بإضافة أي منتجات إلى عربة التسوق بعد</p>
        <Link href="/shop">
          <UIButton
            label="تسوق الآن"
            gradientFrom="blue-500"
            gradientTo="blue-600"
            icon={ShoppingBag}
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/shop" className="text-gray-500 hover:text-blue-600">
          المتجر
        </Link>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <span className="text-gray-900 font-medium">عربة التسوق</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">عربة التسوق ({cartItems.length} منتج)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {cartItems.map((item, index) => (
              <div key={item.item._id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b' : ''}`}>
                <div className="flex gap-4">
                  <img
                    src={item.item.image || '/api/placeholder/100/100'}
                    alt={item.item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{item.item.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">SKU: {item.item.sku || 'N/A'}</p>
                    <p className="text-lg font-bold text-blue-600">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updating[item.item._id]}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="w-12 text-center font-medium">
                        {updating[item.item._id] ? '...' : item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.item._id, item.quantity + 1)}
                        disabled={updating[item.item._id]}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.item._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Item Total */}
                    <p className="font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h2>

            {/* Coupon Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كود الخصم
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {appliedCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="أدخل كود الخصم"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <UIButton
                    label="تطبيق"
                    onClick={applyCoupon}
                    gradientFrom="gray-500"
                    gradientTo="gray-600"
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم ({appliedCoupon.code})</span>
                  <span>-{formatPrice(calculateDiscount())}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600 flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  الشحن
                </span>
                <span className="font-medium">
                  {calculateShipping() === 0 ? 'مجاني' : formatPrice(calculateShipping())}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-blue-600">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Shipping Notice */}
            {calculateSubtotal() < 200 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  أضف {formatPrice(200 - calculateSubtotal())} للحصول على شحن مجاني
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <Link href="/shop/checkout">
              <UIButton
                label="إتمام الطلب"
                gradientFrom="blue-500"
                gradientTo="blue-600"
                className="w-full"
                size="lg"
              />
            </Link>

            <Link href="/shop" className="block text-center text-blue-600 hover:text-blue-800 mt-4">
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
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