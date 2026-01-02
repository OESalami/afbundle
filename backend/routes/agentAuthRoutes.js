import express from 'express';
import { registerAgent, loginAgent, getAgentMe } from '../controllers/agentAuthController.js';
import { protectAgent } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerAgent);
router.post('/login', loginAgent);
router.get('/me', protectAgent, getAgentMe);

export default router;
