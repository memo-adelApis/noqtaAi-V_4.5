"use client";

import React, { useState } from "react";
import { Building, MapPin, TrendingUp, DollarSign, Package, ChevronDown, ChevronUp, Box, Loader2 } from "lucide-react";

export default function BranchesClient({ initialBranches }) {
  const [expandedBranch, setExpandedBranch] = useState(null);
  const [storesData, setStoresData] = useState({});
  const [loading, setLoading] = useState({});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0) + ' ج.م';
  };

  const toggleBranch = async (branchId) => {
    if (expandedBranch === branchId) {
      setExpandedBranch(null);
      return;
    }

    setExpandedBranch(branchId);

    // إذا كانت البيانات محملة مسبقاً، لا نحتاج لجلبها مرة أخرى
    if (storesData[branchId]) {
      return;
    }

    // جلب المخازن والمنتجات
    setLoading(prev => ({ ...prev, [branchId]: true }));
    try {
      const response = await fetch(`/api/owner/branches/${branchId}/stores`);
      const data = await response.json();
      
      if (data.success) {
        setStoresData(prev => ({
          ...prev,
          [branchId]: data.stores
        }));
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(prev => ({ ...prev, [branchId]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {initialBranches.map((branch) => {
        const isExpanded = expandedBranch === branch._id;
        const stores = storesData[branch._id] || [];
        const isLoading = loading[branch._id];

        return (
          <div key={branch._id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Branch Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <Building className="text-purple-500" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{branch.name}</h3>
                    {branch.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <MapPin size={14} />
                        <span>{branch.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1 items-end">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                      {branch.invoiceCount} فاتورة
                    </span>
                    {branch.storeCount > 0 && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium flex items-center gap-1">
                        <Package size={12} />
                        {branch.storeCount} مخزن
                      </span>
                    )}
                  </div>
                  
                  {branch.storeCount > 0 && (
                    <button 
                      onClick={() => toggleBranch(branch._id)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition"
                      title={isExpanded ? "إخفاء المخازن" : "عرض المخازن"}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <p className="text-xs text-gray-400 mb-1">الإيرادات</p>
                  <p className="text-sm font-semibold text-green-400">
                    {formatCurrency(branch.totalRevenue)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">المصروفات</p>
                  <p className="text-sm font-semibold text-red-400">
                    {formatCurrency(branch.totalExpenses)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">الربح</p>
                  <p className={`text-sm font-semibold ${
                    branch.profit >= 0 ? 'text-blue-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(branch.profit)}
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded Content - Stores and Items */}
            {isExpanded && (
              <div className="border-t border-gray-800 bg-gray-950/50">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-purple-400" size={32} />
                    <p className="text-gray-400 text-sm">جاري تحميل المخازن...</p>
                  </div>
                ) : stores.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="mx-auto mb-2 text-gray-600" size={32} />
                    <p className="text-gray-400 text-sm">لا توجد مخازن في هذا الفرع</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {stores.map((store) => (
                      <div key={store._id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                        {/* Store Header */}
                        <div className="p-4 bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Package className="text-blue-400" size={18} />
                              <h4 className="font-semibold text-white">{store.name}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">
                                {store.itemCount} صنف
                              </span>
                              <span className="text-green-400 font-semibold">
                                {formatCurrency(store.totalValue)}
                              </span>
                            </div>
                          </div>
                          {store.location && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin size={12} />
                              {store.location}
                            </p>
                          )}
                        </div>

                        {/* Items Table */}
                        {store.items.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-800">
                                <tr>
                                  <th className="text-right p-3 text-gray-300 font-medium">الصنف</th>
                                  <th className="text-right p-3 text-gray-300 font-medium">الكود</th>
                                  <th className="text-right p-3 text-gray-300 font-medium">الكمية</th>
                                  <th className="text-right p-3 text-gray-300 font-medium">السعر</th>
                                  <th className="text-right p-3 text-gray-300 font-medium">القيمة</th>
                                  <th className="text-right p-3 text-gray-300 font-medium">الوحدة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {store.items.map((item) => (
                                  <tr key={item._id} className="border-t border-gray-800 hover:bg-gray-800/30">
                                    <td className="p-3">
                                      <div>
                                        <p className="font-medium text-white">{item.name}</p>
                                        {item.category !== 'غير محدد' && (
                                          <p className="text-xs text-gray-500">{item.category}</p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-3 font-mono text-xs text-gray-400">{item.sku}</td>
                                    <td className="p-3">
                                      <span className={`font-semibold ${
                                        item.quantity > 10 ? 'text-green-400' : 
                                        item.quantity > 0 ? 'text-yellow-400' : 
                                        'text-red-400'
                                      }`}>
                                        {item.quantity}
                                      </span>
                                    </td>
                                    <td className="p-3 text-gray-300">{formatCurrency(item.price)}</td>
                                    <td className="p-3 font-semibold text-blue-400">
                                      {formatCurrency(item.totalValue)}
                                    </td>
                                    <td className="p-3 text-gray-400">{item.unit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <Box className="mx-auto mb-2 text-gray-600" size={24} />
                            <p className="text-gray-500 text-xs">لا توجد أصناف في هذا المخزن</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
