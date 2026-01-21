import mongoose from "mongoose";


const itemSchema = new mongoose.Schema({
    // معلومات أساسية
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    sku: { type: String, unique: true, sparse: true, trim: true }, // رقم الصنف
    barcode: { type: String, unique: true, sparse: true, trim: true }, // الباركود
    
    // الأسعار
    purchasePrice: { type: Number, default: 0, min: 0 }, // سعر الشراء
    sellingPrice: { type: Number, default: 0, min: 0 }, // سعر البيع
    minSellingPrice: { type: Number, default: 0, min: 0 }, // أقل سعر بيع مسموح
    
    // معلومات المخزون
    quantity_added: { type: Number, default: 0, min: 0 },
    quantity_spent: { type: Number, default: 0, min: 0 },
    quantity_Remaining: { type: Number, default: 0, min: 0 },
    minStockLevel: { type: Number, default: 0, min: 0 }, // الحد الأدنى للمخزون
    maxStockLevel: { type: Number, default: 0, min: 0 }, // الحد الأقصى للمخزون
    
    // العلاقات
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // معلومات إضافية للمتجر الإلكتروني
    images: [{ type: String }], // صور المنتج
    weight: { type: Number, default: 0 }, // الوزن
    dimensions: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 }
    },
    
    // حالة المنتج
    status: { 
        type: String, 
        enum: ["active", "inactive", "discontinued"], 
        default: "active" 
    },
    isVisible: { type: Boolean, default: true }, // ظاهر في المتجر الإلكتروني
    isFeatured: { type: Boolean, default: false }, // منتج مميز
    
    // تتبع المعاملات
    lastadded: [
        {
            date: { type: Date, default: Date.now },
            quantity: { type: Number, required: true, min: 0 },
            purchasePrice: { type: Number, required: true, min: 0 },
            total: { type: Number, required: true, min: 0 },
            invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
            supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            notes: { type: String, trim: true }
        }
    ],
    
    // تصاريح الصرف
    exchange_permits: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            date: { type: Date, default: Date.now },
            status: { 
                type: String, 
                enum: ["pending", "approved", "rejected"], 
                default: "pending" 
            },
            quantity: { type: Number, required: true, min: 0 },
            sellingPrice: { type: Number, min: 0 },
            invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
            customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
            notes: { type: String, trim: true }
        }
    ],
    
    // إحصائيات
    totalPurchaseValue: { type: Number, default: 0 }, // إجمالي قيمة المشتريات
    totalSalesValue: { type: Number, default: 0 }, // إجمالي قيمة المبيعات
    averagePurchasePrice: { type: Number, default: 0 }, // متوسط سعر الشراء
    
    // SEO للمتجر الإلكتروني
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    tags: [{ type: String, trim: true }], // كلمات مفتاحية
    
    // تقييمات المنتج
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 }, // متوسط التقييم
        count: { type: Number, default: 0, min: 0 } // عدد التقييمات
    },
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual للربح المتوقع
itemSchema.virtual('expectedProfit').get(function() {
    return (this.sellingPrice - this.averagePurchasePrice) * this.quantity_Remaining;
});

// Virtual لحالة المخزون
itemSchema.virtual('stockStatus').get(function() {
    if (this.quantity_Remaining <= 0) return 'out_of_stock';
    if (this.quantity_Remaining <= this.minStockLevel) return 'low_stock';
    if (this.quantity_Remaining >= this.maxStockLevel) return 'overstock';
    return 'in_stock';
});

// Virtual للتحقق من إمكانية البيع
itemSchema.virtual('canSell').get(function() {
    return this.quantity_Remaining > 0 && this.status === 'active';
});

// Indexes للأداء
itemSchema.index({ userId: 1, branchId: 1, storeId: 1 });
itemSchema.index({ categoryId: 1, status: 1 });
itemSchema.index({ name: 'text', description: 'text', sku: 'text' });
itemSchema.index({ quantity_Remaining: 1, minStockLevel: 1 });

// حساب الكميات والأسعار تلقائياً قبل الحفظ
itemSchema.pre("save", function (next) {
    // حساب الكميات المضافة
    if (Array.isArray(this.lastadded) && this.lastadded.length > 0) {
        this.quantity_added = this.lastadded.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
        
        // حساب إجمالي قيمة المشتريات
        this.totalPurchaseValue = this.lastadded.reduce((sum, entry) => sum + (entry.total || 0), 0);
        
        // حساب متوسط سعر الشراء
        if (this.quantity_added > 0) {
            this.averagePurchasePrice = this.totalPurchaseValue / this.quantity_added;
        }
    } else {
        this.quantity_added = 0;
        this.totalPurchaseValue = 0;
        this.averagePurchasePrice = 0;
    }
    
    // حساب الكميات المصروفة (المعتمدة فقط)
    if (Array.isArray(this.exchange_permits) && this.exchange_permits.length > 0) {
        this.quantity_spent = this.exchange_permits
            .filter(entry => entry.status === 'approved')
            .reduce((sum, entry) => sum + (entry.quantity || 0), 0);
            
        // حساب إجمالي قيمة المبيعات
        this.totalSalesValue = this.exchange_permits
            .filter(entry => entry.status === 'approved')
            .reduce((sum, entry) => sum + ((entry.sellingPrice || 0) * (entry.quantity || 0)), 0);
    } else {
        this.quantity_spent = 0;
        this.totalSalesValue = 0;
    }
    
    // حساب الكمية المتبقية
    this.quantity_Remaining = (this.quantity_added || 0) - (this.quantity_spent || 0);
    
    // التأكد من عدم وجود كمية سالبة
    if (this.quantity_Remaining < 0) {
        this.quantity_Remaining = 0;
    }
    
    next();
});

// دالة للبحث المتقدم
itemSchema.statics.searchItems = function(searchQuery, filters = {}) {
    const query = { ...filters };
    
    if (searchQuery) {
        query.$or = [
            { name: new RegExp(searchQuery, 'i') },
            { description: new RegExp(searchQuery, 'i') },
            { sku: new RegExp(searchQuery, 'i') },
            { barcode: new RegExp(searchQuery, 'i') }
        ];
    }
    
    return this.find(query)
        .populate('unitId', 'name')
        .populate('categoryId', 'name')
        .populate('storeId', 'name')
        .sort({ updatedAt: -1 });
};

// دالة لإضافة كمية جديدة
itemSchema.methods.addStock = function(quantity, purchasePrice, invoiceId, supplierId, createdBy, notes) {
    const total = quantity * purchasePrice;
    
    this.lastadded.push({
        quantity,
        purchasePrice,
        total,
        invoiceId,
        supplierId,
        createdBy,
        notes
    });
    
    return this.save();
};

// دالة لصرف كمية
itemSchema.methods.sellStock = function(quantity, sellingPrice, invoiceId, customerId, userId, notes) {
    if (this.quantity_Remaining < quantity) {
        throw new Error('الكمية المطلوبة غير متوفرة في المخزون');
    }
    
    this.exchange_permits.push({
        userId,
        quantity,
        sellingPrice,
        invoiceId,
        customerId,
        status: 'approved', // معتمد مباشرة للمبيعات
        notes
    });
    
    return this.save();
};

// استخدم mongoose.models.Item أولاً لتجنب OverwriteModelError
const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
export default Item;