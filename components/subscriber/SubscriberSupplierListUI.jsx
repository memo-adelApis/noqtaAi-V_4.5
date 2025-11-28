"use client";

import { useRouter } from "next/navigation";
import { Truck, Printer, DollarSign, ArrowDown, ArrowUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ تنسيق احترافي للأرقام المالية
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// ⭐ المكون الرئيسي
export default function SubscriberSupplierListUI({ initialSuppliers = [] }) {
  const router = useRouter();

  // ➤ عند الضغط على الصف → الانتقال لصفحة المورد
  const handleRowClick = (supplierId) => {
    router.push(`/subscriber/dashboard/suppliers/${supplierId}`);
  };

  // ➤ زر طباعة كل الموردين
  const handlePrintAll = () => {
    toast.info("جاري تجهيز تقرير جميع الموردين للطباعة...");
  };

  // ➤ حساب الإجماليات (نستخدم الحقل balnce لأن ملفك يستخدمه)
  const totalSupplied = initialSuppliers.reduce(
    (acc, s) => acc + (Number(s.suply) || 0),
    0
  );
  const totalPaid = initialSuppliers.reduce(
    (acc, s) => acc + (Number(s.pay) || 0),
    0
  );
  const totalBalance = initialSuppliers.reduce(
    (acc, s) => acc + (Number(s.balnce) || 0),
    0
  );

  return (
    <div className="space-y-6" dir="rtl">
      <ToastContainer position="top-center" />

      {/* العنوان وزر الطباعة */}
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">تقرير الموردين (المشترك)</h1>
        <button
          onClick={handlePrintAll}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center shadow-md"
        >
          <Printer size={18} className="ml-2" />
          طباعة تقرير إجمالي الموردين
        </button>
      </div>

      {/* بطاقات الإجماليات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* إجمالي التوريد */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <ArrowUp size={24} className="text-blue-500 ml-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">إجمالي التوريد (المشتريات)</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSupplied)} ج.م</div>
            </div>
          </div>
        </div>

        {/* إجمالي المدفوع */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <ArrowDown size={24} className="text-green-500 ml-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">إجمالي المدفوع للموردين</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)} ج.م</div>
            </div>
          </div>
        </div>

        {/* الرصيد المتبقي */}
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <DollarSign size={24} className="text-red-500 ml-3" />
            <div>
              <div className="text-sm font-medium text-gray-500">الرصيد المتبقي (لصالح الموردين)</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)} ج.م</div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول الموردين */}
      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        {initialSuppliers.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المورد</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفرع</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي التوريد</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدفوع</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد المتبقي</th>
              </tr>
            </thead><tbody className="bg-white divide-y divide-gray-200">
              {initialSuppliers.map((supplier) => (
                <tr
                  key={supplier._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(supplier._id)}
                >
                  {/* الاسم والتفاصيل */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-xs text-gray-500">{supplier.details?.contact || "لا يوجد اتصال"}</div>
                  </td>

                  {/* الفرع */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{supplier.branchId?.name || "N/A"}</td>

                  {/* توريد */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">{formatCurrency(supplier.suply)} ج.م</td>

                  {/* مدفوع */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(supplier.pay)} ج.م</td>

                  {/* رصيد */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-600">{formatCurrency(supplier.balnce)} ج.م</td>
                </tr>
              ))}
            </tbody></table>
        ) : (
          <div className="text-center text-gray-500 p-8">
            <Truck size={48} className="mx-auto mb-4 text-gray-300" />
            <p>لا يوجد موردين تابعين لك حتى الآن.</p>
          </div>
        )}
      </div>
    </div>
  );
}
