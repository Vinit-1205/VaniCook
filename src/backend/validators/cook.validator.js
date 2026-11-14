import { z } from 'zod';

export const updateCookProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  specialities: z.array(z.string()).optional(),
  cuisines: z.array(z.string()).optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  maxHouseholds: z.number().int().min(1).max(20).optional(),
  serviceRadiusKm: z.number().min(0.5).max(50).optional(),
  basePriceMonthly: z.number().min(500).max(50000).optional(),
  societyIds: z.array(z.string()).optional(),
});

export const cookFilterSchema = z.object({
  societyId: z.string().optional(),
  cuisine: z.string().optional(),
  diet: z.string().optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'ALL_MEALS']).optional(),
  minRating: z.string().optional(),
  maxPrice: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

