"use client";

import { useState, useMemo } from 'react';
import { 
    FileText, Building, User, Truck, Filter, X, Printer, Calendar, Hash, 
    DollarSign, ArrowUp, ArrowDown 
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- (1) دوال مساعدة لتنسيق الأرقام (لم تتغير) ---
const formatAsCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatAsNumber = (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString('en-US');
};


// --- (2) مكون مساعد: نافذة تفاصيل الفاتورة (Dark Mode) ---
function InvoiceDetailsModal({ isOpen, onClose, invoice }) {
    if (!isOpen || !invoice) return null;

    const printInvoice = () => {
        const printableArea = document.getElementById('printable-invoice');
        if (printableArea) {
            const originalContents = document.body.innerHTML;
            const printContents = printableArea.innerHTML;
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); 
        }
    };
    
    const source = invoice.type === 'revenue' 
        ? { label: "العميل", name: invoice.customerId?.name || 'N/A', icon: <User size={16} /> }
        : { label: "المورد", name: invoice.supplierId?.name || 'N/A', icon: <Truck size={16} /> };

    return (
        <>
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; background-color: white !important; color: black !important; }
                    /* عند الطباعة نعود للأبيض والأسود */
                    .printable-invoice { 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 0 !important;
                        background-color: white !important;
                        color: black !important;
                    }
                    .printable-invoice * {
                        color: black !important;
                        background-color: transparent !important;
                        border-color: #ddd !important;
                    }
                }
            `}</style>
            
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                {/* خلفية المودال داكنة */}
                <div id="printable-invoice" className="bg-[#1c1d22] border border-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 printable-invoice text-gray-200" dir="rtl">
                    
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700 no-print">
                        <h2 className="text-2xl font-bold text-white">تفاصيل الفاتورة</h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-800 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* المعلومات الأساسية */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-4 bg-[#252830] rounded-lg border border-gray-700/50">
                                <div className="font-semibold text-gray-400 flex items-center mb-1"><Hash size={16} className="ml-1" /> رقم الفاتورة</div>
                                <div className="font-bold text-white">{invoice.invoiceNumber}</div>
                            </div>
                            <div className="p-4 bg-[#252830] rounded-lg border border-gray-700/50">
                                <div className="font-semibold text-gray-400 flex items-center mb-1"><Building size={16} className="ml-1" /> الفرع</div>
                                <div className="font-bold text-white">{invoice.branchId?.name || 'N/A'}</div>
                            </div>
                            <div className="p-4 bg-[#252830] rounded-lg border border-gray-700/50">
                                <div className="font-semibold text-gray-400 flex items-center mb-1"><Calendar size={16} className="ml-1" /> تاريخ الإنشاء</div>
                                <div className="font-bold text-white">{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</div>
                            </div>
                        </div>
                        
                        <div className="border border-gray-700 p-4 rounded-lg bg-[#252830]/50">
                            <h3 className="font-semibold text-lg mb-2 text-blue-400">{source.label}</h3>
                            <div className="flex items-center text-gray-300">
                                {source.icon}
                                <span className="mr-2">{source.name}</span>
                            </div>
                        </div>

                        {/* جدول الأصناف */}
                        <div className="overflow-x-auto rounded-lg border border-gray-700">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">الصنف</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">الكمية</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">السعر</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#1c1d22] divide-y divide-gray-800">
                                    {invoice.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{item.productName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{formatAsNumber(item.quantity)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{formatAsCurrency(item.price)} ج.م</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{formatAsCurrency(item.quantity * item.price)} ج.م</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* الإجماليات */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/3 space-y-2 text-sm bg-[#252830] p-4 rounded-lg border border-gray-700">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">الإجمالي الفرعي:</span>
                                    <span className="font-medium text-white">{formatAsCurrency(invoice.subtotal)} ج.م</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">الضريبة ({invoice.taxRate || 0}%):</span>
                                    <span className="font-medium text-white">{formatAsCurrency(invoice.taxAmount)} ج.م</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2 mt-2">
                                    <span className="text-white">الإجمالي الكلي:</span>
                                    <span className="text-blue-400">{formatAsCurrency(invoice.totalInvoice)} ج.م</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* الأزرار */}
                    <div className="flex justify-end space-x-2 space-x-reverse mt-8 pt-4 border-t border-gray-700 no-print">
                        <button onClick={onClose} className="py-2 px-4 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors">
                            إغلاق
                        </button>
                        <button onClick={printInvoice} className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors shadow-lg shadow-blue-900/20">
                            <Printer size={16} className="ml-1" />
                            طباعة
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// --- (3) مكون: المخطط الخطي المصغر (Dark Mode Tooltip) ---
function SparkLineChart({ data, dataKey, stroke }) {
    
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 p-2 shadow-xl rounded border border-gray-700 text-xs">
                    <p className="font-bold" style={{ color: stroke }}>
                        {`${payload[0].payload.name}: ${formatAsCurrency(payload[0].value)} ج.م`}
                    </p>
                </div>
            );
        }
        return null;
    };
    return (
        <ResponsiveContainer width="100%" height={40}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)'}} />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={stroke}
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// --- (4) مكون: بطاقة الإحصائيات (Dark Mode) ---
function StatCard({ title, value, icon, sparkData, isCurrency = false }) {
    const isPositive = value >= 0;
    // تعديل الألوان لتكون ساطعة على الخلفية الداكنة
    const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400';
    const borderColorClass = isPositive ? 'border-emerald-500' : 'border-red-500';
    const sparkColor = isPositive ? '#34d399' : '#f87171';

    return (
        <div className={`bg-[#1c1d22] p-4 rounded-lg shadow-lg border-l-4 ${borderColorClass} border border-gray-800`}>
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-sm font-medium text-gray-400">{title}</div>
                    <div className={`text-2xl font-bold mt-1 ${colorClass}`}>
                        {isCurrency ? formatAsCurrency(value) : formatAsNumber(value)} 
                        {isCurrency && <span className="text-sm text-gray-500 font-normal mr-1"> ج.م</span>}
                    </div>
                </div>
                <div className="p-3 bg-gray-800 rounded-full text-gray-300">
                    {icon}
                </div>
            </div>
            {sparkData && sparkData.length > 0 && (
                <div className="mt-4 h-10">
                    <SparkLineChart data={sparkData} dataKey="value" stroke={sparkColor} />
                </div>
            )}
        </div>
    );
}

