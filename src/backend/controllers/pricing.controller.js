import { PricingService } from '../services/pricing.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class PricingController {
  static calculatePrice(req, res, next) {
    try {
      const params = { ...req.query, ...req.body };
      const {
        totalHouseholds,
        baseRate,
        peoplePerHousehold,
        mealsPerDay,
        daysPerWeek,
        dietaryType,
      } = params;

      const result = PricingService.calculatePoolPrice({
        totalHouseholds: totalHouseholds ? parseInt(totalHouseholds, 10) : 2,
        baseRate: baseRate ? parseFloat(baseRate) : 3500,
        peoplePerHousehold: peoplePerHousehold ? parseInt(peoplePerHousehold, 10) : 3,
        mealsPerDay: mealsPerDay ? parseInt(mealsPerDay, 10) : 1,
        daysPerWeek: daysPerWeek ? parseInt(daysPerWeek, 10) : 6,
        dietaryType: dietaryType || 'Pure Vegetarian',
      });

      return ApiResponse.success(res, 'Price estimate calculated', result);
    } catch (error) {
      next(error);
    }
  }
}
