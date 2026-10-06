import { describe, it, expect } from "vitest";

describe("Checkout Financial & Business Rule Validations", () => {
  const calculateFinancials = (subtotal: number, orderMode: "dine-in" | "takeaway" | "delivery") => {
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const deliveryFee = orderMode === "delivery" ? (subtotal >= 499 ? 0 : 40) : 0;
    const grandTotal = Math.max(0, subtotal + tax + deliveryFee);
    return { tax, deliveryFee, grandTotal };
  };

  it("should calculate 5% tax correctly for dine-in", () => {
    const result = calculateFinancials(200, "dine-in");
    expect(result.tax).toBe(10);
    expect(result.deliveryFee).toBe(0);
    expect(result.grandTotal).toBe(210);
  });

  it("should charge delivery fee of 40 when order is below 499 for delivery", () => {
    const result = calculateFinancials(300, "delivery");
    expect(result.tax).toBe(15);
    expect(result.deliveryFee).toBe(40);
    expect(result.grandTotal).toBe(355);
  });

  it("should provide free delivery when subtotal exceeds 499", () => {
    const result = calculateFinancials(500, "delivery");
    expect(result.tax).toBe(25);
    expect(result.deliveryFee).toBe(0);
    expect(result.grandTotal).toBe(525);
  });

  it("should not charge delivery fee on takeaway orders", () => {
    const result = calculateFinancials(100, "takeaway");
    expect(result.tax).toBe(5);
    expect(result.deliveryFee).toBe(0);
    expect(result.grandTotal).toBe(105);
  });
});
