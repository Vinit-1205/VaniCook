import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/cooks', AdminController.getCooks);
router.patch('/cooks/:id/verify', AdminController.verifyCook);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.setUserStatus);
router.get('/bookings', AdminController.getBookings);
router.get('/pools', AdminController.getPools);

export default router;

