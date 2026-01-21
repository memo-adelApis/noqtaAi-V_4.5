import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Item from "@/models/Items";
import Store from "@/models/Store";
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import Unit from "@/models/Units";
import Category from "@/models/Categories";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { Package, TrendingUp, TrendingDown, DollarSign, Calendar, Building, FileText, ArrowLeft } from "lucide-react";
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProductDetailsPage({ params }) {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  const { id } = params;
  const userId = session.user.id;

  // جلب تفاصيل الصنف
  const item = await Item.findById(id)
    .populate({
      path: 'storeId',
      populate: {
        path: 'branchId',
        select: 'name'
      }
    })
    .populate('unitId', 'name')
    .populate('categoryId', 'name')
    .lean();

  if (!item) {
    redirect('/owner/dashboard/products');
  }

  // التحقق من أن الصنف يخص المستخدم (يمكن إضافة هذا التحقق لاحقاً)
  
  // جلب الفواتير التي تحتوي على هذا الصنف
  const invoices = await Invoice.find({
    userId: new mongoose.Types.ObjectId(userId),
    'items.name': item.name
  })
    .populate('branchId', 'name')
    .populate('customerId', 'name')
    .populate('supplierId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // تحليل الفواتير
  const revenueInvoices = invoices.filter(inv => inv.type === 'revenue');
  const expenseInvoices = invoices.filter(inv => inv.type === 'expense');

  // حساب الكميات المباعة والمشتراة من الفواتير
  let totalSold = 0;
  let totalPurchased = 0;
  let totalRevenue = 0;
  let totalCost = 0;

  revenueInvoices.forEach(inv => {
    const itemInInvoice = inv.items.find(i => i.name === item.name);
    if (itemInInvoice) {
      totalSold += itemInInvoice.quantity;
      totalRevenue += itemInInvoice.total;
    }
  });

  expenseInvoices.forEach(inv => {
    const itemInInvoice = inv.items.find(i => i.name === item.name);
    if (itemInInvoice) {
      totalPurchased += itemInInvoice.quantity;
      totalCost += itemInInvoice.total;
    }
  });

  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // أكثر الفروع مبيعاً
  const salesByBranch = {};
  revenueInvoices.forEach(inv => {
    const branchId = inv.branchId?._id?.toString();
    const branchName = inv.branchId?.name || 'غير محدد';
    const itemInInvoice = inv.items.find(i => i.name === item.name);
    
    if (itemInInvoice && branchId) {
      if (!salesByBranch[branchId]) {
        salesByBranch[branchId] = {
          name: branchName,
          quantity: 0,
          revenue: 0
        };
      }
      salesByBranch[branchId].quantity += itemInInvoice.quantity;
      salesByBranch[branchId].revenue += itemInInvoice.total;
    }
  });

  const topBranches = Object.values(salesByBranch)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/owner/dashboard/products"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition"
          >
            <ArrowLeft size={16} />
            العودة للمنتجات
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="text-purple-500" />
            {item.name}
          </h1>
          {item.description && (
            <p className="text-gray-400 mt-2">{item.description}</p>
          )}
        </div>
      </div>

      {/* معلومات أساسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">المخزن</p>
          <p className="text-lg font-semibold">{item.storeId?.name || 'غير محدد'}</p>
          <p className="text-xs text-gray-400 mt-1">{item.storeId?.branchId?.name || 'غير محدد'}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">الفئة</p>
          <p className="text-lg font-semibold">{item.categoryId?.name || 'غير محدد'}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">الوحدة</p>
          <p className="text-lg font-semibold">{item.unitId?.name || 'غير محدد'}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-2">تاريخ الإضافة</p>
          <p className="text-lg font-semibold">
            {new Date(item.createdAt).toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>

      {/* إحصائيات الأداء */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {totalSold.toLocaleString('en-US')} وحدة
              </p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المشتريات</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalCost)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {totalPurchased.toLocaleString('en-US')} وحدة
              </p>
            </div>
            <TrendingDown className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">صافي الربح</p>
              <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(netProfit)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                هامش {profitMargin.toFixed(1)}%
              </p>
            </div>
            <DollarSign className={netProfit >= 0 ? 'text-blue-400' : 'text-red-400'} size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">القيمة المالية</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(item.totlPrice)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {(item.quantity_Remaining || 0).toLocaleString('en-US')} متبقي
              </p>
            </div>
            <Package className="text-purple-400" size={32} />
          </div>
        </div>
      </div>

      {/* حالة المخزون */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">حالة المخزون</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="56" stroke="#1f2937" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#10b981" 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${((item.quantity_added || 0) / Math.max(item.quantity_added || 1, 1)) * 351.86} 351.86`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-400">
                  {(item.quantity_added || 0).toLocaleString('en-US')}
                </span>
              </div>
            </div>
            <p className="text-gray-400">الكمية المضافة</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="56" stroke="#1f2937" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#ef4444" 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${((item.quantity_spent || 0) / Math.max(item.quantity_added || 1, 1)) * 351.86} 351.86`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-400">
                  {(item.quantity_spent || 0).toLocaleString('en-US')}
                </span>
              </div>
            </div>
            <p className="text-gray-400">الكمية المصروفة</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="56" stroke="#1f2937" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#3b82f6" 
                  strokeWidth="12" 
                  fill="none"
                  strokeDasharray={`${((item.quantity_Remaining || 0) / Math.max(item.quantity_added || 1, 1)) * 351.86} 351.86`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">
                  {(item.quantity_Remaining || 0).toLocaleString('en-US')}
                </span>
              </div>
            </div>
            <p className="text-gray-400">الكمية المتبقية</p>
          </div>
        </div>
      </div>

      {/* أكثر الفروع استهلاكاً */}
      {topBranches.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Building className="text-purple-500" />
            أكثر الفروع استهلاكاً
          </h2>
          
          <div className="space-y-4">
            {topBranches.map((branch, index) => {
              const maxQuantity = topBranches[0].quantity;
              const percentage = (branch.quantity / maxQuantity) * 100;
              
              return (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">
                        {index + 1}
                      </div>
                      <h3 className="font-medium">{branch.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        {formatCurrency(branch.revenue)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {branch.quantity.toLocaleString('en-US')} وحدة
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* سجل الإضافات */}
      {item.lastadded && item.lastadded.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="text-green-500" />
            سجل الإضافات
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-right p-4 text-gray-300">التاريخ</th>
                  <th className="text-right p-4 text-gray-300">الكمية</th>
                  <th className="text-right p-4 text-gray-300">السعر</th>
                  <th className="text-right p-4 text-gray-300">الإجمالي</th>
                  <th className="text-right p-4 text-gray-300">بواسطة</th>
                </tr>
              </thead>
              <tbody>
                {item.lastadded.slice(0, 10).map((entry, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="p-4 text-sm">
                      {entry.date ? new Date(entry.date).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="p-4 font-semibold text-green-400">
                      +{(entry.quantity || 0).toLocaleString('en-US')}
                    </td>
                    <td className="p-4">{formatCurrency(entry.price)}</td>
                    <td className="p-4 font-semibold">{formatCurrency(entry.total)}</td>
                    <td className="p-4 text-sm text-gray-400">{entry.createdby || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* الفواتير المرتبطة */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="text-blue-500" />
            الفواتير المرتبطة ({invoices.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">رقم الفاتورة</th>
                <th className="text-right p-4 text-gray-300">النوع</th>
                <th className="text-right p-4 text-gray-300">الفرع</th>
                <th className="text-right p-4 text-gray-300">العميل/المورد</th>
                <th className="text-right p-4 text-gray-300">الكمية</th>
                <th className="text-right p-4 text-gray-300">السعر</th>
                <th className="text-right p-4 text-gray-300">الإجمالي</th>
                <th className="text-right p-4 text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 20).map((invoice) => {
                const itemInInvoice = invoice.items.find(i => i.name === item.name);
                
                return (
                  <tr key={invoice._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        invoice.type === 'revenue' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {invoice.type === 'revenue' ? 'إيراد' : 'مصروف'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{invoice.branchId?.name || 'غير محدد'}</td>
                    <td className="p-4 text-sm">
                      {invoice.type === 'revenue' 
                        ? invoice.customerId?.name || 'غير محدد'
                        : invoice.supplierId?.name || 'غير محدد'
                      }
                    </td>
                    <td className="p-4 font-semibold">
                      {itemInInvoice?.quantity.toLocaleString('en-US') || 0}
                    </td>
                    <td className="p-4">{formatCurrency(itemInInvoice?.price)}</td>
                    <td className="p-4 font-semibold text-yellow-400">
                      {formatCurrency(itemInInvoice?.total)}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
