import { BookingModel } from '../models/booking.model.js';
import { CookModel } from '../models/cook.model.js';
import { NotificationService } from './notification.service.js';

export class BookingService {
  static async createBooking(customerId, data) {
    const {
      cookProfileId,
      societyId,
      mealType,
      notes,
      isSharedPool,
      diet,
      spiceLevel,
      familySize,
      specialInstructions,
    } = data;

    const cook = await CookModel.findById(cookProfileId);
    if (!cook) {
      const error = new Error('Cook profile not found');
      error.statusCode = 404;
      throw error;
    }

    // Pricing calculation
    const baseMonthly = cook.basePriceMonthly;
    let sharedRatio = 1.0;
    let finalMonthlyRate = baseMonthly;

    if (isSharedPool) {
      // Phase 1 formula for 2-3 household sharing: 45% discount for customers
      sharedRatio = 0.55;
      finalMonthlyRate = Math.round(baseMonthly * sharedRatio);
    }

    const booking = await BookingModel.create({
      customerId,
      cookProfileId,
      societyId: societyId || (cook.societiesServed[0]?.societyId ?? null),
      mealType: mealType || 'ALL_MEALS',
      status: 'PENDING',
      startDate: new Date(),
      monthlyRate: finalMonthlyRate,
      sharedRatio,
      notes,
      requirements: {
        diet: diet || 'Vegetarian',
        spiceLevel: spiceLevel || 'Medium',
        familySize: Number(familySize) || 2,
        specialInstructions,
      },
    });

    // Notify cook partner of incoming inquiry
    if (cook.userId) {
      await NotificationService.createNotification(
        cook.userId,
        'New Booking Request Received',
        `A household requested your ${mealType || 'kitchen'} service. Review their request in your Cook Hub.`,
        'BOOKING',
        '/cook/dashboard'
      );
    }

    return booking;
  }

  static async getCustomerBookings(customerId) {
    return BookingModel.findByCustomer(customerId);
  }

  static async getCookBookings(userId) {
    const cook = await CookModel.findByUserId(userId);
    if (!cook) {
      const error = new Error('Cook profile not found');
      error.statusCode = 404;
      throw error;
    }
    return BookingModel.findByCook(cook.id);
  }

  static async updateBookingStatus(userId, userRole, bookingId, status) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership
    const isCustomer = booking.customerId === userId;
    const isCook = booking.cookProfile.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isCustomer && !isCook && !isAdmin) {
      const error = new Error('Unauthorized to update this booking');
      error.statusCode = 403;
      throw error;
    }

    // Customers can cancel pending bookings, cooks can confirm or complete
    if (isCustomer && status !== 'CANCELLED') {
      const error = new Error('Customers may only cancel a booking');
      error.statusCode = 400;
      throw error;
    }

    const updated = await BookingModel.updateStatus(bookingId, status);

    // Notify counterpart
    if (isCook || isAdmin) {
      const message =
        status === 'ACTIVE'
          ? 'Your cook partner accepted the booking! Service is now active.'
          : status === 'COMPLETED'
          ? 'Your cooking subscription was marked completed. Please share your review!'
          : `Booking status updated to ${status}.`;

      await NotificationService.createNotification(
        booking.customerId,
        `Booking ${status}`,
        message,
        'BOOKING',
        '/customer/bookings'
      );
    } else if (isCustomer && status === 'CANCELLED') {
      await NotificationService.createNotification(
        booking.cookProfile.userId,
        'Booking Cancelled',
        'A customer cancelled their booking request.',
        'BOOKING',
        '/cook/dashboard'
      );
    }

    return updated;
  }

  static async addReview(customerId, reviewData) {
    const { bookingId, rating, comment } = reviewData;
    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.customerId !== customerId) {
      const error = new Error('Unauthorized: You can only review your own bookings');
      error.statusCode = 403;
      throw error;
    }

    if (booking.status !== 'COMPLETED' && booking.status !== 'ACTIVE') {
      const error = new Error('Only completed or active bookings can be reviewed');
      error.statusCode = 400;
      throw error;
    }

    if (booking.review) {
      const error = new Error('A review has already been submitted for this booking');
      error.statusCode = 400;
      throw error;
    }

    const review = await BookingModel.createReview({
      bookingId,
      customerId,
      cookProfileId: booking.cookProfileId,
      rating: Number(rating),
      comment,
    });

    // Notify cook of new review
    if (booking.cookProfile?.userId) {
      await NotificationService.createNotification(
        booking.cookProfile.userId,
        'New Customer Review Received',
        `A resident left you a ${rating}⭐ review: "${comment?.slice(0, 60) || 'Great service!'}"`,
        'REVIEW',
        '/cook/dashboard'
      );
    }

    return review;
  }
}

