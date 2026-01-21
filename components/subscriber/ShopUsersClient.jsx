"use client";

import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Eye, Edit, Trash2, 
  UserCheck, UserX, Mail, Phone, MapPin, Calendar,
  ShoppingBag, DollarSign, Clock, Star, Download,
  RefreshCw, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShopUsersClient() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // فلاتر البحث
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  });

  // تحميل البيانات
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/subscriber/shop-users?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في تحميل البيانات');
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  // عرض تفاصيل المستخدم
  const viewUserDetails = async (userId) => {
    try {
      const response = await fetch(`/api/subscriber/shop-users/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setShowUserModal(true);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في تحميل التفاصيل');
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل المستخدم:', error);
      toast.error('حدث خطأ في الاتصال');
    }
  };

  // تحديث حالة التحقق للمستخدم
  const updateUserVerification = async (userId, isVerified) => {
    try {
      const response = await fetch(`/api/subscriber/shop-users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified })
      });

      if (response.ok) {
        toast.success(`تم ${isVerified ? 'تأكيد' : 'إلغاء تأكيد'} الحساب`);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في التحديث');
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة التحقق:', error);
      toast.error('حدث خطأ في الاتصال');
    }
  };

  // تحديث حالة المستخدم
  const updateUserStatus = async (userId, isActive) => {
    try {
      const response = await fetch(`/api/subscriber/shop-users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        toast.success(`تم ${isActive ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم`);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في التحديث');
      }
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      toast.error('حدث خطأ في الاتصال');
    }
  };

  // حذف المستخدم
  const deleteUser = async (userId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      const response = await fetch(`/api/subscriber/shop-users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في الحذف');
      }
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      toast.error('حدث خطأ في الاتصال');
    }
  };

  // تصدير البيانات
  const exportUsers = () => {
    const csvContent = [
      ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'المدينة', 'الحالة', 'تاريخ التسجيل', 'إجمالي الطلبات', 'إجمالي المبلغ'],
      ...users.map(user => [
        user.name,
        user.email || '',
        user.phone,
        user.address?.city || '',
        user.isActive ? 'نشط' : 'غير نشط',
        new Date(user.createdAt).toLocaleDateString('ar-SA'),
        user.stats?.totalOrders || 0,
        user.stats?.totalSpent || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shop-users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="w-7 h-7 ml-3 text-blue-600" />
            إدارة عملاء المتجر
          </h1>
          <p className="text-gray-600 mt-1">إدارة ومتابعة عملاء متجرك الإلكتروني</p>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={exportUsers}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة عميل
          </button>
          
          <button
            onClick={fetchUsers}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">العملاء النشطون</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">العملاء المؤكدون</p>
              <p className="text-2xl font-bold text-purple-600">{stats.verifiedUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عملاء جدد هذا الشهر</p>
              <p className="text-2xl font-bold text-orange-600">{stats.newUsersThisMonth || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث بالاسم أو الهاتف أو البريد..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="verified">مؤكد</option>
            <option value="unverified">غير مؤكد</option>
          </select>

          {/* Items per page */}
          <select
            value={filters.limit}
            onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value), page: 1})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 عناصر</option>
            <option value={25}>25 عنصر</option>
            <option value={50}>50 عنصر</option>
            <option value={100}>100 عنصر</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ search: '', status: '', page: 1, limit: 10 })}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            مسح الفلاتر
          </button>
          
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-3">جاري التحميل...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">لا يوجد عملاء</h3>
            <p className="text-gray-500">لم يتم العثور على عملاء بالمعايير المحددة</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      معلومات التواصل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإحصائيات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ التسجيل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <UserRow 
                      key={user._id} 
                      user={user} 
                      onView={() => viewUserDetails(user._id)}
                      onUpdateStatus={(isActive) => updateUserStatus(user._id, isActive)}
                      onUpdateVerification={(isVerified) => updateUserVerification(user._id, isVerified)}
                      onDelete={() => deleteUser(user._id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    عرض {((pagination.currentPage - 1) * filters.limit) + 1} إلى {Math.min(pagination.currentPage * filters.limit, pagination.totalUsers)} من {pagination.totalUsers} عميل
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => setFilters({...filters, page: pagination.currentPage - 1})}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      السابق
                    </button>
                    
                    <span className="px-3 py-1 text-sm">
                      صفحة {pagination.currentPage} من {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setFilters({...filters, page: pagination.currentPage + 1})}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserDetailsModal 
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onUpdate={fetchUsers}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}
      
    </div>
  );
}

