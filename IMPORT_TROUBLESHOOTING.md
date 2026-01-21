# دليل استكشاف أخطاء الاستيراد

## المشكلة التي تم حلها
```
Attempted import error: 'sendNotification' is not exported from '@/app/actions/notificationActions'
```

## الأسباب المحتملة والحلول

### 1. مشكلة في التصدير
**المشكلة**: الدالة غير مصدرة بشكل صحيح
**الحل**: تأكد من وجود `export` قبل الدالة

```javascript
// ✅ صحيح
export async function sendNotification(formData) {
  // ...
}

// ❌ خطأ
async function sendNotification(formData) {
  // ...
}
```

### 2. مشكلة في الاستيراد
**المشكلة**: استيراد خاطئ للدالة
**الحل**: تأكد من صحة اسم الدالة والمسار

```javascript
// ✅ صحيح
import { sendNotification } from "@/app/actions/notificationActions";

// ❌ خطأ
import { SendNotification } from "@/app/actions/notificationActions";
```

### 3. مشكلة في Cache
**المشكلة**: Next.js يحتفظ بنسخة قديمة من الملف
**الحل**: 
- إعادة تشغيل الخادم
- مسح `.next` folder
- Hard refresh في المتصفح

### 4. مشكلة في بنية الملف
**المشكلة**: خطأ في syntax يمنع تحميل الملف
**الحل**: التحقق من:
- الأقواس المتطابقة
- الفواصل المنقوطة
- استيرادات صحيحة

## الملفات المحدثة

### 1. `app/actions/notificationActions.js`
- إضافة تعليقات للدوال
- تنظيم الكود
- التأكد من التصدير الصحيح

### 2. `app/admin/notifications/page.jsx`
- إزالة الاستيرادات غير المستخدمة
- تنظيف الكود

### 3. `app/actions/index.js` (جديد)
- ملف فهرس لتصدير جميع الإجراءات
- تسهيل الاستيراد المركزي

### 4. `app/actions/testImports.js` (جديد)
- اختبار صحة الاستيرادات
- تشخيص المشاكل

## كيفية اختبار الإصلاح

### 1. اختبار مباشر
```javascript
import { sendNotification } from '@/app/actions/notificationActions';
console.log(typeof sendNotification); // should be 'function'
```

### 2. اختبار في المكون
```javascript
import { sendNotification } from '@/app/actions/notificationActions';

export default function TestComponent() {
  const handleTest = async () => {
    const formData = new FormData();
    formData.append('title', 'Test');
    formData.append('message', 'Test message');
    formData.append('type', 'info');
    formData.append('target', 'all');
    
    const result = await sendNotification(formData);
    console.log(result);
  };
  
  return <button onClick={handleTest}>Test</button>;
}
```

## الدوال المتاحة في notificationActions

- `sendNotification(formData)` - إرسال إشعار
- `markNotificationAsRead(notificationId)` - تحديد كمقروء
- `markAllNotificationsAsRead(userId)` - تحديد الكل كمقروء
- `archiveNotification(notificationId)` - أرشفة إشعار
- `deleteNotification(notificationId)` - حذف إشعار
- `activateUserSubscription(formData)` - تفعيل اشتراك
- `requestRenewal(formData)` - طلب تجديد

## نصائح لتجنب المشاكل المستقبلية

1. **استخدم TypeScript** للتحقق من الأنواع
2. **اختبر الاستيرادات** بعد كل تغيير
3. **استخدم ESLint** للتحقق من الأخطاء
4. **تنظيم الملفات** في مجلدات منطقية
5. **توثيق الدوال** بتعليقات واضحة