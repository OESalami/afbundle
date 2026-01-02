import mongoose from 'mongoose';
import crypto from 'crypto';

const adminSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    default: 'Admin' 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Hash password before saving (async version - no next() needed)
adminSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  // Simple hash (use bcrypt in production)
  this.password = crypto.createHash('sha256').update(this.password).digest('hex');
});

// Compare password
adminSchema.methods.comparePassword = function(candidatePassword) {
  const hashed = crypto.createHash('sha256').update(candidatePassword).digest('hex');
  return this.password === hashed;
};

export default mongoose.model('Admin', adminSchema);