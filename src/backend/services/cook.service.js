import { CookModel } from '../models/cook.model.js';
import prisma from '../config/database.js';

export class CookService {
  static async discoverCooks(filters, page = 1, limit = 20) {
    const skip = (Math.max(1, page) - 1) * limit;
    const { total, cooks } = await CookModel.findMany(filters, limit, skip);

    // Compute pricing and pool insights for each cook
    const enhancedCooks = cooks.map((cook) => {
      const baseMonthly = cook.basePriceMonthly;
      return {
        ...cook,
        pricing: {
          individualMonthly: baseMonthly,
          twoHouseholdPoolMonthly: Math.round(baseMonthly * 0.55),
          threeHouseholdPoolMonthly: Math.round(baseMonthly * 0.40),
          estimatedSavingsPercent: '40% - 60%',
        },
        capacitySummary: {
          maxHouseholds: cook.maxHouseholds,
          openSlots: Math.max(0, cook.maxHouseholds - 1),
        },
      };
    });

    return {
      cooks: enhancedCooks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCookDetails(cookId) {
    const cook = await CookModel.findById(cookId);
    if (!cook) {
      const error = new Error('Cook profile not found');
      error.statusCode = 404;
      throw error;
    }

    const baseMonthly = cook.basePriceMonthly;
    return {
      ...cook,
      pricing: {
        individualMonthly: baseMonthly,
        twoHouseholdPoolMonthly: Math.round(baseMonthly * 0.55),
        threeHouseholdPoolMonthly: Math.round(baseMonthly * 0.40),
        savingsHeadline: 'Save up to 60% by sharing within your society tower',
      },
      capacitySummary: {
        maxHouseholds: cook.maxHouseholds,
        openSlots: Math.max(0, cook.maxHouseholds - 1),
      },
    };
  }

  static async getCookByUserId(userId) {
    const cook = await CookModel.findByUserId(userId);
    if (!cook) {
      const error = new Error('Cook profile not found for this user');
      error.statusCode = 404;
      throw error;
    }
    return cook;
  }

  static async updateCookProfile(userId, updateData) {
    const cook = await CookModel.findByUserId(userId);
    if (!cook) {
      const error = new Error('Cook profile not found');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.avatarUrl) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: updateData.avatarUrl },
      });
      delete updateData.avatarUrl;
    }

    return CookModel.update(cook.id, updateData);
  }

  static async getCookReviews(cookProfileId) {
    return prisma.review.findMany({
      where: { cookProfileId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  static async getNeighbourhoodPoolPreview(societyId) {
    // Finds active cooks and group interest in a given residential society
    const society = await prisma.society.findUnique({
      where: { id: societyId },
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
                availabilities: true,
              },
            },
          },
        },
        groupRequests: {
          where: {
            status: { in: ['OPEN', 'MATCHING'] },
          },
          include: {
            creator: {
              select: { fullName: true, avatarUrl: true },
            },
            members: {
              include: {
                user: {
                  select: { fullName: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (!society) {
      const error = new Error('Society not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      society: {
        id: society.id,
        name: society.name,
        locality: society.locality,
        city: society.city,
      },
      activeCooksCount: society.cooks.length,
      availableCooks: society.cooks.map((cs) => cs.cookProfile),
      activePools: society.groupRequests,
      benefitSummary: {
        headline: 'Neighbourhood Cook Pool',
        description:
          'Multiple households in your society share one dedicated cook visiting your floor/tower.',
        perHouseholdCost: 'Starting at ₹1,400/mo (approx ₹45/meal)',
        cookEarningsBoost: '+65% earnings vs single household travel',
      },
    };
  }
}

