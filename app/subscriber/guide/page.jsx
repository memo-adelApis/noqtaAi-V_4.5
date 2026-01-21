import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  Building, 
  Settings, 
  Crown, 
  DollarSign, 
  Calculator, 
  Eye,
  ArrowRight,
  CheckCircle,
  Star,
  Lightbulb,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Bell,
  FileText,
  BarChart3
} from 'lucide-react';

export default async function SubscriberGuidePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
          <BookOpen className="text-blue-500" />
          دليل آلية العمل
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          دليل شامل لفهم كيفية استخدام منصة نقطة AI لإدارة مؤسستك بكفاءة عالية
        </p>
      </div>

      {/* خطوات البداية السريعة */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl border border-blue-500/30 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Zap className="text-yellow-500" />
          البداية السريعة - 5 خطوات فقط
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            {
              step: 1,
              title: "إضافة الفروع",
              description: "أضف فروع مؤسستك",
              icon: Building,
              color: "text-purple-400",
              link: "/subscriber/branches"
            },
            {
              step: 2,
              title: "إضافة الموظفين",
              description: "أضف فريق العمل",
              icon: Users,
              color: "text-green-400",
              link: "/subscriber/employees"
            },
            {
              step: 3,
              title: "تحديد الصلاحيات",
              description: "حدد دور كل موظف",
              icon: Shield,
              color: "text-blue-400",
              link: "/subscriber/employees"
            },
            {
              step: 4,
              title: "إعداد النظام",
              description: "اضبط إعدادات المؤسسة",
              icon: Settings,
              color: "text-orange-400",
              link: "/subscriber/settings"
            },
            {
              step: 5,
              title: "بدء العمل",
              description: "ابدأ استخدام النظام",
              icon: TrendingUp,
              color: "text-indigo-400",
              link: "/subscriber/dashboard"
            }
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconComponent className={item.color} size={24} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                <a
                  href={item.link}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition"
                >
                  ابدأ الآن <ArrowRight size={14} />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* شرح الأدوار والصلاحيات */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Users className="text-green-500" />
          الأدوار والصلاحيات
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              role: "owner",
              title: "المالك",
              icon: Crown,
              color: "text-purple-400 bg-purple-500/20 border-purple-500/30",
              permissions: [
                "جميع الصلاحيات",
                "إدارة النظام بالكامل",
                "إعدادات الشركة",
                "إدارة الاشتراكات",
                "تقارير شاملة"
              ]
            },
            {
              role: "manager",
              title: "مدير الفرع",
              icon: Building,
              color: "text-green-400 bg-green-500/20 border-green-500/30",
              permissions: [
                "إدارة الفرع المخصص",
                "إدارة موظفي الفرع",
                "عرض تقارير الفرع",
                "إدارة المخزون",
                "متابعة الأداء"
              ]
            },
            {
              role: "employee",
              title: "الموظف",
              icon: Users,
              color: "text-blue-400 bg-blue-500/20 border-blue-500/30",
              permissions: [
                "عرض البيانات الأساسية",
                "إنشاء فواتير بسيطة",
                "تحديث المخزون",
                "خدمة العملاء",
                "تسجيل المعاملات"
              ]
            },
            {
              role: "cashier",
              title: "الكاشير",
              icon: DollarSign,
              color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
              permissions: [
                "إدارة المبيعات",
                "معالجة المدفوعات",
                "إدارة الخزينة",
                "طباعة الفواتير",
                "تقارير المبيعات"
              ]
            },
            {
              role: "accountant",
              title: "المحاسب",
              icon: Calculator,
              color: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
              permissions: [
                "إدارة الحسابات",
                "التقارير المالية",
                "المراجعة والتدقيق",
                "إدارة المصروفات",
                "تحليل الأرباح"
              ]
            },
            {
              role: "supervisor",
              title: "المشرف",
              icon: Eye,
              color: "text-orange-400 bg-orange-500/20 border-orange-500/30",
              permissions: [
                "مراقبة العمليات",
                "إشراف على الموظفين",
                "تقارير الأداء",
                "ضمان الجودة",
                "متابعة الإنتاجية"
              ]
            }
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className={`p-6 rounded-xl border ${item.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <IconComponent size={24} />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <ul className="space-y-2">
                  {item.permissions.map((permission, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* مميزات النظام */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Star className="text-yellow-500" />
          مميزات النظام
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "إدارة متعددة الفروع",
              description: "إدارة عدة فروع من مكان واحد",
              icon: Building,
              color: "text-purple-400"
            },
            {
              title: "نظام إشعارات ذكي",
              description: "تنبيهات فورية لجميع العمليات",
              icon: Bell,
              color: "text-blue-400"
            },
            {
              title: "تقارير تفصيلية",
              description: "تقارير شاملة لجميع العمليات",
              icon: BarChart3,
              color: "text-green-400"
            },
            {
              title: "أمان عالي",
              description: "حماية متقدمة لبياناتك",
              icon: Shield,
              color: "text-red-400"
            },
            {
              title: "إدارة المخزون",
              description: "متابعة دقيقة للمخزون",
              icon: FileText,
              color: "text-orange-400"
            },
            {
              title: "واجهة سهلة",
              description: "تصميم بسيط وسهل الاستخدام",
              icon: Lightbulb,
              color: "text-yellow-400"
            },
            {
              title: "دعم عربي كامل",
              description: "واجهة عربية بالكامل RTL",
              icon: Target,
              color: "text-indigo-400"
            },
            {
              title: "تحديثات مستمرة",
              description: "ميزات جديدة باستمرار",
              icon: TrendingUp,
              color: "text-pink-400"
            }
          ].map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center p-4 bg-gray-800/50 rounded-lg">
                <IconComponent className={`${feature.color} mx-auto mb-3`} size={32} />
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* نصائح مهمة */}
      <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl border border-green-500/30 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Lightbulb className="text-yellow-500" />
          نصائح مهمة للنجاح
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "ابدأ بالأساسيات",
              tips: [
                "أضف الفروع أولاً",
                "حدد الأدوار بوضوح",
                "درب الموظفين على النظام",
                "ابدأ بفرع واحد للتجربة"
              ]
            },
            {
              title: "أفضل الممارسات",
              tips: [
                "راجع التقارير يومياً",
                "حدث بيانات المخزون باستمرار",
                "استخدم الإشعارات للمتابعة",
                "احتفظ بنسخ احتياطية"
              ]
            },
            {
              title: "الأمان والحماية",
              tips: [
                "غير كلمات المرور دورياً",
                "راقب سجلات الدخول",
                "حدد الصلاحيات بدقة",
                "فعل الإشعارات الأمنية"
              ]
            },
            {
              title: "تحسين الأداء",
              tips: [
                "استخدم الفلاتر في البحث",
                "نظم البيانات بانتظام",
                "راجع الإحصائيات أسبوعياً",
                "حدث النظام باستمرار"
              ]
            }
          ].map((section, index) => (
            <div key={index} className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">ابدأ الآن</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/subscriber/employees"
            className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white text-center"
          >
            <Users size={24} />
            <div>
              <h3 className="font-medium">إدارة الموظفين</h3>
              <p className="text-sm opacity-90">أضف وأدر فريق العمل</p>
            </div>
          </a>
          
          <a
            href="/subscriber/branches"
            className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-white text-center"
          >
            <Building size={24} />
            <div>
              <h3 className="font-medium">إدارة الفروع</h3>
              <p className="text-sm opacity-90">أضف وأدر الفروع</p>
            </div>
          </a>
          
          <a
            href="/subscriber/dashboard"
            className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition text-white text-center"
          >
            <BarChart3 size={24} />
            <div>
              <h3 className="font-medium">لوحة التحكم</h3>
              <p className="text-sm opacity-90">راقب أداء المؤسسة</p>
            </div>
          </a>
        </div>
      </div>

      {/* معلومات الدعم */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
        <h3 className="font-medium text-blue-400 mb-3">💡 هل تحتاج مساعدة؟</h3>
        <p className="text-sm text-gray-300 mb-4">
          فريق الدعم الفني متاح لمساعدتك في أي وقت
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-400">📧 support@noqta.ai</span>
          <span className="text-gray-400">📱 +966 50 000 0000</span>
        </div>
      </div>
    </div>
  );
}