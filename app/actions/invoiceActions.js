"use server";

import { connectToDB } from "@/utils/database";
import Invoice from "@/models/Invoices";
import Item from "@/models/Items";
import Store from "@/models/Store";
import Unit from "@/models/Units";
import Category from "@/models/Categories";
import mongoose from "mongoose";
import { checkUserLimit } from "@/utils/limitsChecker";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createInvoice(invoiceData) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.id;
    const branchId = session.user.branchId;

    // التحقق من وجود branchId
    if (!branchId) {
      return { success: false, error: "لا يمكن إنشاء فاتورة بدون فرع مرتبط" };
    }

    // التحقق من الحقول المطلوبة
    if (!invoiceData.type || !invoiceData.invoiceKind) {
      return { success: false, error: "نوع الفاتورة وتصنيفها مطلوبان" };
    }

    // التحقق من حد الفواتير قبل الإنشاء
    const limitCheck = await checkUserLimit(userId, 'invoice');
    
    if (!limitCheck.allowed) {
      return { 
        success: false, 
        error: limitCheck.message,
        limitExceeded: true,
        current: limitCheck.current,
        limit: limitCheck.limit
      };
    }

    // إنشاء رقم فاتورة فريد
    const invoiceCount = await Invoice.countDocuments({ 
      userId: session.user.mainAccountId || userId,
      branchId: branchId 
    });
    const invoiceNumber = `INV-${Date.now()}-${invoiceCount + 1}`;

    // إنشاء الفاتورة إذا كان مسموح
    const finalInvoiceData = {
      ...invoiceData,
      invoiceNumber,
      userId: session.user.mainAccountId || userId,
      branchId: branchId,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const invoice = await Invoice.create(finalInvoiceData);

    // معالجة الأصناف حسب نوع الفاتورة
    if (invoiceData.items && invoiceData.items.length > 0) {
      await processInvoiceItems(invoice, invoiceData.items, invoiceData.type, userId, branchId);
    }

    revalidatePath("/subuser/invoices");
    revalidatePath("/invoices");
    
    return { 
      success: true, 
      message: "تم إنشاء الفاتورة بنجاح",
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      remainingLimit: limitCheck.limit - (limitCheck.current + 1)
    };

  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: "فشل في إنشاء الفاتورة: " + error.message };
  }
}

// دالة معالجة أصناف الفاتورة
async function processInvoiceItems(invoice, items, invoiceType, userId, branchId) {
  for (const item of items) {
    try {
      if (invoiceType === 'expense') {
        // فاتورة شراء - إضافة للمخزون
        await addItemToStock(item, invoice._id, userId, branchId);
      } else if (invoiceType === 'revenue') {
        // فاتورة بيع - خصم من المخزون
        await sellItemFromStock(item, invoice._id, userId, branchId);
      }
    } catch (error) {
      console.error(`Error processing item ${item.name}:`, error);
      // يمكن إضافة منطق للتراجع عن العملية هنا
    }
  }
}

// دالة إضافة صنف للمخزون (للشراء)
async function addItemToStock(itemData, invoiceId, userId, branchId) {
  let item;
  
  // البحث عن الصنف الموجود
  if (itemData.itemId) {
    item = await Item.findById(itemData.itemId);
    if (!item) {
      throw new Error(`الصنف ${itemData.name} غير موجود`);
    }
  } else {
    // التحقق من الحقول المطلوبة
    if (!itemData.categoryId) {
      throw new Error(`فئة المنتج مطلوبة للصنف ${itemData.name}`);
    }
    if (!itemData.unit) {
      throw new Error(`وحدة القياس مطلوبة للصنف ${itemData.name}`);
    }
    if (!itemData.storeId) {
      throw new Error(`المخزن مطلوب للصنف ${itemData.name}`);
    }

    // إنشاء صنف جديد
    item = new Item({
      name: itemData.name,
      description: itemData.description || '',
      unitId: itemData.unit,
      categoryId: itemData.categoryId,
      storeId: itemData.storeId,
      userId: userId,
      branchId: branchId,
      purchasePrice: itemData.price,
      sellingPrice: itemData.price * 1.2, // هامش ربح افتراضي 20%
      status: 'active'
    });
    
    // حفظ الصنف الجديد
    await item.save();
  }
  
  // إضافة الكمية للمخزون
  item.lastadded.push({
    date: new Date(),
    quantity: itemData.quantity,
    purchasePrice: itemData.price,
    total: itemData.quantity * itemData.price,
    invoiceId: invoiceId,
    createdBy: userId,
    notes: itemData.notes || `شراء من فاتورة ${invoiceId}`
  });
  
  // حفظ التحديثات
  await item.save();
}

