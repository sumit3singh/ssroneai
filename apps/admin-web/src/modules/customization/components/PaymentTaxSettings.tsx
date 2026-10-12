import React from "react";
import { Percent, CreditCard, MessageSquare, Check } from "lucide-react";
import { Label, Input } from "@ssrone/ui";

export interface PaymentTaxSettingsProps {
  taxSettings: {
    applyGst?: boolean;
    gstRate?: number;
    pricesIncludeTax?: boolean;
  };
  paymentOptions: {
    enableRazorpay?: boolean;
    enablePayAtCounter?: boolean;
    enableCashOnDelivery?: boolean;
    enableUpiQr?: boolean;
  };
  orderConfirmationMessage?: string;
  onTaxChange: (field: string, value: any) => void;
  onPaymentChange: (field: string, value: any) => void;
  onMessageChange: (value: string) => void;
}

export const PaymentTaxSettings: React.FC<PaymentTaxSettingsProps> = ({
  taxSettings,
  paymentOptions,
  orderConfirmationMessage,
  onTaxChange,
  onPaymentChange,
  onMessageChange,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. GST & Tax Policy */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Percent size={16} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">GST & Tax Configuration</h4>
              <p className="text-xs text-muted-foreground">
                Set restaurant GST rates (standard 5% for food service) and billing calculation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onTaxChange("applyGst", !taxSettings.applyGst)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              taxSettings.applyGst
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                taxSettings.applyGst ? "bg-primary" : "bg-muted-foreground/50"
              }`}
            />
            <span>{taxSettings.applyGst ? "GST Enabled" : "Tax-Free (0% GST)"}</span>
          </button>
        </div>

        {taxSettings.applyGst ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
            <div>
              <Label className="text-xs font-semibold">Total GST Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="28"
                step="0.5"
                value={taxSettings.gstRate ?? 5.0}
                onChange={(e) => onTaxChange("gstRate", parseFloat(e.target.value) || 0)}
                className="mt-1.5 text-xs font-mono h-9"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Standard cafe rate is 5% (split equally as 2.5% CGST + 2.5% SGST on receipts).
              </p>
            </div>

            <div>
              <Label className="text-xs font-semibold">Tax Calculation Mode</Label>
              <select
                value={taxSettings.pricesIncludeTax ? "inclusive" : "exclusive"}
                onChange={(e) => onTaxChange("pricesIncludeTax", e.target.value === "inclusive")}
                className="w-full mt-1.5 h-9 rounded-md bg-background border border-border px-3 text-xs text-foreground focus:outline-none"
              >
                <option value="exclusive">Exclusive (Tax added on top at checkout)</option>
                <option value="inclusive">Inclusive (Menu prices already include tax)</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Exclusive is standard for cafes and restaurant bill receipts.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Tax calculation is turned off. Orders will have ₹0.00 CGST and SGST added to bills.
          </p>
        )}
      </div>

      {/* 2. Customer Checkout Payment Gateways */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CreditCard size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Customer Payment Options</h4>
            <p className="text-xs text-muted-foreground">
              Select which payment tenders are presented to customers on the food app checkout page.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Razorpay Online */}
          <div
            onClick={() =>
              onPaymentChange("enableRazorpay", !paymentOptions.enableRazorpay)
            }
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              paymentOptions.enableRazorpay
                ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                : "bg-muted/20 border-border text-muted-foreground"
            }`}
          >
            <div>
              <p className="font-bold text-xs text-foreground">Razorpay Online Gateway (UPI, Cards, NetBanking)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Instant digital payment verified online before order fulfillment.
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs ${
                paymentOptions.enableRazorpay ? "bg-primary" : "bg-muted-foreground/40"
              }`}
            >
              {paymentOptions.enableRazorpay && <Check size={13} strokeWidth={3} />}
            </div>
          </div>

          {/* Pay at Counter */}
          <div
            onClick={() =>
              onPaymentChange(
                "enablePayAtCounter",
                paymentOptions.enablePayAtCounter === false ? true : false
              )
            }
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              paymentOptions.enablePayAtCounter !== false
                ? "bg-emerald-500/5 border-emerald-500/40 ring-1 ring-emerald-500/20"
                : "bg-muted/20 border-border text-muted-foreground"
            }`}
          >
            <div>
              <p className="font-bold text-xs text-foreground">Pay at Billing Counter (Cash / Counter UPI)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Customer places order and settles cash or dynamic QR at the cashier counter.
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs ${
                paymentOptions.enablePayAtCounter !== false ? "bg-emerald-600" : "bg-muted-foreground/40"
              }`}
            >
              {paymentOptions.enablePayAtCounter !== false && <Check size={13} strokeWidth={3} />}
            </div>
          </div>

          {/* Cash on Delivery */}
          <div
            onClick={() =>
              onPaymentChange(
                "enableCashOnDelivery",
                paymentOptions.enableCashOnDelivery === false ? true : false
              )
            }
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              paymentOptions.enableCashOnDelivery !== false
                ? "bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20"
                : "bg-muted/20 border-border text-muted-foreground"
            }`}
          >
            <div>
              <p className="font-bold text-xs text-foreground">Cash on Delivery (Doorstep Delivery Only)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Pay delivery partner upon food arrival at doorstep.
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs ${
                paymentOptions.enableCashOnDelivery !== false ? "bg-amber-600" : "bg-muted-foreground/40"
              }`}
            >
              {paymentOptions.enableCashOnDelivery !== false && <Check size={13} strokeWidth={3} />}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Order Confirmation Screen Message */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <MessageSquare size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Order Confirmation Screen Message</h4>
            <p className="text-xs text-muted-foreground">
              Thank-you note displayed to customers on screen immediately after placing an order.
            </p>
          </div>
        </div>

        <div>
          <textarea
            value={
              orderConfirmationMessage ||
              "Thank you for dining with us! Your order has been placed directly with the kitchen."
            }
            onChange={(e) => onMessageChange(e.target.value)}
            rows={3}
            className="w-full p-3 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Thank you for dining with us at Baithak Cafe! Your food is being prepared with love."
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentTaxSettings;
