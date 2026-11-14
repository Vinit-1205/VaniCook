import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { CookModel } from '../models/cook.model.js';
import { LocationModel } from '../models/location.model.js';

export class AuthService {
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );
  }

  static async register(data) {
    const { email, password, fullName, role, phone, societyId, flatNumber, building } = data;

    // Check if email already taken
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserModel.create({
      email,
      passwordHash,
      fullName,
      role: role || 'CUSTOMER',
      phone: phone || null,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(fullName)}`,
    });

    // If role is COOK, initialize empty CookProfile
    if (user.role === 'COOK') {
      await CookModel.create({
        userId: user.id,
        bio: 'Professional home cook passionate about healthy and delicious food.',
        experienceYears: 2,
        specialities: ['Daily Balanced Meals', 'Roti & Sabzi'],
        cuisines: ['North Indian', 'South Indian'],
        dietaryPreferences: ['Pure Vegetarian', 'Non-Vegetarian'],
        maxHouseholds: 4,
        serviceRadiusKm: 3.0,
        basePriceMonthly: 3500,
        societyIds: societyId ? [societyId] : [],
      });
    }

    // If customer provided a societyId, link household location
    if (user.role === 'CUSTOMER' && societyId) {
      await LocationModel.createHouseholdLocation({
        userId: user.id,
        societyId,
        building: building || 'Tower A',
        flatNumber: flatNumber || '101',
        isPrimary: true,
      });
    }

    // Fetch full user with relations
    const fullUser = await UserModel.findById(user.id);
    const token = this.generateToken(fullUser);

    return {
      user: this.sanitizeUser(fullUser),
      token,
    };
  }

  static async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (user.isActive === false) {
      const error = new Error('Your account has been suspended by system administration. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const fullUser = await UserModel.findById(user.id);
    const token = this.generateToken(fullUser);

    return {
      user: this.sanitizeUser(fullUser),
      token,
    };
  }

  static async getCurrentUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return this.sanitizeUser(user);
  }

  static sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

