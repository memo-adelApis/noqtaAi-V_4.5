import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: false // قد يكون null في حالة فشل تسجيل الدخول
    },
    email: { 
      type: String, 
      required: true,
      lowercase: true 
    },
    status: { 
      type: String, 
      enum: ["success", "failed", "blocked"], 
      required: true 
    },
    ipAddress: { 
      type: String, 
      required: true 
    },
    userAgent: { 
      type: String, 
      required: true 
    },
    location: {
      country: { type: String, default: null },
      city: { type: String, default: null },
      region: { type: String, default: null }
    },
    device: {
      type: { type: String, default: null }, // mobile, desktop, tablet
      os: { type: String, default: null },
      browser: { type: String, default: null }
    },
    failureReason: { 
      type: String, 
      required: false // سبب فشل تسجيل الدخول
    },
    sessionId: { 
      type: String, 
      required: false 
    },
    duration: { 
      type: Number, 
      default: null // مدة الجلسة بالدقائق
    },
    logoutTime: { 
      type: Date, 
      default: null 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { 
    timestamps: true,
    // فهرسة للبحث السريع
    indexes: [
      { email: 1, createdAt: -1 },
      { status: 1, createdAt: -1 },
      { ipAddress: 1 },
      { userId: 1, createdAt: -1 }
    ]
  }
);

// إضافة methods مفيدة
loginLogSchema.methods.getDeviceInfo = function() {
  return {
    type: this.device?.type || 'unknown',
    os: this.device?.os || 'unknown',
    browser: this.device?.browser || 'unknown'
  };
};

loginLogSchema.methods.getLocationString = function() {
  const parts = [];
  if (this.location?.city) parts.push(this.location.city);
  if (this.location?.region) parts.push(this.location.region);
  if (this.location?.country) parts.push(this.location.country);
  return parts.join(', ') || 'غير محدد';
};

// Static methods للإحصائيات
loginLogSchema.statics.getLoginStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    success: stats.find(s => s._id === 'success')?.count || 0,
    failed: stats.find(s => s._id === 'failed')?.count || 0,
    blocked: stats.find(s => s._id === 'blocked')?.count || 0
  };
};

loginLogSchema.statics.getFailedAttempts = async function(email, hours = 1) {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - hours);

  return await this.countDocuments({
    email: email,
    status: 'failed',
    createdAt: { $gte: startTime }
  });
};

const LoginLog = mongoose.models.LoginLog || mongoose.model("LoginLog", loginLogSchema);
export default LoginLog;