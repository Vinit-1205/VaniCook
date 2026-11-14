import { z } from 'zod';

export const createGroupSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'ALL_MEALS']).default('LUNCH'),
  preferredSchedule: z.string().default('11:30 AM - 01:30 PM'),
  daysOfWeek: z.array(z.string()).default(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  dietaryPreference: z.string().default('Pure Vegetarian'),
  targetHouseholds: z.number().int().min(2).max(5).default(3),
  maxCapacity: z.number().int().min(2).max(5).default(4),
  householdSize: z.number().int().min(1).max(10).default(3),
  flatNumber: z.string().optional(),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  assignedCookId: z.string().optional(),
});

export const joinGroupSchema = z.object({
  householdSize: z.number().int().min(1).max(10).default(2),
  flatNumber: z.string().optional(),
});

export const assignCookSchema = z.object({
  cookProfileId: z.string().min(1, 'Cook profile ID is required'),
});

export const respondCookGroupSchema = z.object({
  decision: z.enum(['ACCEPT', 'REJECT']),
});

