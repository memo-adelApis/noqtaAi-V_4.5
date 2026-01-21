"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, Filter, ListFilter } from "lucide-react";

export default function InvoiceFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleFilterChange = useDebouncedCallback((e) => {
        const { name, value } = e.target;
        const params = new URLSearchParams(searchParams);

        params.set("page", "1");

        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }

        router.replace(`${pathname}?${params.toString()}`);
    }, 400);

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm mb-6">
            
            {/* عنوان الفلاتر */}
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Filter size={14} />
                <span>تصفية البيانات</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* حقل البحث */}
                <div className="col-span-1 sm:col-span-2 relative group">
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        name="q"
                        placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                        className="w-full h-11 pr-10 pl-4 text-sm bg-gray-700 border border-gray-600 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-white placeholder:text-gray-400"
                        onChange={handleFilterChange}
                        defaultValue={searchParams.get("q") || ""}
                    />
                </div>

                {/* فلتر الحالة */}
                <div className="relative">
                    <select
                        name="status"
                        onChange={handleFilterChange}
                        defaultValue={searchParams.get("status") || ""}
                        className="w-full h-11 px-4 text-sm bg-gray-700 border border-gray-600 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-white cursor-pointer appearance-none"
                    >
                        <option value="">📋 كل الحالات</option>
                        <option value="pending">⏳ قيد الانتظار</option>
                        <option value="paid">✅ مدفوعة</option>
                        <option value="cancelled">🚫 ملغاة</option>
                        <option value="overdue">⚠️ متأخرة</option>
                    </select>
                    {/* سهم مخصص للقائمة */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ListFilter size={16} />
                    </div>
                </div>

                {/* فلتر النوع */}
                <div className="relative">
                    <select
                        name="type"
                        onChange={handleFilterChange}
                        defaultValue={searchParams.get("type") || ""}
                        className="w-full h-11 px-4 text-sm bg-gray-700 border border-gray-600 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-white cursor-pointer appearance-none"
                    >
                        <option value="">🔄 كل الأنواع</option>
                        <option value="revenue">💰 إيرادات (مبيعات)</option>
                        <option value="expense">💸 مصروفات (مشتريات)</option>
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ListFilter size={16} />
                    </div>
                </div>

            </div>
        </div>
    );
}