// مكون صف المستخدم
function UserRow({ user, onView, onUpdateStatus, onUpdateVerification, onDelete }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0)}
          </div>
          <div className="mr-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">ID: {user._id.slice(-6)}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          {user.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 ml-2" />
              {user.email}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 ml-2" />
            {user.phone}
          </div>
          {user.address?.city && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 ml-2" />
              {user.address.city}
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <ShoppingBag className="w-4 h-4 ml-2 text-blue-600" />
            <span>{user.stats?.totalOrders || 0} طلب</span>
          </div>
          <div className="flex items-center text-sm">
            <DollarSign className="w-4 h-4 ml-2 text-green-600" />
            <span>{(user.stats?.totalSpent || 0).toLocaleString('en-US')} جنيه</span>
          </div>
          {user.stats?.lastOrderDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 ml-2" />
              <span>آخر طلب: {new Date(user.stats.lastOrderDate).toLocaleDateString('ar-SA')}</span>
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'نشط' : 'غير نشط'}
          </span>
          
          {user.isVerified && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              مؤكد
            </span>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString('ar-SA')}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={onView}
            className="text-blue-600 hover:text-blue-900 p-1 rounded"
            title="عرض التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onUpdateVerification(!user.isVerified)}
            className={`p-1 rounded ${
              user.isVerified 
                ? 'text-orange-600 hover:text-orange-900' 
                : 'text-purple-600 hover:text-purple-900'
            }`}
            title={user.isVerified ? 'إلغاء التأكيد' : 'تأكيد الحساب'}
          >
            {user.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => onUpdateStatus(!user.isActive)}
            className={`p-1 rounded ${
              user.isActive 
                ? 'text-red-600 hover:text-red-900' 
                : 'text-green-600 hover:text-green-900'
            }`}
            title={user.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
          >
            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 p-1 rounded"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// مكون تفاصيل المستخدم
function UserDetailsModal({ user, onClose, onUpdate }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">تفاصيل العميل</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">المعلومات الأساسية</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">الاسم</label>
                  <p className="text-gray-800">{user.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
                  <p className="text-gray-800">{user.email || 'غير محدد'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">رقم الهاتف</label>
                  <p className="text-gray-800">{user.phone}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">تاريخ الميلاد</label>
                  <p className="text-gray-800">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">العنوان</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">الشارع</label>
                  <p className="text-gray-800">{user.address?.street || 'غير محدد'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">المدينة</label>
                  <p className="text-gray-800">{user.address?.city || 'غير محدد'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">المحافظة</label>
                  <p className="text-gray-800">{user.address?.state || 'غير محدد'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">الرمز البريدي</label>
                  <p className="text-gray-800">{user.address?.zipCode || 'غير محدد'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">الإحصائيات</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user.stats?.totalOrders || 0}</div>
                <div className="text-sm text-blue-600">إجمالي الطلبات</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(user.stats?.totalSpent || 0).toLocaleString('en-US')}
                </div>
                <div className="text-sm text-green-600">إجمالي المبلغ (جنيه)</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(user.stats?.averageOrderValue || 0).toLocaleString('en-US')}
                </div>
                <div className="text-sm text-purple-600">متوسط قيمة الطلب</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{user.stats?.pendingOrders || 0}</div>
                <div className="text-sm text-orange-600">الطلبات المعلقة</div>
              </div>
            </div>
          </div>

          {/* Cart & Wishlist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">السلة الحالية ({user.cart?.length || 0})</h3>
              {user.cart && user.cart.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {user.cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item.item?.name || 'منتج محذوف'}</span>
                      <span className="text-sm font-medium">
                        {item.quantity} × {item.price} جنيه
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">السلة فارغة</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">المفضلة ({user.wishlist?.length || 0})</h3>
              {user.wishlist && user.wishlist.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {user.wishlist.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.sellingPrice} جنيه</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد منتجات مفضلة</p>
              )}
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 space-x-reverse p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
        
      </div>
    </div>
  );
}

// مكون إنشاء مستخدم جديد
function CreateUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subscriber/shop-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('تم إنشاء العميل بنجاح');
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'حدث خطأ في إنشاء العميل');
      }
    } catch (error) {
      console.error('خطأ في إنشاء العميل:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">إضافة عميل جديد</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="6 أحرف على الأقل"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">العنوان</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الشارع والحي
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData, 
                  address: {...formData.address, street: e.target.value}
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء العميل'}
            </button>
          </div>
          
        </form>
        
      </div>
    </div>
  );
}