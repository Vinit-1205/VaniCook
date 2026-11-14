import prisma from '../config/database.js';

export class AvailabilityModel {
  static async findByCookProfileId(cookProfileId) {
    return prisma.cookAvailability.findMany({
      where: { cookProfileId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  static async findById(id) {
    return prisma.cookAvailability.findUnique({
      where: { id },
      include: {
        cookProfile: true,
      },
    });
  }

  static async create(data) {
    return prisma.cookAvailability.create({
      data,
    });
  }

  static async createMany(slots) {
    return prisma.cookAvailability.createMany({
      data: slots,
    });
  }

  static async update(id, data) {
    return prisma.cookAvailability.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.cookAvailability.delete({
      where: { id },
    });
  }

  static async deleteByCookProfileId(cookProfileId) {
    return prisma.cookAvailability.deleteMany({
      where: { cookProfileId },
    });
  }
}

