import { UserService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const profile = await UserService.getProfile(req.user.id);
      return ApiResponse.success(res, 'Profile retrieved', profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const updated = await UserService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, 'Profile updated successfully', updated);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminStats(req, res, next) {
    try {
      const stats = await UserService.getAdminStats();
      return ApiResponse.success(res, 'Admin stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }
}