// دالة بيع صنف من المخزون (للبيع)
async function sellItemFromStock(itemData, invoiceId, userId, branchId) {
  const item = await Item.findById(itemData.itemId);
  
  if (!item) {
    throw new Error(`الصنف ${itemData.name} غير موجود في المخزون`);
  }
  
  if (item.quantity_Remaining < itemData.quantity) {
    throw new Error(`الكمية المتاحة للصنف ${itemData.name} غير كافية. المتوفر: ${item.quantity_Remaining}`);
  }
  
  // بيع الكمية من المخزون
  item.exchange_permits.push({
    userId: userId,
    date: new Date(),
    status: "approved",
    quantity: itemData.quantity,
    sellingPrice: itemData.price,
    invoiceId: invoiceId,
    notes: `بيع من فاتورة ${invoiceId}`
  });
  
  // حفظ التحديثات
  await item.save();
}

export async function searchProducts(query) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return [];
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    // أولاً: جلب المخازن التي تنتمي لهذا الفرع
    const stores = await Store.find({ 
      userId: userId, 
      branchId: branchId 
    }).lean();
    
    const storeIds = stores.map(s => s._id);

    if (storeIds.length === 0) {
      return [];
    }

    // البحث في الأصناف بناءً على الاسم من المخازن المحددة
    const searchResults = await Item.find({
      storeId: { $in: storeIds },
      name: { $regex: query, $options: 'i' }
    })
    .populate('categoryId', 'name')
    .populate('storeId', 'name')
    .populate('unitId', 'name')
    .limit(10)
    .lean();

    // تنسيق البيانات للإرجاع
    return searchResults.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      description: item.description,
      quantity: item.quantity_Remaining || 0,
      storeId: item.storeId?._id?.toString() || '',
      storeName: item.storeId?.name || '',
      unit: item.unitId?._id?.toString() || '',
      unitName: item.unitId?.name || '',
      categoryId: item.categoryId?._id?.toString() || '',
      categoryName: item.categoryId?.name || ''
    }));

  } catch (error) {
    console.error("Error searching items:", error);
    return [];
  }
}

// دالة جديدة للحصول على الفئات
export async function getCategories() {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    const Category = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({
      name: { type: String, required: true },
      description: String,
      parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      image: String,
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }
    }, { timestamps: true }));

    const categories = await Category.find({
      userId: userId,
      branchId: branchId,
      isActive: true
    })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

    return {
      success: true,
      data: categories.map(cat => ({
        _id: cat._id.toString(),
        name: cat.name,
        description: cat.description,
        parentId: cat.parentId?.toString() || null,
        image: cat.image
      }))
    };

  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "فشل في جلب الفئات: " + error.message };
  }
}

// دالة للحصول على جميع الأصناف
export async function getAllItems(filters = {}) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    if (!branchId) {
      return { success: false, error: "لا يمكن الوصول للأصناف بدون فرع مرتبط" };
    }

    // أولاً: جلب المخازن التي تنتمي لهذا الفرع
    const stores = await Store.find({ 
      userId: userId, 
      branchId: branchId 
    }).lean();
    
    const storeIds = stores.map(s => s._id);

    if (storeIds.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    // ثانياً: جلب الأصناف من هذه المخازن
    const query = {
      storeId: { $in: storeIds },
      ...filters
    };

    const items = await Item.find(query)
      .populate('categoryId', 'name')
      .populate('storeId', 'name')
      .populate('unitId', 'name')
      .sort({ updatedAt: -1 })
      .lean();

    const formattedItems = items.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      description: item.description,
      sku: item.sku,
      barcode: item.barcode,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      minSellingPrice: item.minSellingPrice,
      quantity_added: item.quantity_added,
      quantity_spent: item.quantity_spent,
      quantity_Remaining: item.quantity_Remaining,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      category: item.categoryId ? {
        _id: item.categoryId._id.toString(),
        name: item.categoryId.name
      } : null,
      store: item.storeId ? {
        _id: item.storeId._id.toString(),
        name: item.storeId.name
      } : null,
      unit: item.unitId ? {
        _id: item.unitId._id.toString(),
        name: item.unitId.name
      } : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    return {
      success: true,
      data: formattedItems
    };

  } catch (error) {
    console.error("Error fetching items:", error);
    return { success: false, error: "فشل في جلب الأصناف: " + error.message };
  }
}

