import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true }, 
    quantity: { type: Number, default: 0, min: 0 },
    averageCost: { type: Number, default: 0 },
    inventoryValue: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" }
}, { timestamps: true });

ProductSchema.index({ storeId: 1, name: 1 }, { unique: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;
