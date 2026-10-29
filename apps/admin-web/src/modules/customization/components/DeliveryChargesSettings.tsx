import React from "react";
import { Truck, Receipt, Check } from "lucide-react";
import { Label, Input } from "@ssrone/ui";

export interface DeliveryChargesSettingsProps {
  charges: {
    enablePackingCharge?: boolean;
    packingChargeAmount?: number;
    enableDeliveryCharge?: boolean;
    deliveryChargeAmount?: number;
  };
  deliverySettings: {
    minOrderValue?: number;
  };
  onChargesChange: (field: string, value: any) => void;
  onDeliverySettingsChange: (field: string, value: any) => void;
}

export const DeliveryChargesSettings: React.FC<DeliveryChargesSettingsProps> = ({
  charges,
  deliverySettings,
  onChargesChange,
  onDeliverySettingsChange,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Minimum Order Value */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Truck size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Delivery Order Threshold</h4>
            <p className="text-xs text-muted-foreground">
              Define order value requirements for home and campus deliveries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold">Minimum Delivery Order Value (₹)</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-2 text-xs text-muted-foreground font-bold">₹</span>
              <Input
                type="number"
                min="0"
                step="10"
                value={deliverySettings.minOrderValue ?? 200}
                onChange={(e) =>
                  onDeliverySettingsChange("minOrderValue", parseFloat(e.target.value) || 0)
                }
                className="pl-7 text-xs font-mono h-9"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Customers cannot place delivery orders below this cart subtotal.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Packaging & Delivery Surcharges */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Receipt size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Packaging & Delivery Fees</h4>
            <p className="text-xs text-muted-foreground">
              Configure container packaging charges and standard delivery fees.
            </p>
          </div>
        </div>

        {/* Packaging Fee Row */}
        <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-foreground">Packaging Fee (Containers & Bags)</p>
              <p className="text-[10px] text-muted-foreground">
                Automatically added to takeaway and delivery orders. (₹0 on dine-in).
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onChargesChange(
                  "enablePackingCharge",
                  charges.enablePackingCharge === false ? true : false
                )
              }
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                charges.enablePackingCharge
                  ? "bg-amber-500/10 text-amber-700 border border-amber-500/30"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  charges.enablePackingCharge ? "bg-amber-500" : "bg-muted-foreground/50"
                }`}
              />
              <span>{charges.enablePackingCharge ? "Packaging Active" : "Disabled (₹0)"}</span>
            </button>
          </div>

          {charges.enablePackingCharge && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div>
                <Label className="text-xs font-semibold">Standard Packaging Charge (₹)</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-2 text-xs text-muted-foreground font-bold">₹</span>
                  <Input
                    type="number"
                    min="0"
                    step="5"
                    value={charges.packingChargeAmount ?? 10}
                    onChange={(e) =>
                      onChargesChange("packingChargeAmount", parseFloat(e.target.value) || 0)
                    }
                    className="pl-7 text-xs font-mono h-9"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Fee Row */}
        <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-foreground">Delivery Rates & Slabs</p>
              <p className="text-[10px] text-muted-foreground">
                Tiered delivery fee: ₹0 to ₹220 = ₹50, ₹220 to ₹300 = ₹30, above ₹300 = Free (₹0).
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onChargesChange(
                  "enableDeliveryCharge",
                  charges.enableDeliveryCharge === false ? true : false
                )
              }
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                charges.enableDeliveryCharge
                  ? "bg-indigo-500/10 text-indigo-700 border border-indigo-500/30"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  charges.enableDeliveryCharge ? "bg-indigo-500" : "bg-muted-foreground/50"
                }`}
              />
              <span>{charges.enableDeliveryCharge ? "Delivery Fee Active" : "Free Delivery (₹0)"}</span>
            </button>
          </div>

          {charges.enableDeliveryCharge && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div>
                <Label className="text-xs font-semibold">Delivery Fee Amount (₹)</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-2 text-xs text-muted-foreground font-bold">₹</span>
                  <Input
                    type="number"
                    min="0"
                    step="5"
                    value={charges.deliveryChargeAmount ?? 30}
                    onChange={(e) =>
                      onChargesChange("deliveryChargeAmount", parseFloat(e.target.value) || 0)
                    }
                    className="pl-7 text-xs font-mono h-9"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryChargesSettings;
