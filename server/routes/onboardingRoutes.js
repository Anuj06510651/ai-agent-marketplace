import { Router } from 'express';
import { createOnboarding, getOnboardingById } from '../controllers/onboardingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/onboarding', requireAuth, createOnboarding);
router.get('/onboarding/:id', requireAuth, getOnboardingById);

export default router;
