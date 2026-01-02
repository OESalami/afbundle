// Unique package codes - format: {network}_{sizeGB}
// These IDs must match the packageCode field in the database

export const PACKAGES = [
  // MTN Packages
  { id: 'mtn_1', networkId: 'mtn', sizeGb: 1, price: 4 },
  { id: 'mtn_2', networkId: 'mtn', sizeGb: 2, price: 8 },
  { id: 'mtn_3', networkId: 'mtn', sizeGb: 3, price: 12 },
  { id: 'mtn_4', networkId: 'mtn', sizeGb: 4, price: 16 },
  { id: 'mtn_5', networkId: 'mtn', sizeGb: 5, price: 20 },
  { id: 'mtn_6', networkId: 'mtn', sizeGb: 6, price: 24 },
  { id: 'mtn_7', networkId: 'mtn', sizeGb: 7, price: 28 },
  { id: 'mtn_8', networkId: 'mtn', sizeGb: 8, price: 32 },
  { id: 'mtn_9', networkId: 'mtn', sizeGb: 9, price: 36 },
  { id: 'mtn_10', networkId: 'mtn', sizeGb: 10, price: 40 },
  { id: 'mtn_12', networkId: 'mtn', sizeGb: 12, price: 48 },
  { id: 'mtn_15', networkId: 'mtn', sizeGb: 15, price: 60 },
  { id: 'mtn_20', networkId: 'mtn', sizeGb: 20, price: 80 },
  { id: 'mtn_25', networkId: 'mtn', sizeGb: 25, price: 100 },
  { id: 'mtn_30', networkId: 'mtn', sizeGb: 30, price: 120 },
  { id: 'mtn_40', networkId: 'mtn', sizeGb: 40, price: 160 },
  { id: 'mtn_50', networkId: 'mtn', sizeGb: 50, price: 200 },
  { id: 'mtn_100', networkId: 'mtn', sizeGb: 100, price: 400 },

  // AirtelTigo Packages
  { id: 'airteltigo_1', networkId: 'airteltigo', sizeGb: 1, price: 3.5 },
  { id: 'airteltigo_2', networkId: 'airteltigo', sizeGb: 2, price: 7 },
  { id: 'airteltigo_3', networkId: 'airteltigo', sizeGb: 3, price: 10.5 },
  { id: 'airteltigo_4', networkId: 'airteltigo', sizeGb: 4, price: 14 },
  { id: 'airteltigo_5', networkId: 'airteltigo', sizeGb: 5, price: 17.5 },
  { id: 'airteltigo_6', networkId: 'airteltigo', sizeGb: 6, price: 21 },
  { id: 'airteltigo_7', networkId: 'airteltigo', sizeGb: 7, price: 24.5 },
  { id: 'airteltigo_8', networkId: 'airteltigo', sizeGb: 8, price: 28 },
  { id: 'airteltigo_9', networkId: 'airteltigo', sizeGb: 9, price: 31.5 },
  { id: 'airteltigo_10', networkId: 'airteltigo', sizeGb: 10, price: 35 },
  { id: 'airteltigo_12', networkId: 'airteltigo', sizeGb: 12, price: 42 },
  { id: 'airteltigo_15', networkId: 'airteltigo', sizeGb: 15, price: 52.5 },
  { id: 'airteltigo_20', networkId: 'airteltigo', sizeGb: 20, price: 70 },
  { id: 'airteltigo_25', networkId: 'airteltigo', sizeGb: 25, price: 87.5 },
  { id: 'airteltigo_30', networkId: 'airteltigo', sizeGb: 30, price: 105 },
  { id: 'airteltigo_40', networkId: 'airteltigo', sizeGb: 40, price: 140 },
  { id: 'airteltigo_50', networkId: 'airteltigo', sizeGb: 50, price: 175 },
  { id: 'airteltigo_100', networkId: 'airteltigo', sizeGb: 100, price: 350 },

  // Telecel Packages
  { id: 'telecel_1', networkId: 'telecel', sizeGb: 1, price: 3.8 },
  { id: 'telecel_2', networkId: 'telecel', sizeGb: 2, price: 7.6 },
  { id: 'telecel_3', networkId: 'telecel', sizeGb: 3, price: 11.4 },
  { id: 'telecel_4', networkId: 'telecel', sizeGb: 4, price: 15.2 },
  { id: 'telecel_5', networkId: 'telecel', sizeGb: 5, price: 19 },
  { id: 'telecel_6', networkId: 'telecel', sizeGb: 6, price: 22.8 },
  { id: 'telecel_7', networkId: 'telecel', sizeGb: 7, price: 26.6 },
  { id: 'telecel_8', networkId: 'telecel', sizeGb: 8, price: 30.4 },
  { id: 'telecel_9', networkId: 'telecel', sizeGb: 9, price: 34.2 },
  { id: 'telecel_10', networkId: 'telecel', sizeGb: 10, price: 38 },
  { id: 'telecel_12', networkId: 'telecel', sizeGb: 12, price: 45.6 },
  { id: 'telecel_15', networkId: 'telecel', sizeGb: 15, price: 57 },
  { id: 'telecel_20', networkId: 'telecel', sizeGb: 20, price: 76 },
  { id: 'telecel_25', networkId: 'telecel', sizeGb: 25, price: 95 },
  { id: 'telecel_30', networkId: 'telecel', sizeGb: 30, price: 114 },
  { id: 'telecel_40', networkId: 'telecel', sizeGb: 40, price: 152 },
  { id: 'telecel_50', networkId: 'telecel', sizeGb: 50, price: 190 },
  { id: 'telecel_100', networkId: 'telecel', sizeGb: 100, price: 380 },
];

// Helper functions
export const getPackagesByNetwork = (networkId) => 
  PACKAGES.filter(pkg => pkg.networkId === networkId);

export const getPackageById = (packageId) => 
  PACKAGES.find(pkg => pkg.id === packageId);

export const getPackageByNetworkAndSize = (networkId, sizeGb) => 
  PACKAGES.find(pkg => pkg.networkId === networkId && pkg.sizeGb === sizeGb);

export const getPriceRange = (networkId) => {
  const networkPackages = getPackagesByNetwork(networkId);
  if (!networkPackages.length) return { min: 0, max: 0 };
  const prices = networkPackages.map(pkg => pkg.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

// Get unique data sizes (for display grid)
export const DATA_SIZES = [...new Set(PACKAGES.map(pkg => pkg.sizeGb))].sort((a, b) => a - b);