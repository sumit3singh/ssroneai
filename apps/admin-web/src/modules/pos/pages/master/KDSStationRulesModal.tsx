import React, { useState, useEffect } from "react";
import { X, ChefHat, Save, RefreshCw, Layers, CheckCircle2, AlertCircle, Clock, UtensilsCrossed, Printer, Trash2 } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";

interface KDSStationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StationDTO {
  id: number;
  name: string;
  code: string;
  station_type: string;
  printer_name: string | null;
  categories: string[];
  is_active: boolean;
  sort_order: number;
}

export function KDSStationRulesModal({ isOpen, onClose, onSuccess }: KDSStationRulesModalProps) {
  const [stations, setStations] = useState<StationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "Tandoor & Charcoal Station",
    code: "TANDOOR",
    station_type: "main",
    printer_name: "KOT_Tandoor_LAN",
    categories_raw: "Breads, Tandoori Starters, Kebabs",
    sort_order: 1,
    is_active: true
  });

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await api.get<StationDTO[]>("/business/kitchen-stations");
      setStations(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.warn("Could not fetch kitchen stations from PostgreSQL:", err);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStations();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const cats = formData.categories_raw
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        station_type: formData.station_type,
        printer_name: formData.printer_name.trim() || undefined,
        categories: cats,
        sort_order: Number(formData.sort_order),
        is_active: formData.is_active,
        branch_id: 1
      };

      await api.post("/business/kitchen-stations", payload);
      setSuccessMsg("KDS Station routing rule recorded in PostgreSQL!");
      setFormData({
        name: "",
        code: "",
        station_type: "prep",
        printer_name: "",
        categories_raw: "",
        sort_order: 2,
        is_active: true
      });
      fetchStations();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save KDS station rule in database");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/business/kitchen-stations/${id}`);
      fetchStations();
    } catch (err) {
      console.error("Failed to delete kitchen station rule", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ChefHat size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                Kitchen Display System (KDS) Station Routing Rules
              </h2>
              <p className="text-2xs text-muted-foreground font-semibold">
                PostgreSQL Multi-Station KOT Dispatch, Category Mapping & Thermal Printers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2.5">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
              <ChefHat size={14} className="text-amber-500" />
              <span>Register Kitchen Station & Category Rules</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Station Name *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Chinese & Wok Section"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Station Code *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. CHINESE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="font-mono text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Station Type *
                </label>
                <select
                  value={formData.station_type}
                  onChange={(e) => setFormData({ ...formData, station_type: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="main">Main Kitchen</option>
                  <option value="prep">Cold / Prep Station</option>
                  <option value="bar">Beverage / Bar Counter</option>
                  <option value="sweets">Mithai / Sweet Counter</option>
                  <option value="bakery">Bakery & Oven</option>
                  <option value="expo">Expo / Pass Consolidation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  KOT Thermal Printer Device
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Printer_Kitchen_LAN or USB001"
                  value={formData.printer_name}
                  onChange={(e) => setFormData({ ...formData, printer_name: e.target.value })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Routed Menu Categories (Comma Separated) *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Noodles, Fried Rice, Soups, Dimsums"
                  value={formData.categories_raw}
                  onChange={(e) => setFormData({ ...formData, categories_raw: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-2xs font-bold text-foreground">Active in Live KDS Screen</span>
              </label>

              <Button
                type="submit"
                disabled={submitting}
                className="font-extrabold text-xs flex items-center gap-2"
              >
                <Save size={14} />
                <span>{submitting ? "Saving..." : "Save Station Rule"}</span>
              </Button>
            </div>
          </form>

          {/* Stations Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <ChefHat size={14} className="text-amber-500" />
                <span>Configured Kitchen Stations ({stations.length})</span>
              </h3>
              <button
                onClick={fetchStations}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Station Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Routed Categories</th>
                    <th className="p-3">Printer</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-bold">
                  {stations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                        No kitchen stations configured yet in PostgreSQL database.
                      </td>
                    </tr>
                  ) : (
                    stations.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-2xs text-amber-600 dark:text-amber-400 font-black">
                          {s.code}
                        </td>
                        <td className="p-3 font-black text-foreground">{s.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-muted text-foreground border border-border">
                            {s.station_type}
                          </span>
                        </td>
                        <td className="p-3 text-2xs text-muted-foreground max-w-[200px] truncate">
                          {Array.isArray(s.categories) ? s.categories.join(", ") : "-"}
                        </td>
                        <td className="p-3 font-mono text-3xs text-muted-foreground">
                          {s.printer_name || "None"}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                              s.is_active
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {s.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end">
          <Button variant="outline" onClick={onClose} className="font-bold text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
