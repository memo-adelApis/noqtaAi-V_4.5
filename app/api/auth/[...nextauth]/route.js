import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/utils/database";
import User from "@/models/User";

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("البيانات غير مكتملة");

        await connectToDB();
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) throw new Error("المستخدم غير موجود");
        if (!user.isActive) throw new Error("الحساب غير نشط");

        const isMatch = await user.comparePassword(credentials.password);
        if (!isMatch) throw new Error("كلمة المرور أو البريد الإلكتروني غير صحيح");

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          mainAccountId: user.mainAccountId,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.branchId = user.branchId;
        token.mainAccountId = user.mainAccountId;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.branchId = token.branchId;
        session.user.mainAccountId = token.mainAccountId;
        session.user.image = token.image;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
