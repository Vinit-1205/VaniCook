import { UserModel } from '../models/user.model.js';
import { AuthService } from './auth.service.js';
import prisma from '../config/database.js';

export class UserService {
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return AuthService.sanitizeUser(user);
  }

  static async updateProfile(userId, updateData) {
    const updatedUser = await UserModel.update(userId, updateData);
    return AuthService.sanitizeUser(updatedUser);
  }

  static async getAdminStats() {
    const [totalUsers, totalCooks, totalSocieties, totalBookings, recentUsers] =
      await Promise.all([
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.cookProfile.count(),
        prisma.society.count(),
        prisma.booking.count(),
        UserModel.findAll({}, 10, 0),
      ]);

    return {
      totalCustomers: totalUsers,
      totalCooks,
      totalSocieties,
      totalBookings,
      recentUsers,
    };
  }
}

