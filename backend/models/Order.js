// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },

  network: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Network",
    required: true
  },

  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true
  },

  packageCode: { 
    type: String, 
    required: true 
  }, // e.g., 'mtn_5' - for quick reference without populating

  phoneNumber: { type: String, required: true }, // Recipient phone number

  // Agent who placed the order (optional - null for customer orders)
  agentPhone: { type: String, default: null },

  amount: { type: Number, required: true },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  deliveryStatus: {
    type: String,
    enum: ["pending", "processing", "delivered"],
    default: "pending"
  },

  paystackReference: { type: String }

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
