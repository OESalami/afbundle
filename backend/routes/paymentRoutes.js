import express from 'express';
import {
  initializePayment,
  createOrderInstant,
  paystackWebhook
} from '../controllers/paymentController.js';

const router = express.Router();

// Initialize payment - get payment data for Paystack popup
router.post('/initialize', initializePayment);

// Create order instantly after Paystack success callback
router.post('/create-order', createOrderInstant);

// Paystack webhook (for backup verification)
router.post('/webhook', paystackWebhook);

export default router;
