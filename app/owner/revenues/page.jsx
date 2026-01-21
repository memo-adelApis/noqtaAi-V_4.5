import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { TrendingUp, DollarSign, Calendar, Building, ArrowUpRight, Filter } from "lucide-react";
import { redirect } from 'next/navigation';

export default async function OwnerRevenuesPage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  // if (!session || session.user.role !== 'owner') {
  //   redirect('/login');
  // }

  const userId = session.user.id;

  // جلب فواتير الإيرادات فقط
  const revenueInvoices = await Invoice.find({ 
    userId,
    type: 'revenue'
  })
    .populate('branchId', 'name')
    .populate('customerId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // إحصائيات الإيرادات
  const totalRevenue = revenueInvoices.reduce((sum, inv) => sum + inv.totalInvoice, 0);
  const paidRevenue = revenueInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalInvoice, 0);
  const pendingRevenue = revenueInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.totalInvoice, 0);

  // الإيرادات حسب الفرع
  const revenueByBranch = await Invoice.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        type: 'revenue'
      } 
    },
    { 
      $group: { 
        _id: '$branchId',
        totalRevenue: { $sum: '$totalInvoice' },
        invoiceCount: { $sum: 1 }
      } 
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  // جلب أسماء الفروع
  const branchIds = revenueByBranch.map(r => r._id);
  const branches = await Branch.find({ _id: { $in: branchIds } }).lean();
  const branchMap = Object.fromEntries(branches.map(b => [b._id.toString(), b.name]));

  // الإيرادات الشهرية (آخر 6 أشهر)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Invoice.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        type: 'revenue',
        createdAt: { $gte: sixMonthsAgo }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalInvoice' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  const getMonthName = (month) => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[month - 1];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="text-green-500" />
          تقرير الإيرادات
        </h1>
        <p className="text-gray-400 mt-2">
          تحليل شامل لجميع إيرادات المؤسسة
        </p>
      </div>

      {/* إحصائيات رئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الإيرادات المحصلة</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{formatCurrency(paidRevenue)}</p>
            </div>
            <ArrowUpRight className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الإيرادات المعلقة</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(pendingRevenue)}</p>
            </div>
            <Calendar className="text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">عدد الفواتير</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{revenueInvoices.length}</p>
            </div>
            <Filter className="text-purple-400" size={32} />
          </div>
        </div>
      </div>

      {/* الإيرادات حسب الفرع */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Building className="text-purple-500" />
          الإيرادات حسب الفرع
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {revenueByBranch.map((branch) => {
            const maxRevenue = Math.max(...revenueByBranch.map(b => b.totalRevenue));
            const percentage = (branch.totalRevenue / maxRevenue) * 100;
            
            return (
              <div key={branch._id?.toString()} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{branchMap[branch._id?.toString()] || 'غير محدد'}</h3>
                  <span className="text-xs text-gray-400">{branch.invoiceCount} فاتورة</span>
                </div>
                <p className="text-lg font-bold text-green-400 mb-2">
                  {formatCurrency(branch.totalRevenue)}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* الإيرادات الشهرية */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Calendar className="text-blue-500" />
          الإيرادات الشهرية (آخر 6 أشهر)
        </h2>
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          {monthlyRevenue.map((month, index) => {
            const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
            const height = (month.revenue / maxRevenue) * 200;
            
            return (
              <div key={index} className="flex flex-col items-center gap-2 min-w-[100px]">
                <div className="text-xs text-gray-400">{formatCurrency(month.revenue)}</div>
                <div 
                  className="w-16 bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all"
                  style={{ height: `${height}px`, minHeight: '20px' }}
                ></div>
                <div className="text-xs text-gray-500 text-center">
                  {getMonthName(month._id.month)}
                  <br />
                  {month._id.year}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">فواتير الإيرادات</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-right p-4 text-gray-300">رقم الفاتورة</th>
                <th className="text-right p-4 text-gray-300">العميل</th>
                <th className="text-right p-4 text-gray-300">الفرع</th>
                <th className="text-right p-4 text-gray-300">المبلغ</th>
                <th className="text-right p-4 text-gray-300">الحالة</th>
                <th className="text-right p-4 text-gray-300">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {revenueInvoices.slice(0, 20).map((invoice) => (
                <tr key={invoice._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                  <td className="p-4">{invoice.customerId?.name || 'غير محدد'}</td>
                  <td className="p-4 text-sm">{invoice.branchId?.name || 'غير محدد'}</td>
                  <td className="p-4 font-semibold text-green-400">{formatCurrency(invoice.totalInvoice)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                      invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {invoice.status === 'paid' ? 'مدفوعة' : 
                       invoice.status === 'pending' ? 'معلقة' : 'ملغاة'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
