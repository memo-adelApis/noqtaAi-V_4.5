import Link from 'next/link';
import { getSubuserDashboardData } from '@/app/actions/dashboardActions';
import DashboardChart from '@/components/subuser/DashboardChart';
import StatCards from '@/components/subuser/StatCards';

// --- صفحة لوحة التحكم (Server Component) ---
export default async function SubuserHomePage() {
    const { data, error } = await getSubuserDashboardData();

    if (error || !data) {
        return (
            <div className="p-6 bg-red-100 text-red-700 rounded-lg">
                <h2 className="font-bold">خطأ في جلب البيانات</h2>
                <p>{error || "لم نتمكن من جلب بيانات لوحة التحكم."}</p>
            </div>
        );
    }

    const { stats, recentInvoices, chartData } = data;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-100">لوحة التحكم (الفرع)</h1>

            {/* 1. الإحصائيات السريعة (مكون منفصل) */}
            <StatCards stats={stats} />

            {/* 2. الإجراءات السريعة */}
            <div className="flex space-x-4 rtl:space-x-reverse">
                <Link href="/subuser/invoices/add" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    + إضافة فاتورة جديدة
                </Link>
                <Link href="/subuser/customers/add" className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-50 border transition-colors">
                    + إضافة عميل جديد
                </Link>
            </div>

            {/* 3. الأقسام الرئيسية (الرسم البياني وأحدث الفواتير) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* الرسم البياني (يحتاج مكون Client) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4">الأداء (آخر 7 أيام)</h3>
                    <div className="h-80">
                        {/* هذا المكون "use client" */}
                        <DashboardChart data={chartData} />
                    </div>
                </div>

                {/* أحدث الفواتير */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md space-y-4">
                    <h3 className="text-xl font-semibold mb-4">أحدث الفواتير</h3>
                    {recentInvoices.length === 0 && (
                        <p className="text-gray-500">لا توجد فواتير لعرضها.</p>
                    )}
                    <ul className="divide-y divide-gray-200">
                        {recentInvoices.map((invoice) => (
                            <li key={invoice._id} className="py-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {invoice.type === 'revenue' 
                                                ? invoice.customerId?.name || 'عميل محذوف'
                                                : invoice.supplierId?.name || 'مورد محذوف'
                                            }
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(invoice.createdAt).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-semibold ${invoice.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                            {invoice.totalInvoice.toLocaleString()}
                                        </p>
                                        <p className={`text-xs px-2 py-0.5 rounded-full ${
                                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {invoice.status === 'paid' ? 'مدفوعة' : 'معلقة'}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}