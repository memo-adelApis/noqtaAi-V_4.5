import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // معلومات المستخدم
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // معلومات الدفعة
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'SAR',
    enum: ['SAR', 'USD', 'EUR']
  },
  
  // رقم عملية الدفع (المرجع)
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // طريقة الدفع
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'credit_card', 'paypal', 'stc_pay', 'mada', 'other']
  },
  
  // حالة الدفعة
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'refunded'],
    default: 'pending'
  },
  
  // نوع الاشتراك
  subscriptionType: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  
  // فترة الاشتراك
  subscriptionPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  
  // معلومات التحقق
  verification: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // المدير الذي تحقق من الدفعة
    },
    verifiedAt: Date,
    notes: String // ملاحظات المدير
  },
  
  // معلومات إضافية
  metadata: {
    bankName: String,
    accountNumber: String,
    receiptImage: String, // رابط صورة الإيصال
    ipAddress: String,
    userAgent: String
  }
  
}, {
  timestamps: true // createdAt, updatedAt
});

// إنشاء فهرس للبحث السريع
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

// دالة لحساب تاريخ انتهاء الاشتراك
paymentSchema.methods.calculateEndDate = function(startDate, subscriptionType) {
  const start = new Date(startDate);
  let endDate = new Date(start);
  
  switch(subscriptionType) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }
  
  return endDate;
};

// دالة للتحقق من صحة الدفعة
paymentSchema.methods.verify = async function(adminId, notes = '') {
  this.status = 'verified';
  this.verification.verifiedBy = adminId;
  this.verification.verifiedAt = new Date();
  this.verification.notes = notes;
  
  // تفعيل المستخدم
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.userId, {
    isActive: true,
    subscriptionStatus: 'active',
    subscriptionType: this.subscriptionType,
    subscriptionStart: this.subscriptionPeriod.startDate,
    subscriptionEnd: this.subscriptionPeriod.endDate
  });
  
  return await this.save();
};

// دالة لرفض الدفعة
paymentSchema.methods.reject = async function(adminId, notes = '') {
  this.status = 'rejected';
  this.verification.verifiedBy = adminId;
  this.verification.verifiedAt = new Date();
  this.verification.notes = notes;
  
  return await this.save();
};

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;