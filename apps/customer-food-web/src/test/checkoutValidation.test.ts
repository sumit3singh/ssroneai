import { describe, it, expect } from "vitest";

describe("Checkout Financial & Business Rule Validations", () => {
  const calculateFinancials = (subtotal: number, orderMode: "dine-in" | "takeaway" | "delivery") => {
    const tax = Math.round(subtotal * 0.05); // 5% GST
    // Tiered Delivery Fee (Delivery Only):
    // ₹0 - ₹220: ₹50
    // ₹220 - ₹300: ₹30
    // Above ₹300: FREE (₹0)
    const deliveryFee = orderMode === "delivery"
      ? (subtotal > 300 ? 0 : subtotal > 220 ? 30 : (subtotal > 0 ? 50 : 0))
      : 0;
    const grandTotal = Math.max(0, subtotal + tax + deliveryFee);
    return { tax, deliveryFee, grandTotal };
  };

  it("should calculate 5% tax correctly for dine-in and keep delivery fee at 0", () => {
    const result = calculateFinancials(200, "dine-in");
    expect(result.tax).toBe(10);
    expect(result.deliveryFee).toBe(0);
    expect(result.grandTotal).toBe(210);
  });

  it("should charge delivery fee of ₹50 when order is between 0 and 220 for delivery", () => {
    const result = calculateFinancials(150, "delivery");
    expect(result.tax).toBe(8);
    expect(result.deliveryFee).toBe(50);
    expect(result.grandTotal).toBe(208);
  });

  it("should charge delivery fee of ₹30 when order is between 220 and 300 for delivery", () => {
    const result = calculateFinancials(250, "delivery");
    expect(result.tax).toBe(13);
    expect(result.deliveryFee).toBe(30);
    expect(result.grandTotal).toBe(293);
  });

  it("should provide free delivery when subtotal exceeds 300", () => {
    const result = calculateFinancials(350, "delivery");
    expect(result.tax).toBe(18);
    expect(result.deliveryFee).toBe(0);
    expect(result.grandTotal).toBe(368);
  });

  it("should not charge delivery fee on takeaway orders", () => {
    const result = calculateFinancials(100, "takeaway");
    expect(result.tax).toBe(5);
    expect(result.deliveryFee).toBe(0);
    expect(result.grandTotal).toBe(105);
  });
});
