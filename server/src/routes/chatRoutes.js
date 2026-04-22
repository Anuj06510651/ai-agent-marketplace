import { Router } from 'express';
import { chatWithBot } from '../controllers/chatController.js';

const router = Router();

router.post('/chat', chatWithBot);

export default router;