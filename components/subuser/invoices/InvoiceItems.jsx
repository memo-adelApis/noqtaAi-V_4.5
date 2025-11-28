"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, Box } from 'lucide-react';
import UIButton from '@/components/ui/UIButton';
import { searchProducts } from '@/app/actions/invoiceActions'; // تأكد من المسار

export default function InvoiceItems({ 
    items, onAddItem, onRemoveItem, currency, initialData,
    currentItem, onCurrentItemChange
}) {
    // --- منطق البحث (Autocomplete) ---
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const wrapperRef = useRef(null);

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
        }, 300); // انتظار 300ms بعد التوقف عن الكتابة

        return () => clearTimeout(timer);
    }, [query]);

    // عند اختيار منتج من القائمة
    const handleSelectProduct = (product) => {
        // تحديث الـ State بالبيانات القادمة من المنتج المختار
        onCurrentItemChange({ target: { name: 'name', value: product.name } });
        onCurrentItemChange({ target: { name: 'price', value: product.price || 0 } }); // تعيين السعر تلقائياً
        onCurrentItemChange({ target: { name: 'storeId', value: product.storeId || "" } }); // تعيين المخزن تلقائياً
        onCurrentItemChange({ target: { name: 'unit', value: product.unit || "" } }); // تعيين الوحدة تلقائياً
        
        setQuery(product.name); // وضع الاسم في الحقل
        setShowSuggestions(false);
    };

    // تحديث حقل الاسم اليدوي (في حالة منتج جديد)
    const handleNameChange = (e) => {
        setQuery(e.target.value);
        onCurrentItemChange(e);
    };

    const handleAddItemWrapper = () => {
        onAddItem();
        setQuery(""); // تصفير البحث بعد الإضافة
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Box size={20} className="text-blue-500"/> الأصناف
            </h3>
            
            {/* 1. فورم إضافة صنف */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 items-end">
                
                {/* حقل البحث عن المنتج (يأخذ مساحة أكبر) */}
                <div className="md:col-span-4 relative" ref={wrapperRef}>
                    <label className="text-xs text-gray-500 mb-1 block">اسم المنتج / البحث</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="name" 
                            value={query} 
                            onChange={handleNameChange}
                            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                            placeholder="ابحث باسم المنتج..." 
                            className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            autoComplete="off"
                        />
                        <Search size={16} className="absolute left-2.5 top-3 text-gray-400" />
                    </div>

                    {/* قائمة الاقتراحات */}
                    {showSuggestions && (
                        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                            {isSearching ? (
                                <li className="p-3 text-center text-sm text-gray-500">جاري البحث...</li>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((prod) => (
                                    <li 
                                        key={prod._id} 
                                        onClick={() => handleSelectProduct(prod)}
                                        className="p-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                                    >
                                        <div className="font-medium text-gray-800 group-hover:text-blue-700">{prod.name}</div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>السعر: {prod.price}</span>
                                            <span className={prod.quantity > 0 ? "text-green-600" : "text-red-500"}>
                                                المتوفر: {prod.quantity}
                                            </span>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="p-3 text-center text-sm text-gray-500">
                                    لا توجد نتائج. <span className="text-xs block mt-1">(سيتم إضافته كمنتج جديد)</span>
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {/* السعر */}
                <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">السعر</label>
                    <input 
                        type="number" name="price" 
                        value={currentItem.price} 
                        onChange={onCurrentItemChange} 
                        placeholder="0.00" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* الكمية */}
                <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">الكمية</label>
                    <input 
                        type="number" name="quantity" 
                        value={currentItem.quantity} 
                        onChange={onCurrentItemChange} 
                        placeholder="1" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                {/* الوحدة */}
                <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">الوحدة</label>
                    <select 
                        name="unit" 
                        value={currentItem.unit} 
                        onChange={onCurrentItemChange} 
                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">اختر</option>
                        {initialData?.units?.map(unit => (
                            <option key={unit._id} value={unit._id}>{unit.name}</option>
                        ))}
                    </select>
                </div>
                
                {/* المخزن */}
                <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">المخزن</label>
                    <select 
                        name="storeId" 
                        value={currentItem.storeId} 
                        onChange={onCurrentItemChange} 
                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">اختر</option>
                        {initialData?.stores?.map(store => (
                            <option key={store._id} value={store._id}>{store.name}</option>
                        ))}
                    </select>
                </div>

                {/* زر الإضافة (يأخذ سطر كامل في الموبايل) */}
                <div className="md:col-span-12 flex justify-end mt-2">
                    <UIButton
                        onClick={handleAddItemWrapper}
                        label="إضافة للقائمة"
                        icon={Plus}
                        gradientFrom="blue-600"
                        gradientTo="blue-700"
                        className="text-white w-full md:w-auto px-6"
                    />
                </div>
            </div>

            {/* 2. جدول الأصناف المضافة */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المخزن</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر الوحدة</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">
                                    السلة فارغة.. ابدأ بإضافة المنتجات من الأعلى
                                </td>
                            </tr>
                        )}
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.storeName || '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{(Number(item.price) || 0).toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {Number(item.quantity)} {item.unitName && <span className="text-xs text-gray-400">({item.unitName})</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">{(item.price * item.quantity).toLocaleString()} {currency}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
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
        </div>
    );
}