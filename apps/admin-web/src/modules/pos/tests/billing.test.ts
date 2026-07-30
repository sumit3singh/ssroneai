import { billingService } from "../services/billing.service";

export const runBillingTests = (): boolean => {
  const mockItems: any[] = [
    { unit_price: 200, quantity: 2 }, // 400
    { unit_price: 100, quantity: 1 }  // 100
  ];

  const subtotal = billingService.calculateSubtotal(mockItems);
  if (subtotal !== 500) throw new Error(`Subtotal test failed: expected 500 got ${subtotal}`);

  const gst = billingService.calculateGST(subtotal, 0.05);
  if (gst !== 25) throw new Error(`GST test failed: expected 25 got ${gst}`);

  const net = billingService.calculateNetTotal(subtotal, gst, 50);
  if (net !== 475) throw new Error(`Net total test failed: expected 475 got ${net}`);

  return true;
};
