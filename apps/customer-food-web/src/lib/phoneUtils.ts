/**
 * Utility functions for Indian phone number sanitization and validation
 */
export const sanitizeIndianPhoneNumber = (input: string): string => {
  if (!input) return "";
  let digits = input.replace(/\D/g, "");

  // If mobile autofill or paste includes 91 country code for a number (e.g. +91 8059075260 -> 918059075260)
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  }

  // Strip leading zeroes (smart app: prevents typing 0 as first digit, prevents 08059075260 losing last digit)
  digits = digits.replace(/^0+/, "");

  // If user entered 091... or +91 080...
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
    digits = digits.replace(/^0+/, "");
  }

  return digits.slice(0, 10);
};
