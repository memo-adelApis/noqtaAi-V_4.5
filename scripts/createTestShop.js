/**
 * سكريبت لإنشاء متجر تجريبي سريع
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// تحميل متغيرات البيئة
config({ quiet: true });

import User from '../models/User.js';
import Shop from '../models/Shop.js';

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

const createTestShop = async () => {
  try {
    await connectDB();

    // البحث عن أول مشترك
    const subscriber = await User.findOne({ role: 'subscriber' });
    
    if (!subscriber) {
      console.error('❌ لا يوجد مشتركين في قاعدة البيانات');
      console.log('يرجى تشغيل سكريبت البذر الرئيسي أولاً');
      process.exit(1);
    }

    console.log(`✅ تم العثور على مشترك: ${subscriber.name}`);

    // التحقق من وجود متجر مسبقاً
    const existingShop = await Shop.findOne({ subscriberId: subscriber._id });
    
    if (existingShop) {
      console.log(`✅ يوجد متجر مسبقاً: ${existingShop.name} - /${existingShop.uniqueName}`);
      console.log(`🔗 رابط المتجر: http://localhost:3000/shop/${existingShop.uniqueName}`);
      process.exit(0);
    }

    // إنشاء متجر جديد
    const newShop = new Shop({
      name: 'متجر ميجا شوب الإلكتروني',
      uniqueName: 'megashop',
      description: 'متجر إلكتروني شامل يضم أفضل المنتجات بأسعار تنافسية. نوفر لك تجربة تسوق مميزة مع خدمة عملاء متميزة وتوصيل سريع.',
      keywords: ['إلكترونيات', 'تسوق', 'منتجات', 'جودة عالية', 'أسعار مميزة', 'توصيل سريع'],
      contact: {
        phone: '01012345678',
        email: 'info@megashop.com',
        address: 'القاهرة - مصر الجديدة - شارع الحجاز'
      },
      subscriberId: subscriber._id,
      status: 'active',
      subscription: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        isActive: true,
        monthlyPrice: 70
      },
      settings: {
        currency: 'EGP',
        language: 'ar',
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          backgroundColor: '#F9FAFB'
        },
        shipping: {
          enabled: true,
          freeShippingThreshold: 500,
          shippingCost: 30
        },
        payment: {
          cashOnDelivery: true,
          bankTransfer: true,
          onlinePayment: false
        }
      },
      socialMedia: {
        facebook: 'https://facebook.com/megashop',
        instagram: 'https://instagram.com/megashop',
        whatsapp: '01012345678'
      },
      seo: {
        metaTitle: 'متجر ميجا شوب - أفضل المنتجات بأسعار مميزة',
        metaDescription: 'تسوق من متجر ميجا شوب واحصل على أفضل المنتجات بأسعار تنافسية مع توصيل مجاني للطلبات أكثر من 500 جنيه',
        metaKeywords: ['تسوق', 'منتجات', 'إلكترونيات', 'أسعار مميزة']
      }
    });

    await newShop.save();

    console.log('✅ تم إنشاء المتجر بنجاح!');
    console.log(`📛 اسم المتجر: ${newShop.name}`);
    console.log(`🔗 الاسم الفريد: ${newShop.uniqueName}`);
    console.log(`🌐 رابط المتجر: http://localhost:3000/shop/${newShop.uniqueName}`);
    console.log(`👤 مرتبط بالمشترك: ${subscriber.name} (${subscriber.email})`);

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ في إنشاء المتجر:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
createTestShop();