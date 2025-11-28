import { getCurrentUser } from "@/app/lib/auth";
import User from "@/models/User";
import { requestRenewal } from "@/app/actions/billingActions";
import { CreditCard, CheckCircle, AlertTriangle, Wallet, QrCode, ArrowRight, Smartphone } from "lucide-react";

export default async function BillingPage() {
  const currentUser = await getCurrentUser();
  const user_id = currentUser._id
  const user = await User.findById(user_id).lean();
  console.log("object" , user + "user_id" + user_id)
  
  const subscription = user.subscription || {};
  const startDate = subscription.startDate ? new Date(subscription.startDate) : new Date();
  const endDate = subscription.endDate ? new Date(subscription.endDate) : new Date();
  const now = new Date();
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  let percentageLeft = 0;
  if (totalDuration > 0) {
      percentageLeft = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }
  
  const isExpired = now > endDate;
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  const formattedEndDate = endDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 font-sans relative overflow-hidden" dir="rtl">
      
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px] -z-10" />
      
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                    <Wallet className="text-indigo-400" size={32} />
                </div>
                <span>إدارة الاشتراك</span>
            </h1>
            <p className="text-gray-400 mt-2 mr-16">تابع حالة باقتك وجدد اشتراكك بسهولة.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* تفاصيل الباقة (الجزء الأيمن) - لم يتغير */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              <div className={`absolute top-0 right-0 w-2 h-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-gray-400 text-sm font-medium mb-1">الباقة الحالية</h2>
                    <div className="text-4xl font-bold text-white uppercase tracking-tight font-sans">
                        {subscription.plan || "TRIAL"} <span className="text-lg text-gray-500 font-normal">PLAN</span>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${isExpired ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                    {isExpired ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
                    {isExpired ? "منتهي" : "نشط"}
                </div>
              </div>
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-400">المدة المستهلكة</span>
                    <span className={`font-bold ${isExpired ? "text-red-400" : "text-emerald-400"}`}>
                        {isExpired ? "انتهت الصلاحية" : `باقي ${daysLeft} يوم`}
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700/50">
                    <div className={`h-full rounded-full transition-all duration-1000 relative ${isExpired ? 'bg-red-500' : 'bg-gradient-to-l from-emerald-400 to-cyan-500'}`} style={{ width: `${isExpired ? 100 : percentageLeft}%` }}>
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                    <span>تاريخ البدء: {startDate.toLocaleDateString('ar-EG')}</span>
                    <span>الانتهاء: {formattedEndDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* قسم الدفع (الجزء الأيسر المعدل) */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-[#111318] to-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl sticky top-6">
                
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">تجديد الاشتراك</h3>
                    <div className="inline-flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">60</span>
                        <span className="text-lg text-gray-400">ج.م / شهرياً</span>
                    </div>
                </div>

                {/* طرق الدفع المعدلة */}
                <div className="space-y-3 mb-6">
                    
                    {/* خيار المحافظ الإلكترونية */}
                    <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 hover:border-red-500/30 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/20">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">محافظ إلكترونية</p>
                                    <p className="text-[10px] text-gray-400">فودافون كاش، اتصالات، أورانج، وي</p>
                                </div>
                            </div>
                            <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-1 rounded border border-red-500/20">يقبل الكل</span>
                        </div>
                        <div className="text-center bg-black/20 p-2 rounded-lg mt-2 border border-white/5">
                            <p className="text-lg font-mono font-bold text-white ltr tracking-widest" dir="ltr">010 1234 5678</p>
                        </div>
                    </div>

                    {/* انستا باي */}
                    <div className="bg-gray-800/80 p-4 rounded-xl flex items-center justify-between border border-gray-700/50 hover:border-purple-500/30 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/20">
                                <QrCode size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">InstaPay</p>
                                <p className="text-xs text-gray-400">username@instapay</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* فورم الإرسال مع حقل رقم العملية */}
                <form action={requestRenewal} className="space-y-4">
                    <input type="hidden" name="userId" value={user._id.toString()} />
                    
                    <div>
                        <label className="block text-xs text-gray-400 mb-2 mr-1 font-medium">بيانات عملية الدفع (مطلوب)</label>
                        <input 
                            type="text" 
                            name="transactionId"
                            required
                            placeholder="اكتب رقم العملية أو رقم المحفظة المحول منها"
                            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 mr-1">
                            * سيظهر هذا الرقم للإدارة لتأكيد التحويل وتفعيل الحساب.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!isExpired && daysLeft > 5} 
                        className={`w-full py-4 rounded-xl font-bold text-md transition-all shadow-lg flex items-center justify-center gap-2 group
                        ${(!isExpired && daysLeft > 5) 
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700" 
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-indigo-500/25 transform hover:-translate-y-1"
                        }`}
                    >
                        {(!isExpired && daysLeft > 5) ? (
                            "الاشتراك ساري حالياً"
                        ) : (
                            <>
                                <span>تأكيد الدفع وإرسال الطلب</span>
                                <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}