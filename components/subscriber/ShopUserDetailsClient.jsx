"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, User, Mail, Phone, MapPin, Calendar, 
  ShoppingBag, DollarSign, Clock, Star, Edit, Save, 
  X, CheckCircle, XCircle, Package, Heart, Eye,
  TrendingUp, TrendingDown, Activity, Lock
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShopUserDetailsClient({ userId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscriber/shop-users/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRecentOrders(data.recentOrders || []);
        setEditData({
          name: data.user.name,
          email: data.user.email || '',
          phone: data.user.phone,
          address: data.user.address || {},
          isActive: data.user.isActive,
          isVerified: data.user.isVerified
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في تحميل البيانات');
        router.push('/subscriber/shop-users');
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل المستخدم:', error);
      toast.error('حدث خطأ في الاتصال');
      router.push('/subscriber/shop-users');
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين كلمة المرور
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      const response = await fetch(`/api/subscriber/shop-users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        toast.success('تم تحديث كلمة المرور بنجاح');
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في التحديث');
      }
    } catch (error) {
      console.error('خطأ في إعادة تعيين كلمة المرور:', error);
      toast.error('حدث خطأ في الاتصال');
    }
  };
    try {
      const response = await fetch(`/api/subscriber/shop-users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        toast.success('تم تحديث البيانات بنجاح');
        setEditing(false);
        fetchUserDetails();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في التحديث');
      }
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      toast.error('حدث خطأ في الاتصال');
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>جاري تحميل تفاصيل العميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">العميل غير موجود</h1>
        <p className="text-gray-600 mb-4">لم يتم العثور على العميل المطلوب</p>
        <button
          onClick={() => router.push('/subscriber/shop-users')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/subscriber/shop-users')}
            className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">تفاصيل العميل</h1>
            <p className="text-gray-600">إدارة ومتابعة بيانات العميل</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Lock className="w-4 h-4 ml-2" />
                إعادة تعيين كلمة المرور
              </button>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Edit className="w-4 h-4 ml-2" />
                تعديل
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="mr-4">
                <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                <p className="text-gray-600">ID: {user._id}</p>
                <div className="flex items-center mt-2 space-x-2 space-x-reverse">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                  {user.isVerified && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      مؤكد
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">معلومات التواصل</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 ml-3" />
                    {editing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="البريد الإلكتروني"
                      />
                    ) : (
                      <span className="text-gray-700">{user.email || 'غير محدد'}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 ml-3" />
                    {editing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="رقم الهاتف"
                      />
                    ) : (
                      <span className="text-gray-700">{user.phone}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 ml-3" />
                    <span className="text-gray-700">
                      انضم في {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">العنوان</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">الشارع</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editData.address?.street || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          address: {...editData.address, street: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="الشارع والحي"
                      />
                    ) : (
                      <p className="text-gray-700">{user.address?.street || 'غير محدد'}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">المدينة</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editData.address?.city || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            address: {...editData.address, city: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="المدينة"
                        />
                      ) : (
                        <p className="text-gray-700">{user.address?.city || 'غير محدد'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">المحافظة</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editData.address?.state || ''}
                          onChange={(e) => setEditData({
                            ...editData, 
                            address: {...editData.address, state: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="المحافظة"
                        />
                      ) : (
                        <p className="text-gray-700">{user.address?.state || 'غير محدد'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Status Controls */}
            {editing && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-800 mb-4">إعدادات الحساب</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editData.isActive}
                        onChange={(e) => setEditData({...editData, isActive: e.target.checked})}
                        className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">حساب نشط</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editData.isVerified}
                        onChange={(e) => setEditData({...editData, isVerified: e.target.checked})}
                        className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">حساب مؤكد</span>
                    </label>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">ملاحظة مهمة:</h4>
                    <p className="text-xs text-blue-700">
                      • الحسابات المؤكدة تتطلب كلمة مرور لتسجيل الدخول
                    </p>
                    <p className="text-xs text-blue-700">
                      • الحسابات غير المؤكدة يمكنها استخدام رمز التحقق أو كلمة المرور
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-800 mb-4">الطلبات الأخيرة</h3>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">
                        {order.pricing.total.toLocaleString('en-US')} جنيه
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>

        {/* Statistics & Quick Info */}
        <div className="space-y-6">
          
          {/* Statistics */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-800 mb-4">الإحصائيات</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600 ml-3" />
                  <span className="text-sm font-medium text-gray-700">إجمالي الطلبات</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {user.stats?.totalOrders || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 ml-3" />
                  <span className="text-sm font-medium text-gray-700">إجمالي المبلغ</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {(user.stats?.totalSpent || 0).toLocaleString('en-US')} جنيه
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 ml-3" />
                  <span className="text-sm font-medium text-gray-700">متوسط قيمة الطلب</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {(user.stats?.averageOrderValue || 0).toLocaleString('en-US')} جنيه
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-orange-600 ml-3" />
                  <span className="text-sm font-medium text-gray-700">طلبات معلقة</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {user.stats?.pendingOrders || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Cart & Wishlist Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-800 mb-4">السلة والمفضلة</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600 ml-3" />
                  <span className="text-sm font-medium text-gray-700">منتجات في السلة</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {user.cart?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-red-600 ml-3" />
                  <span className="text-sm font-medium text-gray-700">منتجات مفضلة</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {user.wishlist?.length || 0}
                </span>
              </div>
              
              {user.cart && user.cart.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">قيمة السلة الحالية:</p>
                  <p className="text-lg font-bold text-green-600">
                    {user.cart.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString('en-US')} جنيه
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Last Activity */}
          {user.stats?.lastOrderDate && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium text-gray-800 mb-4">آخر نشاط</h3>
              
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-gray-600 ml-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">آخر طلب</p>
                  <p className="text-sm text-gray-600">
                    {new Date(user.stats.lastOrderDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          )}
          
        </div>
        
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">إعادة تعيين كلمة المرور</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="6 أحرف على الأقل"
                  minLength="6"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⚠️ سيتم تحديث كلمة مرور العميل وسيحتاج لاستخدامها في تسجيل الدخول القادم
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                تحديث كلمة المرور
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}