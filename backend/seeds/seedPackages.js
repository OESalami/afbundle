import mongoose from 'mongoose';
import Package from '../models/Package.js';
import Network from '../models/Network.js';
import dotenv from 'dotenv';

dotenv.config();

// Networks data - must match frontend constants
const NETWORKS_DATA = [
  { name: 'MTN', slug: 'mtn', active: true },
  { name: 'AirtelTigo', slug: 'airteltigo', active: true },
  { name: 'Telecel', slug: 'telecel', active: true },
];

// Same package data as frontend - must stay in sync!
const PACKAGES_DATA = [
  // MTN Packages
  { id: 'mtn_1', networkSlug: 'mtn', sizeGb: 1, price: 4 },
  { id: 'mtn_2', networkSlug: 'mtn', sizeGb: 2, price: 8 },
  { id: 'mtn_3', networkSlug: 'mtn', sizeGb: 3, price: 12 },
  { id: 'mtn_4', networkSlug: 'mtn', sizeGb: 4, price: 16 },
  { id: 'mtn_5', networkSlug: 'mtn', sizeGb: 5, price: 20 },
  { id: 'mtn_6', networkSlug: 'mtn', sizeGb: 6, price: 24 },
  { id: 'mtn_7', networkSlug: 'mtn', sizeGb: 7, price: 28 },
  { id: 'mtn_8', networkSlug: 'mtn', sizeGb: 8, price: 32 },
  { id: 'mtn_9', networkSlug: 'mtn', sizeGb: 9, price: 36 },
  { id: 'mtn_10', networkSlug: 'mtn', sizeGb: 10, price: 40 },
  { id: 'mtn_12', networkSlug: 'mtn', sizeGb: 12, price: 48 },
  { id: 'mtn_15', networkSlug: 'mtn', sizeGb: 15, price: 60 },
  { id: 'mtn_20', networkSlug: 'mtn', sizeGb: 20, price: 80 },
  { id: 'mtn_25', networkSlug: 'mtn', sizeGb: 25, price: 100 },
  { id: 'mtn_30', networkSlug: 'mtn', sizeGb: 30, price: 120 },
  { id: 'mtn_40', networkSlug: 'mtn', sizeGb: 40, price: 160 },
  { id: 'mtn_50', networkSlug: 'mtn', sizeGb: 50, price: 200 },
  { id: 'mtn_100', networkSlug: 'mtn', sizeGb: 100, price: 400 },

  // AirtelTigo Packages
  { id: 'airteltigo_1', networkSlug: 'airteltigo', sizeGb: 1, price: 3.5 },
  { id: 'airteltigo_2', networkSlug: 'airteltigo', sizeGb: 2, price: 7 },
  { id: 'airteltigo_3', networkSlug: 'airteltigo', sizeGb: 3, price: 10.5 },
  { id: 'airteltigo_4', networkSlug: 'airteltigo', sizeGb: 4, price: 14 },
  { id: 'airteltigo_5', networkSlug: 'airteltigo', sizeGb: 5, price: 17.5 },
  { id: 'airteltigo_6', networkSlug: 'airteltigo', sizeGb: 6, price: 21 },
  { id: 'airteltigo_7', networkSlug: 'airteltigo', sizeGb: 7, price: 24.5 },
  { id: 'airteltigo_8', networkSlug: 'airteltigo', sizeGb: 8, price: 28 },
  { id: 'airteltigo_9', networkSlug: 'airteltigo', sizeGb: 9, price: 31.5 },
  { id: 'airteltigo_10', networkSlug: 'airteltigo', sizeGb: 10, price: 35 },
  { id: 'airteltigo_12', networkSlug: 'airteltigo', sizeGb: 12, price: 42 },
  { id: 'airteltigo_15', networkSlug: 'airteltigo', sizeGb: 15, price: 52.5 },
  { id: 'airteltigo_20', networkSlug: 'airteltigo', sizeGb: 20, price: 70 },
  { id: 'airteltigo_25', networkSlug: 'airteltigo', sizeGb: 25, price: 87.5 },
  { id: 'airteltigo_30', networkSlug: 'airteltigo', sizeGb: 30, price: 105 },
  { id: 'airteltigo_40', networkSlug: 'airteltigo', sizeGb: 40, price: 140 },
  { id: 'airteltigo_50', networkSlug: 'airteltigo', sizeGb: 50, price: 175 },
  { id: 'airteltigo_100', networkSlug: 'airteltigo', sizeGb: 100, price: 350 },

  // Telecel Packages
  { id: 'telecel_1', networkSlug: 'telecel', sizeGb: 1, price: 3.8 },
  { id: 'telecel_2', networkSlug: 'telecel', sizeGb: 2, price: 7.6 },
  { id: 'telecel_3', networkSlug: 'telecel', sizeGb: 3, price: 11.4 },
  { id: 'telecel_4', networkSlug: 'telecel', sizeGb: 4, price: 15.2 },
  { id: 'telecel_5', networkSlug: 'telecel', sizeGb: 5, price: 19 },
  { id: 'telecel_6', networkSlug: 'telecel', sizeGb: 6, price: 22.8 },
  { id: 'telecel_7', networkSlug: 'telecel', sizeGb: 7, price: 26.6 },
  { id: 'telecel_8', networkSlug: 'telecel', sizeGb: 8, price: 30.4 },
  { id: 'telecel_9', networkSlug: 'telecel', sizeGb: 9, price: 34.2 },
  { id: 'telecel_10', networkSlug: 'telecel', sizeGb: 10, price: 38 },
  { id: 'telecel_12', networkSlug: 'telecel', sizeGb: 12, price: 45.6 },
  { id: 'telecel_15', networkSlug: 'telecel', sizeGb: 15, price: 57 },
  { id: 'telecel_20', networkSlug: 'telecel', sizeGb: 20, price: 76 },
  { id: 'telecel_25', networkSlug: 'telecel', sizeGb: 25, price: 95 },
  { id: 'telecel_30', networkSlug: 'telecel', sizeGb: 30, price: 114 },
  { id: 'telecel_40', networkSlug: 'telecel', sizeGb: 40, price: 152 },
  { id: 'telecel_50', networkSlug: 'telecel', sizeGb: 50, price: 190 },
  { id: 'telecel_100', networkSlug: 'telecel', sizeGb: 100, price: 380 },
];

async function seedPackages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Step 1: Seed Networks first
    await Network.deleteMany({});
    console.log('Cleared existing networks');
    
    const insertedNetworks = await Network.insertMany(NETWORKS_DATA);
    console.log(`Seeded ${insertedNetworks.length} networks`);

    // Build network map from freshly inserted networks
    const networkMap = {};
    insertedNetworks.forEach(n => {
      networkMap[n.slug] = n._id;
    });

    // Step 2: Seed Packages
    await Package.deleteMany({});
    console.log('Cleared existing packages');

    const packagesToInsert = PACKAGES_DATA.map(pkg => ({
      packageCode: pkg.id,
      network: networkMap[pkg.networkSlug],
      networkSlug: pkg.networkSlug,
      title: `${pkg.sizeGb}GB Data`,
      sizeGb: pkg.sizeGb,
      price: pkg.price,
      validity: '30 days',
      active: true
    }));

    await Package.insertMany(packagesToInsert);
    console.log(`Seeded ${packagesToInsert.length} packages`);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedPackages();