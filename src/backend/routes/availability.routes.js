import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
} from '../validators/availability.validator.js';

const router = Router();

// Public: view a cook's availability
router.get('/cook/:cookProfileId', AvailabilityController.getCookAvailability);

// Cook protected routes
router.get('/me', authenticate, authorize('COOK'), AvailabilityController.getMyAvailability);
router.post(
  '/',
  authenticate,
  authorize('COOK'),
  validate(createAvailabilitySchema),
  AvailabilityController.addSlot
);
router.put(
  '/:id',
  authenticate,
  authorize('COOK'),
  validate(updateAvailabilitySchema),
  AvailabilityController.updateSlot
);
router.delete('/:id', authenticate, authorize('COOK'), AvailabilityController.deleteSlot);

export default router;

