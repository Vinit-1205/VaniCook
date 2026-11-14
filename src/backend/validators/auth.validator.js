import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['CUSTOMER', 'COOK', 'ADMIN']).default('CUSTOMER'),
  phone: z.string().optional(),
  societyId: z.string().optional(), // For auto-linking household/cook on signup
  flatNumber: z.string().optional(),
  building: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

