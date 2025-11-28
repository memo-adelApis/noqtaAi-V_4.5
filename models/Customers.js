import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: String,
  // (userId) هو حساب المشترك الرئيسي (الشركة)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // --- (هذه هي الإضافة الأهم) ---
  // (branchId) هو الفرع الذي يتبعه هذا العميل
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  // --- (نهاية الإضافة) ---

  details: {
    contact: String,
    address: String
  },
  createdAt: { type: Date, default: Date.now }
}); 

// لسرعة البحث
customerSchema.index({ userId: 1, branchId: 1 });

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;