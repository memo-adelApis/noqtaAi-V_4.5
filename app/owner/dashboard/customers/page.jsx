import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Customer from "@/models/Customers";
import Invoice from "@/models/Invoices";
import Branch from "@/models/Branches";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { Users, DollarSign, FileText, TrendingUp, Phone, Mail, MapPin, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';

export default async function OwnerCustomersPage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  // جلب المستخدم الحالي للحصول على mainAccountId
  const currentUser = await getCurrentUser();
  
  if (!currentUser || !currentUser.mainAccountId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">خطأ في الوصول</h2>
          <p className="text-gray-400">المالك غير مرتبط بحساب مشترك</p>
        </div>
      </div>
    );
  }

  const subscriberId = new mongoose.Types.ObjectId(currentUser.mainAccountId);

  // جلب جميع العملاء
  const customers = await Customer.find({ userId: subscriberId }).lean();

  // جلب إحصائيات كل عميل من الفواتير
  const customerStats = await Invoice.aggregate([
    { 
      $match: { 
        userId: subscriberId,
        type: 'revenue'
      } 
    },
    {
      $group: {
        _id: '$customerId',
        totalRevenue: { $sum: '$totalInvoice' },
        totalPaid: { $sum: '$totalPays' },
        totalBalance: { $sum: '$balance' },
        invoiceCount: { $sum: 1 }
      }
    }
  ]);

  // دمج البيانات
  const customersWithStats = customers.map(customer => {
    const stats = customerStats.find(s => s._id?.toString() === customer._id.toString()) || {
      totalRevenue: 0,
      totalPaid: 0,
      totalBalance: 0,
      invoiceCount: 0
    };
    
    return {
      ...customer,
      ...stats
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // إحصائيات عامة
  const totalCustomers = customers.length;
  const totalRevenue = customersWithStats.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalBalance = customersWithStats.reduce((sum, c) => sum + c.totalBalance, 0);
  const activeCustomers = customersWithStats.filter(c => c.invoiceCount > 0).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-blue-500" />
          إدارة العملاء
        </h1>
        <p className="text-gray-400 mt-2">
          عرض وإدارة جميع عملاء المؤسسة
        </p>
      </div>

      {/* إحصائيات رئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalCustomers}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">العملاء النشطون</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{activeCustomers}</p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المبالغ المستحقة</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalBalance)}</p>
            </div>
            <FileText className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* قائمة العملاء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {customersWithStats.map((customer) => (
          <div key={customer._id} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <Users className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{customer.name}</h3>
                  {customer.company && (
                    <p className="text-sm text-gray-400">{customer.company}</p>
                  )}
                </div>
              </div>
              
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                {customer.invoiceCount} فاتورة
              </span>
            </div>

            {/* معلومات الاتصال */}
            <div className="space-y-2 mb-4">
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone size={14} />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail size={14} />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin size={14} />
                  <span>{customer.address}</span>
                </div>
              )}
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-400 mb-1">إجمالي المبيعات</p>
                <p className="text-sm font-semibold text-green-400">
                  {formatCurrency(customer.totalRevenue)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">المدفوع</p>
                <p className="text-sm font-semibold text-blue-400">
                  {formatCurrency(customer.totalPaid)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">المستحق</p>
                <p className={`text-sm font-semibold ${
                  customer.totalBalance > 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {formatCurrency(customer.totalBalance)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-gray-600" size={64} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            لا يوجد عملاء بعد
          </h3>
          <p className="text-gray-500">
            لم يتم إضافة أي عملاء للمؤسسة
          </p>
        </div>
      )}
    </div>
  );
}
