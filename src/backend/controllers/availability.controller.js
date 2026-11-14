import { AvailabilityService } from '../services/availability.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AvailabilityController {
  static async getCookAvailability(req, res, next) {
    try {
      const slots = await AvailabilityService.getCookAvailability(req.params.cookProfileId);
      return ApiResponse.success(res, 'Availability slots retrieved', slots);
    } catch (error) {
      next(error);
    }
  }

  static async getMyAvailability(req, res, next) {
    try {
      const slots = await AvailabilityService.getMyAvailability(req.user.id);
      return ApiResponse.success(res, 'My availability retrieved', slots);
    } catch (error) {
      next(error);
    }
  }

  static async addSlot(req, res, next) {
    try {
      const slot = await AvailabilityService.addSlot(req.user.id, req.body);
      return ApiResponse.created(res, 'Slot added successfully', slot);
    } catch (error) {
      next(error);
    }
  }

  static async updateSlot(req, res, next) {
    try {
      const updated = await AvailabilityService.updateSlot(
        req.user.id,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, 'Slot updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSlot(req, res, next) {
    try {
      await AvailabilityService.deleteSlot(req.user.id, req.params.id);
      return ApiResponse.success(res, 'Slot removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

