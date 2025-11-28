"use server";

import { getCurrentUser } from "@/app/lib/auth";
import Invoice from "@/models/Invoices";
import Product from "@/models/Product"; // ✅ ضروري جداً: استيراد موديل المنتج
import { connectToDB } from "@/utils/database";
import { unstable_noStore as noStore } from "next/cache";



export async function createInvoiceAction(data) {
    try {
        const user = await getCurrentUser();
  
  // 1. فحص الاشتراك والقيود
  const limitCheck = await checkSubscriptionLimits(user);
  
  if (limitCheck.restricted) {
    // إذا كان الحساب مقيداً ووصل للحد الأقصى للفواتير
    if (limitCheck.limits.invoices.isReached) {
        return { 
            success: false, 
            message: "عفواً، لقد انتهت فترتك التجريبية وتجاوزت حد الـ 20 فاتورة. يرجى الترقية للمتابعة." 
        };
    }
  }
  //فحص الصلاحية
        if (!currentUser) throw new Error("401 - غير مصرح به");
        await connectToDB();

        const securedInvoiceData = {
            ...data,
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId,
            invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`
        };

        const processedItems = [];

        if (data.items && data.items.length > 0) {
            for (const item of data.items) {
                const cleanName = item.name.trim();
                const itemQty = Number(item.quantity);
                const itemPrice = Number(item.price);

                if (!item.storeId) throw new Error(`يجب تحديد المخزن للصنف: ${cleanName}`);

                // البحث عن المنتج
                let product = await Product.findOne({
                    name: cleanName,
                    storeId: item.storeId,
                    branchId: currentUser.branchId
                });

                // ✅ التعديل الجوهري هنا:
                // إذا لم يتم العثور على المنتج، نقوم بإنشائه فوراً بدلاً من إرجاع خطأ
                if (!product) {
                    product = await Product.create({
                        name: cleanName,
                        // توليد SKU تلقائي إذا لم يكن موجوداً لتجنب مشاكل التكرار
                        sku: `AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
                        storeId: item.storeId,
                        branchId: currentUser.branchId,
                        userId: currentUser.mainAccountId,
                        
                        quantity: 0, // نبدأ الكمية بصفر (سيتم تعديلها في الخطوات التالية)
                        
                        // إذا كانت فاتورة شراء، فالتكلفة هي السعر، أما إذا كانت بيع فنضع 0 لأننا لا نعرف التكلفة
                        averageCost: data.type === 'expense' ? itemPrice : 0, 
                        
                        price: itemPrice, // سعر التكلفة المبدئي
                        sellingPrice: itemPrice, // سعر البيع المبدئي
                        
                        // قيم افتراضية
                        category: "عام",
                        unit: item.unit || "قطعة"
                    });
                }

                // =================================================
                // 🟥 سيناريو البيع (Revenue)
                // =================================================
                if (data.type === 'revenue') {
                    // ❌ تم حذف شرط (!product) لأنه تم إنشاؤه بالأعلى
                    // ⚠️ ملاحظة: تم تجاوز شرط الكمية (quantity < itemQty) للسماح بالبيع بالسالب للصنف الجديد
                    
                    // 1. خصم الكمية (سيصبح الرصيد بالسالب إذا كان المنتج جديداً)
                    product.quantity -= itemQty;

                    // 2. تحديث القيمة المالية
                    product.inventoryValue = product.quantity * product.averageCost;

                    await product.save();
                }

                // =================================================
                // 🟩 سيناريو الشراء (Expense)
                // =================================================
                else if (data.type === 'expense') {
                    // بما أننا ضمنا وجود المنتج (product) في الأعلى، ننفذ منطق التحديث مباشرة
                    
                    // حساب متوسط التكلفة الجديد
                    const oldTotalValue = product.quantity * product.averageCost;
                    const newItemsValue = itemQty * itemPrice;
                    const totalQty = product.quantity + itemQty;

                    // تجنب القسمة على صفر
                    if (totalQty !== 0) {
                        product.averageCost = (oldTotalValue + newItemsValue) / totalQty;
                    } else {
                         // حالة نادرة: إذا كانت الكمية الاجمالية صفر، نعتمد السعر الجديد
                        product.averageCost = itemPrice;
                    }

                    // تحديث الكمية
                    product.quantity = totalQty;

                    // تحديث القيمة المالية الإجمالية
                    product.inventoryValue = product.quantity * product.averageCost;

                    await product.save();
                }

                processedItems.push({ ...item, productId: product._id });
            }
        }

        securedInvoiceData.items = processedItems;
        const newInvoice = new Invoice(securedInvoiceData);
        await newInvoice.save();

        return {
            success: true,
            message: "تم حفظ الفاتورة وتحديث/إنشاء الأصناف بالمخزن بنجاح",
            data: JSON.parse(JSON.stringify(newInvoice)),
        };

    } catch (error) {
        // console.error("Error creating invoice:");
        return { success: false, error: error.message || "حدث خطأ غير متوقع" };
    }
}

