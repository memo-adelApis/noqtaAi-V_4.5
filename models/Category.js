import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        trim: true 
    },
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category" 
    }, // للفئات الفرعية
    image: { 
        type: String 
    }, // صورة الفئة
    isActive: { 
        type: Boolean, 
        default: true 
    },
    sortOrder: { 
        type: Number, 
        default: 0 
    }, // ترتيب العرض
    
    // للمتجر الإلكتروني
    seoTitle: { 
        type: String, 
        trim: true 
    },
    seoDescription: { 
        type: String, 
        trim: true 
    },
    slug: { 
        type: String, 
        unique: true, 
        sparse: true 
    }, // للروابط الودية
    
    // العلاقات
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    branchId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Branch", 
        required: true 
    }
}, { 
    timestamps: true
});

// Indexes
categorySchema.index({ userId: 1, branchId: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ slug: 1 }, { unique: true, sparse: true });
categorySchema.index({ name: 'text', description: 'text' });

// إنشاء slug تلقائياً
categorySchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;