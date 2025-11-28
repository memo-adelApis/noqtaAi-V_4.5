import { getCurrentUser } from "@/app/lib/auth"; // تأكد من المسار
import User from "@/models/User";
import SubscriberLayoutClient from "@/components/layout/SubscriberLayoutClient"; // استيراد المكون الجديد
import { redirect } from "next/navigation";

export default async function SubscriberLayout({ children }) {
  // 1. جلب الجلسة
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect('/login');
  }

  // 2. جلب أحدث بيانات المستخدم من الداتابيس (بما في ذلك حالة الاشتراك)
  const dbUser = await User.findById(sessionUser.id).select('name email role subscription image').lean();

  // 3. تحويل البيانات لتناسب المكون (Serializing)
  const userForClient = {
      ...dbUser,
      _id: dbUser._id.toString(),
      subscription: {
          ...dbUser.subscription,
          // تحويل التواريخ لنصوص لتجنب أخطاء React
          startDate: dbUser.subscription?.startDate?.toISOString(),
          endDate: dbUser.subscription?.endDate?.toISOString(),
      }
  };

  // 4. تمرير البيانات لمكون العميل
  return (
    <SubscriberLayoutClient user={userForClient}>
      {children}
    </SubscriberLayoutClient>
  );
}