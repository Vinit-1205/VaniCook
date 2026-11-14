import { AvailabilityModel } from '../models/availability.model.js';
import { CookModel } from '../models/cook.model.js';

export class AvailabilityService {
  static async getCookAvailability(cookProfileId) {
    return AvailabilityModel.findByCookProfileId(cookProfileId);
  }

  static async getMyAvailability(userId) {
    const cook = await CookModel.findByUserId(userId);
    if (!cook) {
      const error = new Error('Cook profile not found');
      error.statusCode = 404;
      throw error;
    }
    return AvailabilityModel.findByCookProfileId(cook.id);
  }

  static async addSlot(userId, slotData) {
    const cook = await CookModel.findByUserId(userId);
    if (!cook) {
      const error = new Error('Cook profile not found');
      error.statusCode = 404;
      throw error;
    }

    return AvailabilityModel.create({
      ...slotData,
      cookProfileId: cook.id,
    });
  }

  static async updateSlot(userId, slotId, updateData) {
    const slot = await AvailabilityModel.findById(slotId);
    if (!slot) {
      const error = new Error('Slot not found');
      error.statusCode = 404;
      throw error;
    }

    if (slot.cookProfile.userId !== userId) {
      const error = new Error('Unauthorized to modify this availability slot');
      error.statusCode = 403;
      throw error;
    }

    return AvailabilityModel.update(slotId, updateData);
  }

  static async deleteSlot(userId, slotId) {
    const slot = await AvailabilityModel.findById(slotId);
    if (!slot) {
      const error = new Error('Slot not found');
      error.statusCode = 404;
      throw error;
    }

    if (slot.cookProfile.userId !== userId) {
      const error = new Error('Unauthorized to delete this availability slot');
      error.statusCode = 403;
      throw error;
    }

    return AvailabilityModel.delete(slotId);
  }
}

