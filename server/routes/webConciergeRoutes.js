import { Router } from 'express';
import {
	chatWithBot,
	chatWithPublicBot,
	getPublicBotBySlug,
	setupBot,
} from '../controllers/webConciergeController.js';

const router = Router();

router.post('/setup-bot', setupBot);
router.post('/chat', chatWithBot);
router.get('/bot/:slug', getPublicBotBySlug);
router.post('/chat/public', chatWithPublicBot);

export default router;
