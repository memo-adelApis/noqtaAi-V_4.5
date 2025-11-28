import Providers from "./Provider";
import ToastProvider from "../components/ToastProvider"; // عدل المسار حسب مكان الملف
import "./globals.css";

export const metadata = {
  title: "منصة نقطتة - إدارة الأعمال بالذكاء الاصطناعي",
  description: "حوّل بياناتك إلى قرارات ذكية باستخدام الذكاء الاصطناعي",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className="dark bg-gray-1000">
      <body className="bg-gray-100 w-full">
        <Providers>
          {children}
          <ToastProvider /> {/* هنا نضيف المكون Client */}
        </Providers>
      </body>
    </html>
  );
}
