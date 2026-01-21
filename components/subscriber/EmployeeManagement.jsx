"use client";

import { useState } from 'react';
import { UserPlus, Edit, Trash2, Eye, EyeOff, Search, Filter, X, Crown, Building, Users, DollarSign, Calculator } from 'lucide-react';
import AddEmployeeForm from './AddEmployeeForm';
import UserActionsButtons from './UserActionsButtons';

export default function EmployeeManagement({ users, branches }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // تعريف الـ functions داخل الـ Client Component
  const getRoleLabel = (role) => {
    const labels = {
      owner: 'مالك',
      manager: 'مدير فرع',
      employee: 'موظف',
      cashier: 'كاشير',
      accountant: 'محاسب',
      supervisor: 'مشرف'
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      owner: Crown,
      manager: Building,
      employee: Users,
      cashier: DollarSign,
      accountant: Calculator,
      supervisor: Eye
    };
    return icons[role] || Users;
  };

  const getRoleColor = (role) => {
    const colors = {
      owner: 'text-purple-400 bg-purple-500/20',
      manager: 'text-green-400 bg-green-500/20',
      employee: 'text-blue-400 bg-blue-500/20',
      cashier: 'text-yellow-400 bg-yellow-500/20',
      accountant: 'text-indigo-400 bg-indigo-500/20',
      supervisor: 'text-orange-400 bg-orange-500/20'
    };
    return colors[role] || 'text-gray-400 bg-gray-500/20';
  };

  // فلترة المستخدمين
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          <EyeOff size={12} className="mr-1" />
          معلق
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
        <Eye size={12} className="mr-1" />
        نشط
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* أزرار التحكم والبحث */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium"
          >
            <UserPlus size={20} />
            {showAddForm ? 'إلغاء' : 'إضافة موظف جديد'}
          </button>
          
          {showAddForm && (
            <span className="text-sm text-gray-400">
              املأ النموذج أدناه لإضافة موظف جديد
            </span>
          )}
        </div>

        {/* البحث والفلاتر */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="البحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-10 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">جميع الأدوار</option>
            <option value="owner">مالك</option>
            <option value="manager">مدير فرع</option>
            <option value="employee">موظف</option>
            <option value="cashier">كاشير</option>
            <option value="accountant">محاسب</option>
            <option value="supervisor">مشرف</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">معلق</option>
          </select>
        </div>
      </div>

      {/* نموذج إضافة موظف */}
      {showAddForm && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="text-blue-500" />
              إضافة موظف جديد
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
          
          <AddEmployeeForm branches={branches} />
        </div>
      )}

      {/* جدول الموظفين */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">قائمة الموظفين</h2>
            <span className="text-sm text-gray-400">
              {filteredUsers.length} من {users.length} موظف
            </span>
          </div>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {users.length === 0 ? 'لا يوجد موظفون' : 'لا توجد نتائج'}
            </h3>
            <p className="text-gray-500 mb-4">
              {users.length === 0 
                ? 'ابدأ بإضافة أول موظف في مؤسستك'
                : 'جرب تغيير معايير البحث أو الفلترة'
              }
            </p>
            {users.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                إضافة موظف جديد
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-4 text-gray-300 font-medium">الموظف</th>
                  <th className="p-4 text-gray-300 font-medium">الدور</th>
                  <th className="p-4 text-gray-300 font-medium">الفرع</th>
                  <th className="p-4 text-gray-300 font-medium">الحالة</th>
                  <th className="p-4 text-gray-300 font-medium">تاريخ الانضمام</th>
                  <th className="p-4 text-gray-300 font-medium text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-800/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{user.name}</h3>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                          <RoleIcon size={14} />
                          {getRoleLabel(user.role)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-sm text-gray-300">
                          {user.branchId?.name || 'غير محدد'}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        {getStatusBadge(user)}
                      </td>
                      
                      <td className="p-4">
                        <span className="text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <UserActionsButtons 
                            userId={user._id} 
                            isActive={user.isActive}
                            user={user}
                            branches={branches}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}