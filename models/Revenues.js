import mongoose from "mongoose";


const revenuesSchema = new mongoose.Schema({
      invoiceNumber: String,
  date: Date,
  type: "normal" | "tax", // ضريبية أو عادية
  branchId: ObjectId, // FK -> Branch
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
               ref: "Customer"

     },
  
  items: [
    {
      productId: ObjectId, // FK -> Product
      name: String,
      price: Number,
      quantity: Number,
      categoryId: ObjectId, // FK -> Category
      unitId: ObjectId, // FK -> Units
      date: Date
    }
  ],
  discount: Number,
  extra: Number,
  total: Number,
  paid: Number,
  remaining: Number,
  paymentType: "cash" | "credit" | "installment",
  installments: [
    {
      dueDate: Date,
      amount: Number,
      status: "paid" | "pending"
    }
  ],
  createdAt: Date
});

const Revenues = mongoose.model("Revenues", revenuesSchema) || mongoose.models.Revenues;
export default Revenues;





