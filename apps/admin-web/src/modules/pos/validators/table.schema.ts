export const validateTable = (tableNumber: string, capacity: number): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!tableNumber || !tableNumber.trim()) {
    errors.push("Table number is mandatory");
  }

  if (capacity <= 0) {
    errors.push("Seating capacity must be at least 1");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
