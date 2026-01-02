import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = 'admin@afdb.com';
const ADMIN_PASSWORD = 'afdb@2026';
const ADMIN_NAME = 'AFDB Admin';

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Admin already exists:', ADMIN_EMAIL);
      await mongoose.disconnect();
      return;
    }

    // Create default admin
    await Admin.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME
    });

    console.log(`Admin created: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedAdmin();