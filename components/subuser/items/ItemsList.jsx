"use client";

import { useState, useEffect } from 'react';
import { Package, Search, Filter, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { getAllItems } from '@/app/actions/invoiceActions';

export default function ItemsList() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // تحميل الأصناف
    useEffect(() => {
        loadItems();
    }, []);

    // تطبيق الفلاتر
    useEffect(() => {
        applyFilters();
    }, [items, searchQuery, statusFilter]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const result = await getAllItems();
            if (result.success) {
                setItems(result.data);
            } else {
                console.error('Error loading items:', result.error);
            }
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...items];

        // فلتر البحث
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.sku?.toLowerCase().includes(query)
            );
        }

        // فلتر الحالة
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        setFilteredItems(filtered);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-EG').format(amount || 0);
    };

    const getStockStatus = (item) => {
        if (item.quantity_Remaining <= 0) {
            return { text: 'نفد المخزون', color: 'text-red-600 bg-red-50' };
        } else if (item.quantity_Remaining <= 10) {
            return { text: 'مخزون قليل', color: 'text-yellow-600 bg-yellow-50' };
        } else {
            return { text: 'متوفر', color: 'text-green-600 bg-green-50' };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="mr-3 text-gray-600">جاري تحميل الأصناف...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* رأس الصفحة */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="text-blue-600" size={28} />
                        إدارة الأصناف
                    </h1>
                    <p className="text-gray-600 mt-1">عرض وإدارة جميع الأصناف في المخزون</p>
                </div>
            </div>

            {/* شريط البحث والفلاتر */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* البحث */}
                    <div className="relative">
                        <Search size={18} className="absolute right-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث في الأصناف..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* فلتر الحالة */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                    </select>

                    {/* عدد النتائج */}
                    <div className="flex items-center text-sm text-gray-600">
                        <Filter size={16} className="ml-2" />
                        {filteredItems.length} من {items.length} صنف
                    </div>
                </div>
            </div>

            {/* جدول الأصناف */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أصناف</h3>
                        <p className="text-gray-500 mb-4">
                            {items.length === 0 ? 'لم يتم إضافة أي أصناف بعد' : 'لا توجد أصناف تطابق معايير البحث'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الصنف
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الفئة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المخزن
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الأسعار
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المخزون
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map((item) => {
                                    const stockStatus = getStockStatus(item);
                                    return (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            
                                            {/* معلومات الصنف */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.name}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                    {item.sku && (
                                                        <div className="text-xs text-blue-600 font-mono">
                                                            SKU: {item.sku}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* الفئة */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.category?.name || '-'}
                                            </td>

                                            {/* المخزن */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.store?.name || '-'}
                                            </td>

                                            {/* الأسعار */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="text-gray-900">
                                                        شراء: {formatCurrency(item.purchasePrice)}
                                                    </div>
                                                    <div className="text-gray-600">
                                                        بيع: {formatCurrency(item.sellingPrice)}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* المخزون */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        متبقي: {item.quantity_Remaining}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        مضاف: {item.quantity_added} | مصروف: {item.quantity_spent}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* الحالة */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                    {stockStatus.text}
                                                </span>
                                            </td>

                                            {/* الإجراءات */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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