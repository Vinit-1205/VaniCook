import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  createReviewSchema,
} from '../validators/booking.validator.js';

const router = Router();

// Customer creates booking
router.post(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  validate(createBookingSchema),
  BookingController.createBooking
);

// Customer views their bookings
router.get(
  '/customer',
  authenticate,
  authorize('CUSTOMER'),
  BookingController.getCustomerBookings
);

// Cook views their bookings
router.get(
  '/cook',
  authenticate,
  authorize('COOK'),
  BookingController.getCookBookings
);

// Update status (Customer or Cook)
router.patch(
  '/:id/status',
  authenticate,
  validate(updateBookingStatusSchema),
  BookingController.updateStatus
);

// Customer leaves review
router.post(
  '/reviews',
  authenticate,
  authorize('CUSTOMER'),
  validate(createReviewSchema),
  BookingController.createReview
);

export default router;

