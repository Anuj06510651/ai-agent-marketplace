import { Router } from 'express';
import { getCustomerById, getCustomers } from '../controllers/customerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/customers', requireAuth, getCustomers);
router.get('/customers/:id', requireAuth, getCustomerById);

export default router;