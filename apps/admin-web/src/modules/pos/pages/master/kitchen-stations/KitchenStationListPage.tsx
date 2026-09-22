import React, { useState, useEffect } from "react";
import { ChefHat, Plus, Printer, Edit2, Trash2, RefreshCw, CheckCircle2, Layers } from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
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
      const msg =
        err?.response?.data?.detail || err?.detail || err?.message || "Failed to save kitchen station";
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
      const msg =
        err?.response?.data?.detail || err?.detail || err?.message || "Failed to delete kitchen station";
      toast.error(msg);
    }
  };

  const activeCount = stations.filter((s) => s.is_active !== false).length;
  const connectedPrinters = stations.filter((s) => Boolean(s.printer_name)).length;

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Kitchen Display & KOT Station Master"
        description="Configure preparation areas, KOT routing rules, and dedicated thermal printers in one place"
        icon={<ChefHat size={18} />}
        badge={`${stations.length} Stations`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStations}
              disabled={isLoading}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Refresh Stations"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>

            <Button
              onClick={() => {
                setEditingStation(null);
                setIsDialogOpen(true);
              }}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Add Kitchen Station
            </Button>
          </div>
        }
      />

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total KDS Stations
            </span>
            <div className="p-1 rounded bg-muted text-muted-foreground">
              <ChefHat size={15} />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{stations.length}</div>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Stations
            </span>
            <div className="p-1 rounded bg-muted text-muted-foreground">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {activeCount} Operational
          </div>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Connected Printers
            </span>
            <div className="p-1 rounded bg-muted text-muted-foreground">
              <Printer size={15} />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {connectedPrinters} Devices
          </div>
        </div>
      </div>

      {/* Empty State */}
      {stations.length === 0 && (
        <div className="text-center py-8 border border-dashed border-border rounded-md space-y-2">
          <ChefHat size={28} className="mx-auto text-muted-foreground/50" />
          <p className="font-semibold text-xs text-foreground">No kitchen stations configured yet</p>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
            Click "+ Add Kitchen Station" above to create your first preparation area and assign its thermal printer.
          </p>
        </div>
      )}

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {stations.map((s) => {
          const cats = Array.isArray(s.categories) ? s.categories : [];
          return (
            <div
              key={s.id || s.code}
              className="bg-card border border-border hover:border-primary/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-foreground truncate">
                      {s.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border uppercase">
                        {s.code || `ST-${s.id}`}
                      </span>
                      {s.station_type && (
                        <span className="text-[10px] text-muted-foreground capitalize">
                          • {s.station_type.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold shrink-0 ${
                      s.is_active !== false
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {s.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Categories Badge List */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <Layers size={11} className="text-primary" />
                    <span>Routed Categories:</span>
                  </div>
                  {cats.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {cats.slice(0, 4).map((c: any, cIdx: number) => (
                        <span
                          key={cIdx}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-foreground font-medium border border-border/80"
                        >
                          {String(c)}
                        </span>
                      ))}
                      {cats.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/40 text-muted-foreground">
                          +{cats.length - 4} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">
                      All unmatched categories (Default KOT Receiver)
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-border">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground font-semibold">
                  <Printer size={13} className="text-primary" />
                  {s.printer_name || "RETSOL RPT82"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingStation(s);
                      setIsDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Edit Station"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => s.id && handleDeleteStation(s.id, s.name)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
                    title="Delete Station"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Form Dialog */}
      <KitchenStationFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveStation}
        editingStation={editingStation}
      />
    </PageContainer>
  );
};