// --- (5) مكون: حاوية كروت الإحصائيات (نفس المنطق) ---
function InvoiceStatsCards({ filteredInvoices }) {
    // ... (نفس منطق الحسابات لم يتغير) ...
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let totalExpense = 0;
        let invoiceCount = filteredInvoices.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        const dailyNet = new Map();

        for (let i = 0; i <= 7; i++) {
            const date = new Date(sevenDaysAgo);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            dailyNet.set(dateString, 0);
        }

        filteredInvoices.forEach(inv => {
            if (inv.type === 'revenue') {
                totalRevenue += inv.totalInvoice;
            } else if (inv.type === 'expense') {
                totalExpense += inv.totalInvoice;
            }

            const invDate = new Date(inv.createdAt);
            if (invDate >= sevenDaysAgo) {
                const dateString = invDate.toISOString().split('T')[0];
                const netAmount = inv.type === 'revenue' ? (inv.totalInvoice || 0) : -(inv.totalInvoice || 0);
                
                if (dailyNet.has(dateString)) {
                        dailyNet.set(dateString, dailyNet.get(dateString) + netAmount);
                }
            }
        });

        const netProfit = totalRevenue - totalExpense;

        const sparklineData = Array.from(dailyNet.entries())
            .map(([date, net]) => ({
                name: new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
                value: net
            }));

        return { totalRevenue, totalExpense, netProfit, invoiceCount, sparklineData };

    }, [filteredInvoices]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
                title="صافي الربح" 
                value={stats.netProfit} 
                icon={<DollarSign className={stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} />} 
                sparkData={stats.sparklineData}
                isCurrency={true}
            />
            <StatCard 
                title="إجمالي الإيرادات" 
                value={stats.totalRevenue} 
                icon={<ArrowUp className="text-emerald-400" />} 
                isCurrency={true}
            />
            <StatCard 
                title="إجمالي المصروفات" 
                value={stats.totalExpense} 
                icon={<ArrowDown className="text-red-400" />} 
                isCurrency={true}
            />
            <StatCard 
                title="عدد الفواتير" 
                value={stats.invoiceCount} 
                icon={<FileText className="text-blue-400" />}
                isCurrency={false}
            />
        </div>
    );
}


