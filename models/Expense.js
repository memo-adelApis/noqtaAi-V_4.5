import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'COGS', // Cost of Goods Sold
      'Operating',
      'Administrative',
      'Utilities',
      'Rent',
      'Salary',
      'Office Supplies',
      'Marketing',
      'Insurance',
      'Maintenance',
      'Travel',
      'Professional Services',
      'Other'
    ]
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'check', 'other'],
    default: 'cash'
  },
  reference: {
    type: String,
    trim: true
  },
  vendor: {
    type: String,
    trim: true
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  },
  nextRecurringDate: {
    type: Date,
    required: function() {
      return this.isRecurring;
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ExpenseSchema.index({ businessId: 1, date: -1 });
ExpenseSchema.index({ businessId: 1, category: 1 });
ExpenseSchema.index({ businessId: 1, createdAt: -1 });
ExpenseSchema.index({ businessId: 1, status: 1 });

// Virtual for formatted amount
ExpenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

// Pre-save middleware to set approval date
ExpenseSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  next();
});

// Static method to get expenses by date range
ExpenseSchema.statics.getByDateRange = function(businessId, startDate, endDate) {
  return this.find({
    businessId,
    date: {
      $gte: startDate,
      $lte: endDate
    },
    status: 'approved'
  }).sort({ date: -1 });
};

// Static method to get expenses by category
ExpenseSchema.statics.getByCategory = function(businessId, category, startDate, endDate) {
  const query = {
    businessId,
    category,
    status: 'approved'
  };
  
  if (startDate && endDate) {
    query.date = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.find(query).sort({ date: -1 });
};

// Static method to get total expenses by category
ExpenseSchema.statics.getTotalByCategory = function(businessId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(businessId),
        date: {
          $gte: startDate,
          $lte: endDate
        },
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get monthly expense trends
ExpenseSchema.statics.getMonthlyTrends = function(businessId, year) {
  return this.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(businessId),
        date: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        },
        status: 'approved'
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          category: '$category'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.month',
        categories: {
          $push: {
            category: '$_id.category',
            total: '$total',
            count: '$count'
          }
        },
        monthTotal: { $sum: '$total' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);