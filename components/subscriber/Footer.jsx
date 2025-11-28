"use client";

import Link from 'next/link';
import { 
  Github, Twitter, Linkedin, Facebook, Mail, Phone, MapPin, Heart 
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-[#1c1d22] border-t border-gray-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] mt-auto no-print relative z-10" 
      dir="rtl"
    >
      {/* ✅ لمسة التميز: خط متدرج رفيع في الأعلى */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* العمود الأول: عن النظام */}
          <div className="col-span-1">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-blue-500">نظام</span> إدارة
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              منصة متكاملة لإدارة الفواتير، المخازن، والموظفين بسهولة وكفاءة. صُممت لتناسب احتياجات الشركات الصغيرة والمتوسطة.
            </p>
            <div className="flex gap-4">
              <SocialIcon Icon={Twitter} href="#" color="hover:text-blue-400" />
              <SocialIcon Icon={Facebook} href="#" color="hover:text-blue-600" />
              <SocialIcon Icon={Linkedin} href="#" color="hover:text-blue-500" />
              <SocialIcon Icon={Github} href="#" color="hover:text-white" />
            </div>
          </div>

          {/* العمود الثاني: روابط سريعة */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              روابط هامة
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-blue-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/dashboard" className="hover:text-blue-400 hover:translate-x-[-5px] transition-all inline-block">لوحة التحكم</Link></li>
              <li><Link href="/dashboard/stores" className="hover:text-blue-400 hover:translate-x-[-5px] transition-all inline-block">المخازن</Link></li>
              <li><Link href="/invoices" className="hover:text-blue-400 hover:translate-x-[-5px] transition-all inline-block">الفواتير</Link></li>
              <li><Link href="/employees" className="hover:text-blue-400 hover:translate-x-[-5px] transition-all inline-block">الموظفين</Link></li>
            </ul>
          </div>

          {/* العمود الثالث: الدعم والمساعدة */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              الدعم الفني
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-purple-600 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/support" className="hover:text-purple-400 hover:translate-x-[-5px] transition-all inline-block">مركز المساعدة</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 hover:translate-x-[-5px] transition-all inline-block">الشروط والأحكام</Link></li>
              <li><Link href="/privacy" className="hover:text-purple-400 hover:translate-x-[-5px] transition-all inline-block">سياسة الخصوصية</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 hover:translate-x-[-5px] transition-all inline-block">اتصل بنا</Link></li>
            </ul>
          </div>

          {/* العمود الرابع: تواصل معنا */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              تواصل معنا
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-emerald-600 rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>القاهرة، مصر - التجمع الخامس<br/>شارع التسعين</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-500 shrink-0" />
                <span dir="ltr" className="hover:text-white transition-colors cursor-pointer">+20 100 000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-500 shrink-0" />
                <span className="hover:text-white transition-colors cursor-pointer">support@example.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* الفاصل السفلي */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center md:text-right">
            © {currentYear} جميع الحقوق محفوظة <span className="text-gray-300 font-medium">لنظام الإدارة</span>.
          </p>
          
          <p className="text-sm text-gray-500 flex items-center gap-1 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800">
            تم التطوير بواسطة <span className="text-white font-semibold">فريق التطوير</span> 
            <Heart size={14} className="text-red-500 fill-current animate-pulse" />
          </p>
        </div>

      </div>
    </footer>
  );
}

// مكون مساعد لأيقونات التواصل الاجتماعي
function SocialIcon({ Icon, href, color }) {
  return (
    <a 
      href={href} 
      className={`p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 transition-all duration-300 hover:border-gray-600 hover:-translate-y-1 ${color}`}
    >
      <Icon size={18} />
    </a>
  );
}