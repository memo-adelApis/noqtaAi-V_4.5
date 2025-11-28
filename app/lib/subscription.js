// lib/subscription.js
import Invoice from "@/models/Invoice";
import Branch from "@/models/Branch";

export async function checkSubscriptionLimits(user) {
  const now = new Date();
  const endDate = new Date(user.subscription.endDate);
  
  // 1. هل الاشتراك منتهي الصلاحية؟
  // ينتهي إذا مر التاريخ المحدد أو قام الأدمن بإيقافه يدوياً
  const isExpired = now > endDate || !user.subscription.isActive;

  // إذا كان الاشتراك ساري (فترة تجريبية أو مدفوعة)، لا توجد قيود
  if (!isExpired) {
    return { restricted: false, reason: null };
  }

  // === 🛑 إذا انتهت الفترة المجانية (نطبق القيود) ===
  
  // قيد 1: عدد الفروع (فرع واحد فقط)
  const branchesCount = await Branch.countDocuments({ ownerId: user._id });
  const branchLimit = 1;
  
  // قيد 2: عدد الفواتير (20 فاتورة)
  const invoicesCount = await Invoice.countDocuments({ ownerId: user._id });
  const invoiceLimit = 20;

  return {
    restricted: true,
    isExpired: true,
    limits: {
      branches: { current: branchesCount, max: branchLimit, isReached: branchesCount >= branchLimit },
      invoices: { current: invoicesCount, max: invoiceLimit, isReached: invoicesCount >= invoiceLimit }
    }
  };
}