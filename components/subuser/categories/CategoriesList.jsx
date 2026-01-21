"use client";

import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Search, Filter, Tag, Package, Image as ImageIcon } from 'lucide-react';
import CategoryModal from './CategoryModal';
import SeedCategoriesButton from './SeedCategoriesButton';
import { getAllCategories, deleteCategory, toggleCategoryStatus } from '@/app/actions/categoryActions';

export default function CategoriesList() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [parentFilter, setParentFilter] = useState('all');
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create, edit, view
    const [selectedCategory, setSelectedCategory] = useState(null);

    // تحميل الفئات
    useEffect(() => {
        loadCategories();
    }, []);

    // تطبيق الفلاتر
    useEffect(() => {
        applyFilters();
    }, [categories, searchQuery, statusFilter, parentFilter]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const result = await getAllCategories();
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...categories];

        // فلتر البحث
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(cat => 
                cat.name.toLowerCase().includes(query) ||
                cat.description?.toLowerCase().includes(query) ||
                cat.slug?.toLowerCase().includes(query)
            );
        }

        // فلتر الحالة
        if (statusFilter !== 'all') {
            filtered = filtered.filter(cat => 
                statusFilter === 'active' ? cat.isActive : !cat.isActive
            );
        }

        // فلتر النوع (رئيسية/فرعية)
        if (parentFilter !== 'all') {
            filtered = filtered.filter(cat => 
                parentFilter === 'main' ? !cat.parentId : cat.parentId
            );
        }

        setFilteredCategories(filtered);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleView = (category) => {
        setSelectedCategory(category);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleDelete = async (category) => {
        if (window.confirm(`هل أنت متأكد من حذف الفئة "${category.name}"؟`)) {
            const result = await deleteCategory(category._id);
            if (result.success) {
                loadCategories();
                alert(result.message);
            } else {
                alert(result.error);
            }
        }
    };

    const handleToggleStatus = async (category) => {
        const result = await toggleCategoryStatus(category._id);
        if (result.success) {
            loadCategories();
        } else {
            alert(result.error);
        }
    };

    const handleModalSave = (savedCategory) => {
        loadCategories();
    };

    const getParentCategoryName = (parentId) => {
        const parent = categories.find(cat => cat._id === parentId);
        return parent ? parent.name : '';
    };

    const getSubcategoriesCount = (categoryId) => {
        return categories.filter(cat => cat.parentId === categoryId).length;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="mr-3 text-gray-600">جاري تحميل الفئات...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* رأس الصفحة */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Tag className="text-blue-600" size={28} />
                        إدارة الفئات
                    </h1>
                    <p className="text-gray-600 mt-1">إدارة فئات المنتجات والتصنيفات</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <SeedCategoriesButton onCategoriesUpdated={loadCategories} />
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        إضافة فئة جديدة
                    </button>
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
                            placeholder="البحث في الفئات..."
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
                        <option value="active">نشطة</option>
                        <option value="inactive">غير نشطة</option>
                    </select>

                    {/* فلتر النوع */}
                    <select
                        value={parentFilter}
                        onChange={(e) => setParentFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">جميع الأنواع</option>
                        <option value="main">فئات رئيسية</option>
                        <option value="sub">فئات فرعية</option>
                    </select>

                    {/* عدد النتائج */}
                    <div className="flex items-center text-sm text-gray-600">
                        <Filter size={16} className="ml-2" />
                        {filteredCategories.length} من {categories.length} فئة
                    </div>
                </div>
            </div>

            {/* جدول الفئات */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                        <Tag size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فئات</h3>
                        <p className="text-gray-500 mb-4">
                            {categories.length === 0 ? 'ابدأ بإضافة فئة جديدة' : 'لا توجد فئات تطابق معايير البحث'}
                        </p>
                        {categories.length === 0 && (
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={18} />
                                إضافة فئة جديدة
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الفئة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        النوع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الفئات الفرعية
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        تاريخ الإنشاء
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCategories.map((category) => (
                                    <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                                        
                                        {/* معلومات الفئة */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {category.image ? (
                                                        <img
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                            src={category.image}
                                                            alt={category.name}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                            <ImageIcon size={20} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mr-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {category.name}
                                                    </div>
                                                    {category.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {category.description}
                                                        </div>
                                                    )}
                                                    {category.slug && (
                                                        <div className="text-xs text-blue-600 font-mono">
                                                            /{category.slug}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* النوع */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.parentId ? (
                                                <div className="text-sm text-gray-900">
                                                    <span className="text-gray-500">فرعية من:</span>
                                                    <br />
                                                    <span className="font-medium">
                                                        {getParentCategoryName(category.parentId)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    فئة رئيسية
                                                </span>
                                            )}
                                        </td>

                                        {/* الفئات الفرعية */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {!category.parentId && (
                                                <div className="flex items-center">
                                                    <Package size={16} className="text-gray-400 ml-1" />
                                                    {getSubcategoriesCount(category._id)} فئة فرعية
                                                </div>
                                            )}
                                        </td>

                                        {/* الحالة */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(category)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                    category.isActive
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {category.isActive ? (
                                                    <>
                                                        <ToggleRight size={14} className="ml-1" />
                                                        نشطة
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft size={14} className="ml-1" />
                                                        غير نشطة
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        {/* تاريخ الإنشاء */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(category.createdAt).toLocaleDateString('ar-EG')}
                                        </td>

                                        {/* الإجراءات */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(category)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
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

            {/* Modal */}
            {modalOpen && (
                <CategoryModal
                    mode={modalMode}
                    category={selectedCategory}
                    categories={categories}
                    onClose={() => setModalOpen(false)}
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
}