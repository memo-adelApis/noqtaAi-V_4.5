/**
 * سكريبت لإنشاء منتجات تجريبية للمتجر
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
import Branch from '../models/Branches.js';
import Store from '../models/Store.js';

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

// منتجات تجريبية
const testProducts = [
  {
    name: 'هاتف ذكي سامسونج Galaxy A54',
    description: 'هاتف ذكي بشاشة 6.4 بوصة وكاميرا 50 ميجابكسل',
    purchasePrice: 4000,
    sellingPrice: 5500,
    quantity: 25,
    category: 'إلكترونيات',
    tags: ['هاتف', 'سامسونج', 'ذكي', 'android'],
    images: ['/images/products/samsung-a54.jpg']
  },
  {
    name: 'لابتوب HP Pavilion 15',
    description: 'لابتوب بمعالج Intel Core i5 وذاكرة 8GB RAM',
    purchasePrice: 8000,
    sellingPrice: 11000,
    quantity: 15,
    category: 'إلكترونيات',
    tags: ['لابتوب', 'HP', 'كمبيوتر', 'intel'],
    images: ['/images/products/hp-pavilion.jpg']
  },
  {
    name: 'سماعات بلوتوث JBL',
    description: 'سماعات لاسلكية بجودة صوت عالية وبطارية تدوم 20 ساعة',
    purchasePrice: 300,
    sellingPrice: 450,
    quantity: 50,
    category: 'إلكترونيات',
    tags: ['سماعات', 'بلوتوث', 'JBL', 'لاسلكي'],
    images: ['/images/products/jbl-headphones.jpg']
  },
  {
    name: 'قميص قطني رجالي',
    description: 'قميص قطني عالي الجودة متوفر بألوان متعددة',
    purchasePrice: 80,
    sellingPrice: 120,
    quantity: 100,
    category: 'ملابس',
    tags: ['قميص', 'قطن', 'رجالي', 'ملابس'],
    images: ['/images/products/cotton-shirt.jpg']
  },
  {
    name: 'فستان نسائي أنيق',
    description: 'فستان نسائي عصري مناسب للمناسبات الخاصة',
    purchasePrice: 150,
    sellingPrice: 250,
    quantity: 30,
    category: 'ملابس',
    tags: ['فستان', 'نسائي', 'أنيق', 'مناسبات'],
    images: ['/images/products/elegant-dress.jpg']
  },
  {
    name: 'أرز بسمتي هندي 5 كيلو',
    description: 'أرز بسمتي أصلي من الهند بجودة عالية',
    purchasePrice: 35,
    sellingPrice: 50,
    quantity: 200,
    category: 'أغذية',
    tags: ['أرز', 'بسمتي', 'هندي', 'طعام'],
    images: ['/images/products/basmati-rice.jpg']
  },
  {
    name: 'زيت زيتون بكر ممتاز 1 لتر',
    description: 'زيت زيتون بكر ممتاز من أجود أنواع الزيتون',
    purchasePrice: 25,
    sellingPrice: 40,
    quantity: 80,
    category: 'أغذية',
    tags: ['زيت زيتون', 'بكر', 'طبيعي', 'صحي'],
    images: ['/images/products/olive-oil.jpg']
  },
  {
    name: 'كريم مرطب للوجه',
    description: 'كريم مرطب طبيعي للوجه مناسب لجميع أنواع البشرة',
    purchasePrice: 60,
    sellingPrice: 90,
    quantity: 40,
    category: 'مستحضرات تجميل',
    tags: ['كريم', 'مرطب', 'وجه', 'تجميل'],
    images: ['/images/products/face-cream.jpg']
  },
  {
    name: 'مقلاة تيفال غير لاصقة',
    description: 'مقلاة تيفال بطلاء غير لاصق وقاعدة سميكة',
    purchasePrice: 90,
    sellingPrice: 130,
    quantity: 35,
    category: 'أدوات منزلية',
    tags: ['مقلاة', 'تيفال', 'طبخ', 'منزلي'],
    images: ['/images/products/tefal-pan.jpg']
  },
  {
    name: 'كتاب تعلم البرمجة',
    description: 'كتاب شامل لتعلم البرمجة للمبتدئين',
    purchasePrice: 40,
    sellingPrice: 65,
    quantity: 60,
    category: 'كتب وقرطاسية',
    tags: ['كتاب', 'برمجة', 'تعليم', 'تقنية'],
    images: ['/images/products/programming-book.jpg']
  }
];

const createTestProducts = async () => {
  try {
    await connectDB();

    // جلب المتجر والمشترك
    const shop = await Shop.findOne({ uniqueName: 'megashop' }).populate('subscriberId');
    
    if (!shop) {
      console.log('❌ لا يوجد متجر megashop');
      process.exit(1);
    }

    console.log(`✅ المتجر: ${shop.name}`);
    console.log(`👤 المشترك: ${shop.subscriberId.name}`);

    // جلب أول فرع ومخزن للمشترك
    const branch = await Branch.findOne({ userId: shop.subscriberId._id });
    const store = await Store.findOne({ userId: shop.subscriberId._id });

    if (!branch || !store) {
      console.log('❌ لا يوجد فرع أو مخزن للمشترك');
      console.log('💡 يرجى تشغيل سكريبت البذر الرئيسي أولاً');
      process.exit(1);
    }

    console.log(`🏢 الفرع: ${branch.name}`);
    console.log(`🏪 المخزن: ${store.name}`);

    // جلب الفئات والوحدات
    const categories = await Category.find({});
    const units = await Unit.find({});

    if (categories.length === 0 || units.length === 0) {
      console.log('❌ لا توجد فئات أو وحدات');
      console.log('💡 يرجى تشغيل سكريبت البذر الرئيسي أولاً');
      process.exit(1);
    }

    console.log(`📂 الفئات المتوفرة: ${categories.length}`);
    console.log(`📏 الوحدات المتوفرة: ${units.length}`);
    console.log('');

    // حذف المنتجات الموجودة للمشترك
    await Item.deleteMany({ userId: shop.subscriberId._id });
    console.log('🗑️ تم حذف المنتجات الموجودة');

    // إنشاء المنتجات الجديدة
    console.log('📦 إنشاء المنتجات الجديدة...');
    
    for (let i = 0; i < testProducts.length; i++) {
      const productData = testProducts[i];
      
      // البحث عن الفئة
      let category = categories.find(c => c.name === productData.category);
      if (!category) {
        category = categories[0]; // استخدام أول فئة كافتراضي
      }

      // استخدام وحدة عشوائية
      const unit = units[Math.floor(Math.random() * units.length)];

      const item = new Item({
        name: productData.name,
        description: productData.description,
        sku: `SKU-${Date.now()}-${i}`,
        barcode: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
        purchasePrice: productData.purchasePrice,
        sellingPrice: productData.sellingPrice,
        minSellingPrice: productData.sellingPrice * 0.9,
        quantity_added: productData.quantity,
        quantity_spent: 0,
        quantity_Remaining: productData.quantity,
        minStockLevel: 5,
        maxStockLevel: productData.quantity * 2,
        unitId: unit._id,
        categoryId: category._id,
        storeId: store._id,
        branchId: branch._id,
        userId: shop.subscriberId._id,
        status: 'active',
        isVisible: true,
        isFeatured: Math.random() > 0.7, // 30% احتمال أن يكون مميز
        images: productData.images,
        tags: productData.tags,
        seoTitle: productData.name,
        seoDescription: productData.description,
        lastadded: [{
          date: new Date(),
          quantity: productData.quantity,
          purchasePrice: productData.purchasePrice,
          total: productData.quantity * productData.purchasePrice,
          notes: 'إضافة مخزون أولية'
        }]
      });

      await item.save();
      console.log(`✅ ${i + 1}. ${productData.name} - ${productData.sellingPrice} جنيه`);
    }

    console.log('');
    console.log(`🎉 تم إنشاء ${testProducts.length} منتج بنجاح!`);
    console.log('');
    console.log('🔗 اختبار الروابط:');
    console.log(`   المتجر: http://localhost:3000/shop/${shop.uniqueName}`);
    console.log(`   API: http://localhost:3000/api/shop/${shop.uniqueName}`);
    console.log(`   إدارة: http://localhost:3000/subscriber/shop`);

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ في إنشاء المنتجات:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
createTestProducts();