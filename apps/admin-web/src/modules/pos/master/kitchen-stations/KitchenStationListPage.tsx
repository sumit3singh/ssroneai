import React from "react";
import { ChefHat, Plus, Printer } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";

export const KitchenStationListPage: React.FC = () => {
  const stations = [
    { id: 1, name: "Main Kitchen", code: "MAIN", printer_ip: "192.168.1.101" },
    { id: 2, name: "Chinese & Tandoor", code: "CHINESE", printer_ip: "192.168.1.102" },
    { id: 3, name: "Beverages & Bar", code: "BAR", printer_ip: "192.168.1.103" },
    { id: 4, name: "Bakery & Desserts", code: "BAKERY", printer_ip: "192.168.1.104" }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <ChefHat size={18} className="text-primary" />
            Kitchen Display & KOT Station Master ({stations.length})
          </h3>
          <p className="text-3xs text-muted-foreground">
            Configure preparation areas, KDS routing rules, and dedicated thermal printers
          </p>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20">
          <Plus size={16} /> + Add Kitchen Station
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {stations.map((s) => (
          <div key={s.id} className="bg-muted/30 border border-border/70 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-foreground">{s.name}</span>
              <span className="text-3xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {s.code}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-2xs font-mono text-muted-foreground">
              <Printer size={12} /> {s.printer_ip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
