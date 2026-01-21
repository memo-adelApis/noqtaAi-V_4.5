import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Supplier from "@/models/Suppliers";
import Invoice from "@/models/Invoices";
import { connectToDB } from '@/utils/database';
import mongoose from 'mongoose';
import { Truck, DollarSign, FileText, TrendingDown, Phone, Mail, MapPin, AlertTriangle } from "lucide-react";
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';

export default async function OwnerSuppliersPage() {
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

  // جلب جميع الموردين
  const suppliers = await Supplier.find({ userId: subscriberId }).lean();

  // جلب إحصائيات كل مورد من الفواتير
  const supplierStats = await Invoice.aggregate([
    { 
      $match: { 
        userId: subscriberId,
        type: 'expense'
      } 
    },
    {
      $group: {
        _id: '$supplierId',
        totalExpenses: { $sum: '$totalInvoice' },
        totalPaid: { $sum: '$totalPays' },
        totalBalance: { $sum: '$balance' },
        invoiceCount: { $sum: 1 }
      }
    }
  ]);

  // دمج البيانات
  const suppliersWithStats = suppliers.map(supplier => {
    const stats = supplierStats.find(s => s._id?.toString() === supplier._id.toString()) || {
      totalExpenses: 0,
      totalPaid: 0,
      totalBalance: 0,
      invoiceCount: 0
    };
    
    return {
      ...supplier,
      ...stats
    };
  }).sort((a, b) => b.totalExpenses - a.totalExpenses);

  // إحصائيات عامة
  const totalSuppliers = suppliers.length;
  const totalExpenses = suppliersWithStats.reduce((sum, s) => sum + s.totalExpenses, 0);
  const totalBalance = suppliersWithStats.reduce((sum, s) => sum + s.totalBalance, 0);
  const activeSuppliers = suppliersWithStats.filter(s => s.invoiceCount > 0).length;

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
          <Truck className="text-orange-500" />
          إدارة الموردين
        </h1>
        <p className="text-gray-400 mt-2">
          عرض وإدارة جميع موردي المؤسسة
        </p>
      </div>

      {/* إحصائيات رئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 p-6 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي الموردين</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{totalSuppliers}</p>
            </div>
            <Truck className="text-orange-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">الموردين النشطون</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{activeSuppliers}</p>
            </div>
            <TrendingDown className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">إجمالي المشتريات</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalExpenses)}</p>
            </div>
            <DollarSign className="text-red-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">المبالغ المستحقة</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{formatCurrency(totalBalance)}</p>
            </div>
            <FileText className="text-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* قائمة الموردين */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suppliersWithStats.map((supplier) => (
          <div key={supplier._id} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-orange-500/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <Truck className="text-orange-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{supplier.name}</h3>
                  {supplier.company && (
                    <p className="text-sm text-gray-400">{supplier.company}</p>
                  )}
                </div>
              </div>
              
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                {supplier.invoiceCount} فاتورة
              </span>
            </div>

            {/* معلومات الاتصال */}
            <div className="space-y-2 mb-4">
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone size={14} />
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail size={14} />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin size={14} />
                  <span>{supplier.address}</span>
                </div>
              )}
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-400 mb-1">إجمالي المشتريات</p>
                <p className="text-sm font-semibold text-red-400">
                  {formatCurrency(supplier.totalExpenses)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">المدفوع</p>
                <p className="text-sm font-semibold text-blue-400">
                  {formatCurrency(supplier.totalPaid)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">المستحق</p>
                <p className={`text-sm font-semibold ${
                  supplier.totalBalance > 0 ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {formatCurrency(supplier.totalBalance)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-12">
          <Truck className="mx-auto mb-4 text-gray-600" size={64} />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            لا يوجد موردين بعد
          </h3>
          <p className="text-gray-500">
            لم يتم إضافة أي موردين للمؤسسة
          </p>
        </div>
      )}
    </div>
  );
}
