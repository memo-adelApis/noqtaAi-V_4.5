"use client";

import { useState, useEffect } from 'react';
import { 
  CheckCircle, Package, Truck, Clock, 
  Phone, Mail, MapPin, ArrowRight, Star,
  Download, Share2, MessageCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function OrderConfirmationPage({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const { shopName, orderNumber } = await params;
      
      const response = await fetch(`/api/shop/${shopName}/order/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('shop_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setShop(data.shop);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في تحميل الطلب');
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل الطلب:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'في الانتظار',
      confirmed: 'مؤكد',
      processing: 'قيد التحضير',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغي'
    };
    return texts[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      pending: 'في الانتظار',
      paid: 'مدفوع',
      failed: 'فشل',
      refunded: 'مسترد'
    };
    return texts[status] || status;
  };

  const shareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `طلب رقم ${order.orderNumber}`,
          text: `تم تأكيد طلبي من متجر ${shop.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('خطأ في المشاركة:', error);
      }
    } else {
      // نسخ الرابط
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ رابط الطلب');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">الطلب غير موجود</h1>
          <p className="text-gray-600 mb-4">تأكد من صحة رقم الطلب</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = `/shop/${shop.uniqueName}`}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة للمتجر
            </button>
            <h1 className="text-xl font-bold text-gray-800">تفاصيل الطلب</h1>
            <button
              onClick={shareOrder}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <Share2 className="w-5 h-5 ml-2" />
              مشاركة
            </button>
          </div>
        </div>
      </header>

      {/* Success Message */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">تم تأكيد طلبك بنجاح!</h2>
            <p className="text-green-700 mb-4">
              رقم الطلب: <span className="font-bold">{order.orderNumber}</span>
            </p>
            <p className="text-green-600">
              سيتم التواصل معك قريباً لتأكيد التفاصيل
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">حالة الطلب</h3>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
              
              {/* Status Timeline */}
              <div className="space-y-3">
                {order.statusHistory.map((status, index) => (
                  <div key={index} className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getStatusText(status.status)}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(status.date).toLocaleString('ar-SA')}
                        </span>
                      </div>
                      {status.note && (
                        <p className="text-sm text-gray-600 mt-1">{status.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">المنتجات المطلوبة</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 space-x-reverse border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-1">{item.name}</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">الكمية: {item.quantity}</span>
                        <span className="font-medium">{item.price.toLocaleString('en-US')} جنيه</span>
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-blue-600 font-semibold">
                          {item.total.toLocaleString('en-US')} جنيه
                        </span>
                      </div>
                      
                      {/* Product Review */}
                      {item.review && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium ml-2">تقييمك:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < item.review.rating 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                          {item.review.comment && (
                            <p className="text-sm text-gray-700">{item.review.comment}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">عنوان التسليم</h3>
              <div className="flex items-start space-x-3 space-x-reverse">
                <MapPin className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">{order.customer.name}</p>
                  <p className="text-gray-600">{order.customer.phone}</p>
                  <p className="text-gray-600 mt-2">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                    {order.shippingAddress.zipCode && ` ${order.shippingAddress.zipCode}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">ملاحظات</h3>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
            
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">ملخص الدفع</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{order.pricing.subtotal.toLocaleString('en-US')} جنيه</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن:</span>
                  <span>
                    {order.pricing.shipping === 0 ? 'مجاني' : `${order.pricing.shipping} جنيه`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة:</span>
                  <span>{order.pricing.tax.toLocaleString('en-US')} جنيه</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>الإجمالي:</span>
                  <span className="text-blue-600">{order.pricing.total.toLocaleString('en-US')} جنيه</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">طريقة الدفع:</span>
                  <span className="text-sm">
                    {order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">حالة الدفع:</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shop Contact */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">تواصل مع المتجر</h3>
              
              <div className="space-y-3">
                {shop.contact?.phone && (
                  <a 
                    href={`tel:${shop.contact.phone}`}
                    className="flex items-center space-x-3 space-x-reverse text-gray-700 hover:text-blue-600"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{shop.contact.phone}</span>
                  </a>
                )}
                
                {shop.contact?.email && (
                  <a 
                    href={`mailto:${shop.contact.email}`}
                    className="flex items-center space-x-3 space-x-reverse text-gray-700 hover:text-blue-600"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{shop.contact.email}</span>
                  </a>
                )}
                
                {shop.socialMedia?.whatsapp && (
                  <a 
                    href={`https://wa.me/${shop.socialMedia.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 space-x-reverse text-gray-700 hover:text-green-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>واتساب</span>
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = `/shop/${shop.uniqueName}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                متابعة التسوق
              </button>
              
              <button
                onClick={() => window.print()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Download className="w-5 h-5 ml-2" />
                طباعة الطلب
              </button>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}