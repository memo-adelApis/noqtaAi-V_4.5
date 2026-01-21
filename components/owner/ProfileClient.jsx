"use client";

import { User, Mail, Phone, Calendar, TrendingUp, Building, FileText, Users, Crown, Edit } from "lucide-react";

export default function ProfileClient({ user, stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0) + ' ج.م';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const netProfit = stats.totalRevenue - stats.totalExpenses;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="text-purple-500" />
          الملف الشخصي
        </h1>
        <p className="text-gray-400 mt-2">
          معلوماتك الشخصية وإحصائياتك
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30 p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-500 flex items-center justify-center text-white text-5xl font-bold shadow-2xl mb-4">
                {user.name?.charAt(0) || "M"}
              </div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Crown className="text-yellow-500" size={20} />
                <p className="text-yellow-400 font-semibold">مالك المؤسسة</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <Mail className="text-blue-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                  <p className="text-sm text-white">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                  <Phone className="text-green-400" size={20} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">رقم الهاتف</p>
                    <p className="text-sm text-white">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <Calendar className="text-purple-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">عضو منذ</p>
                  <p className="text-sm text-white">{formatDate(stats.memberSince)}</p>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <a
              href="/owner/settings"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition"
            >
              <Edit size={20} />
              تعديل الملف الشخصي
            </a>
          </div>
        </div>

        {/* Stats and Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 p-6 rounded-xl border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">إجمالي الإيرادات</p>
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-6 rounded-xl border border-red-500/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">إجمالي المصروفات</p>
                <TrendingUp className="text-red-400" size={24} />
              </div>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.totalExpenses)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 p-6 rounded-xl border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">صافي الربح</p>
                <TrendingUp className={netProfit >= 0 ? "text-blue-400" : "text-red-400"} size={24} />
              </div>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 p-6 rounded-xl border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">هامش الربح</p>
                <TrendingUp className="text-purple-400" size={24} />
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {stats.totalRevenue > 0 ? ((netProfit / stats.totalRevenue) * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold mb-6">نشاط المؤسسة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="text-blue-400" size={24} />
                  <span className="text-3xl font-bold text-white">{stats.totalInvoices}</span>
                </div>
                <p className="text-sm text-gray-400">إجمالي الفواتير</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Building className="text-purple-400" size={24} />
                  <span className="text-3xl font-bold text-white">{stats.totalBranches}</span>
                </div>
                <p className="text-sm text-gray-400">عدد الفروع</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Users className="text-green-400" size={24} />
                  <span className="text-3xl font-bold text-white">{stats.totalSubusers}</span>
                </div>
                <p className="text-sm text-gray-400">الموظفين</p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold mb-6">معلومات الحساب</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">نوع الحساب</p>
                  <p className="text-white font-semibold">مالك - Owner</p>
                </div>
                <Crown className="text-yellow-500" size={24} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">حالة الحساب</p>
                  <p className="text-green-400 font-semibold">نشط</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">معرف المستخدم</p>
                  <p className="text-white font-mono text-sm">{user._id}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">تاريخ التسجيل</p>
                  <p className="text-white">{formatDate(user.createdAt)}</p>
                </div>
                <Calendar className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-semibold mb-6">إجراءات سريعة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/owner/settings"
                className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                <Edit className="text-blue-400" size={20} />
                <span>تعديل الملف الشخصي</span>
              </a>

              <a
                href="/owner/settings#security"
                className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                <User className="text-purple-400" size={20} />
                <span>تغيير كلمة المرور</span>
              </a>

              <a
                href="/owner/financial-report"
                className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                <FileText className="text-green-400" size={20} />
                <span>التقرير المالي</span>
              </a>

              <a
                href="/owner/reports"
                className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                <TrendingUp className="text-yellow-400" size={20} />
                <span>التقارير المتقدمة</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
