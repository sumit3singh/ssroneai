/**
 * PG Management Form Validators
 */

export const validateResidentForm = (name: string, phone: string) => {
  const errors: string[] = [];
  if (!name.trim()) errors.push("Full name is required.");
  if (!phone.trim() || phone.length < 10) errors.push("Valid 10-digit mobile number is required.");
  return { isValid: errors.length === 0, errors };
};

export const validateRoomForm = (roomNumber: string, rent: number) => {
  const errors: string[] = [];
  if (!roomNumber.trim()) errors.push("Room number is required.");
  if (!rent || rent <= 0) errors.push("Monthly rent must be greater than 0.");
  return { isValid: errors.length === 0, errors };
};
