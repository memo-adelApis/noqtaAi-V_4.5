"use client"; // مهم جدًا: هذا المكون Client Component

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return <ToastContainer  position="top-center" />;
}
