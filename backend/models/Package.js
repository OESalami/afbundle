// models/Package.js
import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  packageCode: { 
    type: String, 
    required: true
  }, // e.g., 'customer_mtn_5', 'agent_mtn_5'
  
  network: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Network",
    required: true
  },
  
  networkSlug: { 
    type: String, 
    required: true 
  }, // e.g., 'mtn', 'airteltigo', 'telecel'
  
  type: {
    type: String,
    enum: ['customer', 'agent'],
    default: 'customer'
  },
  
  title: { type: String, required: true }, // e.g., "5GB Data"
  sizeGb: { type: Number, required: true }, // e.g., 5
  price: { type: Number, required: true }, // e.g., 20
  validity: { type: String, default: "30 days" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Compound unique index: network + size + type
packageSchema.index({ networkSlug: 1, sizeGb: 1, type: 1 }, { unique: true });
packageSchema.index({ packageCode: 1 });
packageSchema.index({ networkSlug: 1, type: 1, active: 1 });

export default mongoose.model("Package", packageSchema);
