import { Router } from 'express';
import { CookController } from '../controllers/cook.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  updateCookProfileSchema,
  cookFilterSchema,
} from '../validators/cook.validator.js';

const router = Router();

// Public discovery
router.get('/discover', validate(cookFilterSchema, 'query'), CookController.discoverCooks);
router.get('/pool-preview/:societyId', CookController.getNeighbourhoodPoolPreview);

// Cook self-management (protected)
router.get('/me', authenticate, authorize('COOK'), CookController.getMyProfile);
router.get('/schedule', authenticate, authorize('COOK'), CookController.getSchedule);
router.put(
  '/me',
  authenticate,
  authorize('COOK'),
  validate(updateCookProfileSchema),
  CookController.updateMyProfile
);

// Individual Cook details (public)
router.get('/:id', CookController.getCookDetails);
router.get('/:id/reviews', CookController.getCookReviews);

export default router;