// --- دالة جلب الفواتير (getBranchInvoices) ---
// (التعديلات هنا طفيفة لتحسين البحث والأداء)
export async function getBranchInvoices({ 
    page = 1, 
    limit = 10, 
    status = "", 
    type = "", 
    paymentType = "",
    invoiceKind = "",
    dateFrom = "", 
    dateTo = "",
    searchQuery = "" 
}) {
    noStore();
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("401 - غير مصرح به");

        await connectToDB();

        const pageNum = Math.max(1, parseInt(page, 10)); // ضمان أن الصفحة لا تقل عن 1
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const query = {
            userId: currentUser.mainAccountId,
            branchId: currentUser.branchId,
        };

        // الفلاتر
        if (status && status !== "all") query.status = status;
        if (type && type !== "all") query.type = type;
        if (paymentType && paymentType !== "all") query.paymentType = paymentType;
        if (invoiceKind && invoiceKind !== "all") query.invoiceKind = invoiceKind;

        // التاريخ
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999); // نهاية اليوم
                query.createdAt.$lte = endDate;
            }
        }

        // البحث (رقم الفاتورة أو اسم العميل)
        if (searchQuery) {
            // ملاحظة: البحث في customerId يحتاج logic مختلف (Aggregate)
            // هنا سنبحث في رقم الفاتورة فقط لتبسيط الكود، أو يمكنك البحث في الـ populated fields لاحقاً
            query.invoiceNumber = { $regex: searchQuery, $options: "i" };
        }
        
        const invoices = await Invoice.find(query)
            .populate("customerId", "name")
            .populate("supplierId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const totalInvoices = await Invoice.countDocuments(query);

        return {
            success: true,
            data: {
                invoices: JSON.parse(JSON.stringify(invoices)),
                totalPages: Math.ceil(totalInvoices / limitNum),
                currentPage: pageNum,
                totalCount: totalInvoices,
            },
        };

    } catch (error) {
        // console.error("Get Branch Invoices Error:", error);
        return {
            success: false,
            error: error.message || "حدث خطأ أثناء جلب الفواتير",
        };
    }
}

// --- دالة جلب التفاصيل (getInvoiceDetails) ---
export async function getInvoiceDetails(invoiceId) {
    noStore();
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("401 - غير مصرح به");

        await connectToDB();

        if (!invoiceId) throw new Error("رقم الفاتورة غير موجود");

        const invoice = await Invoice.findOne({
            _id: invoiceId,
            userId: currentUser.mainAccountId,
            // ملاحظة: إذا كنت تريد السماح للمدير برؤية فواتير كل الفروع، يمكنك إزالة شرط branchId
            // branchId: currentUser.branchId, 
        })
        .populate("customerId", "name email phone address")
        .populate("supplierId", "name email phone address")
        .populate("branchId", "name location") // مفيد لعرض اسم الفرع في الطباعة
        .populate("items.unit", "name")
        // إذا كنت تستخدم storeId في الأصناف
        // .populate("items.storeId", "name") 
        .lean(); // استخدام lean للأداء

        if (!invoice) {
            return { success: false, error: "404 - الفاتورة غير موجودة أو لا تملك صلاحية" };
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(invoice)),
        };

    } catch (error) {
        // console.error("Get Invoice Details Error:", error);
        return {
            success: false,
            error: error.message || "حدث خطأ أثناء جلب تفاصيل الفاتورة",
        };
    }
}

export async function searchProducts(query) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return [];

        await connectToDB();

        const products = await Product.find({
            userId: currentUser.mainAccountId,
            $or: [
                { name: { $regex: query, $options: "i" } },
                { sku: { $regex: query, $options: "i" } }
            ]
        })
        .select("name price quantity sku storeId unit") 
        .limit(10)
        .lean();

        // ✅ الحل هنا: تحويل جميع الـ ObjectIds إلى String يدوياً
        const plainProducts = products.map(p => ({
            ...p,
            _id: p._id.toString(),
            storeId: p.storeId ? p.storeId.toString() : null, // تحويل storeId
            unit: p.unit ? p.unit.toString() : null,          // تحويل unit
        }));

        return plainProducts;

    } catch (error) {
        // console.error("Product Search Error:", error);
        return [];
    }
}
