import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  UserController.updateProfile
);
router.get(
  '/admin/stats',
  authenticate,
  authorize('ADMIN'),
  UserController.getAdminStats
);

export default router;

