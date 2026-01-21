'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import UIButton from '@/components/ui/UIButton';

export default function CheckoutClient() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Saudi Arabia'
  });

  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [shippingMethod, setShippingMethod] = useState('standard');

  const steps = [
    { id: 1, name: 'معلومات الشحن', icon: MapPin },
    { id: 2, name: 'طريقة الشحن', icon: Truck },
    { id: 3, name: 'طريقة الدفع', icon: CreditCard },
    { id: 4, name: 'مراجعة الطلب', icon: CheckCircle }
  ];

  const paymentMethods = [
    { id: 'cash_on_delivery', name: 'الدفع عند الاستلام', description: 'ادفع نقداً عند وصول الطلب' },
    { id: 'credit_card', name: 'بطاقة ائتمان', description: 'فيزا، ماستركارد، مدى' },
    { id: 'bank_transfer', name: 'تحويل بنكي', description: 'تحويل مباشر من البنك' },
    { id: 'wallet', name: 'محفظة إلكترونية', description: 'STC Pay، Apple Pay' }
  ];

  const shippingMethods = [
    { id: 'standard', name: 'شحن عادي', description: '3-5 أيام عمل', price: 25 },
    { id: 'express', name: 'شحن سريع', description: '1-2 أيام عمل', price: 50 },
    { id: 'overnight', name: 'شحن فوري', description: 'خلال 24 ساعة', price: 100 }
  ];

  useEffect(() => {
    fetchCartItems();
    loadUserInfo();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/shop/cart');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('حدث خطأ في تحميل العربة');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      const response = await fetch('/api/shop/user');
      if (response.ok) {
        const userData = await response.json();
        setShippingInfo(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          ...userData.address
        }));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
        return requiredFields.every(field => shippingInfo[field].trim() !== '');
      case 2:
        return shippingMethod !== '';
      case 3:
        return paymentMethod !== '';
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitOrder = async () => {
    if (!validateStep(currentStep)) {
      toast.error('يرجى مراجعة جميع البيانات');
      return;
    }

    setSubmitting(true);
    
    try {
      const orderData = {
        shippingAddress: shippingInfo,
        paymentMethod,
        shippingMethod,
        items: cartItems.map(item => ({
          item: item.item._id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        toast.success('تم إنشاء الطلب بنجاح');
        router.push(`/shop/orders/${order.orderNumber}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'فشل في إنشاء الطلب');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('حدث خطأ في إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
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

  const getShippingCost = () => {
    const subtotal = calculateSubtotal();
    if (subtotal >= 200) return 0; // شحن مجاني
    
    const method = shippingMethods.find(m => m.id === shippingMethod);
    return method ? method.price : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + getShippingCost();
  };

  if (loading) {
    return <CheckoutSkeleton />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">عربة التسوق فارغة</h2>
        <p className="text-gray-600 mb-8">لا يمكنك إتمام الطلب بعربة فارغة</p>
        <Link href="/shop">
          <UIButton
            label="العودة للتسوق"
            gradientFrom="blue-500"
            gradientTo="blue-600"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Link href="/shop" className="text-gray-500 hover:text-blue-600">المتجر</Link>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <Link href="/shop/cart" className="text-gray-500 hover:text-blue-600">العربة</Link>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <span className="text-gray-900 font-medium">إتمام الطلب</span>
      </div>

      {/* Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`mr-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Content */}
        <div>
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">معلومات الشحن</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={shippingInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+966 50 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="الرياض"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان التفصيلي *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="الشارع، الحي، رقم المبنى"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنطقة *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="منطقة الرياض"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرمز البريدي *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Shipping Method */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">طريقة الشحن</h2>
              
              <div className="space-y-4">
                {shippingMethods.map((method) => (
                  <label key={method.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={shippingMethod === method.id}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <span className="font-bold text-blue-600">
                          {calculateSubtotal() >= 200 && method.id === 'standard' 
                            ? 'مجاني' 
                            : formatPrice(method.price)
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">طريقة الدفع</h2>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Order Review */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">مراجعة الطلب</h2>
              
              <div className="space-y-6">
                {/* Shipping Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">معلومات الشحن</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{shippingInfo.name}</p>
                    <p>{shippingInfo.email}</p>
                    <p>{shippingInfo.phone}</p>
                    <p>{shippingInfo.street}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                  </div>
                </div>

                {/* Shipping & Payment Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">طريقة الشحن</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{shippingMethods.find(m => m.id === shippingMethod)?.name}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">طريقة الدفع</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{paymentMethods.find(m => m.id === paymentMethod)?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <UIButton
                label="السابق"
                onClick={prevStep}
                gradientFrom="gray-500"
                gradientTo="gray-600"
              />
            )}
            
            <div className="mr-auto">
              {currentStep < 4 ? (
                <UIButton
                  label="التالي"
                  onClick={nextStep}
                  gradientFrom="blue-500"
                  gradientTo="blue-600"
                />
              ) : (
                <UIButton
                  label={submitting ? "جاري الإرسال..." : "تأكيد الطلب"}
                  onClick={submitOrder}
                  disabled={submitting}
                  gradientFrom="green-500"
                  gradientTo="green-600"
                />
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h2>

            {/* Items */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item.item._id} className="flex items-center gap-3">
                  <img
                    src={item.item.image || '/api/placeholder/50/50'}
                    alt={item.item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.item.name}</h4>
                    <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>الشحن</span>
                <span>{getShippingCost() === 0 ? 'مجاني' : formatPrice(getShippingCost())}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>الإجمالي</span>
                <span className="text-blue-600">{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="h-8 w-48 bg-gray-300 rounded mb-8 animate-pulse"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
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
          </div>
        </div>
      </div>
    </div>
  );
}