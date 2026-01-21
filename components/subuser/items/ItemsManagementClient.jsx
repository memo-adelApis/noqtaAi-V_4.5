"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit, Eye, Image, 
  Package, BarChart3, TrendingUp, AlertTriangle,
  Upload, X, Save, RotateCcw, Settings
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ItemsManagementClient({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [currentPage, searchQuery, selectedCategory]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchQuery,
        category: selectedCategory
      });

      const response = await fetch(`/api/subuser/items?${params}`);
      const data = await response.json();

      if (response.ok) {
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.error || 'فشل في تحميل الأصناف');
      }
    } catch (error) {
      console.error('خطأ في جلب الأصناف:', error);
      toast.error('حدث خطأ في تحميل الأصناف');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/subuser/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error);
    }
  };

  const handleEditItem = (item) => {
    setSelectedItem({
      ...item,
      isVisible: item.isVisible ?? true,
      isFeatured: item.isFeatured ?? false
    });
    setShowEditModal(true);
  };

  const handleSaveItem = async (updatedItem) => {
    try {
      const response = await fetch(`/api/subuser/items/${updatedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: updatedItem.name,
          description: updatedItem.description,
          sellingPrice: updatedItem.sellingPrice,
          minSellingPrice: updatedItem.minSellingPrice,
          isVisible: updatedItem.isVisible,
          isFeatured: updatedItem.isFeatured,
          status: updatedItem.status,
          tags: updatedItem.tags,
          seoTitle: updatedItem.seoTitle,
          seoDescription: updatedItem.seoDescription,
          weight: updatedItem.weight,
          dimensions: updatedItem.dimensions
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم تحديث الصنف بنجاح');
        setShowEditModal(false);
        fetchItems();
      } else {
        toast.error(data.error || 'فشل في تحديث الصنف');
      }
    } catch (error) {
      console.error('خطأ في تحديث الصنف:', error);
      toast.error('حدث خطأ في تحديث الصنف');
    }
  };

  const handleImageUpload = async (itemId, file) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/subuser/items/${itemId}/image`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('تم رفع الصورة بنجاح');
        fetchItems();
        setShowImageModal(false);
      } else {
        toast.error(data.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      toast.error('حدث خطأ في رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  const getStockStatusColor = (item) => {
    if (item.quantity_Remaining <= 0) return 'text-red-300 bg-red-900';
    if (item.quantity_Remaining <= item.minStockLevel) return 'text-yellow-300 bg-yellow-900';
    return 'text-green-300 bg-green-900';
  };

  const getStockStatusText = (item) => {
    if (item.quantity_Remaining <= 0) return 'نفد المخزون';
    if (item.quantity_Remaining <= item.minStockLevel) return 'مخزون منخفض';
    return 'متوفر';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل الأصناف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">إدارة الأصناف</h1>
              <p className="text-gray-300">إدارة وتحديث بيانات أصناف الفرع</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm">
                {items.length} صنف
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث في الأصناف..."
                className="w-full pr-10 pl-4 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {items.map(item => (
            <div key={item._id} className="bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-700">
              {/* Image */}
              <div className="relative h-48 bg-gray-700">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-2 right-2 space-y-1">
                  {!item.isVisible && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      مخفي
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      مميز
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 left-2 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowImageModal(true);
                    }}
                    className="bg-gray-800/80 hover:bg-gray-800 p-2 rounded-full transition-colors"
                    title="إدارة الصور"
                  >
                    <Image className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleEditItem(item)}
                    className="bg-gray-800/80 hover:bg-gray-800 p-2 rounded-full transition-colors"
                    title="تعديل الصنف"
                  >
                    <Edit className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {item.categoryId?.name || 'بدون فئة'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStockStatusColor(item)}`}>
                    {getStockStatusText(item)}
                  </span>
                </div>

                <h3 className="font-semibold text-white mb-2 line-clamp-2">
                  {item.name}
                </h3>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>سعر البيع:</span>
                    <span className="font-medium text-white">{item.sellingPrice?.toLocaleString('en-US')} جنيه</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الكمية المتبقية:</span>
                    <span className="font-medium text-white">{item.quantity_Remaining || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحالة:</span>
                    <span className={`font-medium ${item.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                      {item.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-300">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-600 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-600 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <EditItemModal
          item={selectedItem}
          onSave={handleSaveItem}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Image Modal */}
      {showImageModal && selectedItem && (
        <ImageManagementModal
          item={selectedItem}
          onUpload={handleImageUpload}
          onClose={() => setShowImageModal(false)}
          uploading={uploadingImage}
        />
      )}
    </div>
  );
}
// مكون تعديل الصنف
function EditItemModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState(item);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: parseFloat(value) || 0
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">تعديل الصنف</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  اسم الصنف
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  سعر البيع
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice || ''}
                  onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الوصف
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الحالة
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="discontinued">متوقف</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVisible || false}
                    onChange={(e) => handleChange('isVisible', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-300">ظاهر في المتجر</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-300">منتج مميز</span>
                </label>
              </div>
            </div>

            {/* Physical Properties */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الوزن (كجم)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight || ''}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الطول (سم)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensions?.length || ''}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  العرض (سم)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensions?.width || ''}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الارتفاع (سم)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dimensions?.height || ''}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">تحسين محركات البحث</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  عنوان SEO
                </label>
                <input
                  type="text"
                  value={formData.seoTitle || ''}
                  onChange={(e) => handleChange('seoTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="عنوان محسن لمحركات البحث"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  وصف SEO
                </label>
                <textarea
                  value={formData.seoDescription || ''}
                  onChange={(e) => handleChange('seoDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="وصف محسن لمحركات البحث"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الكلمات المفتاحية (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="كلمة مفتاحية 1, كلمة مفتاحية 2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// مكون إدارة الصور
function ImageManagementModal({ item, onUpload, onClose, uploading }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      onUpload(item._id, file);
    } else {
      toast.error('يرجى اختيار ملف صورة صحيح');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">إدارة صور الصنف</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Current Images */}
            {item.images && item.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">الصور الحالية</h3>
                <div className="grid grid-cols-2 gap-2">
                  {item.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`${item.name} ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">إضافة صورة جديدة</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {uploading ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-300">جاري رفع الصورة...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-300">
                      اسحب الصورة هنا أو 
                      <label className="text-blue-400 hover:text-blue-300 cursor-pointer mx-1">
                        اختر ملف
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelect(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF حتى 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}