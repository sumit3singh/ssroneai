import React, { useState, useEffect } from "react";
import { ChefHat, Plus, Printer, Edit2, Trash2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { KitchenStationFormDialog, KitchenStationData } from "./KitchenStationFormDialog";

export const KitchenStationListPage: React.FC = () => {
  const [stations, setStations] = useState<KitchenStationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<KitchenStationData | null>(null);

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<KitchenStationData[]>("/restaurant/kitchen-stations");
      if (Array.isArray(res)) {
        setStations(res);
      }
    } catch (err: any) {
      console.error("Failed to fetch kitchen stations:", err);
      toast.error("Failed to load kitchen stations from server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleSaveStation = async (data: KitchenStationData) => {
    try {
      if (data.id) {
        await api.put(`/restaurant/kitchen-stations/${data.id}`, data);
        toast.success(`Kitchen station "${data.name}" updated successfully!`);
      } else {
        await api.post("/restaurant/kitchen-stations", data);
        toast.success(`Kitchen station "${data.name}" created successfully!`);
      }
      await fetchStations();
    } catch (err: any) {
      console.error("Failed to save kitchen station:", err);
      const msg = err?.response?.data?.detail || err?.detail || err?.message || "Failed to save kitchen station";
      toast.error(msg);
    }
  };

  const handleDeleteStation = async (id: number | string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete kitchen station "${name}"?`)) return;
    try {
      await api.delete(`/restaurant/kitchen-stations/${id}`);
      toast.success(`Kitchen station "${name}" deleted successfully!`);
      await fetchStations();
    } catch (err: any) {
      console.error("Failed to delete kitchen station:", err);
      const msg = err?.response?.data?.detail || err?.detail || err?.message || "Failed to delete kitchen station";
      toast.error(msg);
    }
  };

  const activeCount = stations.filter((s) => s.is_active !== false).length;
  const connectedPrinters = stations.filter((s) => Boolean(s.printer_name)).length;

  return (
    <div className="space-y-4">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Total KDS Stations</p>
            <h4 className="font-display font-black text-xl text-foreground mt-0.5">{stations.length}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ChefHat size={18} />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Active Stations</p>
            <h4 className="font-display font-black text-xl text-emerald-500 mt-0.5">{activeCount} Operational</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Connected Printers</p>
            <h4 className="font-display font-black text-xl text-violet-500 mt-0.5">{connectedPrinters} Devices</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
            <Printer size={18} />
          </div>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
              <ChefHat size={18} className="text-primary" />
              Kitchen Display & KOT Station Master ({stations.length})
            </h3>
            <p className="text-3xs text-muted-foreground">
              Configure preparation areas, KDS routing rules, and dedicated thermal printers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStations}
              disabled={isLoading}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
              title="Refresh Stations"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin text-primary" : ""} />
            </button>
            <Button
              onClick={() => {
                setEditingStation(null);
                setIsDialogOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Plus size={16} /> + Add Kitchen Station
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {stations.length === 0 && (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl space-y-2">
            <ChefHat size={32} className="mx-auto text-muted-foreground/50" />
            <p className="font-bold text-sm text-foreground">No kitchen stations created yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Click "+ Add Kitchen Station" above to create your first preparation area and routing printer.
            </p>
          </div>
        )}

        {/* Station Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {stations.map((s) => (
            <div
              key={s.id || s.code}
              className="bg-card border border-border hover:border-primary/50 rounded-2xl p-4 flex flex-col justify-between h-32 transition-all shadow-card hover:shadow-card-hover group relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display font-black text-sm text-foreground group-hover:text-primary transition-colors">
                    {s.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1 uppercase">
                    {s.code}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                    s.is_active !== false
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  }`}
                >
                  {s.is_active !== false ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground pt-2 border-t border-border/50">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <Printer size={13} className="text-primary" />
                  {s.printer_name || "192.168.1.101"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingStation(s);
                      setIsDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                    title="Edit Station"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => s.id && handleDeleteStation(s.id, s.name)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Station"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Dialog */}
      <KitchenStationFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveStation}
        editingStation={editingStation}
      />
    </div>
  );
};
