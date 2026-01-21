// إدارة المخزون - خصم وإضافة الكميات تلقائياً
import Item from '@/models/Items';
import mongoose from 'mongoose';

/**
 * تحديث المخزون بناءً على نوع الفاتورة
 * @param {Array} items - قائمة الأصناف في الفاتورة
 * @param {String} invoiceType - نوع الفاتورة (revenue أو expense)
 * @param {ObjectId} userId - معرف المستخدم
 * @returns {Object} - نتيجة العملية
 */
export async function updateInventory(items, invoiceType, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = [];

    for (const item of items) {
      const { name, quantity, price, storeId, unit } = item;

      // البحث عن المنتج في المخزون
      let product = await Item.findOne({
        name,
        storeId,
        userId
      }).session(session);

      if (invoiceType === 'revenue') {
        // فاتورة إيراد (بيع) - خصم من المخزون
        if (!product) {
          throw new Error(`المنتج "${name}" غير موجود في المخزون`);
        }

        if (product.quantity < quantity) {
          throw new Error(`الكمية المتوفرة من "${name}" غير كافية. المتوفر: ${product.quantity}, المطلوب: ${quantity}`);
        }

        // خصم الكمية
        product.quantity -= quantity;
        await product.save({ session });

        results.push({
          productId: product._id,
          name: product.name,
          action: 'deducted',
          quantity,
          remainingQuantity: product.quantity
        });

      } else if (invoiceType === 'expense') {
        // فاتورة مصروف (شراء) - إضافة للمخزون
        if (product) {
          // المنتج موجود - زيادة الكمية
          product.quantity += quantity;
          
          // تحديث السعر (اختياري - يمكن استخدام متوسط السعر)
          product.price = price;
          
          await product.save({ session });

          results.push({
            productId: product._id,
            name: product.name,
            action: 'added',
            quantity,
            remainingQuantity: product.quantity
          });
        } else {
          // المنتج غير موجود - إنشاء منتج جديد
          const newProduct = await Item.create([{
            name,
            price,
            quantity,
            unit,
            storeId,
            userId,
            categoryId: null // يمكن إضافة التصنيف لاحقاً
          }], { session });

          results.push({
            productId: newProduct[0]._id,
            name: newProduct[0].name,
            action: 'created',
            quantity,
            remainingQuantity: newProduct[0].quantity
          });
        }
      }
    }

    await session.commitTransaction();
    return { success: true, results };

  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating inventory:', error);
    return { success: false, error: error.message };
  } finally {
    session.endSession();
  }
}

/**
 * التحقق من توفر الكميات قبل إنشاء فاتورة بيع
 * @param {Array} items - قائمة الأصناف
 * @param {ObjectId} userId - معرف المستخدم
 * @returns {Object} - نتيجة التحقق
 */
export async function checkInventoryAvailability(items, userId) {
  const unavailableItems = [];

  for (const item of items) {
    const { name, quantity, storeId } = item;

    const product = await Item.findOne({
      name,
      storeId,
      userId
    });

    if (!product) {
      unavailableItems.push({
        name,
        reason: 'غير موجود في المخزون',
        available: 0,
        required: quantity
      });
    } else if (product.quantity < quantity) {
      unavailableItems.push({
        name,
        reason: 'الكمية غير كافية',
        available: product.quantity,
        required: quantity
      });
    }
  }

  if (unavailableItems.length > 0) {
    return {
      available: false,
      unavailableItems
    };
  }

  return { available: true };
}

/**
 * الحصول على معلومات المخزون لمنتج معين
 * @param {String} productName - اسم المنتج
 * @param {ObjectId} storeId - معرف المخزن
 * @param {ObjectId} userId - معرف المستخدم
 * @returns {Object} - معلومات المنتج
 */
export async function getProductInventory(productName, storeId, userId) {
  const product = await Item.findOne({
    name: productName,
    storeId,
    userId
  });

  if (!product) {
    return {
      exists: false,
      quantity: 0,
      price: 0
    };
  }

  return {
    exists: true,
    quantity: product.quantity,
    price: product.price,
    unit: product.unit,
    _id: product._id
  };
}
