import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "الاسم مطلوب"], trim: true },
    email: { type: String, required: [true, "البريد الإلكتروني مطلوب"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "كلمة المرور مطلوبة"], select: false },
    image: { type: String, default: null },
    role: { type: String, enum: ["subscriber", "manager", "employee", "developer"], required: true, default: "subscriber" },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    mainAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    provider: { type: String, default: "credentials" },
    isActive: { type: Boolean, default: true }, // تفعيل/إيقاف يدوي من الأدمن

    subscription: {
    plan: { type: String, default: "trial" }, // trial, premium
    startDate: { type: Date, default: Date.now },
    // إضافة 40 يوم تلقائياً عند التسجيل
    endDate: { 
      type: Date, 
      default: () => new Date(+new Date() + 40 * 24 * 60 * 60 * 1000) 
    },
    isActive: { type: Boolean, default: true }, // تفعيل/إيقاف يدوي من الأدمن
    isExpired: { type: Boolean, default: false } // هل انتهت المدة؟
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

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
