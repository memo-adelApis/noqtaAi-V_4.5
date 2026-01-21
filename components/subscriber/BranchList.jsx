"use client";

import { Building, MapPin, Edit, Trash2 } from "lucide-react";
import { deleteBranch } from "@/app/actions/branchActions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function BranchList({ branches }) {
  const router = useRouter();

  const handleDelete = async (branchId, branchName) => {
    if (!confirm(`هل أنت متأكد من حذف الفرع "${branchName}"؟`)) {
      return;
    }

    const toastId = toast.loading('جاري حذف الفرع...');
    
    const result = await deleteBranch(branchId);
    
    toast.dismiss(toastId);
    
    if (result.success) {
      toast.success('تم حذف الفرع بنجاح');
      router.refresh();
    } else {
      toast.error(result.error || 'فشل حذف الفرع');
    }
  };

  if (branches.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
          <Building size={40} className="text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">لا توجد فروع مضافة</h3>
        <p className="text-gray-400 mb-6">ابدأ بإضافة أول فرع لشركتك الآن.</p>
        <a
          href="/subscriber/branches/add"
          className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
        >
          + إضافة فرع جديد
        </a>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800">
      {branches.map((branch) => (
        <div key={branch._id} className="p-6 hover:bg-gray-800/50 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <Building className="text-purple-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {branch.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <MapPin size={16} />
                  <span>{branch.location || 'لا يوجد موقع محدد'}</span>
                </div>
                <p className="text-xs text-gray-500">
                  تم الإنشاء: {new Date(branch.createdAt).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href={`/subscriber/branches/${branch._id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                title="تعديل الفرع"
              >
                <Edit size={16} />
              </a>
              <button 
                onClick={() => handleDelete(branch._id, branch.name)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                title="حذف الفرع"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}