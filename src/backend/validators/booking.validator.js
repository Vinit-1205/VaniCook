import { z } from 'zod';

export const createBookingSchema = z.object({
  cookProfileId: z.string().min(1, 'Cook profile is required'),
  societyId: z.string().optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'ALL_MEALS']).default('ALL_MEALS'),
  startDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  isSharedPool: z.boolean().default(false),
  diet: z.string().default('Vegetarian'),
  spiceLevel: z.string().default('Medium'),
  familySize: z.number().int().min(1).max(20).default(2),
  specialInstructions: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
});

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

