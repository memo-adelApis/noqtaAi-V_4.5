"use client";

import { useState, useEffect } from 'react';
import { 
  Store, Plus, Settings, Eye, Calendar, TrendingUp, 
  Package, ShoppingCart, Users, DollarSign, ExternalLink,
  Edit, Trash2, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShopManagement() {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // جلب بيانات المتجر
  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const response = await fetch('/api/subscriber/shop');
      const data = await response.json();
      
      if (response.ok) {
        setShopData(data);
      } else {
        toast.error(data.error || 'حدث خطأ في جلب البيانات');
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المتجر:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  // إذا لم يكن لديه متجر
  if (!shopData?.hasShop) {
    return (
      <div className="space-y-6">
        
        {/* بطاقة إنشاء متجر */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/30 text-center">
          <Store className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            أنشئ متجرك الإلكتروني الآن
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            احصل على متجر إلكتروني احترافي لعرض منتجاتك وزيادة مبيعاتك. 
            يتم ربط المتجر تلقائياً بمنتجاتك الموجودة في النظام.
          </p>
          
          <div className="bg-[#1a1d29] rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">الاشتراك الشهري:</span>
              <span className="text-2xl font-bold text-green-400">70 جنيه</span>
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5 inline-block ml-2" />
            إنشاء متجر جديد
          </button>
        </div>

        {/* مميزات المتجر */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Store className="w-8 h-8 text-blue-400" />,
              title: 'متجر احترافي',
              description: 'تصميم عصري وسريع الاستجابة'
            },
            {
              icon: <Package className="w-8 h-8 text-green-400" />,
              title: 'ربط تلقائي',
              description: 'يعرض منتجاتك الموجودة تلقائياً'
            },
            {
              icon: <ShoppingCart className="w-8 h-8 text-purple-400" />,
              title: 'نظام طلبات',
              description: 'إدارة الطلبات والمدفوعات'
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-yellow-400" />,
              title: 'تقارير مفصلة',
              description: 'إحصائيات المبيعات والزوار'
            },
            {
              icon: <Users className="w-8 h-8 text-indigo-400" />,
              title: 'إدارة العملاء',
              description: 'قاعدة بيانات العملاء'
            },
            {
              icon: <Settings className="w-8 h-8 text-gray-400" />,
              title: 'تخصيص كامل',
              description: 'ألوان وإعدادات قابلة للتخصيص'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-[#1a1d29] rounded-xl p-6 border border-gray-800">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* نموذج إنشاء المتجر */}
        {showCreateForm && (
          <CreateShopForm 
            onClose={() => setShowCreateForm(false)}
            onSuccess={fetchShopData}
          />
        )}
        
      </div>
    );
  }

  // إذا كان لديه متجر
  const { shop } = shopData;
  
  return (
    <div className="space-y-6">
      
      {/* بطاقة معلومات المتجر */}
      <div className="bg-[#1a1d29] rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{shop.name}</h2>
              <p className="text-gray-400 text-sm">/{shop.uniqueName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <a
              href={`/shop/${shop.uniqueName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Eye className="w-4 h-4 inline-block ml-1" />
              عرض المتجر
              <ExternalLink className="w-3 h-3 mr-1" />
            </a>
            <button
              onClick={() => setShowEditForm(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4 inline-block ml-1" />
              تعديل
            </button>
          </div>
        </div>

        {/* حالة الاشتراك */}
        <div className="flex items-center justify-between bg-[#0f111a] rounded-lg p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            {shop.isExpired ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : shop.daysLeft <= 7 ? (
              <Clock className="w-5 h-5 text-yellow-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            <div>
              <p className="text-white font-medium">
                {shop.isExpired ? 'انتهت صلاحية الاشتراك' : 
                 shop.daysLeft <= 7 ? 'ينتهي الاشتراك قريباً' : 
                 'الاشتراك نشط'}
              </p>
              <p className="text-gray-400 text-sm">
                {shop.isExpired ? 'يرجى التجديد لاستمرار الخدمة' :
                 `متبقي ${shop.daysLeft} يوم`}
              </p>
            </div>
          </div>
          
          <div className="text-left">
            <p className="text-2xl font-bold text-green-400">70 جنيه</p>
            <p className="text-gray-400 text-sm">شهرياً</p>
          </div>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Package className="w-6 h-6 text-blue-400" />}
          title="المنتجات"
          value={shop.stats?.totalProducts || 0}
          change="+12%"
          positive={true}
        />
        <StatCard
          icon={<ShoppingCart className="w-6 h-6 text-green-400" />}
          title="الطلبات"
          value={shop.orderStats?.totalOrders || 0}
          change="+8%"
          positive={true}
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-yellow-400" />}
          title="الإيرادات"
          value={`${shop.orderStats?.totalRevenue || 0} جنيه`}
          change="+15%"
          positive={true}
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-purple-400" />}
          title="الزوار"
          value={shop.stats?.totalVisitors || 0}
          change="+5%"
          positive={true}
        />
      </div>

      {/* الطلبات الأخيرة */}
      <RecentOrders shopId={shop._id} />

      {/* نموذج التعديل */}
      {showEditForm && (
        <EditShopForm 
          shop={shop}
          onClose={() => setShowEditForm(false)}
          onSuccess={fetchShopData}
        />
      )}
      
    </div>
  );
}

// مكون بطاقة الإحصائيات
function StatCard({ icon, title, value, change, positive }) {
  return (
    <div className="bg-[#1a1d29] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className={`text-xs px-2 py-1 rounded-full ${
          positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-gray-400 text-sm">{title}</p>
      </div>
    </div>
  );
}

// مكون الطلبات الأخيرة
function RecentOrders({ shopId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, [shopId]);

  const fetchRecentOrders = async () => {
    try {
      // هنا يمكن إضافة API لجلب الطلبات الأخيرة
      // مؤقتاً سنعرض بيانات وهمية
      setOrders([]);
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1d29] rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">الطلبات الأخيرة</h3>
      
      {loading ? (
        <div className="text-center py-8 text-gray-400">جاري التحميل...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد طلبات حتى الآن</p>
          <p className="text-sm mt-1">ستظهر الطلبات هنا عند وصولها</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-[#0f111a] rounded-lg">
              {/* تفاصيل الطلب */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// نموذج إنشاء المتجر
function CreateShopForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    uniqueName: '',
    description: '',
    keywords: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subscriber/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم إنشاء المتجر بنجاح!');
        onSuccess();
        onClose();
        
        // إعادة تحميل الصفحة لإظهار المتجر الجديد
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.error || 'حدث خطأ في إنشاء المتجر');
      }
    } catch (error) {
      console.error('خطأ في إنشاء المتجر:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d29] rounded-xl p-6 w-full max-w-md border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">إنشاء متجر جديد</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اسم المتجر
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#0f111a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="مثال: متجر الإلكترونيات"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الاسم الفريد (بالإنجليزية)
            </label>
            <input
              type="text"
              value={formData.uniqueName}
              onChange={(e) => setFormData({...formData, uniqueName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
              className="w-full bg-[#0f111a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="electronics-shop"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              سيكون رابط متجرك: /shop/{formData.uniqueName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              وصف المتجر
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[#0f111a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              rows="3"
              placeholder="وصف مختصر عن متجرك ومنتجاتك"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمات البحث (مفصولة بفاصلة)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              className="w-full bg-[#0f111a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="إلكترونيات, هواتف, أجهزة"
            />
          </div>

          <div className="flex space-x-3 space-x-reverse pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء المتجر'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// نموذج تعديل المتجر
function EditShopForm({ shop, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: shop.name || '',
    description: shop.description || '',
    keywords: shop.keywords?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subscriber/shop', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم تحديث المتجر بنجاح!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'حدث خطأ في تحديث المتجر');
      }
    } catch (error) {
      console.error('خطأ في تحديث المتجر:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d29] rounded-xl p-6 w-full max-w-md border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">تعديل بيانات المتجر</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اسم المتجر
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#0f111a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              وصف المتجر
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[#0f111a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمات البحث
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              className="w-full bg-[#0f111a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex space-x-3 space-x-reverse pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري التحديث...' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}