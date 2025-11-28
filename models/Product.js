// المسار: models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    // (SKU) كود المنتج لتمييزه (يمكن أن يكون نفس الاسم إذا لم يوجد باركود)
    sku: { type: String, required: true, trim: true }, 
    
    // الكمية الحالية المتاحة في هذا المخزن
    quantity: { type: Number, default: 0, min: 0 },
    
    // متوسط التكلفة (لحساب الأرباح بدقة عند تغير أسعار الشراء)
    averageCost: { type: Number, default: 0 },
    inventoryValue: { type: Number, default: 0 },
    
    // سعر البيع المقترح (اختياري)
    sellingPrice: { type: Number, default: 0 },
    
    // الربط بالمخزن والفرع
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // الشركة الرئيسية
    
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Units" }
}, { timestamps: true });

// فهرس لمنع تكرار نفس المنتج بنفس الاسم داخل نفس المخزن
ProductSchema.index({ storeId: 1, name: 1 }, { unique: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;