import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.cookconnect_token) {
      // Check HTTP-only cookie
      token = req.cookies.cookconnect_token;
    }

    if (!token) {
      return ApiResponse.error(
        res,
        'Authentication required. Please log in.',
        401
      );
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user || !user.isActive) {
      return ApiResponse.error(res, 'User session invalid or deactivated.', 401);
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      cookProfileId: user.cookProfile?.id || null,
      primarySocietyId: user.householdLocations?.find((l) => l.isPrimary)?.societyId || null,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Session expired. Please log in again.', 401);
    }
    return ApiResponse.error(res, 'Invalid token. Please authenticate.', 401);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Requires one of: ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
};

