import { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Building2, Plus, Calendar, X, Layers } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { Badge } from "@/shared/ui/primitives/Badge";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { useReservations, useCreateReservation } from "./hooks";

const STATUS_VARIANT = {
  confirmed: "info" as const,
  checked_in: "success" as const,
  checked_out: "secondary" as const,
  cancelled: "danger" as const,
};

export function ReservationsPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: reservations = [], isLoading } = useReservations();
  const createMutation = useCreateReservation();

  const [showAddForm, setShowAddForm] = useState(
    currentPath === "/reservations/new" ? true : false
  );

  useEffect(() => {
    if (currentPath === "/reservations/new") {
      setShowAddForm(true);
    }
  }, [currentPath]);

  if (currentPath === "/reservations/tables") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
              <Layers className="text-primary" size={20} />
              Tables & Seating Configuration
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Manage physical tables, dining capacities, and guest layout</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { id: "T1", cap: 4, type: "Standard AC Cabin" },
            { id: "T2", cap: 2, type: "Window Seating" },
            { id: "T3", cap: 8, type: "Family Suite" },
            { id: "T4", cap: 4, type: "Terrace Garden Lounge" },
          ].map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-card-hover transition-all">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-foreground">Table {t.id}</span>
                <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Capacity</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{t.cap} Guests max</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Location / Zone</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{t.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const [newRes, setNewRes] = useState({
    guest_name: "",
    room_number: "101",
    check_in_date: new Date().toISOString().slice(0, 10),
    check_out_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    status: "confirmed" as const,
    grand_total: 4500,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.guest_name || newRes.grand_total <= 0) return;

    createMutation.mutate(newRes, {
      onSuccess: () => {
        setShowAddForm(false);
        setNewRes({
          guest_name: "",
          room_number: "101",
          check_in_date: new Date().toISOString().slice(0, 10),
          check_out_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          status: "confirmed",
          grand_total: 4500,
        });
      },
    });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Building2 size={24} className="text-primary" />
            Reservations
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{reservations.length} total bookings</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-primary text-white">
          <Plus size={15} className="mr-1.5" />
          New Reservation
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading bookings...</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="data-table-header border-b border-border">
              <tr className="text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Reservation #</th>
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Room</th>
                <th className="px-5 py-3 font-medium">Check-in</th>
                <th className="px-5 py-3 font-medium">Check-out</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">{r.reservation_number}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{r.guest_name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">Room {r.room_number}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(r.check_in_date)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatDate(r.check_out_date)}</td>
                  <td className="px-5 py-3.5 font-numeric font-medium text-right text-foreground">{formatCurrency(r.grand_total)}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_VARIANT[r.status]} className="capitalize text-3xs">
                      {r.status.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Reservation Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Building2 size={16} className="text-primary" />
                Add Room Reservation
              </h3>
              <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-muted-foreground">Primary Guest Name</label>
                  <Input
                    placeholder="Enter guest name"
                    value={newRes.guest_name}
                    onChange={(e) => setNewRes({ ...newRes, guest_name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Room Assignment</label>
                    <Input
                      placeholder="e.g. 101"
                      value={newRes.room_number}
                      onChange={(e) => setNewRes({ ...newRes, room_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Reservation Status</label>
                    <select
                      value={newRes.status}
                      onChange={(e) => setNewRes({ ...newRes, status: e.target.value as any })}
                      className="w-full bg-background border border-border text-sm rounded-lg p-2 focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Check-in Date</label>
                    <Input
                      type="date"
                      value={newRes.check_in_date}
                      onChange={(e) => setNewRes({ ...newRes, check_in_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Check-out Date</label>
                    <Input
                      type="date"
                      value={newRes.check_out_date}
                      onChange={(e) => setNewRes({ ...newRes, check_out_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-muted-foreground">Booking Amount (INR)</label>
                  <Input
                    type="number"
                    value={newRes.grand_total}
                    onChange={(e) => setNewRes({ ...newRes, grand_total: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 p-4 border-t border-border bg-muted/10">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-white" loading={createMutation.isPending}>
                  Create Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
