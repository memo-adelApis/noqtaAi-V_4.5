import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    name: String,
    details: {
        contact: String,
        address: String
    },
    // (userId) هو حساب المشترك الرئيسي (الشركة)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // --- (هذه هي الإضافة الأهم) ---
    // (branchId) هو الفرع الذي يتبعه هذا المورد
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    // --- (نهاية الإضافة) ---

    pay: Number,
    suply : Number,
    balnce : Number,
    createdAt: { type: Date, default: Date.now } ,
});

supplierSchema.pre("save", function (next) {
    if (this.isModified('suply') || this.isModified('pay')) {
        this.balnce = (this.suply || 0) - (this.pay || 0);
    }
    next();
});

// لسرعة البحث
supplierSchema.index({ userId: 1, branchId: 1 });

const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
export default Supplier;