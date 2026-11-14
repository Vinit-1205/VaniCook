export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatMealType = (mealType) => {
  switch (mealType) {
    case 'BREAKFAST':
      return 'Breakfast';
    case 'LUNCH':
      return 'Lunch';
    case 'DINNER':
      return 'Dinner';
    case 'ALL_MEALS':
      return 'All Meals';
    default:
      return mealType;
  }
};

