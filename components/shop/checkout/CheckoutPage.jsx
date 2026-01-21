"use client";

import { useState, useEffect } from 'react';
import { 
  ArrowRight, ShoppingCart, CreditCard, Truck, 
  MapPin, Phone, User, Mail, Star, MessageSquare,
  CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function CheckoutPage({ shopName }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: معلومات, 2: دفع, 3: تأكيد
  
  const [formData, setFormData] = useState({
    // معلومات الشحن
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    
    // طريقة الدفع
    paymentMethod: 'cod', // cod, card, bank
    
    // ملاحظات
    notes: '',
    
    // تقييمات المنتجات
    productReviews: {}
  });

  // تحميل بيانات المستخدم والسلة
  useEffect(() => {
    loadUserAndCart();
  }, []);

  const loadUserAndCart = async () => {
    try {
      const savedUser = localStorage.getItem('shop_user');
      const token = localStorage.getItem('shop_token');
      
      if (!savedUser || !token) {
        // إعادة توجيه لتسجيل الدخول
        window.location.href = `/shop/${shopName}`;
        return;
      }

      const userData = JSON.parse(savedUser);
      setUser(userData);

      // تحميل السلة
      const response = await fetch('/api/shop/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart || []);
        
        if (data.cart.length === 0) {
          toast.error('السلة فارغة');
          window.location.href = `/shop/${shopName}`;
          return;
        }
      }

      // ملء البيانات الأولية
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        phone: userData.phone || '',
        email: userData.email || ''
      }));

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // حساب الإجماليات
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 500 ? 0 : 30; // شحن مجاني للطلبات أكثر من 500 جنيه
  const tax = subtotal * 0.14; // ضريبة 14%
  const total = subtotal + shipping + tax;

  // إرسال الطلب
  const handleSubmitOrder = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('shop_token');
      const response = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shopName,
          shippingAddress: formData.address,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          productReviews: formData.productReviews
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم إرسال الطلب بنجاح!');
        
        // إعادة توجيه لصفحة تأكيد الطلب
        window.location.href = `/shop/${shopName}/order/${data.orderNumber}`;
      } else {
        toast.error(data.error || 'حدث خطأ في إرسال الطلب');
      }
    } catch (error) {
      console.error('خطأ في إرسال الطلب:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة للمتجر
            </button>
            <h1 className="text-xl font-bold text-gray-800">إتمام الطلب</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8 space-x-reverse">
            {[
              { num: 1, title: 'معلومات الشحن', icon: MapPin },
              { num: 2, title: 'طريقة الدفع', icon: CreditCard },
              { num: 3, title: 'تأكيد الطلب', icon: CheckCircle }
            ].map((stepItem, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepItem.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <stepItem.icon className="w-5 h-5" />
                </div>
                <span className={`mr-2 text-sm font-medium ${
                  step >= stepItem.num ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {stepItem.title}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepItem.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-2">
            {step === 1 && <ShippingForm formData={formData} setFormData={setFormData} />}
            {step === 2 && <PaymentForm formData={formData} setFormData={setFormData} />}
            {step === 3 && <ReviewForm formData={formData} setFormData={setFormData} cart={cart} />}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <OrderSummary 
              cart={cart}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
            />
            
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {submitting ? 'جاري الإرسال...' : 
               step === 3 ? 'تأكيد الطلب' : 'التالي'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// نموذج معلومات الشحن
function ShippingForm({ formData, setFormData }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">معلومات الشحن</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الكامل
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني (اختياري)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العنوان التفصيلي
          </label>
          <input
            type="text"
            value={formData.address.street}
            onChange={(e) => setFormData({
              ...formData, 
              address: {...formData.address, street: e.target.value}
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="الشارع والحي والمنطقة"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المدينة
          </label>
          <input
            type="text"
            value={formData.address.city}
            onChange={(e) => setFormData({
              ...formData, 
              address: {...formData.address, city: e.target.value}
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المحافظة
          </label>
          <input
            type="text"
            value={formData.address.state}
            onChange={(e) => setFormData({
              ...formData, 
              address: {...formData.address, state: e.target.value}
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );
}

// نموذج طريقة الدفع
function PaymentForm({ formData, setFormData }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">طريقة الدفع</h2>
      
      <div className="space-y-4">
        {[
          {
            id: 'cod',
            title: 'الدفع عند الاستلام',
            description: 'ادفع نقداً عند وصول الطلب',
            icon: Truck
          },
          {
            id: 'card',
            title: 'بطاقة ائتمان',
            description: 'فيزا، ماستركارد، أو أمريكان إكسبريس',
            icon: CreditCard
          }
        ].map((method) => (
          <label key={method.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={formData.paymentMethod === method.id}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="ml-3"
            />
            <method.icon className="w-6 h-6 text-gray-600 ml-3" />
            <div>
              <div className="font-medium text-gray-800">{method.title}</div>
              <div className="text-sm text-gray-600">{method.description}</div>
            </div>
          </label>
        ))}
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ملاحظات إضافية (اختياري)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
          placeholder="أي ملاحظات خاصة بالطلب..."
        />
      </div>
    </div>
  );
}

// نموذج المراجعة والتقييم
function ReviewForm({ formData, setFormData, cart }) {
  const updateProductReview = (productId, field, value) => {
    setFormData({
      ...formData,
      productReviews: {
        ...formData.productReviews,
        [productId]: {
          ...formData.productReviews[productId],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">تقييم المنتجات</h2>
      
      <div className="space-y-6">
        {cart.map((item) => (
          <div key={item._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4 space-x-reverse mb-4">
              <img 
                src={item.image || '/images/no-image.jpg'} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                <p className="text-sm text-blue-600 font-medium">{item.price} جنيه</p>
              </div>
            </div>
            
            {/* تقييم بالنجوم */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تقييمك للمنتج
              </label>
              <div className="flex items-center space-x-1 space-x-reverse">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateProductReview(item._id, 'rating', star)}
                    className={`w-8 h-8 ${
                      (formData.productReviews[item._id]?.rating || 0) >= star
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* تعليق */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعليقك (اختياري)
              </label>
              <textarea
                value={formData.productReviews[item._id]?.comment || ''}
                onChange={(e) => updateProductReview(item._id, 'comment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
                placeholder="شاركنا رأيك في هذا المنتج..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ملخص الطلب
function OrderSummary({ cart, subtotal, shipping, tax, total }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">ملخص الطلب</h3>
      
      {/* المنتجات */}
      <div className="space-y-3 mb-4">
        {cart.map((item) => (
          <div key={item._id} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {item.quantity}
              </span>
              <span className="text-gray-800">{item.name}</span>
            </div>
            <span className="font-medium">{(item.price * item.quantity).toLocaleString('en-US')} جنيه</span>
          </div>
        ))}
      </div>
      
      <hr className="my-4" />
      
      {/* الإجماليات */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>المجموع الفرعي:</span>
          <span>{subtotal.toLocaleString('en-US')} جنيه</span>
        </div>
        <div className="flex justify-between">
          <span>الشحن:</span>
          <span>{shipping === 0 ? 'مجاني' : `${shipping} جنيه`}</span>
        </div>
        <div className="flex justify-between">
          <span>الضريبة (14%):</span>
          <span>{tax.toLocaleString('en-US')} جنيه</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between text-lg font-semibold">
          <span>الإجمالي:</span>
          <span className="text-blue-600">{total.toLocaleString('en-US')} جنيه</span>
        </div>
      </div>
      
      {shipping === 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-800 text-sm">
            <CheckCircle className="w-4 h-4 ml-2" />
            شحن مجاني للطلبات أكثر من 500 جنيه
          </div>
        </div>
      )}
    </div>
  );
}