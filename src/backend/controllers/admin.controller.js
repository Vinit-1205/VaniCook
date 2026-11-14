import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AdminController {
  static async getStats(req, res, next) {
    try {
      const stats = await AdminService.getPlatformStats();
      return ApiResponse.success(res, 'Platform statistics retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  static async getCooks(req, res, next) {
    try {
      const cooks = await AdminService.getCooks();
      return ApiResponse.success(res, 'Cook partners retrieved', cooks);
    } catch (error) {
      next(error);
    }
  }

  static async verifyCook(req, res, next) {
    try {
      const { isVerified } = req.body;
      const cook = await AdminService.verifyCook(req.params.id, isVerified === true || isVerified === 'true');
      return ApiResponse.success(res, `Cook verification status updated to ${cook.isVerified}`, cook);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const { role } = req.query;
      const users = await AdminService.getUsers(role);
      return ApiResponse.success(res, 'Users retrieved', users);
    } catch (error) {
      next(error);
    }
  }

  static async setUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const user = await AdminService.setUserStatus(req.params.id, isActive === true || isActive === 'true');
      return ApiResponse.success(res, `User status updated to ${user.isActive ? 'Active' : 'Suspended'}`, user);
    } catch (error) {
      next(error);
    }
  }

  static async getBookings(req, res, next) {
    try {
      const bookings = await AdminService.getAllBookings();
      return ApiResponse.success(res, 'All platform bookings retrieved', bookings);
    } catch (error) {
      next(error);
    }
  }

  static async getPools(req, res, next) {
    try {
      const pools = await AdminService.getAllPools();
      return ApiResponse.success(res, 'All platform pools retrieved', pools);
    } catch (error) {
      next(error);
    }
  }
}

