import prisma from '../config/database.js';

export class CookModel {
  static async findById(id) {
    return prisma.cookProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        availabilities: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        societiesServed: {
          include: {
            society: true,
          },
        },
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  static async findByUserId(userId) {
    return prisma.cookProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        availabilities: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        societiesServed: {
          include: {
            society: true,
          },
        },
      },
    });
  }

  static async findMany(filters = {}, take = 20, skip = 0) {
    const {
      societyId,
      cuisine,
      diet,
      mealType,
      minRating,
      maxPrice,
      search,
    } = filters;

    const where = {};

    if (cuisine) {
      where.cuisines = {
        has: cuisine,
      };
    }

    if (diet) {
      where.dietaryPreferences = {
        has: diet,
      };
    }

    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating),
      };
    }

    if (maxPrice) {
      where.basePriceMonthly = {
        lte: parseFloat(maxPrice),
      };
    }

    if (societyId) {
      where.societiesServed = {
        some: {
          societyId,
        },
      };
    }

    if (mealType) {
      where.availabilities = {
        some: {
          mealType,
          isBooked: false,
        },
      };
    }

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { bio: { contains: search, mode: 'insensitive' } },
        { cuisines: { has: search } },
        { specialities: { has: search } },
      ];
    }

    const [total, cooks] = await Promise.all([
      prisma.cookProfile.count({ where }),
      prisma.cookProfile.findMany({
        where,
        take,
        skip,
        orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          availabilities: true,
          societiesServed: {
            include: {
              society: true,
            },
          },
        },
      }),
    ]);

    return { total, cooks };
  }

  static async create(data) {
    const { societyIds, ...profileData } = data;
    return prisma.cookProfile.create({
      data: {
        ...profileData,
        societiesServed: societyIds?.length
          ? {
              create: societyIds.map((sId) => ({ societyId: sId })),
            }
          : undefined,
      },
      include: {
        user: true,
        societiesServed: {
          include: { society: true },
        },
      },
    });
  }

  static async update(id, data) {
    const { societyIds, ...profileData } = data;

    // If societyIds is provided, update the associations
    if (societyIds) {
      await prisma.cookSociety.deleteMany({
        where: { cookProfileId: id },
      });
      if (societyIds.length > 0) {
        await prisma.cookSociety.createMany({
          data: societyIds.map((sId) => ({
            cookProfileId: id,
            societyId: sId,
          })),
        });
      }
    }

    return prisma.cookProfile.update({
      where: { id },
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        societiesServed: {
          include: { society: true },
        },
        availabilities: true,
      },
    });
  }
}

