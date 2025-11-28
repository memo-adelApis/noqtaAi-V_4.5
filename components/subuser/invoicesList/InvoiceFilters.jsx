"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-4">

            {/* حقل البحث */}
            <div className="col-span-1 sm:col-span-2 relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    name="q"
                    placeholder="ابحث برقم أو اسم العميل..."
                    className="w-full border border-gray-300 dark:border-gray-700 text-sm rounded-md py-2.5 pr-9 pl-3 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    onChange={handleFilterChange}
                    defaultValue={searchParams.get("q") || ""}
                />
            </div>

            {/* فلتر الحالة */}
            <select
                name="status"
                onChange={handleFilterChange}
                defaultValue={searchParams.get("status") || ""}
                className="w-full border border-gray-300 dark:border-gray-700 text-sm rounded-md py-2.5 px-3 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
                <option value="">كل الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="paid">مدفوعة</option>
                <option value="cancelled">ملغاة</option>
                <option value="overdue">متأخرة</option>
            </select>

            {/* فلتر النوع */}
            <select
                name="type"
                onChange={handleFilterChange}
                defaultValue={searchParams.get("type") || ""}
                className="w-full border border-gray-300 dark:border-gray-700 text-sm rounded-md py-2.5 px-3 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
                <option value="">كل الأنواع</option>
                <option value="revenue">إيرادات</option>
                <option value="expense">مصروفات</option>
            </select>

            {/* ✨ جاهز لإضافة فلاتر أخرى مثل التاريخ لاحقاً */}
        </div>
    );
}
