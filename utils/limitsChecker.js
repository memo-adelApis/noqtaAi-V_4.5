import { connectToDB } from './database';
import User from '@/models/User';
import Invoice from '@/models/Invoices';
import Branch from '@/models/Branches';
import Product from '@/models/Product';
import Item from '@/models/Items';
import Supplier from '@/models/Suppliers';
import Customer from '@/models/Customers';
import Category from '@/models/Categories';

/**
 * التحقق من حدود المستخدم قبل إنشاء عنصر جديد
 * @param {string} userId - معرف المستخدم
 * @param {string} limitType - نوع الحد المراد التحقق منه
 * @returns {Promise<{allowed: boolean, message: string, current: number, limit: number}>}
 */
export async function checkUserLimit(userId, limitType) {
  await connectToDB();
  
  try {
    // جلب بيانات المستخدم أو المستخدم الرئيسي
    let user = await User.findById(userId);
    if (!user) {
      return { allowed: false, message: 'المستخدم غير موجود', current: 0, limit: 0 };
    }

    // إذا كان المستخدم فرعي، نحصل على حدود المستخدم الرئيسي
    if (user.mainAccountId) {
      user = await User.findById(user.mainAccountId);
      if (!user) {
        return { allowed: false, message: 'الحساب الرئيسي غير موجود', current: 0, limit: 0 };
      }
    }

    const subscription = user.subscription || {};
    let current = 0;
    let limit = 0;
    let message = '';

    // التحقق من نوع الحد المطلوب
    switch (limitType) {
      case 'invoice':
        // حساب عدد الفواتير في الشهر الحالي
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        current = await Invoice.countDocuments({
          userId: user.mainAccountId || userId,
          createdAt: { $gte: startOfMonth }
        });
        limit = subscription.invoiceLimit || 100;
        message = `تم الوصول للحد الأقصى من الفواتير الشهرية (${limit})`;
        break;

      case 'branch':
        current = await Branch.countDocuments({
          userId: user.mainAccountId || userId
        });
        limit = subscription.branchLimit || 3;
        message = `تم الوصول للحد الأقصى من الفروع (${limit})`;
        break;

      case 'user':
        current = await User.countDocuments({
          mainAccountId: user.mainAccountId || userId,
          role: { $in: ['manager', 'employee', 'cashier'] }
        });
        limit = subscription.userLimit || 5;
        message = `تم الوصول للحد الأقصى من المستخدمين الفرعيين (${limit})`;
        break;

      case 'supplier':
        current = await Supplier.countDocuments({
          userId: user.mainAccountId || userId
        });
        limit = subscription.supplierLimit || 50;
        message = `تم الوصول للحد الأقصى من الموردين (${limit})`;
        break;

      case 'customer':
        current = await Customer.countDocuments({
          userId: user.mainAccountId || userId
        });
        limit = subscription.customerLimit || 200;
        message = `تم الوصول للحد الأقصى من العملاء (${limit})`;
        break;

      case 'product':
        // استخدام نموذج Product للمنتجات العامة و Item للأصناف
        const productCount = await Product.countDocuments({
          userId: user.mainAccountId || userId
        });
        const itemCount = await Item.countDocuments({
          userId: user.mainAccountId || userId
        });
        current = productCount + itemCount;
        limit = subscription.productLimit || 500;
        message = `تم الوصول للحد الأقصى من المنتجات (${limit})`;
        break;

      case 'category':
        current = await Category.countDocuments({
          userId: user.mainAccountId || userId
        });
        limit = subscription.categoryLimit || 50;
        message = `تم الوصول للحد الأقصى من الفئات (${limit})`;
        break;

      default:
        return { allowed: false, message: 'نوع الحد غير صحيح', current: 0, limit: 0 };
    }

    const allowed = current < limit;
    
    return {
      allowed,
      message: allowed ? 'مسموح' : message,
      current,
      limit,
      percentage: limit > 0 ? Math.round((current / limit) * 100) : 0
    };

  } catch (error) {
    console.error('Error checking user limit:', error);
    return { allowed: false, message: 'خطأ في التحقق من الحدود', current: 0, limit: 0 };
  }
}

/**
 * الحصول على جميع حدود المستخدم مع الاستخدام الحالي
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<Object>} كائن يحتوي على جميع الحدود والاستخدام
 */
