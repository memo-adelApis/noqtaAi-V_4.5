# دليل استكشاف أخطاء البناء

## المشكلة التي تم حلها
```
MongooseError: Cannot call `users.countDocuments()` before initial connection is complete if `bufferCommands = false`
```

## الأسباب والحلول

### 1. مشكلة الاتصال بقاعدة البيانات أثناء البناء
**المشكلة**: Next.js يحاول تنفيذ استعلامات قاعدة البيانات أثناء البناء
**الحل**: استخدام دوال آمنة للبناء

### 2. الحلول المطبقة

#### أ. إنشاء دوال آمنة للبناء (`app/lib/buildSafeDb.js`)
```javascript
export async function safeDatabaseQuery(queryFunction, fallbackValue = null) {
  // تجاهل استعلامات قاعدة البيانات في بيئة الإنتاج
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    return fallbackValue;
  }
  
  try {
    await connectToDB();
    return await queryFunction();
  } catch (error) {
    console.warn('Database query failed during build:', error.message);
    return fallbackValue;
  }
}
```

#### ب. تحديث صفحة Admin
- استخدام `safeParallelQueries` بدلاً من `Promise.all`
- إرجاع قيم افتراضية في حالة فشل الاتصال
- معالجة أخطاء محسنة

#### ج. تحسين تكوين Next.js
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  // ...
};
```

### 3. استراتيجيات تجنب المشاكل

#### أ. استخدام Static Generation بحذر
```javascript
// ❌ خطأ - استعلام مباشر في Server Component
export default async function Page() {
  const users = await User.find(); // سيفشل أثناء البناء
  return <div>{users.length}</div>;
}

// ✅ صحيح - استخدام دالة آمنة
export default async function Page() {
  const users = await safeDatabaseQuery(
    () => User.find(),
    [] // قيمة افتراضية
  );
  return <div>{users.length}</div>;
}
```

#### ب. استخدام Client-side Data Fetching
```javascript
// للبيانات الديناميكية، استخدم useEffect
"use client";
import { useEffect, useState } from 'react';

export default function DynamicStats() {
  const [stats, setStats] = useState({ users: 0, invoices: 0 });
  
  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);
  
  return <div>Users: {stats.users}</div>;
}
```

#### ج. استخدام ISR (Incremental Static Regeneration)
```javascript
export const revalidate = 3600; // إعادة بناء كل ساعة

export default async function Page() {
  const stats = await getStats();
  return <StatsDisplay stats={stats} />;
}
```

### 4. متغيرات البيئة للبناء

#### `.env.production`
```bash
NODE_ENV=production
SKIP_DATABASE_CONNECTION=true
MONGODB_URI=your-production-uri
```

#### `.env.local` (للتطوير)
```bash
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/your-db
```

### 5. أوامر البناء المحسنة

#### للتطوير
```bash
npm run dev
```

#### للبناء المحلي
```bash
# تأكد من وجود قاعدة البيانات
npm run build

# أو تجاهل قاعدة البيانات
SKIP_DATABASE_CONNECTION=true npm run build
```

#### للنشر على Vercel
```bash
# Vercel سيستخدم متغيرات البيئة المكونة في لوحة التحكم
vercel --prod
```

### 6. نصائح إضافية

#### أ. فصل البيانات الثابتة عن الديناميكية
- البيانات الثابتة: في ملفات JSON أو constants
- البيانات الديناميكية: عبر API routes

#### ب. استخدام Fallback UI
```javascript
export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminStats />
    </Suspense>
  );
}
```

#### ج. تحسين الاستعلامات
```javascript
// ❌ بطيء - استعلامات متعددة
const users = await User.find();
const invoices = await Invoice.find();

// ✅ سريع - استعلام واحد مجمع
const [users, invoices] = await Promise.all([
  User.countDocuments(),
  Invoice.countDocuments()
]);
```

### 7. استكشاف الأخطاء

#### إذا استمر الخطأ:
1. تأكد من متغيرات البيئة
2. امسح مجلد `.next`
3. تأكد من إصدار Next.js
4. تحقق من إعدادات Mongoose

#### للتحقق من البناء محلياً:
```bash
# بناء محلي
npm run build

# تشغيل البناء
npm start
```

## الملفات المحدثة
- `app/admin/page.jsx` - صفحة آمنة للبناء
- `app/lib/buildSafeDb.js` - دوال آمنة لقاعدة البيانات
- `next.config.mjs` - تحسينات البناء
- `.env.build.example` - مثال متغيرات البيئة