import express from 'express';
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  getNetworkPrices
} from '../controllers/packageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPackages);
router.get('/prices/:networkId', getNetworkPrices);
router.get('/:id', getPackageById);

// Admin routes (protected)
router.post('/', protect, createPackage);
router.put('/:id', protect, updatePackage);
router.delete('/:id', protect, deletePackage);

export default router;