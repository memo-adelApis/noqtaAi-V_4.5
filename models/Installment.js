import mongoose from "mongoose";



const installmentSchema = new mongoose.Schema({
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending"
    }
}, { timestamps: true });

const Installment = mongoose.models.Installment || mongoose.model("Installment", installmentSchema);

export default Installment;
