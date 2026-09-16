import React, { useState } from "react";
import { X, AlertOctagon, Search, Power, CheckCircle } from "lucide-react";

interface MenuItem86 {
  id: number;
  name: string;
  category: string;
  isAvailable: boolean;
}

interface KDS86ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KDS86ItemModal({ isOpen, onClose }: KDS86ItemModalProps) {
  if (!isOpen) return null;

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MenuItem86[]>([
    { id: 1, name: "Classic Chicken Burger", category: "Burgers", isAvailable: true },
    { id: 2, name: "Double Cheese Veg Burger", category: "Burgers", isAvailable: true },
    { id: 3, name: "Peri Peri French Fries", category: "Sides", isAvailable: false },
    { id: 4, name: "Crispy Chicken Nuggets (8pcs)", category: "Sides", isAvailable: true },
    { id: 5, name: "Cold Coffee Shake", category: "Beverages", isAvailable: true },
    { id: 6, name: "Paneer Tikka Pizza 12\"", category: "Pizza", isAvailable: false },
    { id: 7, name: "Chocolate Lava Cake", category: "Desserts", isAvailable: true },
  ]);

  const toggleAvailability = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col relative shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
            <AlertOctagon size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              86 OUT-OF-STOCK ITEM CONTROL
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Toggle ingredient & dish availability live across POS and Menu apps
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dish or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
          />
        </div>

        {/* List of Items */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                item.isAvailable
                  ? "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}
            >
              <div>
                <div className={`font-bold text-xs ${item.isAvailable ? "text-slate-900 dark:text-white" : "text-rose-500"}`}>
                  {item.name} {!item.isAvailable && <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase ml-1">(86 OUT OF STOCK)</span>}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">{item.category}</div>
              </div>

              <button
                onClick={() => toggleAvailability(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                  item.isAvailable
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                }`}
              >
                <Power size={13} />
                {item.isAvailable ? "Mark 86 Out-of-Stock" : "Restore In-Stock"}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#103B2B] hover:bg-[#0d2f22] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition cursor-pointer"
        >
          Save Availability Changes & Close
        </button>
      </div>
    </div>
  );
}

export default KDS86ItemModal;
