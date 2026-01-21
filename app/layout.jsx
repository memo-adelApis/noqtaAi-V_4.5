import Providers from "./Provider";
import ToastProvider from "../components/ToastProvider";
import "./globals.css";

export const metadata = {
  title: "منصة نقطة - إدارة الأعمال بالذكاء الاصطناعي",
  description: "حول بياناتك لقرارات ذكية باستخدام الذكاء الاصطناعي",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar-EG" dir="rtl" className="dark bg-gray-1000">
      {/* 2. إضافة min-h-screen لضمان أن الخلفية تغطي الشاشة كاملة حتى لو المحتوى قليل */}
      {/* إضافة overflow-x-hidden لمنع السكرول العرضي غير المرغوب فيه */}
      <body className="bg-gray-100 w-full min-h-screen overflow-x-hidden flex flex-col" style={{ unicodeBidi: 'plaintext' }}>
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
