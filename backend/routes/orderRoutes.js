import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByPhone,
  getOrdersByAgent,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.get('/phone/:phoneNumber', getOrdersByPhone);
router.get('/agent/:agentPhone', getOrdersByAgent);
router.get('/:id', getOrderById);

// Admin routes (protected)
router.get('/', protect, getOrders);
router.put('/:id', protect, updateOrder);
router.delete('/:id', protect, deleteOrder);

export default router;