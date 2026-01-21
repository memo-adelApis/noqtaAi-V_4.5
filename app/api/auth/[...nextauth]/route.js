import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";
import { z } from "zod";
import { LoginLogService } from "../../../../utils/notificationService";

// التحقق من صحة المدخلات
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // 1. التحقق من صحة البيانات (Zod)
        const validation = loginSchema.safeParse(credentials);

        if (!validation.success) {
          // تسجيل محاولة دخول فاشلة - بيانات غير صالحة
          await LoginLogService.logLoginAttempt(
            credentials?.email || 'unknown',
            'failed',
            req,
            null,
            'بيانات غير صالحة'
          );
          throw new Error("بيانات الدخول غير صالحة");
        }

        await connectToDB();

        // جلب المستخدم مع كلمة المرور (لأنها select: false في الموديل)
        const user = await User.findOne({ email: credentials.email }).select("+password");

        // 2. الحماية من "تعداد المستخدمين" (User Enumeration)
        if (!user || !(await user.comparePassword(credentials.password))) {
          // تسجيل محاولة دخول فاشلة - بيانات خاطئة
          await LoginLogService.logLoginAttempt(
            credentials.email,
            'failed',
            req,
            user?._id || null,
            user ? 'كلمة مرور خاطئة' : 'مستخدم غير موجود'
          );
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }

        // 3. التحقق من حالة الحساب (Global Account Ban)
        if (user.isActive === false) {
          // تسجيل محاولة دخول فاشلة - حساب معطل
          await LoginLogService.logLoginAttempt(
            credentials.email,
            'failed',
            req,
            user._id,
            'حساب معطل'
          );
          throw new Error("تم تعطيل هذا الحساب. يرجى التواصل مع الدعم الفني.");
        }

        // 4. تسجيل محاولة دخول ناجحة
        await LoginLogService.logLoginAttempt(
          credentials.email,
          'success',
          req,
          user._id
        );

        // 5. التحقق من حالة الاشتراك وتمريرها
        const isSubscriptionActive = user.subscription?.isActive ?? false;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          mainAccountId: user.mainAccountId,
          image: user.image,
          subscriptionActive: isSubscriptionActive,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // 🔥 جديد: التحقق الأمني عند الدخول عبر Google
    async signIn({ user, account }) {
      // إذا كان الدخول عبر Credentials، فقد تم التحقق بالفعل في authorize
      if (account.provider === "credentials") return true;

      // إذا كان الدخول عبر Google أو أي مزود آخر
      if (account.provider === "google") {
        try {
          await connectToDB();
          const existingUser = await User.findOne({ email: user.email });

          // إذا وجدنا المستخدم وكان محظوراً، نمنع الدخول
          if (existingUser && existingUser.isActive === false) {
            // إرجاع false يعيد المستخدم لصفحة الدخول مع رسالة خطأ عامة
            // أو يمكن رمي Error لتخصيص الرسالة إذا كانت الواجهة تدعم ذلك
            return false; 
          }
          
          return true;
        } catch (error) {
          console.error("Error inside signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    // نقل البيانات من المستخدم إلى التوكن
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.branchId = user.branchId;
        token.mainAccountId = user.mainAccountId;
        token.image = user.image;
        token.subscriptionActive = user.subscriptionActive;
      }
      return token;
    },

    // نقل البيانات من التوكن إلى الجلسة (ليراها الـ Client)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.branchId = token.branchId;
        session.user.mainAccountId = token.mainAccountId;
        session.user.image = token.image;
        session.user.subscriptionActive = token.subscriptionActive;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
