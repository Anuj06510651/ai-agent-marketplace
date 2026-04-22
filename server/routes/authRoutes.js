import { Router } from 'express';
import {
	forgotPassword,
	getCurrentUser,
	login,
	resetPassword,
	signup,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/me', requireAuth, getCurrentUser);

export default router;