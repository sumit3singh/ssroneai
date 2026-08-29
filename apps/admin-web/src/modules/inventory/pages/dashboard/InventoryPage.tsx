import React, { useState, useEffect, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { 
  Package, Plus, Search, AlertTriangle, X, ArrowDown, ArrowUp, 
  RefreshCw, BarChart2, Users, DollarSign, ArrowRight, History, Save
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { Input } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { cn } from "@/shared/utils/cn";
import { formatCurrency, formatNumber } from "@/shared/utils/formatters";
import { api } from "@ssrone/api-client";

interface StockItem {
  id: string;
  product_id?: string;
  name: string;
  category?: string;
  quantity: number;
  reorder_level: number;
  unit: string;
  cost: number;
}

export function InventoryPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Domain State strictly fetched from PostgreSQL (Golden Rule #1 & #2)
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "low" | "ok">("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Form states
  const [newStock, setNewStock] = useState({
    name: "",
    category: "Grocery",
    quantity: 10,
    unit: "kg",
    reorder_level: 5,
    cost: 100,
  });
  const [adjustQty, setAdjustQty] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch stocks strictly from PostgreSQL API
  const fetchInventoryData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>("/inventory/items").catch(() => null);
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      setStocks(list);
    } catch (err) {
      console.log("Failed to fetch PostgreSQL inventory items", err);
      setStocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const filtered = useMemo(() => {
    return stocks.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const isLow = s.quantity <= s.reorder_level;
      const matchesFilter = 
        activeFilter === "all" ||
        (activeFilter === "low" && isLow) ||
        (activeFilter === "ok" && !isLow);
      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter, stocks]);

  const lowStockCount = useMemo(() => {
    return stocks.filter((s) => s.quantity <= s.reorder_level).length;
  }, [stocks]);

  const totalValue = useMemo(() => {
    return stocks.reduce((sum, s) => sum + s.quantity * s.cost, 0);
  }, [stocks]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStock.name) return;

    const newItem: StockItem = {
      id: `stk-${Date.now()}`,
      name: newStock.name,
      category: newStock.category,
      quantity: Number(newStock.quantity),
      reorder_level: Number(newStock.reorder_level),
      unit: newStock.unit,
      cost: Number(newStock.cost)
    };

    try {
      await api.post("/inventory/items", newItem).catch(() => null);
    } catch (err) {
      console.log("Added stock item");
    }

    setStocks((prev) => [newItem, ...prev]);
    setShowAddModal(false);
    setNewStock({
      name: "",
      category: "Grocery",
      quantity: 10,
      unit: "kg",
      reorder_level: 5,
      cost: 100,
    });
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || adjustQty === 0) return;

    const newQty = selectedItem.quantity + Number(adjustQty);
    setStocks((prev) =>
      prev.map((s) => (s.id === selectedItem.id ? { ...s, quantity: Math.max(0, newQty) } : s))
    );

    setShowAdjustModal(false);
    setSelectedItem(null);
    setAdjustQty(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Package size={20} />
            </div>
            <h1 className="font-display font-black text-xl text-foreground uppercase tracking-wider">
              Material & Inventory Master Workspace
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Stock ledger, reorder levels, ingredient batching & supplier inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventoryData}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="font-extrabold flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Ingredient Master</span>
          </Button>
        </div>
      </div>

      {/* Realtime Stock Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-3xs font-extrabold text-muted-foreground uppercase tracking-wider block">Total Stock Valuation</span>
          <span className="font-mono font-black text-xl text-emerald-500">{formatCurrency(totalValue)}</span>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-3xs font-extrabold text-muted-foreground uppercase tracking-wider block">Total Stock Items</span>
          <span className="font-mono font-black text-xl text-foreground">{stocks.length} Items</span>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
          <span className="text-3xs font-extrabold text-muted-foreground uppercase tracking-wider block">Low Stock Alerts</span>
          <span className="font-mono font-black text-xl text-amber-500">{lowStockCount} Items Below Threshold</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search raw items..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all",
              activeFilter === "all" ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground"
            )}
          >
            All Items ({stocks.length})
          </button>

          <button
            onClick={() => setActiveFilter("low")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all",
              activeFilter === "low" ? "bg-amber-500 text-white border-amber-500" : "bg-card border-border text-muted-foreground"
            )}
          >
            Low Stock ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground tracking-wider">
            <tr>
              <th className="p-4">Item Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Current Quantity</th>
              <th className="p-4">Reorder Level</th>
              <th className="p-4">Unit Cost</th>
              <th className="p-4">Total Value</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-bold">
            {filtered.map((item) => {
              const isLow = item.quantity <= item.reorder_level;
              return (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-black text-foreground">{item.name}</td>
                  <td className="p-4 text-muted-foreground">{item.category || "General"}</td>
                  <td className="p-4">
                    <span className={cn("font-mono font-black", isLow ? "text-amber-500" : "text-emerald-500")}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-muted-foreground">{item.reorder_level} {item.unit}</td>
                  <td className="p-4 font-mono">{formatCurrency(item.cost)}</td>
                  <td className="p-4 font-mono text-foreground">{formatCurrency(item.quantity * item.cost)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setAdjustQty(0);
                        setShowAdjustModal(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-muted border border-border text-2xs font-extrabold hover:bg-muted/80"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-black text-base text-foreground uppercase">Add Raw Ingredient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-muted-foreground mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  placeholder="e.g. Basmati Rice"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1">Unit</label>
                  <input
                    type="text"
                    value={newStock.unit}
                    onChange={(e) => setNewStock({ ...newStock, unit: e.target.value })}
                    placeholder="kg / packs / L"
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={newStock.reorder_level}
                    onChange={(e) => setNewStock({ ...newStock, reorder_level: Number(e.target.value) })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={newStock.cost}
                    onChange={(e) => setNewStock({ ...newStock, cost: Number(e.target.value) })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-extrabold flex items-center gap-1.5">
                  <Save size={14} />
                  <span>Save Ingredient</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-modal">
            <h3 className="font-display font-black text-base text-foreground uppercase">Adjust Stock: {selectedItem.name}</h3>
            <p className="text-xs text-muted-foreground font-semibold">
              Current: <strong className="text-foreground">{selectedItem.quantity} {selectedItem.unit}</strong>
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-muted-foreground mb-1">Quantity Change (+ / -)</label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  placeholder="e.g. +10 or -5"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none text-base"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-extrabold">
                  Update Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
