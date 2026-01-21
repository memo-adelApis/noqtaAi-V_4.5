"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Store, Building } from "lucide-react";

export default function StoresTab({ stores, branches, onAdd, onEdit, onRefresh }) {
  const [deleting, setDeleting] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('all');

  const handleDelete = async (storeId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المخزن؟')) return;
    
    setDeleting(storeId);
    try {
      const response = await fetch(`/api/subscriber/stores/${storeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('تم حذف المخزن بنجاح');
        onRefresh();
      } else {
        const result = await response.json();
        alert(result.error || 'حدث خطأ في حذف المخزن');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('حدث خطأ في حذف المخزن');
    } finally {
      setDeleting(null);
    }
  };

  // فلترة المخازن حسب الفرع المختار
  const filteredStores = selectedBranch === 'all' 
    ? stores 
    : stores.filter(s => s.branchId?._id === selectedBranch || s.branchId === selectedBranch);

  // تجميع المخازن حسب الفرع
  const storesByBranch = branches.map(branch => ({
    branch,
    stores: stores.filter(s => 
      (s.branchId?._id || s.branchId) === branch._id
    )
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-semibold">إدارة المخازن</h3>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">جميع الفروع</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          <button
            onClick={onAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            إضافة مخزن
          </button>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Store className="mx-auto mb-4" size={48} />
          <p>لا يوجد مخازن</p>
          <button
            onClick={onAdd}
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
          >
            إضافة أول مخزن
          </button>
        </div>
      ) : (
        <>
          {/* عرض حسب الفرع */}
          {selectedBranch === 'all' ? (
            <div className="space-y-6">
              {storesByBranch.map(({ branch, stores: branchStores }) => (
                <div key={branch._id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
                    <Building className="text-green-500" size={20} />
                    <h4 className="font-semibold text-lg">{branch.name}</h4>
                    <span className="text-sm text-gray-400">({branchStores.length} مخزن)</span>
                  </div>
                  
                  {branchStores.length === 0 ? (
                    <p className="text-gray-400 text-sm">لا يوجد مخازن في هذا الفرع</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {branchStores.map((store) => (
                        <StoreCard 
                          key={store._id} 
                          store={store} 
                          onEdit={onEdit}
                          onDelete={handleDelete}
                          deleting={deleting}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStores.map((store) => (
                <StoreCard 
                  key={store._id} 
                  store={store} 
                  onEdit={onEdit}
                  onDelete={handleDelete}
                  deleting={deleting}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// مكون بطاقة المخزن
function StoreCard({ store, onEdit, onDelete, deleting }) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 hover:border-orange-500/50 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Store className="text-orange-500" size={20} />
          <h4 className="font-semibold">{store.name}</h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(store)}
            className="text-blue-400 hover:text-blue-300 p-1"
            title="تعديل"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(store._id)}
            disabled={deleting === store._id}
            className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
            title="حذف"
          >
            {deleting === store._id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-gray-400 flex items-center gap-2">
          <Building size={14} className="text-green-500" />
          {store.branchId?.name || 'غير محدد'}
        </p>
        {store.location && (
          <p className="text-gray-400">{store.location}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {new Date(store.createdAt).toLocaleDateString('en-GB')}
        </p>
      </div>
    </div>
  );
}
