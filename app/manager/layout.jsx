import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ManagerLayoutClient from "@/components/layout/ManagerLayoutClient";

export const metadata = {
  title: "لوحة المدير - نقطة AI",
  description: "لوحة تحكم المدير لإدارة الفرع",
};

export default async function ManagerLayout({ children }) {
  const session = await getServerSession(authOptions);

  // التحقق من تسجيل الدخول
  if (!session) {
    redirect("/login");
  }

  // التحقق من صلاحية المدير
  if (session.user.role !== "manager") {
    redirect("/"); // إعادة توجيه للصفحة الرئيسية إذا لم يكن مدير
  }

  return (
    <ManagerLayoutClient user={session.user}>
      {children}
    </ManagerLayoutClient>
  );
}