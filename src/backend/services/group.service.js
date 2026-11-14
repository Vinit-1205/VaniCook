import prisma from '../config/database.js';
import { PricingService } from './pricing.service.js';
import { SchedulingService } from './scheduling.service.js';
import { emitToSociety, emitToGroup } from '../sockets/index.js';
import { NotificationService } from './notification.service.js';

export class GroupService {
  /**
   * Create a new neighbourhood group cooking request
   */
  static async createGroupRequest(creatorId, data) {
    const {
      societyId,
      mealType = 'LUNCH',
      preferredSchedule = '11:30 AM - 01:30 PM',
      daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      dietaryPreference = 'Pure Vegetarian',
      targetHouseholds = 3,
      maxCapacity = 4,
      householdSize = 3,
      flatNumber,
      title,
      description,
      assignedCookId,
    } = data;

    // Fetch user primary flat if not passed
    let flat = flatNumber;
    if (!flat) {
      const userLoc = await prisma.householdLocation.findFirst({
        where: { userId: creatorId, isPrimary: true },
      });
      flat = userLoc?.flatNumber || '101';
    }

    // Initial pricing estimate for 1 household joining
    const initialPricing = PricingService.calculatePoolPrice({
      totalHouseholds: 1,
      baseRate: 3500,
      dietaryType: dietaryPreference,
    });

    const group = await prisma.groupRequest.create({
      data: {
        societyId,
        creatorId,
        assignedCookId: assignedCookId || null,
        mealType,
        preferredSchedule,
        daysOfWeek,
        dietaryPreference,
        targetHouseholds: Number(targetHouseholds),
        currentHouseholds: 1,
        maxCapacity: Number(maxCapacity),
        status: assignedCookId ? 'COOK_PENDING' : 'OPEN',
        estimatedPricePerHousehold: initialPricing.pricePerHousehold,
        totalWorkloadMinutes: initialPricing.workload.dailyCookingMinutes,
        title: title || `${preferredSchedule.split(' ')[0]} ${mealType} Pool`,
        description: description || `Neighbourhood group sharing a dedicated home cook.`,
        members: {
          create: {
            userId: creatorId,
            householdSize: Number(householdSize),
            flatNumber: flat,
            sharePercentage: 100.0,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        society: true,
        creator: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        assignedCook: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
          },
        },
        members: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    // Notify residential society room via Socket.IO
    emitToSociety(societyId, 'group:created', {
      groupId: group.id,
      title: group.title,
      mealType: group.mealType,
      societyName: group.society.name,
    });

    return group;
  }

  /**
   * List open and active groups in a residential society (with privacy protection)
   */
  static async listGroups(societyId, currentUserId) {
    const groups = await prisma.groupRequest.findMany({
      where: societyId ? { societyId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        society: true,
        creator: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        assignedCook: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
        members: {
          select: {
            id: true,
            userId: true,
            householdSize: true,
            status: true,
            joinedAt: true,
            // Flat number omitted for non-creator privacy
          },
        },
      },
    });

    // Enhance each group with dynamic pricing and participation status
    return groups.map((g) => {
      const isMember = g.members.some((m) => m.userId === currentUserId);
      const isCreator = g.creatorId === currentUserId;

      const baseRate = g.assignedCook?.basePriceMonthly || 3500;
      const currentPricing = PricingService.calculatePoolPrice({
        totalHouseholds: g.currentHouseholds,
        baseRate,
        dietaryType: g.dietaryPreference,
      });

      const nextMemberPricing = PricingService.calculatePoolPrice({
        totalHouseholds: Math.min(g.maxCapacity, g.currentHouseholds + 1),
        baseRate,
        dietaryType: g.dietaryPreference,
      });

      return {
        ...g,
        isMember,
        isCreator,
        currentPricing,
        nextMemberPricing,
        openSlots: Math.max(0, g.maxCapacity - g.currentHouseholds),
        isFull: g.currentHouseholds >= g.maxCapacity,
      };
    });
  }

  /**
   * Join an available group
   */
  static async joinGroup(groupId, userId, data = {}) {
    const { householdSize = 2, flatNumber } = data;

    const group = await prisma.groupRequest.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        assignedCook: true,
      },
    });

    if (!group) throw new Error('Group request not found');
    if (group.status !== 'OPEN' && group.status !== 'MATCHING') {
      throw new Error(`Cannot join group in ${group.status} status.`);
    }

    if (group.currentHouseholds >= group.maxCapacity) {
      throw new Error('This neighbourhood pool is already at maximum capacity.');
    }

    const alreadyMember = group.members.some((m) => m.userId === userId);
    if (alreadyMember) {
      throw new Error('You have already joined this neighbourhood pool.');
    }

    let flat = flatNumber;
    if (!flat) {
      const userLoc = await prisma.householdLocation.findFirst({
        where: { userId, isPrimary: true },
      });
      flat = userLoc?.flatNumber || 'Flat 202';
    }

    const newHouseholdCount = group.currentHouseholds + 1;
    const baseRate = group.assignedCook?.basePriceMonthly || 3500;

    // Recalculate dynamic pricing for the new total
    const updatedPricing = PricingService.calculatePoolPrice({
      totalHouseholds: newHouseholdCount,
      baseRate,
      dietaryType: group.dietaryPreference,
    });

    const sharePercentage = Math.round((100 / newHouseholdCount) * 100) / 100;

    // Transaction-safe join
    const updatedGroup = await prisma.$transaction(async (tx) => {
      // Add member
      await tx.groupMember.create({
        data: {
          groupRequestId: groupId,
          userId,
          householdSize: Number(householdSize),
          flatNumber: flat,
          sharePercentage,
          status: 'ACTIVE',
        },
      });

      // Update share percentage of all existing members
      await tx.groupMember.updateMany({
        where: { groupRequestId: groupId },
        data: { sharePercentage },
      });

      // Update group record
      const nextStatus =
        newHouseholdCount >= group.targetHouseholds
          ? group.assignedCookId
            ? 'COOK_PENDING'
            : 'MATCHING'
          : 'OPEN';

      return tx.groupRequest.update({
        where: { id: groupId },
        data: {
          currentHouseholds: newHouseholdCount,
          estimatedPricePerHousehold: updatedPricing.pricePerHousehold,
          totalWorkloadMinutes: updatedPricing.workload.dailyCookingMinutes,
          status: nextStatus,
        },
        include: {
          members: true,
          assignedCook: true,
        },
      });
    });

    // Real-time broadcast
    emitToGroup(groupId, 'group:member_joined', {
      groupId,
      currentHouseholds: newHouseholdCount,
      updatedPricing,
    });

    // Notify creator of new member joining
    if (group.creatorId !== userId) {
      await NotificationService.createNotification(
        group.creatorId,
        'New Neighbour Joined Your Pool!',
        `A new household joined "${group.title}". Cost dropped to ₹${updatedPricing.pricePerHousehold}/family!`,
        'POOL',
        '/customer/pools'
      );
    }

    return {
      group: updatedGroup,
      updatedPricing,
    };
  }

