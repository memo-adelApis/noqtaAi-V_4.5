import Link from 'next/link';
import { getCurrentUser } from './lib/auth';
import { ArrowLeft, Sparkles, ShieldCheck, BarChart3, FlaskConical } from 'lucide-react';

export default async function HomePage() {
  const user = await getCurrentUser();

  // ✅ تم إزالة منطق التوجيه (Smart Routing)
  // ستقوم الـ Middleware بمعالجة ذلك تلقائياً

  return (
    <div className="bg-[#0f1117] text-white min-h-screen font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden" dir="rtl">
      
      {/* خلفية جمالية (متجاوبة) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[500px] bg-indigo-600/20 rounded-full blur-[80px] md:blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[250px] md:w-[600px] h-[250px] md:h-[400px] bg-purple-600/10 rounded-full blur-[60px] md:blur-[100px] -z-10" />

      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-wrap justify-between items-center border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BarChart3 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            نقطة<span className="text-indigo-400">.ai</span>
          </h1>
          <span className="hidden sm:inline-block bg-indigo-500/10 text-indigo-400 text-[10px] sm:text-xs px-2 py-1 rounded-full border border-indigo-500/20 font-medium mr-1 sm:mr-2">
            Beta
          </span>
        </div>

        {/* Navigation */}
        <nav>
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-sm text-gray-300 hidden lg:inline-block">
                أهلاً، <span className="text-white font-semibold">{user.name}</span>
              </span>

              <Link
                href="/logout"
                className="px-3 sm:px-5 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 transition-all hover:text-red-400"
              >
                خروج
              </Link>
              
              {/* الرابط يوجه حسب الدور، لكن الميدل وير سيمنع الوصول أصلاً لو الصفحة الرئيسية محمية */}
              <Link
                href={user.role === 'admin' ? "/admin" : "/subuser/reports"}
                className="px-3 sm:px-5 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-lg shadow-indigo-900/20"
              >
                لوحة التحكم
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="group flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-black rounded-full font-bold text-sm sm:text-base hover:bg-gray-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
            >
              دخول
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20 sm:pb-32 text-center relative">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm mb-6 sm:mb-8 animate-fade-in-up">
          <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="font-medium">البرنامج في مرحلة التطوير النشط (Beta)</span>
        </div>

        {/* Main Title */}
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight max-w-4xl mx-auto">
          حوّل بياناتك المعقدة إلى <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x py-2 inline-block">
            قرارات استراتيجية ذكية
          </span>
        </h2>
        
        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl md:max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
          منصة "نقطة AI" تحلل فواتيرك ومبيعاتك لحظياً لتعطيك رؤى مستقبلية وتنبؤات دقيقة، 
          مما يساعدك على توفير المصروفات وزيادة الأرباح بضغطة زر.
        </p>

        {!user && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-base sm:text-lg font-bold transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1"
            >
              جرب النسخة التجريبية
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-base sm:text-lg font-medium transition-all"
            >
              كيف نعمل؟
            </Link>
          </div>
        )}
      </main>

      {/* Features Section */}
      <section id="features" className="relative py-16 sm:py-24 bg-[#0a0c10]/50 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">لماذا تعتمد على منصتنا؟</h3>
            <p className="text-gray-400 text-sm sm:text-base">مميزات مصممة خصيصاً لنمو أعمالك</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="group p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] group-hover:bg-indigo-500/20 transition-all" />
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 text-indigo-400">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-indigo-300 transition-colors">تنبؤات الذكاء الاصطناعي</h4>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                لا تنظر للماضي فقط. خوارزمياتنا تتوقع لك مبيعات الشهر القادم وتكشف لك فرص التوفير الخفية.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] group-hover:bg-purple-500/20 transition-all" />
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 text-purple-400">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-purple-300 transition-colors">لوحات تحكم تفاعلية</h4>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                رسوم بيانية حية ومباشرة. صممنا واجهة للمدير وأخرى للموظف لضمان سهولة الاستخدام.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] group-hover:bg-blue-500/20 transition-all" />
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 text-blue-400">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors">أمان وخصوصية تامة</h4>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                بياناتك مشفرة بالكامل. نظام صلاحيات دقيق يضمن أن كل مستخدم يرى ما يحتاج إليه فقط.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-white/5 text-center bg-[#050608]">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-gray-500 text-xs sm:text-sm mb-4">
            © 2025 منصة نقطة AI. نسخة تجريبية v0.1.0
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-white transition-colors">شروط الاستخدام</Link>
            <Link href="#" className="hover:text-white transition-colors">الدعم الفني</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
