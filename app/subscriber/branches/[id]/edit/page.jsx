import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { connectToDB } from '@/utils/database';
import Branch from '@/models/Branches';
import { Building, ArrowRight } from "lucide-react";
import EditBranchForm from '@/components/subscriber/EditBranchForm';

export default async function EditBranchPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'subscriber') {
    redirect('/login');
  }

  await connectToDB();

  const resolvedParams = await params;
  const branchId = resolvedParams.id;

  // جلب بيانات الفرع
  const branch = await Branch.findOne({ 
    _id: branchId, 
    userId: session.user.id 
  }).lean();

  if (!branch) {
    redirect('/subscriber/branches');
  }

  // تحويل ObjectId إلى string
  const serializedBranch = {
    ...branch,
    _id: branch._id.toString(),
    userId: branch.userId.toString(),
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt.toISOString()
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <a href="/subscriber/branches" className="hover:text-white transition">الفروع</a>
          <ArrowRight size={16} />
          <span>تعديل الفرع</span>
        </div>
        
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building className="text-blue-500" />
          تعديل الفرع
        </h1>
        <p className="text-gray-400 mt-2">
          تعديل بيانات الفرع: {branch.name}
        </p>
      </div>

      {/* نموذج تعديل الفرع */}
      <EditBranchForm branch={serializedBranch} />

      {/* معلومات إضافية */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
        <h3 className="font-medium text-yellow-400 mb-3">⚠️ ملاحظات مهمة:</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• تعديل اسم الفرع لن يؤثر على البيانات المرتبطة به</li>
          <li>• جميع الفواتير والمعاملات ستبقى مرتبطة بالفرع</li>
          <li>• يمكن تعديل الموقع دون تأثير على العمليات الجارية</li>
          <li>• تأكد من صحة البيانات قبل الحفظ</li>
        </ul>
      </div>
    </div>
  );
}