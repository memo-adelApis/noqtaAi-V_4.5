import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema( {
  supplierId: ObjectId, // FK -> Suppliers
  invoiceNumber: String,
  date: Date,
  type: "purchase" | "service", 
  items: [
    {
      productId: ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      warehouseId: ObjectId, // FK -> Warehouses
      categoryId: ObjectId,
      unitId: ObjectId,
      date: Date
    }
  ],
  discount: Number,
  extra: Number,
  total: Number,
  paid: Number,
  remaining: Number,
  createdAt: Date
}
);

const Expenses = mongoose.model("Expense", expenseSchema) || mongoose.models.Expense;
export default Expenses;