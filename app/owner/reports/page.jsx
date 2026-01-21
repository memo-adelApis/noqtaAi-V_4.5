import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import { FileText, TrendingUp, Package, Building, AlertCircle, Download, ArrowRight } from "lucide-react";
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ReportsPage() {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  
//   if (!session || session.user.role !== 'owner') {
//     redirect('/login');
//   }

  const reports = [
    {
      id: 'profit',
      title: 'تقرير الأرباح',
      description: 'تحليل شامل للأرباح والخسائر الشهرية والسنوية',
      icon: TrendingUp,
      color: 'from-green-900/20 to-green-800/10',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-500',
      href: '/owner/reports/profit',
      features: [
        'الأداء الشهري',
        'أفضل وأسوأ شهر',
        'الأرباح حسب الفرع',
        'هامش الربح'
      ]
    },
    {
      id: 'inventory',
      title: 'تقرير المخزون',
      description: 'حالة المخزون والأصناف المنخفضة والنافذة',
      icon: Package,
      color: 'from-purple-900/20 to-purple-800/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-500',
      href: '/owner/reports/inventory',
      features: [
        'حالة المخزون',
        'الأصناف المنخفضة',
        'الأصناف النافذة',
        'القيمة الإجمالية'
      ]
    },
    {
      id: 'branches',
      title: 'تقرير الفروع',
      description: 'تحليل أداء جميع الفروع والمقارنة بينها',
      icon: Building,
      color: 'from-blue-900/20 to-blue-800/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-500',
      href: '/owner/reports/branches',
      features: [
        'أداء كل فرع',
        'الإيرادات والمصروفات',
        'عدد المخازن',
        'المستحقات'
      ]
    },
    {
      id: 'outstanding',
      title: 'تقرير المستحقات',
      description: 'المبالغ المستحقة من العملاء وللموردين',
      icon: AlertCircle,
      color: 'from-yellow-900/20 to-yellow-800/10',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-500',
      href: '/owner/reports/outstanding',
      features: [
        'مستحقات العملاء',
        'مستحقات الموردين',
        'الفواتير المتأخرة',
        'صافي المستحقات'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="text-blue-500" />
          مركز التقارير
        </h1>
        <p className="text-gray-400 mt-2">
          تقارير شاملة ومفصلة لجميع جوانب المؤسسة
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">التقارير المتاحة</h2>
            <p className="text-gray-400 text-sm">
              {reports.length} تقارير مفصلة جاهزة للعرض والتحميل
            </p>
          </div>
          <FileText className="text-blue-400" size={48} />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          
          return (
            <div 
              key={report.id}
              className={`bg-gradient-to-br ${report.color} rounded-xl border ${report.borderColor} p-6 hover:scale-[1.02] transition-transform`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gray-800/50`}>
                    <Icon className={report.iconColor} size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-400">{report.description}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {report.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full ${report.iconColor.replace('text-', 'bg-')}`}></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Link
                  href={report.href}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <ArrowRight size={18} />
                  عرض التقرير
                </Link>
                
                <Link
                  href={`${report.href}?download=true`}
                  className={`flex items-center justify-center gap-2 ${report.iconColor.replace('text-', 'bg-')}/20 hover:${report.iconColor.replace('text-', 'bg-')}/30 ${report.iconColor} px-4 py-2 rounded-lg transition`}
                >
                  <Download size={18} />
                  Excel
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-blue-500" size={20} />
          معلومات عن التقارير
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-2">تنسيقات التصدير</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Excel (.xlsx) - ملفات Excel كاملة مع أوراق متعددة
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                CSV (.csv) - ملفات نصية يمكن فتحها في Excel
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-2">مميزات التقارير</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                بيانات محدثة في الوقت الفعلي
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                تنسيق احترافي جاهز للطباعة
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                دعم كامل للغة العربية
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/owner/invoices"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-4 transition flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-white">الفواتير</p>
            <p className="text-xs text-gray-400 mt-1">عرض جميع الفواتير</p>
          </div>
          <ArrowRight className="text-gray-400" size={20} />
        </Link>

        <Link
          href="/owner/dashboard/branches"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-4 transition flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-white">الفروع</p>
            <p className="text-xs text-gray-400 mt-1">إدارة الفروع</p>
          </div>
          <ArrowRight className="text-gray-400" size={20} />
        </Link>

        <Link
          href="/owner/analytics"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-4 transition flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-white">التحليلات</p>
            <p className="text-xs text-gray-400 mt-1">التحليلات المتقدمة</p>
          </div>
          <ArrowRight className="text-gray-400" size={20} />
        </Link>
      </div>
    </div>
  );
}
