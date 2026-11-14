import { z } from 'zod';

export const createAvailabilitySchema = z.object({
  dayOfWeek: z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'ALL_MEALS']),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  maxSlots: z.number().int().min(1).max(10).default(3),
});

export const updateAvailabilitySchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isBooked: z.boolean().optional(),
  maxSlots: z.number().int().min(1).max(10).optional(),
  bookedSlots: z.number().int().min(0).optional(),
});

