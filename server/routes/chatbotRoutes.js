import { Router } from 'express';
import { getBrainStatus, simulateChat } from '../controllers/chatbotController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/brain-status', requireAuth, getBrainStatus);
router.post('/chatbots/:id/simulate', requireAuth, simulateChat);

export default router;
