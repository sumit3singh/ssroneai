import React from "react";
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  Send,
  Printer,
  Sparkles,
  ShoppingBag,
  Users,
  MessageSquare,
  Flame,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS, OrderType } from "@/stores/useStaffPOSStore";

interface TouchOrderPadProps {
  isSubmitting: boolean;
  onDispatchKOT: () => void;
  onOpenPrintPreview: () => void;
  tables: Array<{ id: string | number; number: string }>;
  onSwitchTable: (tbl: string) => void;
}

const ORDER_PRESETS = [
  "⚡ Rush Order",
  "📦 Parcel Packing",
  "⭐ VIP Guest",
  "💧 Serve Water",
];

export const TouchOrderPad: React.FC<TouchOrderPadProps> = ({
  isSubmitting,
  onDispatchKOT,
  onOpenPrintPreview,
  tables,
  onSwitchTable,
}) => {
  const store = useStaffPOS();
  const [showTableSelect, setShowTableSelect] = React.useState(false);

  const subtotal = React.useMemo(() => {
    return store.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [store.cart]);

  const tax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + tax;

  const toggleOrderPreset = (preset: string) => {
    sound.tap();
    if (store.orderRemark.includes(preset)) {
      store.setOrderRemark(store.orderRemark.replace(preset, "").replace(/\s\s+/g, " ").trim());
    } else {
      store.setOrderRemark(store.orderRemark ? `${store.orderRemark}, ${preset}` : preset);
    }
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl space-y-4">
      {/* Top Header & Table Controls */}
      <div className="space-y-3 border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          {/* Table Switcher Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setShowTableSelect(!showTableSelect);
              }}
              className="min-h-[42px] px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-sky-600/20 cursor-pointer active:scale-95"
            >
              <Utensils size={15} />
              <span>TABLE {store.selectedTable}</span>
              <ChevronDown size={14} className={showTableSelect ? "rotate-180 transition" : "transition"} />
            </button>

            {/* Dropdown Popover */}
            {showTableSelect && (
              <div className="absolute left-0 top-12 z-50 bg-slate-950 border border-white/15 rounded-2xl p-2 shadow-2xl w-56 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold px-2 py-1 block">
                  Select Dining Table:
                </span>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {tables.map((t) => (
                    <button
                      key={t.id || t.number}
                      type="button"
                      onClick={() => {
                        onSwitchTable(t.number);
                        setShowTableSelect(false);
                      }}
                      className={`min-h-[36px] py-1 px-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                        store.selectedTable === t.number
                          ? "bg-sky-600 text-white"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {t.number}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guest Count Stepper */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 px-2 py-1 rounded-2xl">
            <button
              type="button"
              onClick={() => store.setGuestCount(store.guestCount - 1)}
              className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition active:scale-95"
            >
              <Minus size={13} />
            </button>
            <span className="text-xs font-mono font-bold text-slate-200 px-1 flex items-center gap-1">
              <Users size={12} className="text-sky-400" />
              {store.guestCount}
            </span>
            <button
              type="button"
              onClick={() => store.setGuestCount(store.guestCount + 1)}
              className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition active:scale-95"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Clear Cart Button */}
          {store.cart.length > 0 && (
            <button
              type="button"
              onClick={() => store.clearCart()}
              title="Clear Order Pad"
              className="w-8 h-8 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-rose-400 flex items-center justify-center cursor-pointer transition"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Order Type Chips */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-white/10">
          {(["dine_in", "takeaway", "delivery"] as OrderType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => store.setOrderType(type)}
              className={`min-h-[34px] py-1 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                store.orderType === type
                  ? "bg-slate-800 text-sky-400 border border-sky-500/40 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {type === "dine_in" ? "Dine-In" : type === "takeaway" ? "Takeaway" : "Delivery"}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 min-h-[180px] max-h-[340px] overflow-y-auto pr-1 space-y-2">
        {store.cart.length === 0 ? (
          <div className="py-14 text-center space-y-2.5">
            <div className="w-14 h-14 rounded-3xl bg-slate-950 border border-white/10 flex items-center justify-center mx-auto text-slate-600">
              <ShoppingBag size={28} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-300">Order Pad Empty</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Tap dishes on the menu catalog to add items for Table {store.selectedTable}.
            </p>
          </div>
        ) : (
          store.cart.map((item) => (
            <div
              key={item.cartKey}
              className="p-3 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between gap-2.5 shadow-inner"
            >
              {/* Item Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      item.isVeg ? "bg-emerald-400" : "bg-rose-500"
                    }`}
                  />
                  <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">
                    {item.name}
                  </h4>
                </div>

                {item.selectedVariant && (
                  <p className="text-[10px] text-sky-400 pl-4 font-mono font-medium truncate">
                    ↳ {item.selectedVariant.name}
                  </p>
                )}

                {item.selectedAddons && item.selectedAddons.length > 0 && (
                  <p className="text-[10px] text-emerald-400 pl-4 font-mono font-medium truncate">
                    ↳ + {item.selectedAddons.map((a) => a.name).join(", ")}
                  </p>
                )}

                {item.kitchenNote && (
                  <p className="text-[10px] text-amber-400 pl-4 italic truncate">
                    * {item.kitchenNote}
                  </p>
                )}

                <div className="mt-1 pl-4 flex items-center gap-1">
                  <span className="font-mono text-xs font-black text-sky-400">
                    ₹{item.unitPrice * item.quantity}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    (₹{item.unitPrice} each)
                  </span>
                </div>
              </div>

              {/* Large Touch Steppers: 40px hit area */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => store.updateQuantity(item.cartKey, -1)}
                  className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition active:scale-95 border border-white/10"
                >
                  <Minus size={16} />
                </button>

                <span className="w-7 text-center font-mono font-black text-sm text-white">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() => store.updateQuantity(item.cartKey, 1)}
                  className="w-10 h-10 rounded-xl bg-sky-600 text-white hover:bg-sky-500 flex items-center justify-center cursor-pointer transition active:scale-95 shadow-md shadow-sky-600/30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Waiter Preset Remarks & Free-form Note */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {ORDER_PRESETS.map((preset) => {
            const isSelected = store.orderRemark.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                onClick={() => toggleOrderPreset(preset)}
                className={`min-h-[32px] px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-950 border border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={store.orderRemark}
          onChange={(e) => store.setOrderRemark(e.target.value)}
          placeholder="Special kitchen note (e.g. Less spicy, pack 1 plate)..."
          className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      {/* Bill Breakdown & Massive Action Buttons */}
      <div className="pt-3 border-t border-white/10 space-y-3">
        {/* Price rows */}
        <div className="space-y-1 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>GST (5%):</span>
            <span>₹{tax}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-white/10">
            <span>Grand Total:</span>
            <span className="text-lg text-sky-400 font-mono">₹{grandTotal}</span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Thermal Preview Button */}
          <button
            type="button"
            disabled={store.cart.length === 0}
            onClick={onOpenPrintPreview}
            title="Preview Thermal Receipt / KOT"
            className="min-h-[52px] col-span-1 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition disabled:opacity-40 border border-white/10"
          >
            <Printer size={20} />
          </button>

          {/* Primary High-Impact FIRE KOT BUTTON */}
          <button
            type="button"
            disabled={store.cart.length === 0 || isSubmitting}
            onClick={onDispatchKOT}
            className="col-span-3 min-h-[52px] px-4 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-sky-600/30 cursor-pointer transition disabled:opacity-40"
          >
            <Send size={18} />
            <span>
              {isSubmitting
                ? "DISPATCHING KOT..."
                : `FIRE KOT TO KITCHEN (T${store.selectedTable})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
