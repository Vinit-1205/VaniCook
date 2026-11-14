import prisma from '../config/database.js';
import { NotificationService } from './notification.service.js';

export class AdminService {
  /**
   * High-level institutional platform statistics
   */
  static async getPlatformStats() {
    const [
      totalCustomers,
      totalCooks,
      verifiedCooks,
      totalSocieties,
      totalBookings,
      activeBookings,
      completedBookings,
      activePools,
      bookingVolumeResult,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.cookProfile.count(),
      prisma.cookProfile.count({ where: { isVerified: true } }),
      prisma.society.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.groupRequest.count({
        where: { status: { in: ['OPEN', 'MATCHING', 'COOK_PENDING', 'CONFIRMED', 'ACTIVE'] } },
      }),
      prisma.booking.aggregate({
        where: { status: { in: ['ACTIVE', 'CONFIRMED'] } },
        _sum: { monthlyRate: true },
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
    ]);

    const monthlyVolume = bookingVolumeResult._sum.monthlyRate || 0;

    return {
      totalCustomers,
      totalCooks,
      verifiedCooks,
      totalSocieties,
      totalBookings,
      activeBookings,
      completedBookings,
      activePools,
      monthlyVolume,
      recentUsers,
    };
  }

  /**
   * Get all cook partners for admin verification & monitoring
   */
  static async getCooks() {
    return prisma.cookProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
          },
        },
        societiesServed: {
          include: { society: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });
  }

  /**
   * Approve or reject a cook profile verification
   */
  static async verifyCook(cookProfileId, isVerified) {
    const cook = await prisma.cookProfile.update({
      where: { id: cookProfileId },
      data: { isVerified },
      include: { user: true },
    });

    if (cook.userId) {
      await NotificationService.createNotification(
        cook.userId,
        isVerified ? 'Verification Approved! 🛡️' : 'Verification Status Updated',
        isVerified
          ? 'Congratulations! Your CookConnect partner profile is now verified.'
          : 'Your partner verification was set to pending review.',
        'VERIFICATION',
        '/cook/dashboard'
      );
    }

    return cook;
  }

  /**
   * Get all platform users with filtering
   */
  static async getUsers(role) {
    return prisma.user.findMany({
      where: role ? { role } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        householdLocations: {
          where: { isPrimary: true },
          include: { society: true },
        },
        cookProfile: {
          select: { id: true, isVerified: true, rating: true },
        },
      },
    });
  }

  /**
   * Suspend or reactivate user account
   */
  static async setUserStatus(userId, isActive) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, fullName: true, email: true, isActive: true },
    });

    if (!isActive) {
      await NotificationService.createNotification(
        userId,
        'Account Status Notice',
        'Your account has been temporarily restricted by system administration. Please contact support.',
        'SYSTEM'
      );
    }

    return user;
  }

  /**
   * Get all bookings across the platform
   */
  static async getAllBookings() {
    return prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        cookProfile: {
          include: {
            user: { select: { fullName: true, phone: true } },
          },
        },
        society: true,
        requirements: true,
        review: true,
      },
    });
  }

  /**
   * Get all neighbourhood cooking pools across the platform
   */
  static async getAllPools() {
    return prisma.groupRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        society: true,
        creator: {
          select: { fullName: true, email: true },
        },
        assignedCook: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }
}

