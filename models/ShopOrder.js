import mongoose from 'mongoose';

const shopOrderSchema = new mongoose.Schema({
  // رقم الطلب الفريد
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // معلومات المتجر والمشترك
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true
  },
  
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // معلومات العميل
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopUser',
    required: true,
    index: true
  },
  
  customer: {
    name: {
      type: String,
      required: [true, 'اسم العميل مطلوب'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true
    }
  },
  
  // منتجات الطلب
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    // معلومات إضافية للمنتج وقت الطلب
    image: String,
    category: String,
    // تقييم المنتج من العميل
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  }],
  
  // معلومات مالية
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  // عنوان الشحن
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: String
  },
  
  // معلومات الدفع
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'bank_transfer'],
    required: true,
    default: 'cod'
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // ملاحظات العميل
  notes: String,
  
  // حالة الطلب
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true
  },
  
  // تتبع حالة الطلب
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual للحصول على عدد المنتجات
shopOrderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual للتحقق من إمكانية الإلغاء
shopOrderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual للتحقق من إمكانية الإرجاع
shopOrderSchema.virtual('canReturn').get(function() {
  const deliveredDate = this.statusHistory.find(h => h.status === 'delivered')?.date;
  if (!deliveredDate) return false;
  
  const daysSinceDelivery = (new Date() - deliveredDate) / (1000 * 60 * 60 * 24);
  return daysSinceDelivery <= 14; // 14 يوم لإرجاع المنتج
});

// Indexes للأداء
shopOrderSchema.index({ shopId: 1, createdAt: -1 });
shopOrderSchema.index({ subscriberId: 1, createdAt: -1 });
shopOrderSchema.index({ customerId: 1, createdAt: -1 });
shopOrderSchema.index({ 'customer.phone': 1 });
shopOrderSchema.index({ status: 1, createdAt: -1 });
shopOrderSchema.index({ paymentStatus: 1 });

// Middleware قبل الحفظ
shopOrderSchema.pre('save', function(next) {
  // حساب المجاميع تلقائياً
  if (this.isModified('items') || this.isNew) {
    this.pricing.subtotal = this.items.reduce((sum, item) => {
      item.total = item.price * item.quantity;
      return sum + item.total;
    }, 0);
    
    this.pricing.total = this.pricing.subtotal + this.pricing.shipping + this.pricing.tax;
  }
  
  // إضافة رقم طلب تلقائي
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  
  // إضافة حالة إلى التاريخ
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      date: new Date()
    });
  }
  
  next();
});

// دالة لتحديث حالة الطلب
shopOrderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    note
  });
  
  // تحديث معلومات الدفع
  if (newStatus === 'confirmed' && this.paymentMethod === 'cod') {
    this.paymentStatus = 'paid';
  }
  
  return this.save();
};

// دالة لحساب الإحصائيات
shopOrderSchema.statics.getShopStats = async function(shopId, startDate, endDate) {
  const matchQuery = { shopId };
  
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ['$paymentStatus', 'paid'] },
              '$pricing.total',
              0
            ]
          }
        },
        averageOrderValue: { $avg: '$pricing.total' },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0
  };
};

const ShopOrder = mongoose.models.ShopOrder || mongoose.model('ShopOrder', shopOrderSchema);

export default ShopOrder;