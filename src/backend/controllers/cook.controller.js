import { CookService } from '../services/cook.service.js';
import { SchedulingService } from '../services/scheduling.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class CookController {
  static async discoverCooks(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const filters = {
        societyId: req.query.societyId,
        cuisine: req.query.cuisine,
        diet: req.query.diet,
        mealType: req.query.mealType,
        minRating: req.query.minRating,
        maxPrice: req.query.maxPrice,
        search: req.query.search,
      };

      const result = await CookService.discoverCooks(filters, page, limit);
      return ApiResponse.success(res, 'Cooks retrieved', result.cooks, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCookDetails(req, res, next) {
    try {
      const cook = await CookService.getCookDetails(req.params.id);
      return ApiResponse.success(res, 'Cook details retrieved', cook);
    } catch (error) {
      next(error);
    }
  }

  static async getMyProfile(req, res, next) {
    try {
      const cook = await CookService.getCookByUserId(req.user.id);
      return ApiResponse.success(res, 'Cook profile retrieved', cook);
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req, res, next) {
    try {
      const updated = await CookService.updateCookProfile(req.user.id, req.body);
      return ApiResponse.success(res, 'Cook profile updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async getNeighbourhoodPoolPreview(req, res, next) {
    try {
      const societyId = req.params.societyId;
      const preview = await CookService.getNeighbourhoodPoolPreview(societyId);
      return ApiResponse.success(res, 'Neighbourhood pool preview retrieved', preview);
    } catch (error) {
      next(error);
    }
  }

  static async getSchedule(req, res, next) {
    try {
      const schedule = await SchedulingService.getCookSchedule(req.user.id);
      return ApiResponse.success(res, 'Cook weekly schedule retrieved', schedule);
    } catch (error) {
      next(error);
    }
  }

  static async getCookReviews(req, res, next) {
    try {
      const reviews = await CookService.getCookReviews(req.params.id);
      return ApiResponse.success(res, 'Cook reviews retrieved', reviews);
    } catch (error) {
      next(error);
    }
  }
}

