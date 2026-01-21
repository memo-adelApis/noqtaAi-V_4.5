"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// تحميل ToastContainer بشكل ديناميكي لتجنب مشاكل SSR
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  {
    ssr: false,
    loading: () => null
  }
);

export default function ToastProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // تأكد من تحميل CSS
    import("react-toastify/dist/ReactToastify.css");
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ToastContainer
      position="top-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={true}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastStyle={{
        backgroundColor: '#1f2937',
        color: '#f9fafb',
        border: '1px solid #374151',
        borderRadius: '8px',
        fontFamily: 'Cairo, sans-serif'
      }}
      progressStyle={{
        backgroundColor: '#3b82f6'
      }}
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="إغلاق"
        >
          ✕
        </button>
      )}
    />
  );
}
