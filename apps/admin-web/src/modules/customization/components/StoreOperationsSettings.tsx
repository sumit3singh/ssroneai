import React from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Label, Input } from "@ssrone/ui";

export interface StoreOperationsSettingsProps {
  operatingHours: {
    enabled?: boolean;
    openTime?: string;
    closeTime?: string;
    isManuallyClosed?: boolean;
    closedMessage?: string;
  };
  features: {
    tableQrOrdering?: boolean;
    takeaway?: boolean;
    delivery?: boolean;
    onlinePayment?: boolean;
  };
  onlineApproval?: {
    requireApprovalForTakeawayAndDelivery?: boolean;
  };
  onOperatingHoursChange: (field: string, value: any) => void;
  onFeatureToggle: (featureKey: string, value: boolean) => void;
  onApprovalToggle: (value: boolean) => void;
}

export const StoreOperationsSettings: React.FC<StoreOperationsSettingsProps> = ({
  operatingHours,
  features,
  onlineApproval,
  onOperatingHoursChange,
  onFeatureToggle,
  onApprovalToggle,
}) => {
  const isClosed = Boolean(operatingHours?.isManuallyClosed);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Master Emergency Store Closure Switch */}
      <div
        className={`border rounded-xl p-4 sm:p-5 shadow-xs transition-colors ${
          isClosed
            ? "bg-rose-500/10 border-rose-300 dark:border-rose-900/50"
            : "bg-emerald-500/10 border-emerald-300 dark:border-emerald-900/50"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isClosed
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-emerald-600 text-white shadow-sm"
              }`}
            >
              {isClosed ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-foreground">
                  {isClosed ? "Store Temporarily Closed" : "Store Open & Accepting Orders"}
                </h4>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isClosed
                      ? "bg-rose-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {isClosed ? "Closed Today" : "Live Active"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isClosed
                  ? "Food app is currently showing a friendly closure banner and preventing checkouts."
                  : "Customers can actively view menu, customize dishes, and place live orders."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOperatingHoursChange("isManuallyClosed", !isClosed)}
            className={`px-4 py-2 rounded-lg font-bold text-xs shadow-xs transition cursor-pointer shrink-0 ${
              isClosed
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }`}
          >
            {isClosed ? "Reopen Store for Orders" : "Temporarily Close Store Today"}
          </button>
        </div>

        {isClosed && (
          <div className="mt-4 pt-3 border-t border-rose-200 dark:border-rose-900/50">
            <Label className="text-xs font-semibold text-foreground">
              Custom Closed Notice Message Shown to Customers
            </Label>
            <Input
              value={
                operatingHours?.closedMessage ||
                "We are currently closed for maintenance. We look forward to serving you soon!"
              }
              onChange={(e) => onOperatingHoursChange("closedMessage", e.target.value)}
              placeholder="e.g. Cafe closed today for festival celebrations. Back tomorrow at 10:30 AM!"
              className="mt-1.5 text-xs bg-background h-9 border-rose-300"
            />
          </div>
        )}
      </div>

      {/* 2. Standard Operating Hours */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Clock size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Standard Daily Service Hours</h4>
            <p className="text-xs text-muted-foreground">
              Customers ordering outside these hours will see an informative service notice.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold">Opening Time (24h format)</Label>
            <Input
              type="time"
              value={operatingHours?.openTime || "10:30"}
              onChange={(e) => onOperatingHoursChange("openTime", e.target.value)}
              className="mt-1.5 text-xs h-9 font-mono"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Closing Time (24h format)</Label>
            <Input
              type="time"
              value={operatingHours?.closeTime || "22:00"}
              onChange={(e) => onOperatingHoursChange("closeTime", e.target.value)}
              className="mt-1.5 text-xs h-9 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Ordering Channels Available */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="border-b border-border/60 pb-3">
          <h4 className="font-bold text-sm text-foreground">Allowed Customer Ordering Channels</h4>
          <p className="text-xs text-muted-foreground">
            Control which fulfillment options are visible to customers on your food ordering app.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Table Dine-In */}
          <div
            onClick={() =>
              onFeatureToggle("tableQrOrdering", features.tableQrOrdering === false ? true : false)
            }
            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              features.tableQrOrdering !== false
                ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                : "bg-muted/30 border-border text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Utensils size={15} />
              </div>
              <div
                className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                  features.tableQrOrdering !== false ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              >
                {features.tableQrOrdering !== false && <Check size={11} strokeWidth={3} />}
              </div>
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">Table QR Dine-In</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Customers scan QR code at table and order directly to their table floor.
              </p>
            </div>
          </div>

          {/* Takeaway / Self Pickup */}
          <div
            onClick={() =>
              onFeatureToggle("takeaway", features.takeaway === false ? true : false)
            }
            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              features.takeaway !== false
                ? "bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20"
                : "bg-muted/30 border-border text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ShoppingBag size={15} />
              </div>
              <div
                className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                  features.takeaway !== false ? "bg-amber-500" : "bg-muted-foreground/40"
                }`}
              >
                {features.takeaway !== false && <Check size={11} strokeWidth={3} />}
              </div>
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">Counter Takeaway</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Customers pre-order for self-pickup at cafe counter.
              </p>
            </div>
          </div>

          {/* Home Delivery */}
          <div
            onClick={() =>
              onFeatureToggle("delivery", features.delivery === false ? true : false)
            }
            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              features.delivery !== false
                ? "bg-indigo-500/5 border-indigo-500/40 ring-1 ring-indigo-500/20"
                : "bg-muted/30 border-border text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Truck size={15} />
              </div>
              <div
                className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                  features.delivery !== false ? "bg-indigo-500" : "bg-muted-foreground/40"
                }`}
              >
                {features.delivery !== false && <Check size={11} strokeWidth={3} />}
              </div>
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">Doorstep Delivery</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Customers provide delivery address for campus or city delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. POS Approval Gate */}
      <div
        onClick={() =>
          onApprovalToggle(
            onlineApproval?.requireApprovalForTakeawayAndDelivery === false ? true : false
          )
        }
        className={`bg-card border rounded-xl p-4 sm:p-5 shadow-xs transition flex items-center justify-between cursor-pointer ${
          onlineApproval?.requireApprovalForTakeawayAndDelivery !== false
            ? "border-primary/40 bg-primary/5"
            : "border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="font-bold text-xs text-foreground">
              Require Staff POS Confirmation Before Kitchen Dispatch
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-lg">
              Takeaway and delivery orders pop up in the POS approval modal for staff confirmation. When accepted, instant receipt prints and moves order to active delivery/takeaway queues.
            </p>
          </div>
        </div>

        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs ${
            onlineApproval?.requireApprovalForTakeawayAndDelivery !== false
              ? "bg-primary"
              : "bg-muted-foreground/40"
          }`}
        >
          {onlineApproval?.requireApprovalForTakeawayAndDelivery !== false && (
            <Check size={13} strokeWidth={3} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreOperationsSettings;
