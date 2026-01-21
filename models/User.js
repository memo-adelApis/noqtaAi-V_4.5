import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "الاسم مطلوب"], trim: true },
    email: { type: String, required: [true, "البريد الإلكتروني مطلوب"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "كلمة المرور مطلوبة"], select: false },
    image: { type: String, default: null },
    role: { type: String, enum: ["owner", "admin", "subscriber", "manager", "employee", "developer", "cashier"], required: true, default: "subscriber" },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    mainAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    provider: { type: String, default: "credentials" },
    isActive: { type: Boolean, default: true }, // تفعيل/إيقاف يدوي من الأدمن

    // معلومات الاشتراك المحدثة
    subscriptionStatus: { 
      type: String, 
      enum: ["trial", "active", "expired", "suspended"], 
      default: "trial" 
    },
    subscriptionType: { 
      type: String, 
      enum: ["monthly", "quarterly", "yearly"], 
      default: null 
    },
    subscriptionStart: { 
      type: Date, 
      default: Date.now 
    },
    subscriptionEnd: { 
      type: Date, 
      default: () => new Date(+new Date() + 40 * 24 * 60 * 60 * 1000) // 40 يوم تجريبي
    },
    
    // الاشتراك القديم للتوافق مع الكود الموجود
    subscription: {
      plan: { type: String, default: "trial" }, // trial, basic, premium, enterprise
      startDate: { type: Date, default: Date.now },
      endDate: { 
        type: Date, 
        default: () => new Date(+new Date() + 40 * 24 * 60 * 60 * 1000) 
      },
      isActive: { type: Boolean, default: true },
      isExpired: { type: Boolean, default: false },
      
      // حدود الاستخدام
      invoiceLimit: { type: Number, default: 100 }, // حد الفواتير الشهري
      branchLimit: { type: Number, default: 3 }, // حد الفروع
      userLimit: { type: Number, default: 5 }, // حد المستخدمين الفرعيين
      supplierLimit: { type: Number, default: 50 }, // حد الموردين
      customerLimit: { type: Number, default: 200 }, // حد العملاء
      productLimit: { type: Number, default: 500 }, // حد المنتجات
      categoryLimit: { type: Number, default: 50 }, // حد الفئات
      warehouseLimit: { type: Number, default: 5 }, // حد المخازن
      
      // حدود إضافية
      storageLimit: { type: Number, default: 1024 }, // حد التخزين بالميجابايت
      apiCallsLimit: { type: Number, default: 1000 }, // حد استدعاءات API الشهرية
      reportLimit: { type: Number, default: 50 }, // حد التقارير الشهرية
      backupLimit: { type: Number, default: 5 } // حد النسخ الاحتياطية
    },
  },
  { timestamps: true }
);

// قبل الحفظ، تشفير كلمة المرور إذا تم تعديلها
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// التحقق من صحة الاشتراك
userSchema.methods.isSubscriptionActive = function() {
  return this.subscriptionStatus === 'active' && new Date() < this.subscriptionEnd;
};

// التحقق من انتهاء الفترة التجريبية
userSchema.methods.isTrialExpired = function() {
  return this.subscriptionStatus === 'trial' && new Date() > this.subscriptionEnd;
};

// تحديث حالة الاشتراك
userSchema.methods.updateSubscriptionStatus = function() {
  const now = new Date();
  
  if (this.subscriptionStatus === 'active' && now > this.subscriptionEnd) {
    this.subscriptionStatus = 'expired';
  } else if (this.subscriptionStatus === 'trial' && now > this.subscriptionEnd) {
    this.subscriptionStatus = 'expired';
  }
  
  // تحديث الاشتراك القديم للتوافق
  this.subscription.isExpired = this.subscriptionStatus === 'expired';
  this.subscription.isActive = this.subscriptionStatus === 'active';
  
  return this.save();
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
