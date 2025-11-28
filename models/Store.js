import mongoose from "mongoose";

// هذا النموذج صحيح 100% لتحقيق هدفك
const StoreSchema = new mongoose.Schema({
    name: String,
    // (userId) هو حساب المشترك الرئيسي (الشركة)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    
    // (branchId) هو الفرع الذي يتبعه هذا المخزن
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }, 
    
    location: String,
    createdAt: { type: Date, default: Date.now }
}); 

// لسرعة البحث
StoreSchema.index({ userId: 1, branchId: 1 });

const Store =  mongoose.models.Store || mongoose.model("Store", StoreSchema) ;
export default Store;