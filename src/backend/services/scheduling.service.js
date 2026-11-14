import prisma from '../config/database.js';

export class SchedulingService {
  /**
   * Validate cook capacity and schedule before booking confirmation
   */
  static async validateCookCapacityAndSchedule(cookProfileId, mealType, requiredSlots = 1) {
    const cook = await prisma.cookProfile.findUnique({
      where: { id: cookProfileId },
      include: {
        bookings: {
          where: { status: { in: ['ACTIVE', 'CONFIRMED'] } },
        },
        availabilities: {
          where: { mealType },
        },
      },
    });

    if (!cook) {
      throw new Error('Cook profile not found');
    }

    // 1. Capacity check
    const currentBookedCount = cook.bookings.length;
    if (currentBookedCount + requiredSlots > cook.maxHouseholds) {
      throw new Error(
        `Capacity exceeded. Cook has ${cook.maxHouseholds - currentBookedCount} slot(s) remaining (requested ${requiredSlots}).`
      );
    }

    // 2. Schedule check
    const matchingSlot = cook.availabilities.find((a) => !a.isBooked);
    if (!matchingSlot) {
      throw new Error(
        `No available ${mealType} visiting slots for this cook partner.`
      );
    }

    return {
      isValid: true,
      remainingSlots: cook.maxHouseholds - currentBookedCount - requiredSlots,
      matchedSlot: matchingSlot,
    };
  }

  /**
   * Get formatted daily & weekly schedule for an authenticated cook
   */
  static async getCookSchedule(userId) {
    const cook = await prisma.cookProfile.findUnique({
      where: { userId },
      include: {
        availabilities: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        bookings: {
          where: { status: { in: ['ACTIVE', 'CONFIRMED'] } },
          include: {
            customer: {
              select: {
                fullName: true,
                phone: true,
                householdLocations: {
                  where: { isPrimary: true },
                  include: { society: true },
                },
              },
            },
            requirements: true,
            groupRequest: true,
          },
        },
        assignedGroups: {
          where: { status: { in: ['COOK_PENDING', 'CONFIRMED', 'ACTIVE'] } },
          include: {
            society: true,
            members: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    phone: true,
                    householdLocations: {
                      where: { isPrimary: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cook) {
      throw new Error('Cook profile not found');
    }

    // Format weekly calendar with sequential visiting orders
    const days = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];

    const weeklyCalendar = days.map((day) => {
      const daySlots = cook.availabilities.filter((a) => a.dayOfWeek === day);

      const sequentialVisits = cook.bookings.map((b, index) => {
        const primaryLoc = b.customer.householdLocations[0];
        return {
          visitOrder: index + 1,
          customerName: b.customer.fullName,
          phone: b.customer.phone,
          tower: primaryLoc?.building || 'Tower A',
          flat: primaryLoc?.flatNumber || 'Flat 101',
          society: primaryLoc?.society?.name || 'Prestige Shantiniketan',
          mealType: b.mealType,
          diet: b.requirements?.diet || 'Vegetarian',
          spiceLevel: b.requirements?.spiceLevel || 'Medium',
          instructions: b.requirements?.specialInstructions || 'None',
          isGroupPool: !!b.groupRequestId,
        };
      });

      return {
        day,
        totalSlots: daySlots.length,
        slots: daySlots,
        scheduledVisits: sequentialVisits,
        totalHouseholdsVisiting: sequentialVisits.length,
      };
    });

    return {
      cookProfileId: cook.id,
      capacity: {
        maxHouseholds: cook.maxHouseholds,
        currentlyBooked: cook.bookings.length,
        openSlots: Math.max(0, cook.maxHouseholds - cook.bookings.length),
      },
      weeklyCalendar,
      assignedGroups: cook.assignedGroups,
    };
  }
}

