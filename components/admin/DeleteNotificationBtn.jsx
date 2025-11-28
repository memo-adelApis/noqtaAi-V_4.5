"use client";

import { Trash2 } from "lucide-react";
import { deleteNotification } from "@/app/actions/adminActions";
// يمكنك إضافة useFormStatus هنا لاحقاً لإظهار loading أثناء الحذف

export default function DeleteNotificationBtn({ id }) {
  return (
    <form action={deleteNotification}>
      <input type="hidden" name="id" value={id} />
      <button 
        type="submit" 
        className="bg-gray-700 hover:bg-red-600 text-white p-2 rounded-lg transition shadow-md" 
        title="حذف الإشعار"
      >
        <Trash2 size={18} />
      </button>
    </form>
  );
}