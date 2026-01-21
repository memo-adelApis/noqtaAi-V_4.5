import mongoose from 'mongoose';

const productReviewSchema = new mongoose.Schema({
  // ربط بالمنتج
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    index: true
  },
  
  // ربط بالمستخدم
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopUser',
    required: true,
    index: true
  },
  
  // ربط بالمتجر
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true
  },
  
  // ربط بالطلب (للتأكد من أن المستخدم اشترى المنتج)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopOrder'
  },
  
  // التقييم (1-5 نجوم)
  rating: {
    type: Number,
    required: [true, 'التقييم مطلوب'],
    min: [1, 'التقييم يجب أن يكون بين 1 و 5'],
    max: [5, 'التقييم يجب أن يكون بين 1 و 5']
  },
  
  // التعليق
  comment: {
    type: String,
    required: [true, 'التعليق مطلوب'],
    trim: true,
    maxlength: [1000, 'التعليق يجب أن يكون أقل من 1000 حرف']
  },
  
  // معلومات المراجع
  reviewer: {
    name: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false // هل المراجع مؤكد (اشترى المنتج فعلاً)
    }
  },
  
  // حالة المراجعة
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // تفاعل المراجعة
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShopUser'
    }]
  },
  
  // رد المتجر (اختياري)
  shopReply: {
    comment: String,
    date: Date,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // المشترك الذي رد
    }
  },
  
  // معلومات إضافية
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes للأداء
productReviewSchema.index({ productId: 1, createdAt: -1 });
productReviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); // مراجعة واحدة لكل مستخدم لكل منتج
productReviewSchema.index({ shopId: 1, status: 1, createdAt: -1 });
productReviewSchema.index({ rating: 1 });
productReviewSchema.index({ status: 1 });

// Virtual لحساب عمر المراجعة
productReviewSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'الآن' : `منذ ${minutes} دقيقة`;
    }
    return `منذ ${hours} ساعة`;
  } else if (days === 1) {
    return 'أمس';
  } else if (days < 7) {
    return `منذ ${days} أيام`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `منذ ${weeks} أسبوع`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `منذ ${months} شهر`;
  } else {
    const years = Math.floor(days / 365);
    return `منذ ${years} سنة`;
  }
});

// دالة لحساب إحصائيات التقييم للمنتج
productReviewSchema.statics.getProductRatingStats = async function(productId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        productId: new mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $addFields: {
        ratingBreakdown: {
          5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } },
          4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
  
  return {
    totalReviews: stats[0].totalReviews,
    averageRating: Math.round(stats[0].averageRating * 10) / 10, // تقريب لرقم عشري واحد
    ratingBreakdown: stats[0].ratingBreakdown
  };
};

// دالة للتحقق من إمكانية المراجعة
productReviewSchema.statics.canUserReview = async function(userId, productId) {
  // التحقق من عدم وجود مراجعة سابقة
  const existingReview = await this.findOne({ userId, productId });
  if (existingReview) {
    return { canReview: false, reason: 'لقد قمت بمراجعة هذا المنتج مسبقاً' };
  }
  
  // يمكن إضافة المزيد من الشروط هنا (مثل التحقق من الشراء)
  return { canReview: true };
};

// دالة لتحديث تقييم المنتج في نموذج Item
productReviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    await this.updateProductRating();
  }
});

productReviewSchema.post('findOneAndUpdate', async function() {
  if (this.getUpdate()?.status === 'approved') {
    const doc = await this.model.findById(this.getQuery()._id);
    if (doc) {
      await doc.updateProductRating();
    }
  }
});

// دالة لتحديث تقييم المنتج
productReviewSchema.methods.updateProductRating = async function() {
  const Item = mongoose.model('Item');
  const stats = await this.constructor.getProductRatingStats(this.productId);
  
  await Item.findByIdAndUpdate(this.productId, {
    'rating.average': stats.averageRating,
    'rating.count': stats.totalReviews
  });
};

const ProductReview = mongoose.models.ProductReview || mongoose.model('ProductReview', productReviewSchema);

export default ProductReview;