"use client";

import { useState } from "react";
import { Ban, CheckCircle, Trash2, Edit, Key } from "lucide-react";
import { suspendSubUser, activateSubUser, deleteSubUser } from "@/app/actions/subscriberActions";

export default function UserActionsButtons({ userId, isActive, user, branches, onRefresh }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleDelete = async (formData) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }
    await deleteSubUser(formData);
  };

  return (
    <>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setShowEditModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
          title="تعديل المستخدم"
        >
          <Edit size={14} />
        </button>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
          title="تغيير كلمة المرور"
        >
          <Key size={14} />
        </button>

        {isActive ? (
          <form action={suspendSubUser} className="inline">
            <input type="hidden" name="userId" value={userId} />
            <button 
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
              title="تعليق المستخدم"
            >
              <Ban size={14} />
            </button>
          </form>
        ) : (
          <form action={activateSubUser} className="inline">
            <input type="hidden" name="userId" value={userId} />
            <button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
              title="تفعيل المستخدم"
            >
              <CheckCircle size={14} />
            </button>
          </form>
        )}
        
        <form action={handleDelete} className="inline">
          <input type="hidden" name="userId" value={userId} />
          <button 
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
            title="حذف المستخدم"
          >
            <Trash2 size={14} />
          </button>
        </form>
      </div>

      {showEditModal && (
        <EditUserModal
          user={user}
          branches={branches}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          userId={userId}
          userName={user.name}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
}

// Modal لتعديل المستخدم
function EditUserModal({ user, branches, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    branchId: user.branchId?._id || user.branchId || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/subscriber/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('تم تحديث المستخدم بنجاح');
        onSuccess();
      } else {
        const result = await response.json();
        alert(result.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ في التحديث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-semibold">تعديل المستخدم</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">الاسم</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الدور</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
            >
              <option value="owner">👑 مالك</option>
              <option value="manager">👔 مدير فرع</option>
              <option value="employee">👤 موظف</option>
              <option value="cashier">💰 كاشير</option>
              <option value="accountant">📊 محاسب</option>
              <option value="supervisor">🔍 مشرف</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الفرع</label>
            <select
              value={formData.branchId}
              onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">بدون فرع</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'تحديث'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal لتغيير كلمة المرور
function ChangePasswordModal({ userId, userName, onClose }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscriber/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });

      const result = await response.json();

      if (response.ok) {
        alert('تم تغيير كلمة المرور بنجاح');
        onClose();
      } else {
        alert(result.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-semibold">تغيير كلمة المرور</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-400">
              تغيير كلمة المرور لـ: <strong>{userName}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
              minLength={6}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
