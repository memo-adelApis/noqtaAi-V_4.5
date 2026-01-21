"use client";

import { useState, useEffect, useRef } from "react";
import { searchCustomers, searchSuppliers } from "@/app/actions/searchActions";
import { User, Truck, Search } from "lucide-react";

export default function EntitySearch({ invoiceType, selectedEntity, onSelectEntity }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // ✅ هذا المرجع لمنع البحث عند الاختيار
    const isSelectionRef = useRef(false);

    const label = invoiceType === "revenue" ? "العميل" : "المورد";
    const placeholder = invoiceType === "revenue" ? "ابحث عن عميل..." : "ابحث عن مورد...";
    const Icon = invoiceType === "revenue" ? User : Truck;
    const action = invoiceType === "revenue" ? searchCustomers : searchSuppliers;

    // تصفير عند تغيير نوع الفاتورة
    useEffect(() => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
    }, [invoiceType]);

    // منطق البحث مع Debounce
    useEffect(() => {
        // ✅ إذا كان التغيير ناتجاً عن اختيار، لا تبحث
        if (isSelectionRef.current) {
            isSelectionRef.current = false; // إعادة تعيينه للمرة القادمة
            return;
        }

        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            const res = await action(query);
            if (!res?.error) {
                setResults(res);
                setIsOpen(true);
            }
            setIsLoading(false);
        }, 350);

        return () => clearTimeout(timer);
    }, [query, action]);

    const handleSelect = (entity) => {
        // ✅ نرفع العلم لنخبر الـ useEffect ألا يبحث
        isSelectionRef.current = true;
        
        onSelectEntity(entity);
        setQuery(entity.name);
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" dir="rtl">
            <label className="block text-sm font-medium text-gray-300 mb-1">{label} *</label>

            {/* حقل البحث */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        // نفتح القائمة فقط إذا كان المستخدم يكتب
                        if (!isOpen) setIsOpen(true); 
                    }}
                    placeholder={placeholder}
                    className="
                        w-full 
                        pr-12 
                        pl-3
                        py-2.5 
                        border border-gray-700 
                        rounded-lg 
                        bg-gray-800
                        text-white
                        placeholder-gray-500
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        transition-all
                    "
                    autoComplete="off"
                />

                {/* أيقونة البحث */}
                <div className="
                    absolute right-2 top-1/2 -translate-y-1/2 
                    bg-gray-700 
                    border border-gray-600 
                    w-8 h-8 
                    rounded-md 
                    flex items-center justify-center
                ">
                    <Search size={18} className="text-gray-400" />
                </div>
            </div>

            {isLoading && (
                <p className="text-xs text-gray-400 mt-1">جاري البحث...</p>
            )}

            {/* القائمة المنسدلة */}
            {isOpen && results.length > 0 && (
                <ul className="
                    absolute bg-gray-800 w-full border border-gray-700 rounded-lg shadow-xl mt-1 z-50 
                    max-h-64 overflow-auto animate-fadeIn
                ">
                    {results.map((item) => (
                        <li
                            key={item._id}
                            onClick={() => handleSelect(item)}
                            className="
                                p-2.5 flex items-center 
                                cursor-pointer 
                                hover:bg-gray-700 
                                transition 
                                text-white
                                border-b border-gray-700 last:border-0
                            "
                        >
                            <Icon size={16} className="ml-2 text-gray-400" />
                            <span className="font-medium">{item.name}</span>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && !isLoading && results.length === 0 && query.length >= 2 && (
                <p className="text-xs mt-1 text-red-400">لا توجد نتائج مطابقة</p>
            )}
        </div>
    );
}