import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Users, Search, Phone, Mail, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { Button, Input, Badge } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  notes?: string | null;
}

interface GuestDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestCreated?: () => void;
}

export function GuestDirectoryModal({ isOpen, onClose, onGuestCreated }: GuestDirectoryModalProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    id_type: "Aadhaar",
    id_number: "",
    notes: "",
  });

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any[]>("/hotel/guests", { search }).catch(() => []);
      setGuests(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load guests from PostgreSQL", err);
      toast.error("Could not load guests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGuests();
    }
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone.trim()) {
      toast.error("First name, last name, and phone are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/hotel/guests", {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        id_type: formData.id_type,
        id_number: formData.id_number.trim() || null,
        notes: formData.notes.trim() || null,
        branch_id: 1,
      });

      toast.success(`Guest profile for ${formData.first_name} ${formData.last_name} created`);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        id_type: "Aadhaar",
        id_number: "",
        notes: "",
      });
      await fetchGuests();
      if (onGuestCreated) onGuestCreated();
    } catch (err: any) {
      console.error("Failed to register guest", err);
      toast.error(err?.message || "Failed to register guest");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove guest "${name}"?`)) return;
    try {
      await api.delete(`/hotel/guests/${id}`);
      toast.success(`Guest "${name}" removed`);
      setGuests((prev) => prev.filter((g) => g.id !== id));
      if (onGuestCreated) onGuestCreated();
    } catch (err) {
      toast.error("Failed to remove guest");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Guest Directory Master</h2>
              <p className="text-xs text-muted-foreground">Register and manage hotel guest profiles with ID verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add Guest Form */}
          <form onSubmit={handleSubmit} className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Onboard New Hotel Guest</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Phone (10-Digit) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">ID Document Type</label>
                <select
                  value={formData.id_type}
                  onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">ID Document Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1234 5678 9012"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSubmitting} className="h-8 text-xs font-medium px-4">
                {isSubmitting ? "Saving..." : "Save Guest Profile"}
              </Button>
            </div>
          </form>

          {/* Search & List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search guests by name or phone..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {guests.length} Guests in DB
              </span>
            </div>

            {isLoading && guests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Loading guest directory from database...
              </div>
            ) : guests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No guest records found. Register guests using the form above.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {guests.map((g) => (
                  <div key={g.id} className="p-3 bg-card hover:bg-muted/30 flex items-center justify-between gap-3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {g.first_name[0]}{g.last_name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          {g.first_name} {g.last_name}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                          {g.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3" /> {g.phone}
                            </span>
                          )}
                          {g.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {g.email}
                            </span>
                          )}
                          {g.id_type && (
                            <span className="px-1.5 py-0.2 rounded bg-muted text-[10px]">
                              {g.id_type}: {g.id_number || "Verified"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(g.id, `${g.first_name} ${g.last_name}`)}
                      className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove Guest Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
