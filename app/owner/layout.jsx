import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import OwnerLayoutClient from "@/components/layout/OwnerLayoutClient";

export const metadata = {
  title: "لوحة المالك - نقطة AI",
  description: "لوحة تحكم المالك لإدارة المؤسسة",
};

export default async function OwnerLayout({ children }) {
  const session = await getServerSession(authOptions);

  // التحقق من تسجيل الدخول
  // if (!session) {
  //   redirect("/login");
  // }

  // // التحقق من صلاحية المالك
  // if (session.user.role !== "owner") {
  //   redirect("/"); // إعادة توجيه للصفحة الرئيسية إذا لم يكن مالك
  // }

  return (
    <OwnerLayoutClient user={session.user}>
      {children}
    </OwnerLayoutClient>
  );
}