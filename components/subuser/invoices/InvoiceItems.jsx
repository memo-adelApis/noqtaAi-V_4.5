"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, Box, Package, Tag, Warehouse } from 'lucide-react';
import UIButton from '@/components/ui/UIButton';
import { searchProducts, getCategories } from '@/app/actions/invoiceActions';
import { getBranchStores } from '@/app/actions/storeActions';
import CategoryModal from '@/components/subuser/categories/CategoryModal';
import QuickStoreModal from '@/components/subuser/stores/QuickStoreModal';

export default function InvoiceItems({ 
    items, onAddItem, onRemoveItem, currency, initialData,
    currentItem, onCurrentItemChange, invoiceType = 'revenue' // نوع الفاتورة
}) {
    // --- منطق البحث (Autocomplete) ---
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const wrapperRef = useRef(null);

    // --- إدارة نافذة إضافة الفئة ---
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    
    // --- إدارة نافذة إضافة المخزن ---
    const [showStoreModal, setShowStoreModal] = useState(false);

    // جلب الفئات والمخازن عند تحميل المكون
    useEffect(() => {
        const fetchData = async () => {
            // جلب الفئات
            const categoriesResult = await getCategories();
            if (categoriesResult.success) {
                setCategories(categoriesResult.data);
            }

            // استخدام المخازن من initialData بدلاً من جلبها مرة أخرى
            if (initialData?.stores) {
                setStores(initialData.stores);
            }
        };
        fetchData();
    }, [initialData]);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // تنفيذ البحث عند الكتابة
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsSearching(true);
                const results = await searchProducts(query);
                setSuggestions(results);
                setIsSearching(false);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // عند اختيار منتج من القائمة
    const handleSelectProduct = (product) => {
        onCurrentItemChange({ target: { name: 'name', value: product.name } });
        onCurrentItemChange({ target: { name: 'itemId', value: product._id } });
        onCurrentItemChange({ target: { name: 'sku', value: product.sku || '' } });
        onCurrentItemChange({ target: { name: 'description', value: product.description || '' } });
        
        // تعيين السعر حسب نوع الفاتورة
        if (invoiceType === 'expense') {
            // فاتورة شراء - استخدم سعر الشراء أو اتركه فارغ للإدخال اليدوي
            onCurrentItemChange({ target: { name: 'price', value: product.purchasePrice || 0 } });
        } else {
            // فاتورة بيع - استخدم سعر البيع
            onCurrentItemChange({ target: { name: 'price', value: product.sellingPrice || 0 } });
        }
        
        onCurrentItemChange({ target: { name: 'storeId', value: product.storeId || "" } });
        onCurrentItemChange({ target: { name: 'unit', value: product.unit || "" } });
        onCurrentItemChange({ target: { name: 'categoryId', value: product.categoryId || "" } });
        
        setQuery(product.name);
        setShowSuggestions(false);
    };

    // تحديث حقل الاسم اليدوي (في حالة منتج جديد)
    const handleNameChange = (e) => {
        setQuery(e.target.value);
        onCurrentItemChange(e);
    };

    // إضافة فئة جديدة
    const handleAddCategory = () => {
        setShowCategoryModal(true);
    };

    // إضافة مخزن جديد
    const handleAddStore = () => {
        setShowStoreModal(true);
    };

    // عند حفظ فئة جديدة
    const handleCategorySaved = async (newCategory) => {
        // إعادة جلب الفئات لتحديث القائمة
        const categoriesResult = await getCategories();
        if (categoriesResult.success) {
            setCategories(categoriesResult.data);
            // تحديد الفئة الجديدة تلقائياً
            onCurrentItemChange({ target: { name: 'categoryId', value: newCategory._id } });
        }
        setShowCategoryModal(false);
    };

    // عند حفظ مخزن جديد
    const handleStoreSaved = async (newStore) => {
        // إضافة المخزن الجديد للقائمة المحلية
        const updatedStores = [...stores, {
            _id: newStore._id,
            name: newStore.name,
            description: newStore.description || '',
            location: newStore.location || '',
            isActive: true
        }];
        setStores(updatedStores);
        
        // تحديد المخزن الجديد تلقائياً
        onCurrentItemChange({ target: { name: 'storeId', value: newStore._id } });
        setShowStoreModal(false);
    };

    const handleAddItemWrapper = () => {
        // التحقق من الحقول المطلوبة
        if (!currentItem.name || !currentItem.price || !currentItem.quantity) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        // للشراء، التحقق من وجود الفئة والمخزن
        if (invoiceType === 'expense') {
            if (!currentItem.categoryId) {
                alert('يرجى اختيار فئة المنتج');
                return;
            }
            if (!currentItem.storeId) {
                alert('يرجى اختيار المخزن');
                return;
            }
        }

        // للبيع، التحقق من توفر الكمية
        if (invoiceType === 'revenue') {
            const selectedProduct = suggestions.find(p => p._id === currentItem.itemId);
            if (selectedProduct && selectedProduct.quantity < currentItem.quantity) {
                alert(`الكمية المتوفرة: ${selectedProduct.quantity} فقط`);
                return;
            }
        }

        onAddItem();
        setQuery("");
    };

    return (
        <div className="bg-gray-900 p-5 rounded-2xl shadow-xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Box size={20} className="text-blue-400"/> 
                الأصناف {invoiceType === 'expense' ? '(شراء)' : '(بيع)'}
            </h3>
            
            {/* فورم إضافة صنف */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 items-end">
                
                {/* حقل البحث عن المنتج */}
                <div className="md:col-span-3 relative" ref={wrapperRef}>
                    <label className="text-xs text-gray-400 mb-1 block">
                        {invoiceType === 'expense' ? 'اسم المنتج الجديد أو البحث' : 'البحث عن المنتج'}
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="name" 
                            value={query} 
                            onChange={handleNameChange}
                            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                            placeholder={invoiceType === 'expense' ? "اسم المنتج الجديد..." : "ابحث عن منتج موجود..."} 
                            className="w-full p-2 pl-8 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            autoComplete="off"
                        />
                        <Search size={16} className="absolute left-2.5 top-3 text-gray-400" />
                    </div>

                    {/* قائمة الاقتراحات */}
                    {showSuggestions && (
                        <ul className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-md shadow-xl mt-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                            {isSearching ? (
                                <li className="p-3 text-center text-sm text-gray-400">جاري البحث...</li>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((prod) => (
                                    <li 
                                        key={prod._id} 
                                        onClick={() => handleSelectProduct(prod)}
                                        className="p-2.5 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors group"
                                    >
                                        <div className="font-medium text-white group-hover:text-blue-400">{prod.name}</div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>السعر: {invoiceType === 'expense' ? prod.purchasePrice : prod.sellingPrice}</span>
                                            <span className={prod.quantity > 0 ? "text-green-400" : "text-red-400"}>
                                                المتوفر: {prod.quantity}
                                            </span>
                                        </div>
                                        {prod.sku && <div className="text-xs text-gray-500 mt-1">SKU: {prod.sku}</div>}
                                    </li>
                                ))
                            ) : (
                                <li className="p-3 text-center text-sm text-gray-400">
                                    {invoiceType === 'expense' ? 
                                        'لا توجد نتائج. سيتم إضافته كمنتج جديد' : 
                                        'لا توجد منتجات متاحة'
                                    }
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {/* الفئة (للشراء فقط) */}
                {invoiceType === 'expense' && (
                    <div className="md:col-span-2">
                        <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                            <Tag size={12} />
                            الفئة *
                        </label>
                        <div className="flex gap-1">
                            <select 
                                name="categoryId" 
                                value={currentItem.categoryId || ''} 
                                onChange={onCurrentItemChange} 
                                className="flex-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">اختر الفئة</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>{category.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                                title="إضافة فئة جديدة"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* المخزن (للشراء فقط) */}
                {invoiceType === 'expense' && (
                    <div className="md:col-span-2">
                        <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                            <Warehouse size={12} />
                            المخزن *
                        </label>
                        <div className="flex gap-1">
                            <select 
                                name="storeId" 
                                value={currentItem.storeId || ''} 
                                onChange={onCurrentItemChange} 
                                className="flex-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">اختر المخزن</option>
                                {stores.map(store => (
                                    <option key={store._id} value={store._id}>{store.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddStore}
                                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                                title="إضافة مخزن جديد"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* السعر */}
                <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">
                        {invoiceType === 'expense' ? 'سعر الشراء' : 'سعر البيع'}
                    </label>
                    <input 
                        type="number" name="price" 
                        value={currentItem.price || ''} 
                        onChange={onCurrentItemChange} 
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* الكمية */}
                <div className="md:col-span-1">
                    <label className="text-xs text-gray-400 mb-1 block">الكمية</label>
                    <input 
                        type="number" name="quantity" 
                        value={currentItem.quantity || ''} 
                        onChange={onCurrentItemChange} 
                        placeholder="1"
                        min="1"
                        step="1"
                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                {/* الوحدة */}
                <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">الوحدة</label>
                    <div className="flex gap-1">
                        <select 
                            name="unit" 
                            value={currentItem.unit || ''} 
                            onChange={onCurrentItemChange} 
                            className="flex-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">اختر</option>
                            {initialData?.units?.map(unit => (
                                <option key={unit._id} value={unit._id}>{unit.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => alert('سيتم إضافة نافذة إضافة الوحدات قريباً')}
                            className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                            title="إضافة وحدة جديدة"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* زر الإضافة */}
                <div className="md:col-span-12 flex justify-end mt-2">
                    <UIButton
                        onClick={handleAddItemWrapper}
                        label={`إضافة ${invoiceType === 'expense' ? 'للمشتريات' : 'للمبيعات'}`}
                        icon={Plus}
                        gradientFrom="blue-600"
                        gradientTo="blue-700"
                        className="text-white w-full md:w-auto px-6"
                    />
                </div>
            </div>

            {/* جدول الأصناف المضافة */}
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المنتج</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المخزن</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">سعر الوحدة</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الكمية</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الإجمالي</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                                    السلة فارغة.. ابدأ بإضافة المنتجات من الأعلى
                                </td>
                            </tr>
                        )}
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-800 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="font-medium text-white">{item.name}</div>
                                    {item.sku && <div className="text-xs text-gray-400">SKU: {item.sku}</div>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{item.storeName || '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{(Number(item.price) || 0).toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                    {Number(item.quantity)} {item.unitName && <span className="text-xs text-gray-500">({item.unitName})</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-400">{(item.price * item.quantity).toLocaleString()} {currency}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-900/30"
                                        title="حذف الصنف"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* نافذة إضافة فئة */}
            {showCategoryModal && (
                <CategoryModal
                    mode="create"
                    category={null}
                    categories={categories}
                    onClose={() => setShowCategoryModal(false)}
                    onSave={handleCategorySaved}
                />
            )}

            {/* نافذة إضافة مخزن */}
            {showStoreModal && (
                <QuickStoreModal
                    onClose={() => setShowStoreModal(false)}
                    onSave={handleStoreSaved}
                />
            )}
        </div>
    );
}