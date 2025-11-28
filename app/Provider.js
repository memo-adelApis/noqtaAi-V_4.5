"use client";

import { SessionProvider } from "next-auth/react";

/**
 * هذا المكون هو "Client Component"
 * ويقوم بتغليف التطبيق بـ SessionProvider
 * لكي تتمكن المكونات الأخرى من الوصول لبيانات الجلسة (مثل useSession)
 */
export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}