// --- (6) المكون الرئيسي (Client UI) (Dark Mode) ---
export default function InvoicesClientUI({ initialInvoices, branches }) {
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredInvoices = useMemo(() => {
        if (selectedBranch === 'all') {
            return initialInvoices;
        }
        return initialInvoices.filter(invoice => invoice.branchId?._id === selectedBranch);
    }, [initialInvoices, selectedBranch]);

    const openModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    // Chips بألوان داكنة
    const getStatusChip = (status) => {
        switch (status) {
            case 'paid':
                return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-800">مدفوعة</span>;
            case 'pending':
                return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-800">معلقة</span>;
            case 'overdue':
                return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-900/30 text-red-400 border border-red-800">متأخرة</span>;
            default:
                return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-700 text-gray-300 border border-gray-600">{status}</span>;
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <ToastContainer position="top-center" theme="dark" />
            
            <div className="flex flex-col p-2 m-0.5 md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold text-white">إدارة الفواتير (كل الفروع)</h1>
                
                <div className="flex items-center space-x-2 space-x-reverse bg-[#1c1d22] p-2 rounded-lg border border-gray-800">
                    <Filter size={18} className="text-gray-400" />
                    <label htmlFor="branchFilter" className="text-sm font-medium text-gray-300">فلترة حسب الفرع:</label>
                    <select
                        id="branchFilter"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="p-1.5 bg-[#252830] border border-gray-700 rounded text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="all">كل الفروع</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <InvoiceStatsCards filteredInvoices={filteredInvoices} />

            <div className="bg-[#1c1d22] shadow-xl border border-gray-800 rounded-lg overflow-x-auto">
                {filteredInvoices.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-[#252830]">
                            <tr>
                                <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">رقم الفاتورة</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الفرع</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">العميل/المورد</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">النوع</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الإجمالي</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الحالة</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">التاريخ</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#1c1d22] divide-y divide-gray-800">
                            {filteredInvoices.map(invoice => (
                                <tr key={invoice._id} className="hover:bg-gray-800/50 transition-colors duration-150">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-400">{invoice.invoiceNumber}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{invoice.branchId?.name || 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {invoice.type === 'revenue' ? (invoice.customerId?.name || 'N/A') : (invoice.supplierId?.name || 'N/A')}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        {invoice.type === 'revenue' ? 
                                            <span className="text-emerald-400 flex items-center gap-1"><ArrowUp size={14}/> إيراد</span> : 
                                            <span className="text-red-400 flex items-center gap-1"><ArrowDown size={14}/> مصروف</span>
                                        }
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-100">{formatAsCurrency(invoice.totalInvoice)} ج.م</td>
                                    <td className="px-4 py-4 whitespace-nowrap">{getStatusChip(invoice.status)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => openModal(invoice)}
                                            className="py-1.5 px-3 bg-blue-900/30 text-blue-400 border border-blue-800 rounded-md hover:bg-blue-800 hover:text-white transition-all text-xs font-medium"
                                        >
                                            عرض التفاصيل
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center text-gray-500 p-12">
                        <FileText size={64} className="mx-auto mb-4 text-gray-700" />
                        <p className="text-lg">لا توجد فواتير تطابق هذا الفلتر.</p>
                    </div>
                )}
            </div>

            <InvoiceDetailsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={selectedInvoice}
            />
        </div>
    );
}