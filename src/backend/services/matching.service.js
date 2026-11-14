import prisma from '../config/database.js';
import { PricingService } from './pricing.service.js';

export class MatchingService {
  /**
   * Find and score compatible cooks for a group request
   */
  static async findCompatibleCooksForGroup(groupRequest) {
    const {
      societyId,
      mealType,
      dietaryPreference,
      currentHouseholds,
      targetHouseholds,
    } = groupRequest;

    // 1. Mandatory Filter: Cooks that service this residential society
    const eligibleCooks = await prisma.cookProfile.findMany({
      where: {
        isVerified: true,
        societiesServed: {
          some: { societyId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            phone: true,
          },
        },
        availabilities: true,
        bookings: {
          where: {
            status: { in: ['ACTIVE', 'CONFIRMED'] },
          },
        },
      },
    });

    const recommendations = [];

    for (const cook of eligibleCooks) {
      // Mandatory Capacity Constraint Check
      const activeBookingsCount = cook.bookings.length;
      const remainingCapacity = cook.maxHouseholds - activeBookingsCount;

      if (remainingCapacity < 1) {
        // Cook is at maximum capacity, exclude
        continue;
      }

      // Mandatory Schedule Constraint Check:
      // Cook must have matching availability for the mealType
      const hasMealSlot = cook.availabilities.some(
        (a) => a.mealType === mealType && !a.isBooked
      );

      if (!hasMealSlot) {
        // Cook does not offer this meal slot
        continue;
      }

      // Mandatory Dietary Constraint Check:
      // If group wants Jain / Pure Veg, cook must support it
      const cookDiets = cook.dietaryPreferences || [];
      const requiresPureVeg =
        dietaryPreference.toLowerCase().includes('jain') ||
        dietaryPreference.toLowerCase().includes('veg');

      if (requiresPureVeg && !cookDiets.some((d) => d.toLowerCase().includes('veg') || d.toLowerCase().includes('jain'))) {
        continue;
      }

      // Calculate Compatibility Score (0 - 100%)
      let societyScore = 30; // 30% — Exact residential society match
      let scheduleScore = 25; // 25% — Verified open schedule slot
      let mealScore = 20; // 20% — Exact meal slot match
      let dietScore = 10; // 15% Max

      if (cookDiets.includes(dietaryPreference)) {
        dietScore = 15;
      } else if (cookDiets.some((d) => d.toLowerCase().includes('veg') && dietaryPreference.toLowerCase().includes('veg'))) {
        dietScore = 13;
      }

      let capacityScore = 5; // 10% Max
      if (remainingCapacity >= targetHouseholds) {
        capacityScore = 10;
      } else if (remainingCapacity >= currentHouseholds) {
        capacityScore = 8;
      }

      const compatibilityScore = Math.min(
        100,
        societyScore + scheduleScore + mealScore + dietScore + capacityScore
      );

      // Pricing calculation for this cook's base rate
      const pricing = PricingService.calculatePoolPrice({
        totalHouseholds: currentHouseholds,
        baseRate: cook.basePriceMonthly,
        dietaryType: dietaryPreference,
      });

      // Explainable reason
      const explanations = [
        `Verified partner in this society (30/30 pts)`,
        `Confirmed ${mealType} visiting slot available (25/25 pts)`,
        `Caters to ${dietaryPreference} dietary preferences (${dietScore}/15 pts)`,
        `Can comfortably host ${remainingCapacity} more household(s) in their daily round (${capacityScore}/10 pts)`,
      ];

      recommendations.push({
        cook: {
          id: cook.id,
          userId: cook.user.id,
          fullName: cook.user.fullName,
          name: cook.user.fullName,
          avatarUrl: cook.user.avatarUrl,
          experienceYears: cook.experienceYears,
          rating: cook.rating,
          totalReviews: cook.totalReviews,
          cuisines: cook.cuisines,
          dietaryPreferences: cook.dietaryPreferences,
          basePriceMonthly: cook.basePriceMonthly,
        },
        compatibilityScore,
        scoreBreakdown: {
          society: societyScore,
          schedule: scheduleScore,
          meal: mealScore,
          dietary: dietScore,
          capacity: capacityScore,
        },
        breakdown: [
          { factor: 'Society Proximity', points: societyScore },
          { factor: 'Schedule Compatibility', points: scheduleScore },
          { factor: 'Meal Type Match', points: mealScore },
          { factor: 'Dietary Alignment', points: dietScore },
          { factor: 'Household Capacity', points: capacityScore },
        ],
        remainingCapacity,
        pricing,
        explanation: explanations.join(' • '),
      });
    }

    // Sort by compatibility score descending, then rating
    recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore || b.cook.rating - a.cook.rating);

    return recommendations;
  }

  /**
   * Find compatible open group requests in a society for a customer looking to join
   */
  static async findCompatibleGroupsForCustomer({
    societyId,
    mealType,
    dietaryPreference,
    familySize = 2,
    userId,
  }) {
    const where = {
      societyId,
      status: { in: ['OPEN', 'MATCHING'] },
    };

    if (mealType) {
      where.mealType = mealType;
    }

    const openGroups = await prisma.groupRequest.findMany({
      where,
      include: {
        society: true,
        creator: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
        assignedCook: {
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        members: {
          select: {
            id: true,
            userId: true,
            householdSize: true,
            sharePercentage: true,
            joinedAt: true,
            // Flat number is intentionally omitted for privacy
          },
        },
      },
    });

    return openGroups
      .filter((g) => {
        // Exclude if group is already full
        if (g.currentHouseholds >= g.maxCapacity) return false;
        // Exclude groups user already joined
        if (g.members.some((m) => m.userId === userId)) return false;
        return true;
      })
      .map((g) => {
        const remainingCapacity = g.maxCapacity - g.currentHouseholds;

        // Compatibility score
        let score = 30; // 30% society match
        if (mealType && g.mealType === mealType) score += 25;
        else score += 15;

        if (
          dietaryPreference &&
          g.dietaryPreference.toLowerCase() === dietaryPreference.toLowerCase()
        ) {
          score += 25;
        } else {
          score += 15;
        }

        if (remainingCapacity >= 1) score += 20;

        // Pricing with the new family included
        const updatedPricing = PricingService.calculatePoolPrice({
          totalHouseholds: g.currentHouseholds + 1,
          baseRate: g.assignedCook?.basePriceMonthly || 3500,
          peoplePerHousehold: familySize,
          dietaryType: g.dietaryPreference,
        });

        return {
          ...g,
          compatibilityScore: score,
          remainingCapacity,
          newMemberEstimatedPrice: updatedPricing.pricePerHousehold,
          monthlySavings: updatedPricing.monthlySavings,
          savingsPercent: updatedPricing.savingsPercent,
          privacySummary: `${g.currentHouseholds} families already participating (Capacity: ${g.maxCapacity})`,
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}
