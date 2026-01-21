import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  // معلومات أساسية
  name: {
    type: String,
    required: [true, 'اسم المتجر مطلوب'],
    trim: true
  },
  
  // الاسم الفريد (slug) - باللغة الإنجليزية فقط
  uniqueName: {
    type: String,
    required: [true, 'الاسم الفريد مطلوب'],
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'الاسم الفريد يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط'],
    minlength: [3, 'الاسم الفريد يجب أن يكون 3 أحرف على الأقل'],
    maxlength: [50, 'الاسم الفريد يجب أن يكون 50 حرف كحد أقصى']
  },
  
  // وصف المتجر
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'الوصف يجب أن يكون 500 حرف كحد أقصى']
  },
  
  // شعار المتجر
  logo: {
    type: String,
    default: null
  },
  
  // صورة الغلاف
  coverImage: {
    type: String,
    default: null
  },
  
  // مفاتيح البحث (SEO)
  keywords: [{
    type: String,
    trim: true
  }],
  
  // معلومات التواصل
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  
  // إعدادات المتجر
  settings: {
    // العملة
    currency: {
      type: String,
      enum: ['EGP', 'SAR', 'USD', 'EUR'],
      default: 'EGP'
    },
    
    // اللغة
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    },
    
    // الألوان
    theme: {
      primaryColor: {
        type: String,
        default: '#3B82F6'
      },
      secondaryColor: {
        type: String,
        default: '#8B5CF6'
      },
      backgroundColor: {
        type: String,
        default: '#F9FAFB'
      }
    },
    
    // إعدادات الشحن
    shipping: {
      enabled: {
        type: Boolean,
        default: true
      },
      freeShippingThreshold: {
        type: Number,
        default: 0
      },
      shippingCost: {
        type: Number,
        default: 0
      }
    },
    
    // إعدادات الدفع
    payment: {
      cashOnDelivery: {
        type: Boolean,
        default: true
      },
      bankTransfer: {
        type: Boolean,
        default: false
      },
      onlinePayment: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // ربط المتجر بالمشترك
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'المتجر يجب أن يكون مرتبط بمشترك']
  },
  
  // حالة المتجر
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  
  // معلومات الاشتراك
  subscription: {
    // تاريخ بداية الاشتراك
    startDate: {
      type: Date,
      default: Date.now
    },
    
    // تاريخ انتهاء الاشتراك
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم
    },
    
    // حالة الاشتراك
    isActive: {
      type: Boolean,
      default: true
    },
    
    // سعر الاشتراك الشهري (70 جنيه مصري)
    monthlyPrice: {
      type: Number,
      default: 70
    },
    
    // آخر دفعة
    lastPayment: {
      date: Date,
      amount: Number,
      method: String
    }
  },
  
  // إحصائيات المتجر
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalVisitors: {
      type: Number,
      default: 0
    }
  },
  
  // إعدادات SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogImage: String
  },
  
  // معلومات إضافية
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    whatsapp: String
  },
  
  // ساعات العمل
  workingHours: [{
    day: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    openTime: String,
    closeTime: String
  }],
  
  // تقييمات المتجر
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual للرابط الكامل للمتجر
shopSchema.virtual('shopUrl').get(function() {
  return `/shop/${this.uniqueName}`;
});

// Virtual للتحقق من انتهاء الاشتراك
shopSchema.virtual('isSubscriptionExpired').get(function() {
  return new Date() > this.subscription.endDate;
});

// Virtual للأيام المتبقية في الاشتراك
shopSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Indexes للأداء
shopSchema.index({ uniqueName: 1 }, { unique: true });
shopSchema.index({ subscriberId: 1 });
shopSchema.index({ status: 1 });
shopSchema.index({ 'subscription.endDate': 1 });
shopSchema.index({ keywords: 1 });

// Middleware قبل الحفظ
shopSchema.pre('save', function(next) {
  // تنظيف الاسم الفريد
  if (this.isModified('uniqueName')) {
    this.uniqueName = this.uniqueName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // تحديث SEO تلقائياً
  if (this.isModified('name') && !this.seo.metaTitle) {
    this.seo.metaTitle = this.name;
  }
  
  if (this.isModified('description') && !this.seo.metaDescription) {
    this.seo.metaDescription = this.description;
  }
  
  next();
});

// دالة للتحقق من توفر الاسم الفريد
shopSchema.statics.isUniqueNameAvailable = async function(uniqueName, excludeId = null) {
  const query = { uniqueName: uniqueName.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existingShop = await this.findOne(query);
  return !existingShop;
};

// دالة لتجديد الاشتراك
shopSchema.methods.renewSubscription = function(months = 1) {
  const now = new Date();
  const currentEndDate = this.subscription.endDate > now ? this.subscription.endDate : now;
  
  this.subscription.endDate = new Date(currentEndDate.getTime() + (months * 30 * 24 * 60 * 60 * 1000));
  this.subscription.isActive = true;
  this.status = 'active';
  
  return this.save();
};

// دالة لتحديث الإحصائيات
shopSchema.methods.updateStats = async function() {
  const Item = mongoose.model('Item');
  const Invoice = mongoose.model('Invoice');
  
  // عدد المنتجات
  this.stats.totalProducts = await Item.countDocuments({ 
    userId: this.subscriberId,
    status: 'active',
    isVisible: true
  });
  
  // عدد الطلبات والإيرادات
  const orderStats = await Invoice.aggregate([
    {
      $match: {
        userId: this.subscriberId,
        type: 'revenue',
        status: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalInvoice' }
      }
    }
  ]);
  
  if (orderStats.length > 0) {
    this.stats.totalOrders = orderStats[0].totalOrders;
    this.stats.totalRevenue = orderStats[0].totalRevenue;
  }
  
  return this.save();
};

const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);

export default Shop;