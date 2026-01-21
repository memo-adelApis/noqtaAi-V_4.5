/**
 * سكريبت للتحقق من المنتجات الموجودة
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// تحميل متغيرات البيئة
config({ quiet: true });

import Item from '../models/Items.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Category from '../models/Categories.js';
import Unit from '../models/Units.js';

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

const checkProducts = async () => {
  try {
    await connectDB();

    // جلب المتجر
    const shop = await Shop.findOne({ uniqueName: 'megashop' }).populate('subscriberId');
    
    if (!shop) {
      console.log('❌ لا يوجد متجر megashop');
      process.exit(1);
    }

    console.log(`✅ المتجر: ${shop.name}`);
    console.log(`👤 المشترك: ${shop.subscriberId.name}`);
    console.log('');

    // جلب المنتجات للمشترك
    const products = await Item.find({ 
      userId: shop.subscriberId._id,
      status: 'active',
      isVisible: true,
      quantity_Remaining: { $gt: 0 }
    }).populate('categoryId', 'name').populate('unitId', 'name');

    console.log(`📦 عدد المنتجات المتوفرة: ${products.length}`);
    console.log('');

    if (products.length === 0) {
      console.log('❌ لا توجد منتجات متوفرة للعرض في المتجر');
      console.log('💡 تأكد من:');
      console.log('   - وجود منتجات في قاعدة البيانات');
      console.log('   - أن المنتجات مرتبطة بالمشترك الصحيح');
      console.log('   - أن المنتجات نشطة (status: active)');
      console.log('   - أن المنتجات ظاهرة (isVisible: true)');
      console.log('   - أن المنتجات لها كمية متوفرة (quantity_Remaining > 0)');
    } else {
      console.log('📋 المنتجات المتوفرة:');
      console.log('─────────────────────────────────────');
      
      products.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   💰 السعر: ${product.sellingPrice} جنيه`);
        console.log(`   📦 الكمية: ${product.quantity_Remaining}`);
        console.log(`   📂 الفئة: ${product.categoryId?.name || 'غير محدد'}`);
        console.log(`   📏 الوحدة: ${product.unitId?.name || 'غير محدد'}`);
        console.log(`   ✅ الحالة: ${product.status}`);
        console.log(`   👁️ ظاهر: ${product.isVisible ? 'نعم' : 'لا'}`);
        console.log('   ─────────────────────────────────────');
      });

      if (products.length > 10) {
        console.log(`... و ${products.length - 10} منتج آخر`);
      }
    }

    // اختبار API المتجر
    console.log('');
    console.log('🔗 اختبار الروابط:');
    console.log(`   المتجر: http://localhost:3000/shop/${shop.uniqueName}`);
    console.log(`   API: http://localhost:3000/api/shop/${shop.uniqueName}`);
    console.log(`   إدارة: http://localhost:3000/subscriber/shop`);

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ في جلب المنتجات:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
checkProducts();