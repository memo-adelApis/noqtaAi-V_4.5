/**
 * سكريبت للتحقق من المتاجر الموجودة
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// تحميل متغيرات البيئة
config({ quiet: true });

import Shop from '../models/Shop.js';
import User from '../models/User.js';

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

const checkShops = async () => {
  try {
    await connectDB();

    const shops = await Shop.find({}).populate('subscriberId', 'name email');
    
    console.log(`📊 عدد المتاجر الموجودة: ${shops.length}`);
    console.log('');

    shops.forEach((shop, index) => {
      console.log(`${index + 1}. ${shop.name}`);
      console.log(`   🔗 الاسم الفريد: ${shop.uniqueName}`);
      console.log(`   🌐 الرابط: http://localhost:3000/shop/${shop.uniqueName}`);
      console.log(`   👤 المشترك: ${shop.subscriberId?.name || 'غير محدد'}`);
      console.log(`   📧 البريد: ${shop.subscriberId?.email || 'غير محدد'}`);
      console.log(`   📊 الحالة: ${shop.status}`);
      console.log(`   📅 ينتهي في: ${new Date(shop.subscription.endDate).toLocaleDateString('ar-SA')}`);
      console.log('   ─────────────────────────────────────');
    });

    if (shops.length === 0) {
      console.log('❌ لا توجد متاجر في قاعدة البيانات');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ في جلب المتاجر:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
checkShops();