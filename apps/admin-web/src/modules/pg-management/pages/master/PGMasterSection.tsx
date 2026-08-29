import React, { useState, useEffect } from "react";
import { 
  Users, Search, Plus, Phone, Mail, Edit2, Trash2, ShieldCheck, CheckCircle2, Home, Layers, Grid 
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { Input } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Resident } from "../../types";
import { pgApi, PGRoomDTO, PGBedDTO } from "../../api/pg.api";

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
  const [masterTab, setMasterTab] = useState<"residents" | "rooms" | "floors" | "beds">("residents");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "partial" | "overdue">("all");

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
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header for MASTER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMasterTab("residents")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              masterTab === "residents"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 inline-block mr-1.5" />
            Resident Directory Master
          </button>

          <button
            onClick={() => setMasterTab("rooms")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              masterTab === "rooms"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5 inline-block mr-1.5" />
            Rooms & Sharing Master
          </button>

          <button
            onClick={() => setMasterTab("beds")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              masterTab === "beds"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5 inline-block mr-1.5" />
            Bed Allotment Matrix
          </button>
        </div>

        {masterTab === "residents" && (
          <Button onClick={onOpenAddModal} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1">
            <Plus className="w-4 h-4" /> Add Resident
          </Button>
        )}

        {masterTab === "rooms" && (
          <Button onClick={() => setShowRoomModal(true)} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1">
            <Plus className="w-4 h-4" /> Add Room Master
          </Button>
        )}
      </div>

      {/* ── TAB 1: Resident Directory Master ── */}
      {masterTab === "residents" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, room, or phone..."
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              {(["all", "paid", "partial", "overdue"] as const).map((st) => (
                <Button
                  key={st}
                  variant={filterStatus === st ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(st)}
                  className="capitalize text-xs"
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Tenant Details</th>
                  <th className="p-3">Room & Bed</th>
                  <th className="p-3">Rent / Mo</th>
                  <th className="p-3">Due Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No residents found in PostgreSQL database matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-600 font-bold flex items-center justify-center text-xs">
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{r.name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {r.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {r.room}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(r.rent)}
                      </td>
                      <td className="p-3">
                        <Badge variant={r.paid_status === "paid" ? "success" : "danger"}>
                          {r.paid_status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => onOpenRentModal(r)} className="text-xs text-emerald-600">
                            Collect Rent
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onDeleteResident(r.id)} className="text-xs text-rose-500">
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
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Room Inventory & Rate Cards</h3>
            <span className="text-xs text-slate-500 font-mono">{rooms.length} Rooms Configured in PostgreSQL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.length === 0 ? (
              <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                No rooms added yet. Click <strong>Add Room Master</strong> above to create rooms.
              </div>
            ) : (
              rooms.map((rm) => (
                <div key={rm.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-base">Room {rm.room_number}</span>
                    <Badge variant={rm.is_ac ? "primary" : "outline"}>{rm.is_ac ? "AC" : "Non-AC"}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Capacity: <strong className="text-slate-900 dark:text-white">{rm.capacity} Sharing</strong></p>
                  <p className="text-xs text-slate-500">Monthly Rent: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(rm.monthly_rent)}</strong></p>
                  <p className="text-xs text-slate-500">Deposit: <strong>{formatCurrency(rm.security_deposit)}</strong></p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Bed Allotment Matrix ── */}
      {masterTab === "beds" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Interactive Bed Allotment Grid</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Vacant Bed</span>
              <span className="flex items-center gap-1.5 text-rose-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Occupied Bed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {beds.length === 0 ? (
              <div className="col-span-6 p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                No beds generated yet. Beds are automatically created when rooms are added.
              </div>
            ) : (
              beds.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    b.status === "occupied"
                      ? "border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
                      : "border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  <p className="font-bold text-sm">{b.bed_number}</p>
                  <p className="text-[10px] uppercase font-bold mt-1 tracking-wider">{b.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Add Room Master Modal ── */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Room Master</h3>
            <p className="text-xs text-slate-500">Add a new room and auto-generate beds in PostgreSQL DB.</p>

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
                  toast.success(`Room ${room_number} & ${capacity} beds saved to PostgreSQL!`);
                  setShowRoomModal(false);
                  fetchMasterData();
                } catch (err) {
                  toast.error("Failed to save room master");
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-medium mb-1">Room Number *</label>
                <input name="room_number" required placeholder="e.g. Room 101" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Capacity (Beds)</label>
                  <input name="capacity" type="number" defaultValue="2" min="1" max="6" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Monthly Rent (₹)</label>
                  <input name="monthly_rent" type="number" defaultValue="8500" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowRoomModal(false)} className="px-4 py-2 font-semibold text-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-violet-600 text-white rounded-lg">Create Room & Auto-Beds</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
