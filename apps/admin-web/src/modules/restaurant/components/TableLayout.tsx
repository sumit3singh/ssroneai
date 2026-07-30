import React, { useState } from "react";
import { LayoutGrid, Plus, Users, RefreshCw, AlertTriangle, CheckCircle2, Clock, Ban, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { TableCard, Table } from "./TableCard";

interface TableLayoutProps {
  tables: Table[];
  onUpdateTableStatus: (tableId: string | number, status: Table["status"], guests: number, waiter: string) => Promise<void>;
  onCreateTable: (tableNumber: string, capacity: number, section: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const TableLayout: React.FC<TableLayoutProps> = ({
  tables,
  onUpdateTableStatus,
  onCreateTable,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const [selectedSection, setSelectedSection] = useState<string>("ALL");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states for status edit
  const [editStatus, setEditStatus] = useState<Table["status"]>("free");
  const [editGuests, setEditGuests] = useState<number>(0);
  const [editWaiter, setEditWaiter] = useState<string>("");

  // Form states for new table
  const [newNumber, setNewNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState(4);
  const [newSection, setNewSection] = useState("Main Hall");

  const sections = Array.from(new Set(tables.map((t) => t.section || "Main Hall")));

  const filteredTables = tables.filter((t) => {
    if (selectedSection === "ALL") return true;
    return (t.section || "Main Hall") === selectedSection;
  });

  const stats = {
    total: tables.length,
    free: tables.filter((t) => t.status === "free").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    billing: tables.filter((t) => t.status === "billing").length
  };

  const handleOpenEdit = (table: Table) => {
    setSelectedTable(table);
    setEditStatus(table.status);
    setEditGuests(table.guests || 0);
    setEditWaiter(table.waiter || "");
    setIsModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedTable) return;
    await onUpdateTableStatus(selectedTable.id, editStatus, editGuests, editWaiter);
    setIsModalOpen(false);
  };

  const handleSaveNewTable = async () => {
    if (!newNumber.trim()) return;
    await onCreateTable(newNumber, newCapacity, newSection);
    setIsCreateOpen(false);
    setNewNumber("");
  };

  return (
    <div className="space-y-6">
      {/* Table Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <LayoutGrid size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Tables</span>
            <span className="text-base font-black text-foreground font-mono">{stats.total}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card">
          <div className="p-2.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Available</span>
            <span className="text-base font-black text-green-600 dark:text-green-400 font-mono">{stats.free}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Occupied</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">{stats.occupied}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Ban size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Reserved</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">{stats.reserved}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-card">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Billing</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">{stats.billing}</span>
          </div>
        </div>
      </div>

      {/* Section Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSection("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedSection === "ALL"
                ? "bg-primary text-white shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            All Sections
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSection === sec
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 px-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5"
        >
          <Plus size={16} />
          Add Table
        </Button>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-card border border-border/60 rounded-2xl animate-pulse p-4" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-2xl space-y-3">
          <AlertTriangle size={24} className="mx-auto text-red-500" />
          <h3 className="font-extrabold text-sm text-red-700 dark:text-red-300">Failed to Load Tables</h3>
          <p className="text-xs text-red-600/80 dark:text-red-400/80 max-w-md mx-auto">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline" className="text-xs font-bold gap-1 mx-auto">
              <RefreshCw size={14} /> Retry Database Query
            </Button>
          )}
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
          <p className="text-xs text-muted-foreground font-semibold">No tables configured in this section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <TableCard key={table.id} table={table} onEdit={handleOpenEdit} />
          ))}
        </div>
      )}

      {/* Edit Table Status Modal */}
      {isModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
            <h3 className="font-display font-extrabold text-base text-foreground">
              Update Table {selectedTable.table_number}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="free">Free / Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="billing">Billing / Check out</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Current Guests</label>
                <Input
                  type="number"
                  value={editGuests}
                  onChange={(e) => setEditGuests(parseInt(e.target.value) || 0)}
                  className="h-9 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Assigned Waiter</label>
                <Input
                  value={editWaiter}
                  onChange={(e) => setEditWaiter(e.target.value)}
                  placeholder="e.g. Suman Lata"
                  className="h-9 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStatus} className="bg-primary text-white font-bold">
                Save Status
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Table Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
            <h3 className="font-display font-extrabold text-base text-foreground">Add New Dining Table</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Table Number / Code *</label>
                <Input
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="e.g. T12 or VIP-1"
                  required
                  className="h-9 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Seating Capacity</label>
                <Input
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value) || 4)}
                  className="h-9 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Section / Area</label>
                <Input
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="e.g. Main Hall, Terrace, VIP Lounge"
                  className="h-9 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNewTable} className="bg-primary text-white font-bold">
                Create Table
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
