import { ApiResponse } from '../utils/apiResponse.js';
import { ENV } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return ApiResponse.error(
      res,
      `A record with this ${fields} already exists.`,
      409
    );
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return ApiResponse.error(res, 'Requested resource not found.', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';

  const errorDetails =
    ENV.NODE_ENV === 'development'
      ? { message: err.message, stack: err.stack }
      : undefined;

  return ApiResponse.error(res, message, statusCode, errorDetails);
};

