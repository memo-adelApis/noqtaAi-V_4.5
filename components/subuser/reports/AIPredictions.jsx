import { Sparkles, Target, Activity, ArrowUpRight } from 'lucide-react';

export default function AIPredictions({ data }) {
    if (!data) return null;

    return (
        <div className="bg-gradient-to-br from-[#1c1d22] to-[#15161a] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden h-full">
            {/* خلفية جمالية */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                        <Sparkles className="text-purple-400" size={20} />
                    </div>
                    <h3 className="font-bold text-white text-lg">التحليل الذكي والتوقعات</h3>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                    AI Beta
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                {/* التوقع القادم */}
                <div className="col-span-2 bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Target size={12} />
                        التوقعات للشهر القادم
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                        {Math.round(data.prediction.nextMonthRevenue).toLocaleString()} <span className="text-sm font-normal text-gray-500">ج.م</span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2">
                        * بناءً على تحليل الانحدار الخطي لبياناتك السابقة
                    </p>
                </div>

                {/* حالة الفرع */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">حالة الفرع</p>
                    <p className="font-bold text-emerald-400 text-lg">{data.branchHealth}</p>
                </div>

                {/* هدف الربحية (مثال حسابي) */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-2">هدف الربحية المقترح</p>
                    <div className="flex items-center gap-1 text-blue-400 font-bold text-lg">
                        <span>25%</span>
                        <ArrowUpRight size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
}