export async function getBranchInvoices({
  page = "1",
  status = "",
  type = "",
  paymentType = "",
  dateFrom = "",
  dateTo = "",
  searchQuery = "",
  limit = 10
}) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    if (!branchId) {
      return { success: false, error: "لا يمكن الوصول للفواتير بدون فرع مرتبط" };
    }

    // بناء شروط البحث
    const filter = {
      userId: userId,
      branchId: branchId
    };

    // فلترة حسب الحالة
    if (status && status !== "") {
      filter.status = status;
    }

    // فلترة حسب النوع
    if (type && type !== "") {
      filter.type = type;
    }

    // فلترة حسب نوع الدفع
    if (paymentType && paymentType !== "") {
      filter.paymentType = paymentType;
    }

    // فلترة حسب التاريخ
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    // البحث في رقم الفاتورة أو ملاحظات
    if (searchQuery && searchQuery !== "") {
      const searchRegex = new RegExp(searchQuery, 'i');
      filter.$or = [
        { invoiceNumber: searchRegex },
        { notes: searchRegex }
      ];
    }

    // حساب الترقيم
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // جلب الفواتير مع الترقيم
    const [invoices, totalCount] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Invoice.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNumber);

    // تنسيق البيانات للإرجاع
    const formattedInvoices = invoices.map(invoice => ({
      _id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      invoiceKind: invoice.invoiceKind,
      status: invoice.status,
      paymentType: invoice.paymentType,
      totalInvoice: invoice.totalInvoice,
      totalPays: invoice.totalPays,
      balance: invoice.balance,
      currencyCode: invoice.currencyCode,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      customerId: invoice.customerId?.toString() || null,
      supplierId: invoice.supplierId?.toString() || null,
      branchId: invoice.branchId?.toString() || null,
      itemsCount: invoice.items?.length || 0,
      notes: invoice.notes
    }));

    return {
      success: true,
      data: {
        invoices: formattedInvoices,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalCount,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      }
    };

  } catch (error) {
    console.error("Error fetching branch invoices:", error);
    return { success: false, error: "فشل في جلب الفواتير: " + error.message };
  }
}

export async function getInvoiceDetails(invoiceId) {
  await connectToDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "غير مصرح بالوصول" };
    }

    const userId = session.user.mainAccountId || session.user.id;
    const branchId = session.user.branchId;

    if (!branchId) {
      return { success: false, error: "لا يمكن الوصول للفاتورة بدون فرع مرتبط" };
    }

    // التحقق من صحة معرف الفاتورة
    if (!invoiceId || invoiceId.length !== 24) {
      return { success: false, error: "معرف الفاتورة غير صحيح" };
    }

    // جلب الفاتورة مع التحقق من الصلاحيات
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      userId: userId,
      branchId: branchId
    }).lean();

    if (!invoice) {
      return { success: false, error: "الفاتورة غير موجودة أو غير مصرح بالوصول إليها" };
    }

    // تنسيق البيانات للإرجاع
    const formattedInvoice = {
      _id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      invoiceKind: invoice.invoiceKind,
      status: invoice.status,
      paymentType: invoice.paymentType,
      
      // معلومات العميل والمورد
      customerId: invoice.customerId ? {
        _id: invoice.customerId.toString(),
        name: "عميل", // يمكن تحسينها لاحقاً بجلب البيانات الفعلية
        email: "",
        phone: "",
        address: ""
      } : null,
      
      supplierId: invoice.supplierId ? {
        _id: invoice.supplierId.toString(),
        name: "مورد",
        email: "",
        phone: "",
        address: ""
      } : null,

      // الأصناف
      items: invoice.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.total || (item.price * item.quantity),
        storeId: item.storeId?.toString() || null,
        unit: item.unit?.toString() || null
      })),

      // المبالغ
      discount: invoice.discount || 0,
      extra: invoice.extra || 0,
      taxRate: invoice.taxRate || 0,
      vatAmount: invoice.vatAmount || 0,
      totalItems: invoice.totalItems || 0,
      totalInvoice: invoice.totalInvoice || 0,
      totalPays: invoice.totalPays || 0,
      balance: invoice.balance || 0,

      // معلومات الدفع
      pays: invoice.pays || [],
      installments: invoice.installments || [],
      currencyCode: invoice.currencyCode || 'SAR',

      // معلومات إضافية
      notes: invoice.notes || '',
      attachments: invoice.attachments || [],
      
      // التواريخ
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,

      // معلومات الفرع
      branchId: invoice.branchId?.toString() || null
    };

    return {
      success: true,
      data: formattedInvoice
    };

  } catch (error) {
    console.error("Error fetching invoice details:", error);
    return { success: false, error: "فشل في جلب تفاصيل الفاتورة: " + error.message };
  }
}