import { z } from 'zod';

export const createSocietySchema = z.object({
  name: z.string().min(2, 'Society name is required'),
  locality: z.string().min(2, 'Locality is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().default('Karnataka'),
  postalCode: z.string().min(4, 'Postal code is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createHouseholdLocationSchema = z.object({
  societyId: z.string().min(1, 'Society ID is required'),
  building: z.string().optional(),
  flatNumber: z.string().optional(),
  landmark: z.string().optional(),
  isPrimary: z.boolean().default(true),
});

