"use client";

import { useState, useEffect } from "react";
import { 
  Users, Building, Store, Calendar, CreditCard, Plus, 
  Edit, Trash2, Mail, Eye, EyeOff, AlertTriangle, CheckCircle
} from "lucide-react";
import UsersTab from './UsersTab';
import BranchesTab from './BranchesTab';
import StoresTab from './StoresTab';
import UserModal from './UserModal';
import BranchModal from './BranchModal';
import StoreModal from './StoreModal';

export default function SubscriberDashboardClient({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, branches, stores
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriber/dashboard');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-400">حدث خطأ في تحميل البيانات</div>;
  }

  const daysRemaining = Math.ceil((new Date(data.user.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-blue-500" />
          لوحة المشترك - {data.user.name}
        </h1>
        <p className="text-gray-400 mt-2">
          إدارة شاملة للاشتراك والفروع والمستخدمين والمخازن
        </p>
      </div>

      {/* Subscription Alert */}
      {daysRemaining <= 7 && daysRemaining > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            <h3 className="font-medium text-yellow-400">تنبيه: اشتراكك ينتهي قريباً</h3>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            سينتهي اشتراكك خلال {daysRemaining} أيام. يرجى تجديد الاشتراك.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الأيام المتبقية</p>
              <p className={`text-2xl font-bold mt-1 ${
                daysRemaining > 7 ? 'text-green-400' : 
                daysRemaining > 0 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
              </p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المستخدمين</p>
              <p className="text-2xl font-bold text-white mt-1">{data.users.length}</p>
            </div>
            <Users className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الفروع</p>
              <p className="text-2xl font-bold text-white mt-1">{data.branches.length}</p>
            </div>
            <Building className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المخازن</p>
              <p className="text-2xl font-bold text-white mt-1">{data.stores.length}</p>
            </div>
            <Store className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="border-b border-gray-800">
          <div className="flex gap-4 p-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'users' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              المستخدمين
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'branches' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              الفروع
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'stores' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              المخازن
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab data={data} daysRemaining={daysRemaining} />}
          {activeTab === 'users' && (
            <UsersTab 
              users={data.users} 
              branches={data.branches}
              onAdd={() => { setEditingItem(null); setShowUserModal(true); }}
              onEdit={(user) => { setEditingItem(user); setShowUserModal(true); }}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'branches' && (
            <BranchesTab 
              branches={data.branches}
              onAdd={() => { setEditingItem(null); setShowBranchModal(true); }}
              onEdit={(branch) => { setEditingItem(branch); setShowBranchModal(true); }}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'stores' && (
            <StoresTab 
              stores={data.stores}
              branches={data.branches}
              onAdd={() => { setEditingItem(null); setShowStoreModal(true); }}
              onEdit={(store) => { setEditingItem(store); setShowStoreModal(true); }}
              onRefresh={fetchData}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showUserModal && (
        <UserModal 
          user={editingItem}
          branches={data.branches}
          onClose={() => { setShowUserModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowUserModal(false); setEditingItem(null); fetchData(); }}
        />
      )}

      {showBranchModal && (
        <BranchModal 
          branch={editingItem}
          onClose={() => { setShowBranchModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowBranchModal(false); setEditingItem(null); fetchData(); }}
        />
      )}

      {showStoreModal && (
        <StoreModal 
          store={editingItem}
          branches={data.branches}
          onClose={() => { setShowStoreModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowStoreModal(false); setEditingItem(null); fetchData(); }}
        />
      )}
    </div>
  );
}


// Overview Tab Component
function OverviewTab({ data, daysRemaining }) {
  const getStatusBadge = (status) => {
    const badges = {
      trial: { color: 'bg-blue-500', text: 'فترة تجريبية' },
      active: { color: 'bg-green-500', text: 'نشط' },
      expired: { color: 'bg-red-500', text: 'منتهي' },
      suspended: { color: 'bg-gray-500', text: 'معلق' }
    };
    const badge = badges[status] || badges.trial;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Subscription Info */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="text-blue-500" />
          معلومات الاشتراك
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">الحالة</p>
            <div className="mt-1">{getStatusBadge(data.user.subscriptionStatus)}</div>
          </div>
          <div>
            <p className="text-gray-400 text-sm">النوع</p>
            <p className="text-white font-medium mt-1">
              {data.user.subscriptionType === 'monthly' ? 'شهري' :
               data.user.subscriptionType === 'quarterly' ? 'ربع سنوي' :
               data.user.subscriptionType === 'yearly' ? 'سنوي' : 'غير محدد'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">تاريخ البداية</p>
            <p className="text-white font-medium mt-1">
              {new Date(data.user.subscriptionStart).toLocaleDateString('en-GB')}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">تاريخ الانتهاء</p>
            <p className="text-white font-medium mt-1">
              {new Date(data.user.subscriptionEnd).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
        <a 
          href="/subscriber/subscription"
          className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          تجديد الاشتراك
        </a>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">المستخدمين النشطين</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {data.users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">إجمالي الفروع</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {data.branches.length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">إجمالي المخازن</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">
            {data.stores.length}
          </p>
        </div>
      </div>
    </div>
  );
}
