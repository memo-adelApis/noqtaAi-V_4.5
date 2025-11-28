"use client";

import { 
    Code2, Database, Server, BarChart3, Mail, Github, Linkedin, 
    ExternalLink, MapPin, Phone, Globe, Layers, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DeveloperPage() {
    const router = useRouter();

    // بيانات المهارات
    const skills = [
        { name: "Next.js & React", icon: <Code2 className="text-blue-500" />, level: "متقدم" },
        { name: "Node.js (Backend)", icon: <Server className="text-green-500" />, level: "متقدم" },
        { name: ".NET Core", icon: <Layers className="text-purple-500" />, level: "متوسط" },
        { name: "SQL Server", icon: <Database className="text-red-500" />, level: "متقدم" },
        { name: "MongoDB", icon: <Database className="text-green-400" />, level: "متقدم" },
        { name: "Data Analysis", icon: <BarChart3 className="text-yellow-500" />, level: "متقدم" },
    ];

    // بيانات المشاريع
    const projects = [
        {
            title: "نظام إدارة الفواتير",
            desc: "نظام متكامل لإدارة الفواتير والمخزون باستخدام Next.js و SQL Server.",
            tags: ["Next.js", "SQL Server", "Tailwind"],
        },
        {
            title: "لوحة تحكم تحليل البيانات",
            desc: "داشبورد تفاعلي لعرض وتحليل البيانات الكبيرة باستخدام المخططات البيانية.",
            tags: ["React", "Data Analysis", "Recharts"],
        },
        {
            title: "منصة التجارة الإلكترونية",
            desc: "تطبيق متجر إلكتروني متكامل مع بوابات دفع API.",
            tags: [".NET Core", "MongoDB", "Next.js"],
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans relative" dir="rtl">
            
            {/* --- زر العودة (تمت إضافته هنا) --- */}
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 hover:bg-blue-600 text-gray-300 hover:text-white rounded-full border border-gray-700 hover:border-blue-500 transition-all duration-300 backdrop-blur-sm shadow-lg group"
                >
                    <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">عودة</span>
                </button>
            </div>

            {/* --- Hero Section --- */}
            <div className="relative overflow-hidden bg-[#14161f] border-b border-gray-800">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
                    
                    {/* النصوص */}
                    <div className="text-center md:text-right flex-1 z-10">
                        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-900/20 rounded-full border border-blue-800 animate-fade-in">
                            مطور ويب شامل & محلل بيانات
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
                            مرحباً، أنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">محمود عادل</span>
                        </h1>
                        <p className="mt-4 text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto md:mx-0">
                            أقوم بتحويل الأفكار المعقدة إلى حلول برمجية ذكية. متخصص في بناء تطبيقات الويب المتكاملة وتحليل البيانات لاستخراج رؤى قيمة تساعد في اتخاذ القرار.
                        </p>
                        
                        <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                            <a href="mailto:contact@mahmoud.com" className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center hover:shadow-blue-500/30">
                                <Mail className="ml-2 w-5 h-5" /> تواصل معي
                            </a>
                            <a href="#" className="px-8 py-3 rounded-lg bg-[#1c1d22] border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium transition-all flex items-center hover:text-white hover:border-gray-500">
                                <Github className="ml-2 w-5 h-5" /> GitHub
                            </a>
                        </div>
                    </div>

                    {/* الصورة الشخصية */}
                    <div className="relative z-10">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full p-1 bg-gradient-to-br from-blue-500 to-emerald-500 shadow-2xl shadow-blue-500/20 mx-auto animate-pulse-slow">
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#1c1d22] relative">
                                <img 
                                    src="https://ui-avatars.com/api/?name=Mahmoud+Adel&background=0D8ABC&color=fff&size=256&font-size=0.33" 
                                    alt="Mahmoud Adel" 
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Skills Section --- */}
            <div className="py-16 bg-[#0f111a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-2">مهاراتي التقنية</h2>
                        <p className="text-gray-400">مجموعة الأدوات والتقنيات التي أستخدمها لبناء المشاريع</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skills.map((skill, index) => (
                            <div key={index} className="bg-[#1c1d22] border border-gray-800 p-6 rounded-xl hover:-translate-y-1 transition-transform duration-300 hover:shadow-xl hover:border-gray-700 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-gray-900/50 rounded-lg group-hover:bg-gray-800 transition-colors">
                                        {skill.icon}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 group-hover:text-blue-400 transition-colors">{skill.level}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-200 group-hover:text-white transition-colors">{skill.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Projects Section --- */}
            <div className="py-16 bg-[#14161f] border-y border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">أحدث المشاريع</h2>
                            <p className="text-gray-400">بعض الأعمال التي قمت بتطويرها مؤخراً</p>
                        </div>
                        <a href="#" className="hidden md:flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium hover:underline">
                            عرض الكل <ExternalLink size={16} className="mr-1" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <div key={index} className="bg-[#0f111a] border border-gray-800 rounded-xl overflow-hidden hover:border-blue-900/50 transition-colors group flex flex-col">
                                <div className="h-48 bg-gray-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] to-transparent opacity-60" />
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 group-hover:text-blue-500 transition-colors duration-500">
                                        <Code2 size={48} opacity={0.5} />
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-1">
                                        {project.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {project.tags.map((tag, i) => (
                                            <span key={i} className="px-2 py-1 text-xs font-medium bg-blue-900/10 text-blue-400 rounded border border-blue-900/20">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Contact Footer --- */}
            <div className="py-16 bg-[#0f111a]">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">دعنا نعمل معاً</h2>
                    <p className="text-gray-400 mb-10">
                        هل لديك مشروع في ذهنك؟ أو تبحث عن مطور للانضمام لفريقك؟ <br />
                        أنا متاح دائماً لمناقشة طرق جديدة للمساعدة.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="p-6 rounded-xl bg-[#1c1d22] border border-gray-800 hover:border-blue-900/50 transition-colors group">
                            <Mail className="w-8 h-8 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="text-white font-medium mb-1">البريد الإلكتروني</h4>
                            <p className="text-sm text-gray-400">mahmoud@example.com</p>
                        </div>
                        <div className="p-6 rounded-xl bg-[#1c1d22] border border-gray-800 hover:border-emerald-900/50 transition-colors group">
                            <Phone className="w-8 h-8 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="text-white font-medium mb-1">الهاتف</h4>
                            <p className="text-sm text-gray-400">+20 123 456 7890</p>
                        </div>
                        <div className="p-6 rounded-xl bg-[#1c1d22] border border-gray-800 hover:border-red-900/50 transition-colors group">
                            <MapPin className="w-8 h-8 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="text-white font-medium mb-1">الموقع</h4>
                            <p className="text-sm text-gray-400">القاهرة، مصر</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="py-6 border-t border-gray-800 text-center bg-[#0f111a]">
                <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} محمود عادل. جميع الحقوق محفوظة.
                </p>
            </div>
        </div>
    );
}