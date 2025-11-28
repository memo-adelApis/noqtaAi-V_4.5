import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "success", "error"], default: "info" },
  isRead: { type: Boolean, default: false },
  
  // ✅ الإضافات الجديدة:
  isHandled: { type: Boolean, default: false }, // هل تم التعامل مع الطلب؟
  metadata: {
    transactionId: { type: String }, // رقم العملية
    paymentMethod: { type: String }, // طريقة الدفع
    amount: { type: Number }         // المبلغ
  }
  
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;