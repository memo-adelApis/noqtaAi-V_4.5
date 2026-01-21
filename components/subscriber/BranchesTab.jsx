"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Building } from "lucide-react";

export default function BranchesTab({ branches, onAdd, onEdit, onRefresh }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (branchId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟ سيتم حذف جميع البيانات المرتبطة به.')) return;
    
    setDeleting(branchId);
    try {
      const response = await fetch(`/api/subscriber/branches/${branchId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('تم حذف الفرع بنجاح');
        onRefresh();
      } else {
        const result = await response.json();
        alert(result.error || 'حدث خطأ في حذف الفرع');
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('حدث خطأ في حذف الفرع');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">إدارة الفروع</h3>
        <button
          onClick={onAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          إضافة فرع
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Building className="mx-auto mb-4" size={48} />
          <p>لا يوجد فروع</p>
          <button
            onClick={onAdd}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            إضافة أول فرع
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div key={branch._id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building className="text-green-500" size={20} />
                  <h4 className="font-semibold">{branch.name}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(branch)}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="تعديل"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(branch._id)}
                    disabled={deleting === branch._id}
                    className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                    title="حذف"
                  >
                    {deleting === branch._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400">{branch.location || 'لا يوجد موقع محدد'}</p>
              <p className="text-xs text-gray-500 mt-2">
                تاريخ الإنشاء: {new Date(branch.createdAt).toLocaleDateString('en-GB')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
