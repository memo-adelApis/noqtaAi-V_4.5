// المسار: components/ui/Pagination.jsx

"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Pagination({ totalPages, currentPage }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const createPageURL = (pageNumber) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    // (منطق generatePagination و handlePageChange يبقى كما هو)
    const generatePagination = (current, total) => {
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 3) {
            return [1, 2, 3, "...", total - 1, total];
        }
        if (current >= total - 2) {
            return [1, 2, "...", total - 2, total - 1, total];
        }
        return [1, "...", current - 1, current, current + 1, "...", total];
    };

    const allPages = generatePagination(currentPage, totalPages);

    const handlePageChange = (page) => {
        if (typeof page === "number" && page !== currentPage) {
            router.push(createPageURL(page));
        }
    };

    // --- بداية التعديلات على التصميم ---
    return (
        <div className="flex justify-center items-center space-x-2 my-4" dir="ltr">
            
            {/* زر "السابق" */}
            <button
                className="btn btn-ghost btn-sm flex items-center space-x-1 
                           text-gray-300 
                           hover:bg-neutral-700 
                           disabled:bg-transparent disabled:text-neutral-600 
                           transition-colors"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
                <span>السابق</span>
            </button>

            {/* أرقام الصفحات */}
            <div className="join">
                {allPages.map((page, index) => {
                    const isActive = page === currentPage;
                    const isDisabled = typeof page !== "number";

                    return (
                        <button
                            key={index}
                            className={`join-item btn btn-sm transition-colors 
                                ${isActive
                                    ? "btn-primary text-primary-content font-bold" // الزر النشط
                                    : "btn-ghost text-gray-300 hover:bg-neutral-700" // الأزرار العادية
                                }
                                ${isDisabled 
                                    ? "disabled:bg-transparent disabled:text-neutral-600 disabled:cursor-default" // للـ "..."
                                    : ""
                                }
                            `}
                            onClick={() => handlePageChange(page)}
                            disabled={isDisabled}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* زر "التالي" */}
            <button
                 className="btn btn-ghost btn-sm flex items-center space-x-1 
                           text-gray-300 
                           hover:bg-neutral-700 
                           disabled:bg-transparent disabled:text-neutral-600 
                           transition-colors"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                <span>التالي</span>
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}