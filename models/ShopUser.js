import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const shopUserSchema = new mongoose.Schema({
  // معلومات المستخدم الأساسية
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true // يسمح بقيم null متعددة
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح']
  },
  
  // كلمة المرور
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل']
  },
  
  // رمز التحقق للهاتف
  phoneVerification: {
    code: String,
    expiresAt: Date,
    isVerified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    lastSentAt: Date
  },
  
  // العنوان (اختياري)
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'مصر' }
  },

  // ربط بالمتجر/المشترك
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // معلومات إضافية
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },

  // تفضيلات التسوق
  preferences: {
    newsletter: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    language: { type: String, default: 'ar' }
  },

  // حالة الحساب
  isActive: {
    type: Boolean,
    default: true
  },
  
  // نوع التسجيل
  registrationType: {
    type: String,
    enum: ['phone', 'email', 'guest'],
    default: 'phone'
  },
  
  // معلومات الجلسة
  lastLoginAt: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // إحصائيات
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date
  },

  // المفضلة
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],

  // عربة التسوق
  cart: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes للبحث السريع
shopUserSchema.index({ phone: 1 }, { unique: true });
shopUserSchema.index({ email: 1 }, { sparse: true });
shopUserSchema.index({ shopId: 1 });
shopUserSchema.index({ ownerId: 1 });

// Virtual للتحقق من قفل الحساب
shopUserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual للاسم الكامل للعنوان
shopUserSchema.virtual('fullAddress').get(function() {
  if (!this.address || !this.address.street) return '';
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// تشفير كلمة المرور قبل الحفظ
shopUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// دالة مقارنة كلمة المرور
shopUserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// دالة إنشاء JWT token
shopUserSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    phone: this.phone,
    name: this.name,
    type: 'shop_user'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'shop-secret-key', {
    expiresIn: '30d'
  });
};

// دالة إنشاء رمز التحقق
shopUserSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 أرقام
  
  this.phoneVerification = {
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 دقائق
    isVerified: false,
    attempts: 0,
    lastSentAt: new Date()
  };
  
  return code;
};

// دالة التحقق من رمز التحقق
shopUserSchema.methods.verifyCode = function(inputCode) {
  if (!this.phoneVerification || !this.phoneVerification.code) {
    return { success: false, message: 'لا يوجد رمز تحقق' };
  }
  
  if (this.phoneVerification.expiresAt < new Date()) {
    return { success: false, message: 'انتهت صلاحية رمز التحقق' };
  }
  
  if (this.phoneVerification.attempts >= 5) {
    return { success: false, message: 'تم تجاوز عدد المحاولات المسموح' };
  }
  
  this.phoneVerification.attempts += 1;
  
  if (this.phoneVerification.code !== inputCode) {
    return { success: false, message: 'رمز التحقق غير صحيح' };
  }
  
  this.phoneVerification.isVerified = true;
  this.phoneVerification.code = undefined;
  this.phoneVerification.expiresAt = undefined;
  
  return { success: true, message: 'تم التحقق بنجاح' };
};

// دالة تسجيل محاولة دخول فاشلة
shopUserSchema.methods.incLoginAttempts = function() {
  // إذا كان لدينا محاولة سابقة وانتهت فترة القفل، أعد تعيين العداد
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // قفل الحساب بعد 5 محاولات فاشلة لمدة ساعتين
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // ساعتان
  }
  
  return this.updateOne(updates);
};

// دالة إعادة تعيين محاولات الدخول
shopUserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLoginAt: new Date() }
  });
};

// Method لحساب إجمالي عربة التسوق
shopUserSchema.methods.getCartTotal = function() {
  return this.cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Method لإضافة منتج للعربة
shopUserSchema.methods.addToCart = function(itemId, quantity, price) {
  const existingItem = this.cart.find(item => item.item.toString() === itemId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({
      item: itemId,
      quantity,
      price
    });
  }
  
  return this.save();
};

// Method لإزالة منتج من العربة
shopUserSchema.methods.removeFromCart = function(itemId) {
  this.cart = this.cart.filter(item => item.item.toString() !== itemId.toString());
  return this.save();
};

// Method لتحديث كمية منتج في العربة
shopUserSchema.methods.updateCartQuantity = function(itemId, quantity) {
  const item = this.cart.find(item => item.item.toString() === itemId.toString());
  if (item) {
    if (quantity <= 0) {
      return this.removeFromCart(itemId);
    } else {
      item.quantity = quantity;
      return this.save();
    }
  }
  return Promise.resolve(this);
};

// Method لتفريغ العربة
shopUserSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

const ShopUser = mongoose.models.ShopUser || mongoose.model('ShopUser', shopUserSchema);
export default ShopUser;