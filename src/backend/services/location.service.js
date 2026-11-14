import { LocationModel } from '../models/location.model.js';

export class LocationService {
  static async listSocieties(search = '') {
    return LocationModel.findAllSocieties(search);
  }

  static async getSocietyDetails(id) {
    const society = await LocationModel.findSocietyById(id);
    if (!society) {
      const error = new Error('Society not found');
      error.statusCode = 404;
      throw error;
    }
    return society;
  }

  static async createSociety(data) {
    return LocationModel.createSociety(data);
  }

  static async getUserLocations(userId) {
    return LocationModel.getUserLocations(userId);
  }

  static async addHouseholdLocation(userId, data) {
    return LocationModel.createHouseholdLocation({
      ...data,
      userId,
    });
  }

  static async updateHouseholdLocation(userId, locationId, data) {
    return LocationModel.updateHouseholdLocation(locationId, userId, data);
  }

  static async deleteHouseholdLocation(locationId) {
    return LocationModel.deleteHouseholdLocation(locationId);
  }
}

