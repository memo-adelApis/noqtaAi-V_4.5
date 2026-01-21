/**
 * سكريبت لاختبار نظام المصادقة في المتجر
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// تحميل متغيرات البيئة
config({ quiet: true });

import ShopUser from '../models/ShopUser.js';

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

const testShopAuth = async () => {
  try {
    await connectDB();

    console.log('🧪 اختبار نظام المصادقة في المتجر...');
    console.log('');

    // إنشاء مستخدم تجريبي
    console.log('1. إنشاء مستخدم تجريبي...');
    
    // حذف المستخدم إذا كان موجوداً
    await ShopUser.deleteOne({ phone: '0501234567' });
    
    const testUser = new ShopUser({
      name: 'أحمد محمد',
      phone: '0501234567',
      registrationType: 'phone'
    });

    // اختبار إنشاء رمز التحقق
    const verificationCode = testUser.generateVerificationCode();
    console.log(`   📱 رمز التحقق: ${verificationCode}`);
    console.log(`   ⏰ ينتهي في: ${testUser.phoneVerification.expiresAt}`);

    await testUser.save();
    console.log('   ✅ تم إنشاء المستخدم بنجاح');
    console.log('');

    // اختبار التحقق من الرمز
    console.log('2. اختبار التحقق من الرمز...');
    
    // اختبار رمز خاطئ
    let result = testUser.verifyCode('123456');
    console.log(`   ❌ رمز خاطئ: ${result.message}`);
    
    // اختبار الرمز الصحيح
    result = testUser.verifyCode(verificationCode);
    console.log(`   ✅ رمز صحيح: ${result.message}`);
    
    await testUser.save();
    console.log('');

    // اختبار إنشاء JWT
    console.log('3. اختبار إنشاء JWT...');
    const token = testUser.generateAuthToken();
    console.log(`   🔑 JWT Token: ${token.substring(0, 50)}...`);
    console.log('');

    // اختبار كلمة المرور
    console.log('4. اختبار كلمة المرور...');
    testUser.password = 'password123';
    await testUser.save();
    
    const isPasswordValid = await testUser.comparePassword('password123');
    console.log(`   ✅ كلمة المرور الصحيحة: ${isPasswordValid}`);
    
    const isPasswordInvalid = await testUser.comparePassword('wrongpassword');
    console.log(`   ❌ كلمة المرور الخاطئة: ${isPasswordInvalid}`);
    console.log('');

    // اختبار السلة
    console.log('5. اختبار وظائف السلة...');
    
    // إضافة منتج للسلة
    await testUser.addToCart('507f1f77bcf86cd799439011', 2, 100);
    console.log(`   ✅ تم إضافة منتج للسلة`);
    console.log(`   💰 إجمالي السلة: ${testUser.getCartTotal()} جنيه`);
    
    // تحديث الكمية
    await testUser.updateCartQuantity('507f1f77bcf86cd799439011', 3);
    console.log(`   ✅ تم تحديث الكمية`);
    console.log(`   💰 إجمالي السلة الجديد: ${testUser.getCartTotal()} جنيه`);
    
    // إزالة من السلة
    await testUser.removeFromCart('507f1f77bcf86cd799439011');
    console.log(`   ✅ تم إزالة المنتج من السلة`);
    console.log(`   💰 إجمالي السلة: ${testUser.getCartTotal()} جنيه`);
    console.log('');

    // عرض معلومات المستخدم النهائية
    console.log('📊 معلومات المستخدم النهائية:');
    console.log(`   👤 الاسم: ${testUser.name}`);
    console.log(`   📱 الهاتف: ${testUser.phone}`);
    console.log(`   ✅ محقق: ${testUser.phoneVerification?.isVerified}`);
    console.log(`   🔐 لديه كلمة مرور: ${!!testUser.password}`);
    console.log(`   🛒 عناصر السلة: ${testUser.cart.length}`);
    console.log(`   📅 تاريخ الإنشاء: ${testUser.createdAt}`);
    console.log('');

    console.log('🎉 جميع الاختبارات نجحت!');
    console.log('');
    console.log('🔗 اختبار API endpoints:');
    console.log('   POST /api/shop/auth/register');
    console.log('   POST /api/shop/auth/login');
    console.log('   POST /api/shop/auth/verify');
    console.log('   POST /api/shop/auth/resend-code');

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    process.exit(1);
  }
};

// تشغيل الاختبار
testShopAuth();