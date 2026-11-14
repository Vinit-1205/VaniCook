import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller.js';

const router = Router();

// Calculate dynamic shared pool pricing
router.get('/calculate', PricingController.calculatePrice);
router.post('/calculate', PricingController.calculatePrice);

export default router;

