import React, { useState, useEffect } from "react";
import { X, Calendar, Plus, CheckCircle2, User, Bed, IndianRupee, Clock, Key } from "lucide-react";
import { Button, Input, Badge } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";

interface Room {
  id: string | number;
  room_number: string;
  room_type_id?: number;
  status: string;
  type?: string;
}

interface RoomType {
  id: number;
  name: string;
  code: string;
  base_rate: number;
}

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string | null;
}

interface ReservationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReservationCreated?: () => void;
}

export function ReservationBookingModal({ isOpen, onClose, onReservationCreated }: ReservationBookingModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    guest_id: "",
    room_id: "",
    room_type_id: "",
    check_in_date: todayStr,
    check_out_date: tomorrowStr,
    rate_per_night: 2500,
    adults: 2,
    children: 0,
    special_requests: "",
  });

  const loadDependencies = async () => {
    try {
      const [rRes, rtRes, gRes] = await Promise.all([
        api.get<any[]>("/hotel/rooms").catch(() => []),
        api.get<any[]>("/hotel/room-types").catch(() => []),
        api.get<any[]>("/hotel/guests").catch(() => []),
      ]);

      setRooms(Array.isArray(rRes) ? rRes : []);
      setRoomTypes(Array.isArray(rtRes) ? rtRes : []);
      setGuests(Array.isArray(gRes) ? gRes : []);

      if (Array.isArray(rtRes) && rtRes.length > 0) {
        setFormData((prev) => ({
          ...prev,
          room_type_id: String(rtRes[0].id),
          rate_per_night: Number(rtRes[0].base_rate),
        }));
      }

      if (Array.isArray(rRes) && rRes.length > 0) {
        setFormData((prev) => ({ ...prev, room_id: String(rRes[0].id) }));
      }

      if (Array.isArray(gRes) && gRes.length > 0) {
        setFormData((prev) => ({ ...prev, guest_id: String(gRes[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load reservation dependencies", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoomTypeChange = (typeId: string) => {
    const found = roomTypes.find((rt) => String(rt.id) === typeId);
    setFormData((prev) => ({
      ...prev,
      room_type_id: typeId,
      rate_per_night: found ? Number(found.base_rate) : prev.rate_per_night,
    }));
  };

  const calculateNights = () => {
    const d1 = new Date(formData.check_in_date).getTime();
    const d2 = new Date(formData.check_out_date).getTime();
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const subtotal = nights * Number(formData.rate_per_night);
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guest_id || !formData.room_id || !formData.room_type_id) {
      toast.error("Please select a guest, room, and room category");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/hotel/reservations", {
        branch_id: 1,
        room_id: Number(formData.room_id),
        room_type_id: Number(formData.room_type_id),
        primary_guest_id: Number(formData.guest_id),
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        rate_per_night: Number(formData.rate_per_night),
        adults: Number(formData.adults),
        children: Number(formData.children),
        special_requests: formData.special_requests || null,
      });

      toast.success("Hotel reservation confirmed successfully in PostgreSQL");
      if (onReservationCreated) onReservationCreated();
      onClose();
    } catch (err: any) {
      console.error("Failed to book reservation", err);
      toast.error(err?.message || "Failed to confirm reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">New Room Reservation</h2>
              <p className="text-xs text-muted-foreground">Confirm hotel room booking with automated night and tax calculation</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guest Selection */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Primary Guest *</label>
              <select
                required
                value={formData.guest_id}
                onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select Guest Profile</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.first_name} {g.last_name} ({g.phone || "No Phone"})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Room Category *</label>
              <select
                required
                value={formData.room_type_id}
                onChange={(e) => handleRoomTypeChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select Category</option>
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} ({formatCurrency(rt.base_rate)}/night)
                  </option>
                ))}
              </select>
            </div>

            {/* Room Number */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Assign Room *</label>
              <select
                required
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select Room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} ({r.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Rate Per Night */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Agreed Rate / Night (₹) *</label>
              <input
                type="number"
                required
                min={100}
                value={formData.rate_per_night}
                onChange={(e) => setFormData({ ...formData, rate_per_night: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Check-in Date */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Check-in Date *</label>
              <input
                type="date"
                required
                value={formData.check_in_date}
                onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Check-out Date */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Check-out Date *</label>
              <input
                type="date"
                required
                value={formData.check_out_date}
                onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Adults Count */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Adults (Count)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.adults}
                onChange={(e) => setFormData({ ...formData, adults: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Special Requests */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Special Requests</label>
              <input
                type="text"
                placeholder="e.g. Extra Bed, Early Check-In"
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-muted/40 p-4 rounded-xl border border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                {nights} Night{nights > 1 ? "s" : ""} @ {formatCurrency(formData.rate_per_night)} + 18% GST
              </span>
              <div className="text-xs text-muted-foreground font-mono">
                Subtotal: {formatCurrency(subtotal)} | Tax: {formatCurrency(tax)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-foreground font-mono">
                {formatCurrency(grandTotal)}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                Total Due
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9 text-xs font-semibold px-5">
              {isSubmitting ? "Confirming..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
