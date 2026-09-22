import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Bed, CheckCircle2, RefreshCw, IndianRupee, Users } from "lucide-react";
import { Button, Input, Badge } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";

interface RoomType {
  id: number;
  name: string;
  code: string;
  max_occupancy: number;
  base_rate: number;
  description?: string | null;
  is_active: boolean;
}

interface RoomTypeMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomTypeUpdated?: () => void;
}

export function RoomTypeMasterModal({ isOpen, onClose, onRoomTypeUpdated }: RoomTypeMasterModalProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    base_rate: 2500,
    max_occupancy: 2,
    description: "",
  });

  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any[]>("/hotel/room-types").catch(() => []);
      setRoomTypes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load room types from PostgreSQL", err);
      toast.error("Could not load room types");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoomTypes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Please provide room category name and code");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/hotel/room-types", {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        base_rate: Number(formData.base_rate),
        max_occupancy: Number(formData.max_occupancy),
        description: formData.description.trim() || null,
        branch_id: 1,
      });

      toast.success(`Room type "${formData.name}" created successfully`);
      setFormData({ name: "", code: "", base_rate: 2500, max_occupancy: 2, description: "" });
      await fetchRoomTypes();
      if (onRoomTypeUpdated) onRoomTypeUpdated();
    } catch (err: any) {
      console.error("Failed to save room type", err);
      toast.error(err?.message || "Failed to create room type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove room type "${name}"?`)) return;
    try {
      await api.delete(`/hotel/room-types/${id}`);
      toast.success(`Room type "${name}" removed`);
      setRoomTypes((prev) => prev.filter((r) => r.id !== id));
      if (onRoomTypeUpdated) onRoomTypeUpdated();
    } catch (err) {
      toast.error("Failed to remove room type");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Room Types & Rate Cards Master</h2>
              <p className="text-xs text-muted-foreground">Manage hotel room categories, base night rates, and capacity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add Form */}
          <form onSubmit={handleSubmit} className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Add New Room Type</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deluxe Suite, Ocean King"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Short Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLX, STE, STD"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Base Rate / Night (₹) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={50}
                  value={formData.base_rate}
                  onChange={(e) => setFormData({ ...formData, base_rate: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Max Occupancy (Guests) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={10}
                  value={formData.max_occupancy}
                  onChange={(e) => setFormData({ ...formData, max_occupancy: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Description & Amenities</label>
              <input
                type="text"
                placeholder="e.g. King Bed, Pool View, Free Wi-Fi, Breakfast Included"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSubmitting} className="h-8 text-xs font-medium px-4">
                {isSubmitting ? "Saving..." : "Save Room Category"}
              </Button>
            </div>
          </form>

          {/* Table of Existing Room Types */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>CONFIGURED ROOM CATEGORIES ({roomTypes.length})</span>
              <button
                type="button"
                onClick={fetchRoomTypes}
                className="flex items-center gap-1 hover:text-foreground text-[11px] transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>Sync DB</span>
              </button>
            </div>

            {isLoading && roomTypes.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Loading room categories from database...
              </div>
            ) : roomTypes.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No room types configured. Fill the form above to add your first room category.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {roomTypes.map((rt) => (
                  <div key={rt.id} className="p-3 bg-card hover:bg-muted/30 flex items-center justify-between gap-3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        {rt.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{rt.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            Up to {rt.max_occupancy} Guests
                          </span>
                        </div>
                        {rt.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{rt.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-bold text-foreground font-mono">
                          {formatCurrency(rt.base_rate)}
                        </div>
                        <span className="text-[10px] text-muted-foreground">/ night</span>
                      </div>

                      <button
                        onClick={() => handleDelete(rt.id, rt.name)}
                        className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Room Type"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
