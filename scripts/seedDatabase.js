/**
 * Script لملء قاعدة البيانات ببيانات تجريبية شاملة
 * يتضمن: 5 مشتركين، 5 مالكين، فروع، مخازن، منتجات، عملاء، موردين، و50+ فاتورة
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// تحميل متغيرات البيئة بهدوء
config({ quiet: true });

import User from '../models/User.js';
import Branch from '../models/Branches.js';
import Store from '../models/Store.js';
import Customer from '../models/Customers.js';
import Supplier from '../models/Suppliers.js';
import Invoice from '../models/Invoices.js';
import Item from '../models/Items.js';
import Category from '../models/Categories.js';
import Unit from '../models/Units.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import Shop from '../models/Shop.js';

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/noqta_ai');
    console.log('✅ تم الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

// بيانات الوحدات الأساسية
const unitsData = [
  { name: 'قطعة', abbreviation: 'قطعة' },
  { name: 'كيلوجرام', abbreviation: 'كجم' },
  { name: 'جرام', abbreviation: 'جم' },
  { name: 'لتر', abbreviation: 'لتر' },
  { name: 'متر', abbreviation: 'م' },
  { name: 'علبة', abbreviation: 'علبة' },
  { name: 'كرتونة', abbreviation: 'كرتونة' },
  { name: 'زجاجة', abbreviation: 'زجاجة' }
];

// بيانات الفئات الأساسية
const categoriesData = [
  { name: 'إلكترونيات', description: 'أجهزة إلكترونية ومعدات تقنية' },
  { name: 'ملابس', description: 'ملابس رجالية ونسائية وأطفال' },
  { name: 'أغذية', description: 'مواد غذائية ومشروبات' },
  { name: 'مستحضرات تجميل', description: 'منتجات العناية والتجميل' },
  { name: 'أدوات منزلية', description: 'أدوات وأجهزة منزلية' },
  { name: 'كتب وقرطاسية', description: 'كتب ومواد قرطاسية' },
  { name: 'رياضة', description: 'معدات وملابس رياضية' },
  { name: 'ألعاب', description: 'ألعاب أطفال وترفيه' }
];

// أسماء الشركات والمحلات
const companyNames = [
  'شركة النجاح التجارية',
  'مؤسسة الأمل للتجارة',
  'شركة الرائد للمبيعات',
  'مجموعة الفجر التجارية',
  'شركة الإبداع للتسويق'
];

// أسماء الفروع
const branchNames = [
  ['الفرع الرئيسي', 'فرع الشمال', 'فرع الجنوب'],
  ['المركز الرئيسي', 'فرع المدينة', 'فرع الضواحي'],
  ['المقر الرئيسي', 'فرع الشرق', 'فرع الغرب'],
  ['الفرع المركزي', 'فرع السوق', 'فرع المول'],
  ['المكتب الرئيسي', 'فرع الجامعة', 'فرع الصناعية']
];

// أسماء المخازن
const storeNames = [
  'مخزن المواد الخام',
  'مخزن المنتجات الجاهزة',
  'مخزن قطع الغيار',
  'مخزن الأدوات',
  'مخزن المواد الاستهلاكية'
];

// أسماء العملاء
const customerNames = [
  'أحمد محمد علي', 'فاطمة أحمد حسن', 'محمد عبدالله سالم', 'نورا خالد محمد',
  'عبدالرحمن سعد أحمد', 'مريم عبدالله خالد', 'خالد محمد عبدالله', 'سارة أحمد محمد',
  'عبدالله محمد سالم', 'هند خالد أحمد', 'سعد عبدالرحمن محمد', 'ليلى محمد خالد',
  'محمود أحمد عبدالله', 'رانيا سعد محمد', 'طارق محمد أحمد', 'دينا خالد سالم'
];

// أسماء الموردين
const supplierNames = [
  'شركة التوريدات المتقدمة', 'مؤسسة الجودة للتوريد', 'شركة الإمداد الشامل',
  'مجموعة التوريد المتميز', 'شركة المصادر التجارية', 'مؤسسة الثقة للتوريد',
  'شركة الخدمات اللوجستية', 'مجموعة التوريد السريع'
];

// منتجات متنوعة
const productsData = [
  // إلكترونيات
  { name: 'هاتف ذكي سامسونج', price: 2500, category: 'إلكترونيات' },
  { name: 'لابتوب ديل', price: 4500, category: 'إلكترونيات' },
  { name: 'سماعات بلوتوث', price: 150, category: 'إلكترونيات' },
  { name: 'شاحن محمول', price: 80, category: 'إلكترونيات' },
  
  // ملابس
  { name: 'قميص قطني رجالي', price: 120, category: 'ملابس' },
  { name: 'فستان نسائي', price: 200, category: 'ملابس' },
  { name: 'بنطلون جينز', price: 180, category: 'ملابس' },
  { name: 'حذاء رياضي', price: 300, category: 'ملابس' },
  
  // أغذية
  { name: 'أرز بسمتي 5 كيلو', price: 45, category: 'أغذية' },
  { name: 'زيت زيتون 1 لتر', price: 35, category: 'أغذية' },
  { name: 'سكر أبيض 2 كيلو', price: 25, category: 'أغذية' },
  { name: 'شاي أحمد 500 جرام', price: 20, category: 'أغذية' },
  
  // مستحضرات تجميل
  { name: 'كريم مرطب للوجه', price: 85, category: 'مستحضرات تجميل' },
  { name: 'شامبو للشعر', price: 45, category: 'مستحضرات تجميل' },
  { name: 'عطر رجالي', price: 250, category: 'مستحضرات تجميل' },
  
  // أدوات منزلية
  { name: 'مقلاة تيفال', price: 120, category: 'أدوات منزلية' },
  { name: 'خلاط كهربائي', price: 200, category: 'أدوات منزلية' },
  { name: 'مكنسة كهربائية', price: 350, category: 'أدوات منزلية' }
];

// دالة لإنشاء كلمة مرور مشفرة
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// دالة لإنشاء رقم فاتورة عشوائي
const generateInvoiceNumber = () => {
  return 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

// دالة لإنشاء تاريخ عشوائي في آخر 6 أشهر
const getRandomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  return new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));
};

// دالة رئيسية لملء قاعدة البيانات
const seedDatabase = async () => {
  try {
    console.log('🚀 بدء ملء قاعدة البيانات...');

    // حذف البيانات الموجودة
    console.log('🗑️ حذف البيانات الموجودة...');
    await Promise.all([
      User.deleteMany({}),
      Branch.deleteMany({}),
      Store.deleteMany({}),
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
      Invoice.deleteMany({}),
      Item.deleteMany({}),
      Category.deleteMany({}),
      Unit.deleteMany({}),
      Product.deleteMany({}),
      Notification.deleteMany({}),
      Shop.deleteMany({})
    ]);

    // إنشاء الوحدات والفئات الأساسية
    console.log('📦 إنشاء الوحدات والفئات...');
    const units = await Unit.insertMany(unitsData.map(unit => ({
      ...unit,
      createdAt: new Date()
    })));

    const categories = await Category.insertMany(categoriesData.map(cat => ({
      ...cat,
      createdAt: new Date()
    })));

    // إنشاء المشتركين والمالكين
    console.log('👥 إنشاء المستخدمين...');
    const users = [];
    const hashedPassword = await hashPassword('Password123!');

    // إنشاء 5 مشتركين
    for (let i = 0; i < 5; i++) {
      const subscriber = await User.create({
        name: companyNames[i],
        email: `subscriber${i + 1}@example.com`,
        password: hashedPassword,
        role: 'subscriber',
        subscriptionStatus: 'active',
        subscriptionType: 'monthly',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        subscription: {
          plan: 'premium',
          isActive: true,
          isExpired: false,
          invoiceLimit: 1000,
          branchLimit: 10,
          userLimit: 50
        }
      });
      users.push(subscriber);

      // إنشاء مالك لكل مشترك
      const owner = await User.create({
        name: `مالك ${companyNames[i]}`,
        email: `owner${i + 1}@example.com`,
        password: hashedPassword,
        role: 'owner',
        mainAccountId: subscriber._id,
        subscriptionStatus: 'active'
      });
      users.push(owner);
    }

    console.log(`✅ تم إنشاء ${users.length} مستخدم`);

    // إنشاء الفروع
    console.log('🏢 إنشاء الفروع...');
    const branches = [];
    for (let i = 0; i < 5; i++) {
      const subscriber = users[i * 2]; // كل مشترك
      for (let j = 0; j < 3; j++) {
        const branch = await Branch.create({
          name: branchNames[i][j],
          location: `العنوان ${j + 1} - ${companyNames[i]}`,
          userId: subscriber._id
        });
        branches.push(branch);
      }
    }
    console.log(`✅ تم إنشاء ${branches.length} فرع`);

    // إنشاء المخازن
    console.log('🏪 إنشاء المخازن...');
    const stores = [];
    for (const branch of branches) {
      for (let i = 0; i < 2; i++) {
        const store = await Store.create({
          name: storeNames[i % storeNames.length],
          description: `وصف ${storeNames[i % storeNames.length]}`,
          location: `موقع المخزن ${i + 1}`,
          userId: branch.userId,
          branchId: branch._id,
          isActive: true
        });
        stores.push(store);
      }
    }
    console.log(`✅ تم إنشاء ${stores.length} مخزن`);

    // إنشاء العملاء
    console.log('👤 إنشاء العملاء...');
    const customers = [];
    for (const branch of branches) {
      for (let i = 0; i < 4; i++) {
        const customer = await Customer.create({
          name: customerNames[Math.floor(Math.random() * customerNames.length)],
          userId: branch.userId,
          branchId: branch._id,
          details: {
            contact: `05${Math.floor(Math.random() * 90000000) + 10000000}`,
            address: `العنوان ${i + 1} - ${branch.name}`
          }
        });
        customers.push(customer);
      }
    }
    console.log(`✅ تم إنشاء ${customers.length} عميل`);

    // إنشاء الموردين
    console.log('🚚 إنشاء الموردين...');
    const suppliers = [];
    for (const branch of branches) {
      for (let i = 0; i < 2; i++) {
        const supplier = await Supplier.create({
          name: supplierNames[Math.floor(Math.random() * supplierNames.length)],
          userId: branch.userId,
          branchId: branch._id,
          details: {
            contact: `011${Math.floor(Math.random() * 9000000) + 1000000}`,
            address: `عنوان المورد ${i + 1}`
          },
          suply: Math.floor(Math.random() * 50000) + 10000,
          pay: Math.floor(Math.random() * 30000) + 5000
        });
        suppliers.push(supplier);
      }
    }
    console.log(`✅ تم إنشاء ${suppliers.length} مورد`);

    // إنشاء المنتجات
    console.log('📱 إنشاء المنتجات...');
    const items = [];
    for (const store of stores) {
      for (let i = 0; i < 5; i++) {
        const product = productsData[Math.floor(Math.random() * productsData.length)];
        const category = categories.find(c => c.name === product.category);
        const unit = units[Math.floor(Math.random() * units.length)];
        
        const item = await Item.create({
          name: product.name,
          description: `وصف تفصيلي لـ ${product.name}`,
          sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          barcode: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
          purchasePrice: product.price * 0.7, // سعر الشراء 70% من سعر البيع
          sellingPrice: product.price,
          minSellingPrice: product.price * 0.9,
          quantity_added: Math.floor(Math.random() * 100) + 20,
          quantity_spent: Math.floor(Math.random() * 30),
          minStockLevel: 10,
          maxStockLevel: 200,
          unitId: unit._id,
          categoryId: category._id,
          storeId: store._id,
          branchId: store.branchId,
          userId: store.userId,
          status: 'active',
          isVisible: true,
          lastadded: [{
            date: getRandomDate(),
            quantity: Math.floor(Math.random() * 50) + 10,
            purchasePrice: product.price * 0.7,
            total: (Math.floor(Math.random() * 50) + 10) * (product.price * 0.7),
            notes: 'إضافة مخزون أولية'
          }]
        });
        items.push(item);
      }
    }
    console.log(`✅ تم إنشاء ${items.length} منتج`);

    // إنشاء الفواتير
    console.log('🧾 إنشاء الفواتير...');
    const invoices = [];
    
    // إنشاء 60 فاتورة موزعة على الفروع
    for (let i = 0; i < 60; i++) {
      const branch = branches[Math.floor(Math.random() * branches.length)];
      const branchItems = items.filter(item => item.branchId.toString() === branch._id.toString());
      const branchCustomers = customers.filter(c => c.branchId.toString() === branch._id.toString());
      const branchSuppliers = suppliers.filter(s => s.branchId.toString() === branch._id.toString());
      
      if (branchItems.length === 0 || branchCustomers.length === 0) continue;

      const isRevenue = Math.random() > 0.3; // 70% فواتير إيرادات، 30% مصروفات
      const invoiceItems = [];
      
      // إضافة 1-4 منتجات للفاتورة
      const numItems = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numItems; j++) {
        const item = branchItems[Math.floor(Math.random() * branchItems.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const price = isRevenue ? item.sellingPrice : item.purchasePrice;
        
        invoiceItems.push({
          name: item.name,
          price: price,
          quantity: quantity,
          total: price * quantity,
          storeId: item.storeId,
          unit: item.unitId
        });
      }

      const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
      const discount = Math.floor(Math.random() * (subtotal * 0.1)); // خصم حتى 10%
      const taxRate = Math.random() > 0.5 ? 15 : 0; // 50% احتمال ضريبة 15%
      const vatAmount = (subtotal - discount) * (taxRate / 100);
      const totalInvoice = subtotal - discount + vatAmount;
      
      // تحديد نوع الدفع
      const paymentTypes = ['cash', 'credit', 'installment'];
      const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
      
      let pays = [];
      let status = 'pending';
      
      if (paymentType === 'cash') {
        // دفع كامل نقداً
        pays = [{
          date: getRandomDate(),
          amount: totalInvoice,
          method: 'cash',
          status: 'paid'
        }];
        status = 'paid';
      } else if (paymentType === 'credit') {
        // دفع جزئي أو كامل
        const paidAmount = Math.random() > 0.3 ? totalInvoice : totalInvoice * (Math.random() * 0.8 + 0.2);
        pays = [{
          date: getRandomDate(),
          amount: paidAmount,
          method: 'credit',
          status: 'paid'
        }];
        status = paidAmount >= totalInvoice ? 'paid' : 'pending';
      }

      const invoice = await Invoice.create({
        invoiceNumber: generateInvoiceNumber(),
        type: isRevenue ? 'revenue' : 'expense',
        invoiceKind: taxRate > 0 ? 'tax' : 'normal',
        customerId: isRevenue ? branchCustomers[Math.floor(Math.random() * branchCustomers.length)]._id : null,
        supplierId: !isRevenue && branchSuppliers.length > 0 ? branchSuppliers[Math.floor(Math.random() * branchSuppliers.length)]._id : null,
        userId: branch.userId,
        branchId: branch._id,
        items: invoiceItems,
        discount: discount,
        extra: 0,
        taxRate: taxRate,
        vatAmount: vatAmount,
        totalItems: subtotal,
        totalInvoice: totalInvoice,
        paymentType: paymentType,
        pays: pays,
        currencyCode: 'EGP',
        status: status,
        notes: `فاتورة ${isRevenue ? 'بيع' : 'شراء'} رقم ${i + 1}`,
        createdAt: getRandomDate(),
        updatedAt: getRandomDate()
      });
      
      invoices.push(invoice);
    }
    
    console.log(`✅ تم إنشاء ${invoices.length} فاتورة`);

    // إنشاء إشعارات ترحيبية
    console.log('🔔 إنشاء الإشعارات...');
    for (const user of users.filter(u => u.role === 'subscriber')) {
      await Notification.create({
        userId: user._id,
        title: 'مرحباً بك في منصة نقطة AI',
        message: 'نرحب بك في منصتنا المتطورة لإدارة الأعمال. يمكنك الآن البدء في استخدام جميع الميزات المتاحة.',
        type: 'welcome',
        priority: 'medium',
        category: 'account',
        isAutoGenerated: true,
        autoType: 'welcome_message'
      });

      await Notification.create({
        userId: user._id,
        title: 'تم تفعيل اشتراكك بنجاح',
        message: 'تم تفعيل اشتراكك الشهري بنجاح. يمكنك الآن الاستفادة من جميع الميزات المتقدمة.',
        type: 'success',
        priority: 'high',
        category: 'subscription',
        isAutoGenerated: true,
        autoType: 'subscription_activated'
      });
    }

    console.log('✅ تم إنشاء الإشعارات');

    // إنشاء متاجر تجريبية للمشتركين
    console.log('🏪 إنشاء المتاجر الإلكترونية...');
    
    // إنشاء متجر megashop للمشترك الأول
    const firstSubscriber = users[0]; // أول مشترك
    
    const megaShop = await Shop.create({
      name: 'متجر ميجا شوب الإلكتروني',
      uniqueName: 'megashop',
      description: 'متجر إلكتروني شامل يضم أفضل المنتجات بأسعار تنافسية. نوفر لك تجربة تسوق مميزة مع خدمة عملاء متميزة وتوصيل سريع.',
      keywords: ['إلكترونيات', 'تسوق', 'منتجات', 'جودة عالية', 'أسعار مميزة', 'توصيل سريع'],
      contact: {
        phone: '01012345678',
        email: 'info@megashop.com',
        address: 'القاهرة - مصر الجديدة - شارع الحجاز'
      },
      subscriberId: firstSubscriber._id,
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

    console.log(`✅ تم إنشاء متجر: ${megaShop.name} - /${megaShop.uniqueName}`);
    
    // إنشاء متاجر إضافية للمشتركين الآخرين
    for (let i = 1; i < 3; i++) {
      const subscriber = users[i * 2]; // كل مشترك
      
      const shop = await Shop.create({
        name: `متجر ${companyNames[i]} الإلكتروني`,
        uniqueName: `shop-${i + 1}-${Date.now()}`,
        description: `متجر إلكتروني متخصص في بيع منتجات ${companyNames[i]} بأفضل الأسعار والجودة العالية`,
        keywords: ['إلكترونيات', 'تسوق', 'منتجات', 'جودة عالية'],
        contact: {
          phone: `010${Math.floor(Math.random() * 90000000) + 10000000}`,
          email: `info@shop${i + 1}.com`,
          address: `عنوان المتجر ${i + 1} - القاهرة`
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
          }
        }
      });

      console.log(`✅ تم إنشاء متجر: ${shop.name} - /${shop.uniqueName}`);
    }

    console.log('✅ تم إنشاء المتاجر الإلكترونية');

    // طباعة ملخص البيانات
    console.log('\n📊 ملخص البيانات المُنشأة:');
    console.log(`👥 المستخدمين: ${users.length} (${users.filter(u => u.role === 'subscriber').length} مشترك، ${users.filter(u => u.role === 'owner').length} مالك)`);
    console.log(`🏢 الفروع: ${branches.length}`);
    console.log(`🏪 المخازن: ${stores.length}`);
    console.log(`👤 العملاء: ${customers.length}`);
    console.log(`🚚 الموردين: ${suppliers.length}`);
    console.log(`📱 المنتجات: ${items.length}`);
    console.log(`🧾 الفواتير: ${invoices.length}`);
    console.log(`📦 الوحدات: ${units.length}`);
    console.log(`📂 الفئات: ${categories.length}`);

    console.log('\n🔑 بيانات تسجيل الدخول:');
    console.log('المشتركين:');
    for (let i = 0; i < 5; i++) {
      console.log(`  📧 subscriber${i + 1}@example.com | 🔒 Password123!`);
    }
    console.log('المالكين:');
    for (let i = 0; i < 5; i++) {
      console.log(`  📧 owner${i + 1}@example.com | 🔒 Password123!`);
    }

    console.log('\n🎉 تم ملء قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في ملء قاعدة البيانات:', error);
    throw error;
  }
};

// تشغيل السكريبت
const runSeed = async () => {
  try {
    console.log('🔍 اختبار الاتصال بقاعدة البيانات أولاً...');
    
    // اختبار الاتصال أولاً
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI غير موجود في ملف .env');
    }
    
    await connectDB();
    
    // اختبار سريع للكتابة
    const testCollection = mongoose.connection.db.collection('test_seed');
    await testCollection.insertOne({ test: true });
    await testCollection.deleteOne({ test: true });
    
    console.log('✅ اختبار الاتصال نجح، بدء ملء البيانات...\n');
    
    await seedDatabase();
    console.log('✅ تم الانتهاء من ملء قاعدة البيانات');
    process.exit(0);
  } catch (error) {
    console.error('❌ فشل في ملء قاعدة البيانات:', error.message);
    
    if (error.message.includes('MONGODB_URI')) {
      console.error('\n🔧 الحل:');
      console.error('1. أنشئ ملف .env في المجلد الرئيسي');
      console.error('2. أضف السطر التالي: MONGODB_URI=mongodb://localhost:27017/noqta_ai');
      console.error('3. أو استخدم رابط MongoDB Atlas إذا كنت تستخدم السحابة');
    }
    
    process.exit(1);
  }
};

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}

export default seedDatabase;