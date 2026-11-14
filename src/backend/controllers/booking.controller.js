import { BookingService } from '../services/booking.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class BookingController {
  static async createBooking(req, res, next) {
    try {
      const booking = await BookingService.createBooking(req.user.id, req.body);
      return ApiResponse.created(res, 'Booking created successfully', booking);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerBookings(req, res, next) {
    try {
      const bookings = await BookingService.getCustomerBookings(req.user.id);
      return ApiResponse.success(res, 'Customer bookings retrieved', bookings);
    } catch (error) {
      next(error);
    }
  }

  static async getCookBookings(req, res, next) {
    try {
      const bookings = await BookingService.getCookBookings(req.user.id);
      return ApiResponse.success(res, 'Cook bookings retrieved', bookings);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await BookingService.updateBookingStatus(
        req.user.id,
        req.user.role,
        req.params.id,
        status
      );
      return ApiResponse.success(res, `Booking status updated to ${status}`, updated);
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req, res, next) {
    try {
      const review = await BookingService.addReview(req.user.id, req.body);
      return ApiResponse.created(res, 'Review submitted successfully', review);
    } catch (error) {
      next(error);
    }
  }
}

