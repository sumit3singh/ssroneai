import React, { useState, useEffect } from "react";
import { 
  Users, Search, Plus, Phone, Mail, Edit2, Trash2, ShieldCheck, CheckCircle2, Home, Layers, Grid, X 
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { Input } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Resident } from "../../types";
import { pgApi, PGRoomDTO, PGBedDTO } from "../../api/pg.api";

import { useRouterState } from "@tanstack/react-router";

interface PGMasterSectionProps {
  residents: Resident[];
  search: string;
  setSearch: (s: string) => void;
  onOpenAddModal: () => void;
  onOpenRentModal: (r: Resident) => void;
  onOpenAgreementModal: (r: Resident) => void;
  onDeleteResident: (id: string) => void;
}

export const PGMasterSection: React.FC<PGMasterSectionProps> = ({
  residents,
  search,
  setSearch,
  onOpenAddModal,
  onOpenRentModal,
  onOpenAgreementModal,
  onDeleteResident,
}) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const getInitialTab = (): "residents" | "rooms" | "floors" | "beds" => {
    if (currentPath.includes("/beds")) return "beds";
    if (currentPath.includes("/rooms") || currentPath.includes("/types")) return "rooms";
    return "residents";
  };

  const [masterTab, setMasterTab] = useState<"residents" | "rooms" | "floors" | "beds">(getInitialTab);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "partial" | "overdue">("all");

  useEffect(() => {
    if (currentPath.includes("/beds")) setMasterTab("beds");
    else if (currentPath.includes("/rooms") || currentPath.includes("/types")) setMasterTab("rooms");
    else setMasterTab("residents");
  }, [currentPath]);

  // Master Rooms state
  const [rooms, setRooms] = useState<PGRoomDTO[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [beds, setBeds] = useState<PGBedDTO[]>([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showFloorModal, setShowFloorModal] = useState(false);

  const fetchMasterData = async () => {
    try {
      const [roomList, bedList] = await Promise.all([
        pgApi.getRooms().catch(() => []),
        pgApi.getBeds().catch(() => []),
      ]);
      setRooms(roomList);
      setBeds(bedList);
    } catch (err) {
      console.error("Failed to load master data", err);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const filteredResidents = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.room.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);
    const matchesStatus = filterStatus === "all" || r.paid_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* ── TAB 1: Resident Directory Master ── */}
      {masterTab === "residents" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-card p-3 rounded-md border border-border">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search residents by name, room, or phone..."
                className="w-full pl-8 pr-2.5 py-1 text-xs font-medium bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="pl-2 pr-2 py-1 bg-background border border-border rounded text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>

              <Button onClick={onOpenAddModal} size="sm" className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs">
                <Plus className="w-4 h-4" /> Add Resident
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-md border border-border overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-2.5">Tenant Details</th>
                  <th className="p-2.5">Room & Bed</th>
                  <th className="p-2.5">Rent / Mo</th>
                  <th className="p-2.5">Due Status</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium text-xs">
                      No residents found in PostgreSQL database matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{r.name}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {r.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5 font-medium text-foreground">
                        {r.room}
                      </td>
                      <td className="p-2.5 font-bold font-mono text-foreground">
                        {formatCurrency(r.rent)}
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border uppercase ${
                          r.paid_status === "paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        }`}>
                          {r.paid_status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => onOpenRentModal(r)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                            Collect Rent
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onDeleteResident(r.id)} className="text-xs text-rose-500 hover:bg-rose-500/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Rooms & Sharing Master ── */}
      {masterTab === "rooms" && (
        <div className="bg-card rounded-md border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Room Inventory & Rate Cards</h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-mono">{rooms.length} Rooms Configured</span>
              <Button onClick={() => setShowRoomModal(true)} size="sm" className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs">
                <Plus className="w-4 h-4" /> Add Room Master
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rooms.length === 0 ? (
              <div className="col-span-3 p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-md bg-muted/20 font-medium">
                No rooms added yet. Click <strong>Add Room Master</strong> above to create rooms.
              </div>
            ) : (
              rooms.map((rm) => (
                <div key={rm.id} className="p-3.5 rounded-md border border-border bg-background space-y-2 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm font-mono">Room {rm.room_number}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${rm.is_ac ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
                      {rm.is_ac ? "AC" : "Non-AC"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Capacity: <strong className="text-foreground">{rm.capacity} Sharing</strong></p>
                  <p className="text-xs text-muted-foreground">Monthly Rent: <strong className="text-foreground font-mono font-bold">{formatCurrency(rm.monthly_rent)}</strong></p>
                  <p className="text-xs text-muted-foreground">Deposit: <strong className="text-foreground font-mono">{formatCurrency(rm.security_deposit)}</strong></p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Bed Allotment Matrix ── */}
      {masterTab === "beds" && (
        <div className="bg-card rounded-md border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Interactive Bed Allotment Grid</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Vacant Bed</span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Occupied Bed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {beds.length === 0 ? (
              <div className="col-span-6 p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-md bg-muted/20 font-medium">
                No beds generated yet. Beds are automatically created when rooms are added.
              </div>
            ) : (
              beds.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-md border text-center transition-all ${
                    b.status === "occupied"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <p className="font-bold text-xs font-mono">{b.bed_number}</p>
                  <p className="text-[9px] uppercase font-mono font-semibold mt-0.5 tracking-wider">{b.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Add Room Master Modal ── */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-md max-w-md w-full p-5 border border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">Create Room Master</h3>
              <button onClick={() => setShowRoomModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Add a new room and auto-generate beds in database.</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const room_number = String(formData.get("room_number") || "");
                const capacity = Number(formData.get("capacity") || 2);
                const monthly_rent = Number(formData.get("monthly_rent") || 8500);

                if (!room_number) {
                  toast.error("Room Number is required.");
                  return;
                }

                try {
                  await pgApi.createRoom({
                    branch_id: 1,
                    room_number,
                    sharing_type: capacity,
                    monthly_rent,
                  } as any);
                  toast.success(`Room ${room_number} & ${capacity} beds saved successfully!`);
                  setShowRoomModal(false);
                  fetchMasterData();
                } catch (err) {
                  toast.error("Failed to save room master");
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Room Number *</label>
                <input name="room_number" required placeholder="e.g. Room 101" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Capacity (Beds)</label>
                  <input name="capacity" type="number" defaultValue="2" min="1" max="6" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Monthly Rent (₹)</label>
                  <input name="monthly_rent" type="number" defaultValue="8500" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowRoomModal(false)} className="text-xs">Cancel</Button>
                <Button type="submit" size="sm" className="text-xs font-semibold">Create Room & Auto-Beds</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
