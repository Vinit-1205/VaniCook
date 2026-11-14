import prisma from '../config/database.js';

export class BookingModel {
  static async create(data) {
    const { requirements, ...bookingData } = data;

    return prisma.booking.create({
      data: {
        ...bookingData,
        requirements: requirements
          ? {
              create: requirements,
            }
          : undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        cookProfile: {
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
          },
        },
        society: true,
        requirements: true,
      },
    });
  }

  static async findById(id) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        cookProfile: {
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
          },
        },
        society: true,
        requirements: true,
        review: true,
      },
    });
  }

  static async findByCustomer(customerId) {
    return prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        cookProfile: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                phone: true,
              },
            },
          },
        },
        society: true,
        requirements: true,
        review: true,
      },
    });
  }

  static async findByCook(cookProfileId) {
    return prisma.booking.findMany({
      where: { cookProfileId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            householdLocations: {
              where: { isPrimary: true },
              include: { society: true },
            },
          },
        },
        society: true,
        requirements: true,
      },
    });
  }

  static async updateStatus(id, status) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        cookProfile: true,
      },
    });
  }

  static async createReview(data) {
    const { bookingId, customerId, cookProfileId, rating, comment } = data;
    
    // Create review and update cook's aggregate rating
    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId,
        cookProfileId,
        rating,
        comment,
      },
    });

    // Update aggregate rating on cook profile
    const allReviews = await prisma.review.findMany({
      where: { cookProfileId },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const avgRating =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / (totalReviews || 1);

    await prisma.cookProfile.update({
      where: { id: cookProfileId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews,
      },
    });

    return review;
  }
}

