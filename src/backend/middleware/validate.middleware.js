import { ApiResponse } from '../utils/apiResponse.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return ApiResponse.error(res, 'Validation failed', 400, issues);
      }
      return ApiResponse.error(res, error.message || 'Validation error', 400);
    }
  };
};

