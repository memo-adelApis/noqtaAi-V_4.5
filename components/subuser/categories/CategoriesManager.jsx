"use client";

import { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff, 
    Plus,
    ChevronDown,
    ChevronRight,
    Package,
    Folder,
    FolderOpen
} from 'lucide-react';
import { 
    deleteCategory, 
    toggleCategoryStatus, 
    searchCategories 
} from '@/app/actions/categoryActions';
import CategoryModal from './CategoryModal';

export default function CategoriesManager({ initialCategories, includeInactive }) {
    const [categories, setCategories] = useState(initialCategories);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showInactive, setShowInactive] = useState(includeInactive);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create, edit, view

    // البحث في الفئات
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setCategories(initialCategories);
            return;
        }

        setIsSearching(true);
        const result = await searchCategories(query, { isActive: !showInactive ? true : undefined });
        if (result.success) {
            setCategories(result.data);
        }
        setIsSearching(false);
    };

    // تبديل عرض الفئات غير النشطة
    const toggleShowInactive = () => {
        const newValue = !showInactive;
        setShowInactive(newValue);
        window.location.href = `/subuser/categories?includeInactive=${newValue}`;
    };

    // توسيع/طي الفئة
    const toggleExpanded = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // حذف فئة
    const handleDelete = async (categoryId, categoryName) => {
        if (!confirm(`هل أنت متأكد من حذف الفئة "${categoryName}"؟`)) {
            return;
        }

        const result = await deleteCategory(categoryId);
        if (result.success) {
            setCategories(categories.filter(cat => cat._id !== categoryId));
            alert(result.message);
        } else {
            alert(result.error);
        }
    };

    // تغيير حالة الفئة
    const handleToggleStatus = async (categoryId, categoryName, currentStatus) => {
        const action = currentStatus ? 'إلغاء تفعيل' : 'تفعيل';
        if (!confirm(`هل أنت متأكد من ${action} الفئة "${categoryName}"؟`)) {
            return;
        }

        const result = await toggleCategoryStatus(categoryId);
        if (result.success) {
            setCategories(categories.map(cat => 
                cat._id === categoryId 
                    ? { ...cat, isActive: result.isActive }
                    : cat
            ));
            alert(result.message);
        } else {
            alert(result.error);
        }
    };

    // فتح المودال
    const openModal = (mode, category = null) => {
        setModalMode(mode);
        setSelectedCategory(category);
        setShowModal(true);
    };

    // إغلاق المودال
    const closeModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
    };

    // تحديث الفئات بعد الإضافة/التعديل
    const handleCategoryUpdate = (updatedCategory, isNew = false) => {
        if (isNew) {
            setCategories([...categories, updatedCategory]);
        } else {
            setCategories(categories.map(cat => 
                cat._id === updatedCategory._id ? updatedCategory : cat
            ));
        }
        closeModal();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header with Search and Filters */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="البحث في الفئات..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {isSearching && (
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={toggleShowInactive}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                showInactive 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                        >
                            <Filter size={16} />
                            {showInactive ? 'إخفاء غير النشطة' : 'عرض غير النشطة'}
                        </button>
                        
                        <button
                            onClick={() => openModal('create')}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Plus size={16} />
                            إضافة فئة
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories List */}
            <div className="p-6">
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Folder className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فئات</h3>
                        <p className="text-gray-500 mb-4">ابدأ بإضافة فئة جديدة لتنظيم منتجاتك</p>
                        <button
                            onClick={() => openModal('create')}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Plus size={20} />
                            إضافة فئة جديدة
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <CategoryItem
                                key={category._id}
                                category={category}
                                isExpanded={expandedCategories.has(category._id)}
                                onToggleExpanded={() => toggleExpanded(category._id)}
                                onEdit={() => openModal('edit', category)}
                                onDelete={() => handleDelete(category._id, category.name)}
                                onToggleStatus={() => handleToggleStatus(category._id, category.name, category.isActive)}
                                onView={() => openModal('view', category)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <CategoryModal
                    mode={modalMode}
                    category={selectedCategory}
                    onClose={closeModal}
                    onSave={handleCategoryUpdate}
                    categories={categories}
                />
            )}
        </div>
    );
}

// مكون عنصر الفئة
function CategoryItem({ 
    category, 
    isExpanded, 
    onToggleExpanded, 
    onEdit, 
    onDelete, 
    onToggleStatus, 
    onView,
    level = 0 
}) {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const paddingRight = level * 24;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Main Category */}
            <div 
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    !category.isActive ? 'bg-gray-50 opacity-75' : ''
                }`}
                style={{ paddingRight: `${paddingRight + 16}px` }}
            >
                <div className="flex items-center gap-3 flex-1">
                    {/* Expand/Collapse Button */}
                    {hasSubcategories && (
                        <button
                            onClick={onToggleExpanded}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronDown size={16} className="text-gray-600" />
                            ) : (
                                <ChevronRight size={16} className="text-gray-600" />
                            )}
                        </button>
                    )}

                    {/* Category Icon */}
                    <div className={`p-2 rounded-lg ${category.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {hasSubcategories ? (
                            isExpanded ? (
                                <FolderOpen size={20} className={category.isActive ? 'text-blue-600' : 'text-gray-400'} />
                            ) : (
                                <Folder size={20} className={category.isActive ? 'text-blue-600' : 'text-gray-400'} />
                            )
                        ) : (
                            <Package size={20} className={category.isActive ? 'text-blue-600' : 'text-gray-400'} />
                        )}
                    </div>

                    {/* Category Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${category.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                {category.name}
                            </h3>
                            {!category.isActive && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                    غير نشط
                                </span>
                            )}
                        </div>
                        {category.description && (
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {category.itemsCount !== undefined && (
                                <span>{category.itemsCount} منتج</span>
                            )}
                            {hasSubcategories && (
                                <span>{category.subcategories.length} فئة فرعية</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onView}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                    >
                        <Eye size={16} />
                    </button>
                    
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="تعديل"
                    >
                        <Edit size={16} />
                    </button>
                    
                    <button
                        onClick={onToggleStatus}
                        className={`p-2 rounded-lg transition-colors ${
                            category.isActive 
                                ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={category.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                    >
                        {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Subcategories */}
            {hasSubcategories && isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                    {category.subcategories.map((subcategory) => (
                        <CategoryItem
                            key={subcategory._id}
                            category={subcategory}
                            level={level + 1}
                            isExpanded={false}
                            onToggleExpanded={() => {}}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleStatus={onToggleStatus}
                            onView={onView}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}