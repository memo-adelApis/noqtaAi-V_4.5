"use client";

import { Printer } from "lucide-react";

export default function InvoicePrintButton() {
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            // print:hidden -> هذه الفئة مهمة جداً لإخفاء الزر عند الطباعة
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95 print:hidden font-medium"
        >
            <Printer size={18} />
            <span>طباعة / حفظ PDF</span>
        </button>
    );
}