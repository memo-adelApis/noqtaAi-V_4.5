"use client";

import { useState } from "react";
import { Edit, Trash2, Mail, Eye, EyeOff, Plus, CheckCircle, AlertTriangle } from "lucide-react";

export default function UsersTab({ users, branches, onAdd, onEdit, onRefresh }) {
  const [deleting, setDeleting] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null);

  const handleDelete = async (userId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    setDeleting(userId);
    try {
      const response = await fetch(`/api/subscriber/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('تم حذف المستخدم بنجاح');
        onRefresh();
      } else {
        alert('حدث خطأ في حذف المستخدم');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('حدث خطأ في حذف المستخدم');
    } finally {
      setDeleting(null);
    }
  };

  const handleSendPassword = async (userId) => {
    if (!confirm('سيتم إرسال كلمة سر مؤقتة للمستخدم عبر البريد الإلكتروني. هل تريد المتابعة؟')) return;
    
    setSendingEmail(userId);
    try {
      const response = await fetch('/api/subscriber/users/send-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`تم إرسال كلمة السر المؤقتة بنجاح: ${result.tempPassword}`);
      } else {
        alert(result.error || 'حدث خطأ في إرسال البريد');
      }
    } catch (error) {
      console.error('Error sending password:', error);
      alert('حدث خطأ في إرسال البريد');
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">إدارة المستخدمين</h3>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          إضافة مستخدم
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>لا يوجد مستخدمين</p>
          <button
            onClick={onAdd}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            إضافة أول مستخدم
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-right p-3 text-gray-400 font-medium">الاسم</th>
                <th className="text-right p-3 text-gray-400 font-medium">البريد</th>
                <th className="text-right p-3 text-gray-400 font-medium">الدور</th>
                <th className="text-right p-3 text-gray-400 font-medium">الفرع</th>
                <th className="text-right p-3 text-gray-400 font-medium">الحالة</th>
                <th className="text-right p-3 text-gray-400 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3 text-gray-400">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'owner' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.role === 'owner' ? 'مالك' :
                       user.role === 'manager' ? 'مدير' : 'موظف'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">
                    {user.branchId?.name || 'غير محدد'}
                  </td>
                  <td className="p-3">
                    <span className={`flex items-center gap-1 ${
                      user.isActive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {user.isActive ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      {user.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleSendPassword(user._id)}
                        disabled={sendingEmail === user._id}
                        className="text-green-400 hover:text-green-300 p-1 disabled:opacity-50"
                        title="إرسال كلمة سر مؤقتة"
                      >
                        {sendingEmail === user._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                        ) : (
                          <Mail size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deleting === user._id}
                        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                        title="حذف"
                      >
                        {deleting === user._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
