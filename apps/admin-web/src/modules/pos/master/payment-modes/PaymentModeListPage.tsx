import React from "react";
import { CreditCard, DollarSign, Landmark, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";

export const PaymentModeListPage: React.FC = () => {
  const modes = [
    { id: 1, name: "Cash Payment", code: "CASH", icon: "💵", is_active: true },
    { id: 2, name: "UPI / PhonePe / Paytm", code: "UPI", icon: "📱", is_active: true },
    { id: 3, name: "Credit / Debit Card", code: "CARD", icon: "💳", is_active: true },
    { id: 4, name: "Pay Later / Customer Credit", code: "DUE", icon: "📋", is_active: true }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={18} className="text-primary" />
            Payment Modes Master ({modes.length})
          </h3>
          <p className="text-3xs text-muted-foreground">
            Configure settlement methods, merchant QR codes, and card gateway integrations
          </p>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20">
          <Plus size={16} /> + Add Payment Mode
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {modes.map((m) => (
          <div key={m.id} className="bg-muted/30 border border-border/70 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{m.icon}</span>
              <div>
                <h4 className="font-extrabold text-xs text-foreground">{m.name}</h4>
                <span className="text-3xs font-mono font-bold text-emerald-600 uppercase">ACTIVE</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
