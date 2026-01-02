import express from 'express';
import {
  getAgents,
  getAgentStats,
  approveAgent,
  rejectAgent,
  deleteAgent,
  getAgentOrders
} from '../controllers/agentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected (admin only)
router.use(protect);

router.get('/', getAgents);
router.get('/stats', getAgentStats);
router.get('/orders', getAgentOrders);
router.put('/:id/approve', approveAgent);
router.put('/:id/reject', rejectAgent);
router.delete('/:id', deleteAgent);

export default router;
