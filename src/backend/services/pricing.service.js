// CookConnect Phase 2 Smart Dynamic Cost Calculator
// Implements configurable, deterministic multi-household pooling economics

export class PricingService {
  /**
   * Discount ratio per household based on total participating families
   */
  static POOL_DISCOUNT_RATIOS = {
    1: { ratioPerHousehold: 1.0, cookMultiplier: 1.0 },
    2: { ratioPerHousehold: 0.58, cookMultiplier: 1.16 }, // Cook gets +16%, each home saves 42%
    3: { ratioPerHousehold: 0.44, cookMultiplier: 1.32 }, // Cook gets +32%, each home saves 56%
    4: { ratioPerHousehold: 0.36, cookMultiplier: 1.44 }, // Cook gets +44%, each home saves 64%
    5: { ratioPerHousehold: 0.31, cookMultiplier: 1.55 }, // Cook gets +55%, each home saves 69%
  };

  /**
   * Calculate shared pool pricing and workload breakdown
   */
  static calculatePoolPrice({
    totalHouseholds = 2,
    baseRate = 3500,
    peoplePerHousehold = 3,
    mealsPerDay = 1,
    daysPerWeek = 6,
    dietaryType = 'Pure Vegetarian',
  }) {
    const households = Math.min(Math.max(1, parseInt(totalHouseholds, 10)), 5);
    const validBaseRate = Math.max(1000, parseFloat(baseRate) || 3500);

    const config = this.POOL_DISCOUNT_RATIOS[households] || {
      ratioPerHousehold: 0.30,
      cookMultiplier: 1.55,
    };

    // Calculate household monthly rate
    let pricePerHousehold = Math.round(validBaseRate * config.ratioPerHousehold);

    // Minor adjustment if large family (e.g. > 4 members)
    if (peoplePerHousehold > 4) {
      pricePerHousehold = Math.round(pricePerHousehold * 1.15);
    }

    // Total earnings for the cook for this visiting slot
    const totalCookEarnings = Math.round(pricePerHousehold * households);

    // Solo reference cost (what one family would have paid alone)
    const soloMonthlyCost = validBaseRate;
    const monthlySavings = Math.max(0, soloMonthlyCost - pricePerHousehold);
    const savingsPercent = Math.round((monthlySavings / soloMonthlyCost) * 100);

    // Workload computation
    // First household takes ~45 mins; each sequential neighbour in same tower takes +25 mins
    const basePrepMinutes = 45;
    const incrementalMinutesPerHouse = 25;
    const dailyCookingMinutes = basePrepMinutes + (households - 1) * incrementalMinutesPerHouse;
    const totalDaysPerMonth = daysPerWeek * 4.28; // ~26 days
    const totalMonthlyMeals = Math.round(totalDaysPerMonth * mealsPerDay);
    const costPerMeal = Math.round(pricePerHousehold / (totalMonthlyMeals || 1));
    const costPerMealPerPerson = Math.max(15, Math.round(costPerMeal / (peoplePerHousehold || 3)));

    return {
      totalHouseholds: households,
      pricePerHousehold,
      soloMonthlyCost,
      monthlySavings,
      savingsPercent,
      savings: {
        percentSaved: savingsPercent,
        monthlySavingsPerHousehold: monthlySavings,
      },
      totalCookEarnings,
      costPerMeal,
      costPerMealPerPerson,
      workload: {
        dailyCookingMinutes,
        sequentialTowerTransitMinutes: (households - 1) * 5, // 5 mins between elevator/flats vs 45 mins road travel
        totalDailyMinutes: dailyCookingMinutes + (households - 1) * 5,
        estimatedHoursPerDay: (dailyCookingMinutes / 60).toFixed(1),
      },
      explanation:
        households === 1
          ? 'Solo household rate. Full dedicated service visiting only your home.'
          : `${households} families in your tower share one visiting cook. Each family saves ${savingsPercent}% (paying ₹${pricePerHousehold.toLocaleString('en-IN')}/mo), while the cook earns +${Math.round((config.cookMultiplier - 1) * 100)}% higher monthly income without road transit.`,
      disclaimer: 'Preliminary dynamic estimate. Confirmed when cook reviews and accepts the group schedule.',
    };
  }
}
