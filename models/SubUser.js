import mongoose from "mongoose";

// 🔹 Subuser Schema
const subuserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String, // bcrypt hash
      required: true,
    },
    role: {
      type: String,
      enum: ["managerRev", "managerEx", "manager", "user"],
      default: "user",
    },
    mainUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ⚙️ أكواد الدعوة والتفعيل
    inviteCodeHash: {
      type: String, // hash للقيمة العشوائية (لا تُخزن الكود نفسه)
    },
    inviteExpiresAt: {
      type: Date, // وقت انتهاء صلاحية الكود
    },
    inviteUsedAt: {
      type: Date, // وقت أول استخدام للكود
    },

    // ⚙️ إدارة الحساب
    mustChangePassword: {
      type: Boolean,
      default: true, // يجبر المستخدم على تغيير كلمة المرور عند أول دخول
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, _id: true } // ✅ كل subuser له _id خاص
);

export default subuserSchema;
