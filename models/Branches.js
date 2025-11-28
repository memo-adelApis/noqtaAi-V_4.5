// المسار: models/Branches.js (تحديث هام)
import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'اسم الفرع مطلوب'],
    },
    location: {
        type: String,
        default: '',
    },
    // --- (هذا هو التعديل الإجباري) ---
    // ربط الفرع بالمشترك (صاحب الحساب)
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true // لسرعة البحث
    }
    // --- (نهاية التعديل) ---

}, { timestamps: true });

// لمنع المشترك من إنشاء فرعين بنفس الاسم
branchSchema.index({ name: 1, userId: 1 }, { unique: true });

const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);

export default Branch;