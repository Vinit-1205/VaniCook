import prisma from '../config/database.js';

export class LocationModel {
  static async findAllSocieties(search = '') {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { locality: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return prisma.society.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            cooks: true,
            locations: true,
          },
        },
      },
    });
  }

  static async findSocietyById(id) {
    return prisma.society.findUnique({
      where: { id },
      include: {
        cooks: {
          include: {
            cookProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async createSociety(data) {
    return prisma.society.create({
      data,
    });
  }

  static async getUserLocations(userId) {
    return prisma.householdLocation.findMany({
      where: { userId },
      include: {
        society: true,
      },
      orderBy: { isPrimary: 'desc' },
    });
  }

  static async createHouseholdLocation(data) {
    if (data.isPrimary) {
      await prisma.householdLocation.updateMany({
        where: { userId: data.userId },
        data: { isPrimary: false },
      });
    }

    return prisma.householdLocation.create({
      data,
      include: {
        society: true,
      },
    });
  }

  static async updateHouseholdLocation(id, userId, data) {
    if (data.isPrimary) {
      await prisma.householdLocation.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    return prisma.householdLocation.update({
      where: { id },
      data,
      include: {
        society: true,
      },
    });
  }

  static async deleteHouseholdLocation(id) {
    return prisma.householdLocation.delete({
      where: { id },
    });
  }
}

