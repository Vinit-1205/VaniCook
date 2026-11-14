import prisma from '../config/database.js';

export class UserModel {
  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        cookProfile: true,
        householdLocations: {
          include: { society: true },
        },
      },
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        cookProfile: {
          include: {
            availabilities: true,
            societiesServed: {
              include: { society: true },
            },
          },
        },
        householdLocations: {
          include: { society: true },
        },
      },
    });
  }

  static async create(userData) {
    return prisma.user.create({
      data: {
        ...userData,
        email: userData.email.toLowerCase(),
      },
      include: {
        cookProfile: true,
      },
    });
  }

  static async update(id, updateData) {
    return prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        cookProfile: true,
        householdLocations: {
          include: { society: true },
        },
      },
    });
  }

  static async count(filter = {}) {
    return prisma.user.count({ where: filter });
  }

  static async findAll(filter = {}, take = 50, skip = 0) {
    return prisma.user.findMany({
      where: filter,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        cookProfile: {
          select: {
            id: true,
            isVerified: true,
            rating: true,
          },
        },
      },
    });
  }
}

