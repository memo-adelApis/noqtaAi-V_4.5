import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Building, ArrowRight } from "lucide-react";
import { redirect } from 'next/navigation';
import AddBranchForm from '@/components/subscriber/AddBranchForm';

export default async function AddBranchPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <a href="/subscriber/branches" className="hover:text-white transition">الفروع</a>
          <ArrowRight size={16} />
          <span>إضافة فرع جديد</span>
        </div>
        
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building className="text-purple-500" />
          إضافة فرع جديد
        </h1>
        <p className="text-gray-400 mt-2">
          أضف فرع جديد لمؤسستك لتنظيم العمل بشكل أفضل
        </p>
      </div>

      {/* نموذج إضافة الفرع */}
      <AddBranchForm />

      {/* نصائح */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="font-medium text-blue-400 mb-3">💡 نصائح لاختيار اسم الفرع:</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• استخدم أسماء جغرافية واضحة (مثل: فرع الرياض، فرع الدمام)</li>
          <li>• أو استخدم أسماء وظيفية (مثل: الفرع الرئيسي، فرع المبيعات)</li>
          <li>• تجنب الأسماء المعقدة أو الطويلة جداً</li>
          <li>• تأكد من أن الاسم مميز وغير مكرر</li>
        </ul>
      </div>
    </div>
  );
}