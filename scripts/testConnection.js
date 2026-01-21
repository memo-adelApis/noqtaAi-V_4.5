/**
 * اختبار الاتصال بقاعدة البيانات قبل تشغيل سكريبت الملء
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// تحميل متغيرات البيئة بهدوء
config({ quiet: true });

const testConnection = async () => {
  try {
    console.log('🔍 اختبار الاتصال بقاعدة البيانات...');
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI غير موجود في ملف .env');
    }
    
    console.log(`📡 محاولة الاتصال بـ: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 ثواني timeout
    });
    
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');
    
    // اختبار العمليات الأساسية
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 عدد المجموعات الموجودة: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 المجموعات الموجودة:');
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    }
    
    // اختبار الكتابة
    const testCollection = mongoose.connection.db.collection('test_connection');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    await testCollection.deleteOne({ test: true });
    
    console.log('✅ اختبار الكتابة نجح!');
    
    await mongoose.disconnect();
    console.log('✅ تم قطع الاتصال بنجاح');
    
    return true;
    
  } catch (error) {
    console.error('❌ فشل اختبار الاتصال:');
    
    if (error.message.includes('MONGODB_URI')) {
      console.error('🔧 الحل: أضف MONGODB_URI إلى ملف .env');
      console.error('مثال: MONGODB_URI=mongodb://localhost:27017/noqta_ai');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🔧 الحل: تأكد من تشغيل MongoDB على النظام');
    } else if (error.message.includes('authentication')) {
      console.error('🔧 الحل: تحقق من اسم المستخدم وكلمة المرور');
    } else if (error.message.includes('timeout')) {
      console.error('🔧 الحل: تحقق من عنوان قاعدة البيانات والشبكة');
    } else {
      console.error(`🔧 خطأ: ${error.message}`);
    }
    
    return false;
  }
};

// تشغيل الاختبار إذا تم استدعاؤه مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default testConnection;