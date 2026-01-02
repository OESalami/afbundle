import mongoose from 'mongoose';
import crypto from 'crypto';

const agentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: true,
    unique: true
  },
  password: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  registrationFeePaid: {
    type: Boolean,
    default: false
  },
  registrationFee: {
    type: Number,
    default: 50
  },
  paymentReference: {
    type: String,
    default: null
  },
  wallet: {
    type: Number,
    default: 0
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Hash password before saving
agentSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = crypto.createHash('sha256').update(this.password).digest('hex');
});

// Compare password
agentSchema.methods.comparePassword = function(candidatePassword) {
  const hashed = crypto.createHash('sha256').update(candidatePassword).digest('hex');
  return this.password === hashed;
};

export default mongoose.model('Agent', agentSchema);
