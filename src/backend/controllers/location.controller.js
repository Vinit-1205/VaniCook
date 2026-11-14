import { LocationService } from '../services/location.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class LocationController {
  static async listSocieties(req, res, next) {
    try {
      const search = req.query.search || '';
      const societies = await LocationService.listSocieties(search);
      return ApiResponse.success(res, 'Societies retrieved', societies);
    } catch (error) {
      next(error);
    }
  }

  static async getSocietyDetails(req, res, next) {
    try {
      const society = await LocationService.getSocietyDetails(req.params.id);
      return ApiResponse.success(res, 'Society details retrieved', society);
    } catch (error) {
      next(error);
    }
  }

  static async createSociety(req, res, next) {
    try {
      const created = await LocationService.createSociety(req.body);
      return ApiResponse.created(res, 'Society created successfully', created);
    } catch (error) {
      next(error);
    }
  }

  static async getMyLocations(req, res, next) {
    try {
      const locations = await LocationService.getUserLocations(req.user.id);
      return ApiResponse.success(res, 'User locations retrieved', locations);
    } catch (error) {
      next(error);
    }
  }

  static async addLocation(req, res, next) {
    try {
      const location = await LocationService.addHouseholdLocation(req.user.id, req.body);
      return ApiResponse.created(res, 'Location added successfully', location);
    } catch (error) {
      next(error);
    }
  }

  static async updateLocation(req, res, next) {
    try {
      const location = await LocationService.updateHouseholdLocation(
        req.user.id,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, 'Location updated successfully', location);
    } catch (error) {
      next(error);
    }
  }

  static async deleteLocation(req, res, next) {
    try {
      await LocationService.deleteHouseholdLocation(req.params.id);
      return ApiResponse.success(res, 'Location deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