  /**
   * Leave a group
   */
  static async leaveGroup(groupId, userId) {
    const group = await prisma.groupRequest.findUnique({
      where: { id: groupId },
      include: { members: true, assignedCook: true },
    });

    if (!group) throw new Error('Group not found');

    const member = group.members.find((m) => m.userId === userId);
    if (!member) throw new Error('You are not a member of this group');

    if (group.status === 'ACTIVE') {
      throw new Error('Cannot leave an actively running cooking group. Please contact support.');
    }

    const newHouseholdCount = group.currentHouseholds - 1;

    if (newHouseholdCount <= 0) {
      // Delete group if last member leaves
      await prisma.groupRequest.delete({ where: { id: groupId } });
      emitToGroup(groupId, 'group:cancelled', { groupId });
      return { message: 'Group removed as all members left.' };
    }

    const baseRate = group.assignedCook?.basePriceMonthly || 3500;
    const updatedPricing = PricingService.calculatePoolPrice({
      totalHouseholds: newHouseholdCount,
      baseRate,
      dietaryType: group.dietaryPreference,
    });

    const sharePercentage = Math.round((100 / newHouseholdCount) * 100) / 100;

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.delete({
        where: {
          groupRequestId_userId: {
            groupRequestId: groupId,
            userId,
          },
        },
      });

      await tx.groupMember.updateMany({
        where: { groupRequestId: groupId },
        data: { sharePercentage },
      });

      await tx.groupRequest.update({
        where: { id: groupId },
        data: {
          currentHouseholds: newHouseholdCount,
          estimatedPricePerHousehold: updatedPricing.pricePerHousehold,
          status: 'OPEN',
        },
      });
    });

    emitToGroup(groupId, 'group:member_left', {
      groupId,
      currentHouseholds: newHouseholdCount,
      updatedPricing,
    });

    return { message: 'Successfully left group.', updatedPricing };
  }

  /**
   * Assign or propose a cook for the group
   */
  static async assignCook(groupId, cookProfileId, requesterId) {
    const group = await prisma.groupRequest.findUnique({
      where: { id: groupId },
    });

    if (!group) throw new Error('Group not found');
    if (group.creatorId !== requesterId) {
      throw new Error('Only the group creator may select a cook partner.');
    }

    const cook = await prisma.cookProfile.findUnique({
      where: { id: cookProfileId },
    });
    if (!cook) throw new Error('Cook profile not found');

    const updatedPricing = PricingService.calculatePoolPrice({
      totalHouseholds: group.currentHouseholds,
      baseRate: cook.basePriceMonthly,
      dietaryType: group.dietaryPreference,
    });

    const updatedGroup = await prisma.groupRequest.update({
      where: { id: groupId },
      data: {
        assignedCookId: cookProfileId,
        status: 'COOK_PENDING',
        estimatedPricePerHousehold: updatedPricing.pricePerHousehold,
      },
      include: {
        assignedCook: {
          include: {
            user: { select: { fullName: true, phone: true } },
          },
        },
        members: true,
      },
    });

    emitToGroup(groupId, 'group:cook_assigned', {
      groupId,
      cookName: updatedGroup.assignedCook?.user?.fullName,
      status: 'COOK_PENDING',
    });

    if (cook.userId) {
      await NotificationService.createNotification(
        cook.userId,
        'New Pool Invitation Received',
        `You have been invited to cook for "${group.title}". Review schedule and earnings in your Cook Hub.`,
        'POOL',
        '/cook/dashboard'
      );
    }

    return updatedGroup;
  }

  /**
   * Cook responds to incoming group request (Accept or Reject)
   */
  static async respondToGroupRequest(cookUserId, groupId, decision) {
    const cook = await prisma.cookProfile.findUnique({
      where: { userId: cookUserId },
    });

    if (!cook) throw new Error('Cook profile not found');

    const group = await prisma.groupRequest.findUnique({
      where: { id: groupId },
      include: { members: { include: { user: true } }, society: true },
    });

    if (!group) throw new Error('Group not found');
    if (group.assignedCookId !== cook.id) {
      throw new Error('Unauthorized: This group is assigned to another cook partner.');
    }

    if (decision === 'REJECT') {
      const updated = await prisma.groupRequest.update({
        where: { id: groupId },
        data: {
          assignedCookId: null,
          status: 'MATCHING',
        },
      });

      emitToGroup(groupId, 'group:cook_rejected', { groupId });

      await NotificationService.createNotification(
        group.creatorId,
        'Cook Partner Declined Request',
        `The invited cook was unable to take your pool request for "${group.title}". You can explore other matching cooks.`,
        'POOL',
        '/customer/pools'
      );

      return { message: 'Group request declined.', group: updated };
    }

    // DECISION === 'ACCEPT':
    // 1. Transaction-safe Capacity and Schedule Validation
    await SchedulingService.validateCookCapacityAndSchedule(
      cook.id,
      group.mealType,
      group.currentHouseholds
    );

    const poolPricing = PricingService.calculatePoolPrice({
      totalHouseholds: group.currentHouseholds,
      baseRate: cook.basePriceMonthly,
      dietaryType: group.dietaryPreference,
    });

    // 2. Transaction-safe Booking Confirmation across all group members
    const confirmedGroup = await prisma.$transaction(async (tx) => {
      // Create confirmed Booking records for each family in the pool
      for (const member of group.members) {
        await tx.booking.create({
          data: {
            customerId: member.userId,
            cookProfileId: cook.id,
            societyId: group.societyId,
            groupRequestId: group.id,
            mealType: group.mealType,
            status: 'ACTIVE',
            startDate: new Date(),
            monthlyRate: poolPricing.pricePerHousehold,
            sharedRatio: PricingService.POOL_DISCOUNT_RATIOS[group.currentHouseholds]?.ratioPerHousehold || 0.44,
            notes: `Neighbourhood Pool: ${group.title}`,
            requirements: {
              create: {
                diet: group.dietaryPreference,
                spiceLevel: 'Medium',
                familySize: member.householdSize,
                specialInstructions: `Tower flat: ${member.flatNumber}`,
              },
            },
          },
        });
      }

      // Mark slot as booked
      await tx.cookAvailability.updateMany({
        where: {
          cookProfileId: cook.id,
          mealType: group.mealType,
          isBooked: false,
        },
        data: { isBooked: true },
      });

      // Update Group Status to CONFIRMED
      return tx.groupRequest.update({
        where: { id: groupId },
        data: {
          status: 'CONFIRMED',
          estimatedPricePerHousehold: poolPricing.pricePerHousehold,
        },
        include: {
          members: true,
          bookings: true,
        },
      });
    });

    emitToGroup(groupId, 'group:confirmed', {
      groupId,
      status: 'CONFIRMED',
      poolPricing,
    });

    // Notify all members of confirmed pool
    for (const member of group.members) {
      await NotificationService.createNotification(
        member.userId,
        'Neighbourhood Pool Confirmed! 🎉',
        `Cook partner accepted "${group.title}". Your monthly kitchen subscription is now confirmed!`,
        'BOOKING',
        '/customer/bookings'
      );
    }

    return {
      message: 'Group booking confirmed successfully! Subscriptions created.',
      group: confirmedGroup,
      poolPricing,
    };
  }
}

