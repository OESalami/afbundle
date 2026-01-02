// models/Network.js
import mongoose from "mongoose";

const networkSchema = new mongoose.Schema({
  name: { type: String, required: true }, // MTN
  slug: { type: String, required: true, unique: true }, // mtn
  logo: { type: String }, // image URL
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Network", networkSchema);
