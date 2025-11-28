import mongoose from "mongoose";


const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    lastadded: [
        {
            date: Date,
            quantity: Number,
            price: Number,
            total: Number,
            createdby: String

        }
    ],
    exchange_permits: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            date: Date,
            status: { type: String, enum: ["pending", "approved", "rejected"] },
            quantity: Number,
            notes: String
        }
    ],
    quantity_added: Number,
    quantity_spent: Number,
    quantity_Remaining: Number,
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    totlPrice: Number,


    createdAt: Date
});

// حساب الكمية المتبقية تلقائياً قبل الحفظ
itemSchema.pre("save", function (next) {
    // اجمع كل الكميات المضافة من مصفوفة lastadded
    if (Array.isArray(this.lastadded) && this.lastadded.length > 0) {
        this.quantity_added = this.lastadded.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
    } else {
        this.quantity_added = 0;
    }
    // اجمع كل الكميات المصروفة من exchange_permits
    if (Array.isArray(this.exchange_permits) && this.exchange_permits.length > 0) {
        this.quantity_spent = this.exchange_permits.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
    } else {
        this.quantity_spent = 0;
    }
    this.quantity_Remaining = (this.quantity_added || 0) - (this.quantity_spent || 0);
    next();
});

// استخدم mongoose.models.Item أولاً لتجنب OverwriteModelError
const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
export default Item;