<div align="center">
  <br />
    <a href="https://github.com/github_username/noqta-ai" target="_blank">
      <img src="https://via.placeholder.com/150/4f46e5/FFFFFF?text=Noqta+AI" alt="Noqta AI Logo" width="120" height="120" style="border-radius: 20px;">
    </a>
  <br />

  <h1>🚀 Noqta AI (Beta)</h1>

  <p>
    <strong>منصة ذكية لتحليل البيانات المالية وإدارة الفروع باستخدام الذكاء الاصطناعي</strong>
  </p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js"></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS"></a>
    <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb" alt="MongoDB"></a>
    <img src="https://img.shields.io/badge/Status-Beta-orange?style=flat-square" alt="Status">
  </p>
</div>

<br />

## 📖 نبذة عن المشروع
**Noqta AI** هو تطبيق ويب متكامل يهدف إلى مساعدة أصحاب الأعمال ومديري الفروع على فهم بياناتهم المالية بشكل أعمق. لا يكتفي التطبيق بعرض الأرقام، بل يستخدم خوارزميات **الانحدار الخطي (Linear Regression)** للتنبؤ بالإيرادات المستقبلية وتحليل اتجاهات النمو.

> **ملاحظة:** هذا المشروع حالياً في مرحلة **النسخة التجريبية (Beta)** ويخضع للتطوير المستمر.

---

## ✨ المميزات الرئيسية

* **📊 لوحات تحكم تفاعلية:** رسوم بيانية ديناميكية (باستخدام `Recharts`) لعرض الإيرادات، المصروفات، وصافي الربح.
* **🤖 تحليلات الذكاء الاصطناعي:**
    * توقع الإيرادات للشهر القادم.
    * حساب معدلات النمو وتحديد حالة الفرع (صعودي/هبوطي).
    * تحديد أفضل الشهور أداءً وأكثرها توفيراً للمصروفات.
* **👥 نظام صلاحيات متعدد:**
    * **Admin:** إدارة كاملة للنظام والمستخدمين.
    * **Subuser:** إدارة فرع محدد والاطلاع على تقاريره الخاصة.
* **⚡ أداء عالي:** مبني على **Next.js 15 (App Router)** لسرعة فائقة وتجربة مستخدم سلسة.
* **🌍 دعم اللغة العربية:** واجهة مستخدم مصممة بالكامل لتدعم الاتجاه من اليمين لليسار (RTL).

---

## 🛠 التقنيات المستخدمة (Tech Stack)

* **الواجهة الأمامية (Frontend):** Next.js 15, React, Tailwind CSS, Lucide React (Icons).
* **الرسوم البيانية:** Recharts.
* **الواجهة الخلفية (Backend):** Next.js Server Actions.
* **قاعدة البيانات:** MongoDB (via Mongoose).
* **التحليل الإحصائي:** Simple-statistics Library.
* **المصادقة:** Custom Auth / NextAuth (Authentication).

---

## 📸 لقطات شاشة (Screenshots)

| لوحة التحكم (الوضع الداكن) | تقارير الذكاء الاصطناعي |
|:---:|:---:|
| <img src="https://via.placeholder.com/600x300/1e1b4b/FFFFFF?text=Dashboard+Preview" alt="Dashboard" width="100%"> | <img src="https://via.placeholder.com/600x300/312e81/FFFFFF?text=AI+Predictions" alt="AI Reports" width="100%"> |

*(سيتم إضافة صور حقيقية قريباً)*

---

## 🚀 طريقة التشغيل (Getting Started)

لتشغيل المشروع على جهازك المحلي، اتبع الخطوات التالية:

### 1. استنساخ المستودع (Clone)
```bash
git clone [https://github.com/YOUR_USERNAME/noqta-ai.git](https://github.com/YOUR_USERNAME/noqta-ai.git)
cd noqta-ai