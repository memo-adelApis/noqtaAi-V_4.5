import mongoose from "mongoose";

// ------------------- Item Schema -------------------
// (لا تغيير هنا - نفس الكود السابق)
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, default: 0 },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },


}, { _id: false });

// ------------------- Installment Schema -------------------
// (لا تغيير هنا - نفس الكود السابق)
const installmentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  sku: { type: String }, // نحتفظ بالـ SKU هنا أيضاً للبحث السريع
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending"
  },
  paidDate: { type: Date },
  paidAmount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// ------------------- Payment Schema -------------------
// (لا تغيير هنا - نفس الكود السابق)
const paymentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ["cash", "credit", "check", "bank"],
    default: "cash"
  },
  notes: { type: String, default: "" },
  reference: { type: String, default: "" },
  status: { type: String, enum: ["pending", "paid"], default: "pending" }
});

// ------------------- Invoice Schema (التعديل هنا) -------------------
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ["revenue", "expense"], required: true },
  invoiceKind: { type: String, enum: ["tax", "normal"], required: true },

  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  
  // هذا هو حساب المشترك الرئيسي (الشركة)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // --- الإضافة الجديدة والمهمة هنا ---
  branchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Branch",
    required: [true, "الفاتورة يجب أن تكون مرتبطة بفرع"] 
  },
  // ---------------------------------

  items: { type: [itemSchema], default: [] },
  discount: { type: Number, default: 0, min: 0 },
  extra: { type: Number, default: 0 },
  taxRate: { type: Number, min: 0, max: 100 },
  vatAmount: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 },
  totalInvoice: { type: Number, default: 0 },
  totalPays: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  paymentType: { type: String, enum: ["cash", "credit", "installment"], default: "cash" },
  pays: { type: [paymentSchema], default: [] },
  installments: { type: [installmentSchema], default: [] },
  currencyCode: {
    type: String,
    enum: ["SAR", "USD", "EGP", "AED", "EUR"],
    default: "SAR",
    required: true,
  },

  status: {
    type: String,
    enum: ["draft", "pending", "paid", "cancelled", "overdue"],
    default: "pending"
  },
  notes: { type: String, default: "" },
  attachments: { type: [String], default: [] }
}, { timestamps: true });

// ------------------- Hooks -------------------
// (لا تغيير هنا - نفس الكود السابق)
invoiceSchema.pre("save", function (next) {
  const invoice = this;
  invoice.totalItems = invoice.items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    item.total = itemTotal;
    return sum + itemTotal;
  }, 0);

  const subtotal = invoice.totalItems - invoice.discount;
    if (invoice.invoiceKind === "tax") {
    invoice.vatAmount = subtotal * (invoice.taxRate / 100);
  } else {
    invoice.vatAmount = 0; // الفاتورة العادية لا تضريبة
  }
  invoice.totalInvoice = subtotal + invoice.vatAmount + invoice.extra;

  invoice.totalPays = invoice.pays.reduce((sum, pay) => sum + pay.amount, 0);
  invoice.balance = invoice.totalInvoice - invoice.totalPays;

  // تحسين بسيط لمنطق الحالة
  if (invoice.balance <= 0 && invoice.totalInvoice > 0) {
      invoice.status = "paid";
  } else if (invoice.balance > 0 && invoice.paymentType === 'installment') {
      // يمكنك إضافة منطق للـ overdue هنا لاحقاً
      invoice.status = "pending"; 
  } else if (invoice.balance > 0) {
      invoice.status = "pending";
  }

  next();
});

// ------------------- Indexes (إضافة جديدة) -------------------
invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ type: 1, status: 1 });
invoiceSchema.index({ "installments.dueDate": 1 });

// إضافة index جديد لسرعة فلترة الفرع
invoiceSchema.index({ userId: 1, branchId: 1 }); 
// --------------------------------------------------------

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;