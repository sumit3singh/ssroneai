import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid,
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Edit3,
  Plus,
  Search,
  Receipt,
  Eye,
  RefreshCw,
  Layers,
  UtensilsCrossed,
  TrendingUp,
  X
} from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { POSTable, POSOrder, POSWaiter } from "../../types";

interface POSTableTrackerPageProps {
  tables: POSTable[];
  orders: POSOrder[];
  waiters?: POSWaiter[];
  onRecallOrderToCart?: (order: POSOrder) => void;
  onSelectTableForNewOrder?: (tableId: number | string) => void;
  onRefresh?: () => void;
}

export const POSTableTrackerPage: React.FC<POSTableTrackerPageProps> = ({
  tables = [],
  orders = [],
  waiters = [],
  onRecallOrderToCart,
  onSelectTableForNewOrder,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [previewOrderModal, setPreviewOrderModal] = useState<POSOrder | null>(null);

  // Filter active orders (status not completed/paid/cancelled)
  const activeOrders = orders.filter((o) => {
    const s = (o.status || "").toLowerCase();
    return !["completed", "paid", "cancelled"].includes(s);
  });

  // Helper to find active order for a given table
  const getActiveOrderForTable = (table: POSTable): POSOrder | undefined => {
    return activeOrders.find((ord) => {
      if (ord.table_id && String(ord.table_id) === String(table.id)) return true;
      if (ord.table_name && table.table_number && ord.table_name.trim().toLowerCase() === table.table_number.trim().toLowerCase()) return true;
      return false;
    });
  };

  // Group tables by section
  const sectionMap: Record<string, POSTable[]> = {};
  tables.forEach((table) => {
    const secName = table.section?.trim() || "Main Dining";
    if (!sectionMap[secName]) {
      sectionMap[secName] = [];
    }
    sectionMap[secName].push(table);
  });

  const availableSections = Object.keys(sectionMap);

  // Filter sections based on selected tab
  const displaySections =
    selectedSection === "ALL"
      ? availableSections
      : availableSections.filter((s) => s.toLowerCase() === selectedSection.toLowerCase());

  // Count occupied vs free tables
  let occupiedCount = 0;
  let freeCount = 0;
  let activeRevenueTotal = 0;

  tables.forEach((table) => {
    const activeOrd = getActiveOrderForTable(table);
    if (activeOrd || table.status === "occupied" || table.status === "billing") {
      occupiedCount++;
      if (activeOrd) {
        activeRevenueTotal += Number(activeOrd.net_amount || activeOrd.subtotal || 0);
      }
    } else {
      freeCount++;
    }
  });

  // Handle clicking an Occupied Table -> Recalls order to cart in Edit mode
  const handleTableClick = (table: POSTable, activeOrder?: POSOrder) => {
    if (activeOrder) {
      try {
        localStorage.setItem("edit_pos_order", JSON.stringify(activeOrder));
        toast.success(`Order #${activeOrder.order_number} for Table ${table.table_number} loaded into Cart for editing!`);
        if (onRecallOrderToCart) {
          onRecallOrderToCart(activeOrder);
        }
        navigate({ to: "/pos/transaction/billing" });
      } catch (err) {
        console.error("Failed to load order for table", err);
        toast.error("Failed to load table order into cart");
      }
    } else {
      // Free Table -> Start new order with this table pre-selected
      try {
        localStorage.setItem("selected_pos_table_id", String(table.id));
        toast.info(`Selected Table ${table.table_number}. Starting new order...`);
        if (onSelectTableForNewOrder) {
          onSelectTableForNewOrder(table.id);
        }
        navigate({ to: "/pos/transaction/billing" });
      } catch (e) {
        navigate({ to: "/pos/transaction/billing" });
      }
    }
  };

  return (
    <div className="space-y-2.5 flex flex-col h-[calc(100vh-4.25rem)] overflow-hidden select-none">
      {/* Ultra-Compact Top Control Bar */}
      <div className="bg-card border border-border rounded-md p-2.5 shadow-2xs shrink-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Header Title */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-muted text-foreground rounded border border-border">
              <LayoutGrid size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-xs text-foreground leading-none">
                Table Floor Grid & Live Tracker
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Click any table box to take order or edit active cart.
              </p>
            </div>
          </div>

          {/* Stats Badges & Actions */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-[11px]">
              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded border border-border">
                Total: <strong className="text-foreground">{tables.length}</strong>
              </span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded border border-amber-500/20 font-mono">
                Occupied: <strong>{occupiedCount}</strong>
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20 font-mono">
                Free: <strong>{freeCount}</strong>
              </span>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded border border-border font-mono">
                Active: <strong className="text-foreground">₹{activeRevenueTotal.toLocaleString("en-IN")}</strong>
              </span>
            </div>

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-7 text-xs font-medium rounded px-2 cursor-pointer"
              >
                <RefreshCw size={12} />
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate({ to: "/pos/transaction/billing" })}
              className="h-7 gap-1 text-xs font-semibold rounded cursor-pointer px-2.5 shadow-xs"
            >
              <UtensilsCrossed size={12} /> POS Terminal
            </Button>
          </div>
        </div>

        {/* Section Filters & Search Bar */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
            <button
              onClick={() => setSelectedSection("ALL")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedSection === "ALL"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              All ({tables.length})
            </button>
            {availableSections.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedSection.toLowerCase() === sec.toLowerCase()
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {sec} ({sectionMap[sec]?.length || 0})
              </button>
            ))}
          </div>

          {/* Compact Search Input */}
          <div className="relative w-48 shrink-0">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search table or order #..."
              icon={<Search size={12} className="text-muted-foreground" />}
              className="h-7 text-xs font-medium bg-background border-border rounded"
            />
          </div>
        </div>
      </div>

      {/* Main Floor Square Grid Container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
        {displaySections.length === 0 ? (
          <div className="bg-card border border-border rounded-md p-6 text-center text-muted-foreground space-y-1">
            <AlertCircle size={24} className="mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-xs text-foreground">No dining tables found.</p>
          </div>
        ) : (
          displaySections.map((secName) => {
            const secTables = sectionMap[secName] || [];
            const filteredTables = secTables.filter((t) => {
              const activeOrd = getActiveOrderForTable(t);
              const matchesSearch =
                t.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (activeOrd && activeOrd.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (activeOrd && activeOrd.waiter_name && activeOrd.waiter_name.toLowerCase().includes(searchTerm.toLowerCase()));
              return matchesSearch;
            });

            if (filteredTables.length === 0) return null;

            return (
              <div key={secName} className="space-y-1.5">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                    {secName}
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                      {filteredTables.length}
                    </span>
                  </h3>
                </div>

                {/* Ultra-Compact Square Tiles Grid (8 to 12 tiles per row) */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                  {filteredTables.map((table) => {
                    const activeOrd = getActiveOrderForTable(table);
                    const isOccupied = Boolean(activeOrd || table.status === "occupied" || table.status === "billing");

                    return (
                      <div
                        key={table.id}
                        onClick={() => handleTableClick(table, activeOrd)}
                        title={isOccupied && activeOrd ? `Click to edit Order #${activeOrd.order_number}` : `Click to take order for Table ${table.table_number}`}
                        className={`group aspect-square rounded-md border p-2 flex flex-col justify-between items-center text-center transition-colors cursor-pointer ${
                          isOccupied
                            ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500"
                            : "bg-card border-border hover:border-primary/40"
                        }`}
                      >
                        {/* Top: Table Name & Status Dot */}
                        <div className="w-full flex items-center justify-between gap-0.5 shrink-0">
                          <span className="font-semibold text-xs text-foreground truncate max-w-[80%] leading-none">
                            {table.table_number}
                          </span>
                          {isOccupied ? (
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="Occupied"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Available"></span>
                          )}
                        </div>

                        {/* Middle: Live Order Info or Seating Capacity */}
                        {isOccupied && activeOrd ? (
                          <div className="my-auto space-y-0.5 w-full">
                            <div className="bg-muted text-foreground border border-border rounded px-1 py-0.2 text-[9px] font-mono font-medium truncate">
                              #{activeOrd.order_number.replace(/^ORD-/, "").slice(-6)}
                            </div>
                            <p className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 truncate">
                              ₹{Number(activeOrd.net_amount || activeOrd.subtotal || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        ) : (
                          <div className="my-auto text-center space-y-0.5">
                            <p className="text-[10px] font-medium text-muted-foreground leading-none">
                              {table.capacity || 4} Seats
                            </p>
                            <p className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase">
                              FREE
                            </p>
                          </div>
                        )}

                        {/* Bottom Action Footer */}
                        <div className="w-full shrink-0">
                          {isOccupied && activeOrd ? (
                            <div className="flex items-center justify-between w-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors">
                              <span>Edit Cart</span>
                              <Edit3 size={9} />
                            </div>
                          ) : (
                            <div className="w-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground text-muted-foreground border border-border text-[9px] font-medium px-1 py-0.5 rounded transition-colors text-center">
                              + Take Order
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Order Items Preview Modal */}
      {previewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <span className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400">Order Preview</span>
                <h3 className="font-display font-black text-sm text-foreground flex items-center gap-1.5">
                  Order #{previewOrderModal.order_number}
                </h3>
              </div>
              <button
                onClick={() => setPreviewOrderModal(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
              {previewOrderModal.items && previewOrderModal.items.length > 0 ? (
                previewOrderModal.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs font-bold py-1 border-b border-border/40">
                    <div>
                      <p className="text-foreground text-2xs">{item.name || item.product_name || item.item_name || "Item"}</p>
                      {item.variant_name && <span className="text-[9px] text-muted-foreground">({item.variant_name})</span>}
                    </div>
                    <div className="text-right font-mono text-2xs">
                      <p className="text-foreground">x{item.quantity}</p>
                      <p className="text-muted-foreground">₹{Number(item.unit_price || item.price || 0) * item.quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No items listed in order preview.</p>
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase text-muted-foreground font-extrabold">Total Amount</p>
                <p className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
                  ₹{Number(previewOrderModal.net_amount || previewOrderModal.subtotal || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const ord = previewOrderModal;
                  setPreviewOrderModal(null);
                  handleTableClick({ id: ord.table_id || "table", table_number: ord.table_name || "Table", capacity: 4, status: "occupied" }, ord);
                }}
                className="gap-1 text-xs font-bold rounded-lg cursor-pointer h-8"
              >
                <Edit3 size={12} /> Edit Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
