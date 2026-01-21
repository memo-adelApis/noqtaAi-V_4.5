import { getSubuserDashboardData } from '@/app/actions/dashboardActions';
import SubuserDashboard from '@/components/subuser/SubuserDashboard';

// --- صفحة لوحة التحكم (Server Component) ---
export default async function SubuserHomePage() {
    const { data, error } = await getSubuserDashboardData();

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <div className="bg-red-900/20 border border-red-800/50 text-red-400 rounded-2xl p-8 max-w-md">
                    <h2 className="font-bold text-xl mb-2">خطأ في جلب البيانات</h2>
                    <p>{error || "لم نتمكن من جلب بيانات لوحة التحكم."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 py-8 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <SubuserDashboard initialData={data} error={error} />
            </div>
        </div>
    );
}