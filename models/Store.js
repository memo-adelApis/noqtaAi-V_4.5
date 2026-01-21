import mongoose from "mongoose";

// هذا النموذج صحيح 100% لتحقيق هدفك
const StoreSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    
    // (userId) هو حساب المشترك الرئيسي (الشركة)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    
    // (branchId) هو الفرع الذي يتبعه هذا المخزن
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }, 
    
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true }); 

// لسرعة البحث
StoreSchema.index({ userId: 1, branchId: 1 });
StoreSchema.index({ name: 1, userId: 1, branchId: 1 }, { unique: true });

const Store = mongoose.models.Store || mongoose.model("Store", StoreSchema);
export default Store;