export async function getUserLimitsStatus(userId) {
  await connectToDB();
  
  try {
    let user = await User.findById(userId);
    if (!user) {
      return null;
    }

    // إذا كان المستخدم فرعي، نحصل على حدود المستخدم الرئيسي
    if (user.mainAccountId) {
      user = await User.findById(user.mainAccountId);
      if (!user) {
        return null;
      }
    }

    const subscription = user.subscription || {};
    const mainUserId = user.mainAccountId || userId;

    // حساب الاستخدام الحالي لكل نوع
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      invoiceCount,
      branchCount,
      userCount,
      supplierCount,
      customerCount,
      productCount,
      itemCount,
      categoryCount
    ] = await Promise.all([
      Invoice.countDocuments({ userId: mainUserId, createdAt: { $gte: startOfMonth } }),
      Branch.countDocuments({ userId: mainUserId }),
      User.countDocuments({ mainAccountId: mainUserId, role: { $in: ['manager', 'employee', 'cashier'] } }),
      Supplier.countDocuments({ userId: mainUserId }),
      Customer.countDocuments({ userId: mainUserId }),
      Product.countDocuments({ userId: mainUserId }),
      Item.countDocuments({ userId: mainUserId }),
      Category.countDocuments({ userId: mainUserId })
    ]);

    const totalProducts = productCount + itemCount;

    return {
      invoice: {
        current: invoiceCount,
        limit: subscription.invoiceLimit || 100,
        percentage: Math.round((invoiceCount / (subscription.invoiceLimit || 100)) * 100)
      },
      branch: {
        current: branchCount,
        limit: subscription.branchLimit || 3,
        percentage: Math.round((branchCount / (subscription.branchLimit || 3)) * 100)
      },
      user: {
        current: userCount,
        limit: subscription.userLimit || 5,
        percentage: Math.round((userCount / (subscription.userLimit || 5)) * 100)
      },
      supplier: {
        current: supplierCount,
        limit: subscription.supplierLimit || 50,
        percentage: Math.round((supplierCount / (subscription.supplierLimit || 50)) * 100)
      },
      customer: {
        current: customerCount,
        limit: subscription.customerLimit || 200,
        percentage: Math.round((customerCount / (subscription.customerLimit || 200)) * 100)
      },
      product: {
        current: totalProducts,
        limit: subscription.productLimit || 500,
        percentage: Math.round((totalProducts / (subscription.productLimit || 500)) * 100)
      },
      category: {
        current: categoryCount,
        limit: subscription.categoryLimit || 50,
        percentage: Math.round((categoryCount / (subscription.categoryLimit || 50)) * 100)
      }
    };

  } catch (error) {
    console.error('Error getting user limits status:', error);
    return null;
  }
}

/**
 * تحديد الحدود حسب نوع الخطة
 * @param {string} plan - نوع الخطة
 * @returns {Object} كائن يحتوي على جميع الحدود
 */
export function getPlanLimits(plan) {
  const plans = {
    trial: {
      invoiceLimit: 50,
      branchLimit: 1,
      userLimit: 2,
      supplierLimit: 20,
      customerLimit: 50,
      productLimit: 100,
      categoryLimit: 10,
      warehouseLimit: 1,
      storageLimit: 512,
      apiCallsLimit: 500,
      reportLimit: 10,
      backupLimit: 2
    },
    basic: {
      invoiceLimit: 500,
      branchLimit: 3,
      userLimit: 5,
      supplierLimit: 100,
      customerLimit: 500,
      productLimit: 1000,
      categoryLimit: 50,
      warehouseLimit: 3,
      storageLimit: 2048,
      apiCallsLimit: 2000,
      reportLimit: 50,
      backupLimit: 5
    },
    premium: {
      invoiceLimit: 2000,
      branchLimit: 10,
      userLimit: 25,
      supplierLimit: 500,
      customerLimit: 2000,
      productLimit: 5000,
      categoryLimit: 200,
      warehouseLimit: 10,
      storageLimit: 10240,
      apiCallsLimit: 10000,
      reportLimit: 200,
      backupLimit: 15
    },
    enterprise: {
      invoiceLimit: 10000,
      branchLimit: 50,
      userLimit: 100,
      supplierLimit: 2000,
      customerLimit: 10000,
      productLimit: 25000,
      categoryLimit: 1000,
      warehouseLimit: 50,
      storageLimit: 51200,
      apiCallsLimit: 50000,
      reportLimit: 1000,
      backupLimit: 50
    }
  };

  return plans[plan] || plans.trial;
}