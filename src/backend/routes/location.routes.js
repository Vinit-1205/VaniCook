import { Router } from 'express';
import { LocationController } from '../controllers/location.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createSocietySchema,
  createHouseholdLocationSchema,
} from '../validators/location.validator.js';

const router = Router();

// Public: view residential societies
router.get('/societies', LocationController.listSocieties);
router.get('/societies/:id', LocationController.getSocietyDetails);

// Admin: create new society
router.post(
  '/societies',
  authenticate,
  authorize('ADMIN'),
  validate(createSocietySchema),
  LocationController.createSociety
);

// Customer/User household locations (protected)
router.get('/my-locations', authenticate, LocationController.getMyLocations);
router.post(
  '/my-locations',
  authenticate,
  validate(createHouseholdLocationSchema),
  LocationController.addLocation
);
router.put(
  '/my-locations/:id',
  authenticate,
  validate(createHouseholdLocationSchema.partial()),
  LocationController.updateLocation
);
router.delete('/my-locations/:id', authenticate, LocationController.deleteLocation);

export default router;

