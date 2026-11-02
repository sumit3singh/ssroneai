import React from "react";
import { Utensils, Check, Plus, X, ShoppingBag, Clock, Sparkles } from "lucide-react";
import { RunningOrder } from "./ActiveOrdersTracker";
import { api } from "@ssrone/api-client";
import { sound } from "@/utils/audioFeedback";

interface ActiveTableModalProps {
  isOpen: boolean;
  order: RunningOrder | null;
  tableName: string;
  onClose: () => void;
  onAddMoreItems: (tableNumber: string) => void;
  onMarkServed: () => void;
}

export const ActiveTableModal: React.FC<ActiveTableModalProps> = ({
  isOpen,
  order,
  tableName,
  onClose,
  onAddMoreItems,
  onMarkServed,
}) => {
  if (!isOpen) return null;

  const handleServeOrder = async () => {
    sound.kotDispatched();
    if (order && order.id) {
      try {
        const numId = parseInt(String(order.id).replace(/\D/g, ""), 10);
        await api.patch(`/orders/${numId || order.id}/status?status=served`);
      } catch (err) {
        console.warn("Update status error:", err);
      }
    }
    onMarkServed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#F8F6F0] border border-[#0B3B2C]/15 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Luxury Deep Forest Green Header */}
        <div className="bg-[#0B3B2C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#E5A93C] shadow-inner">
              <Utensils size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E5A93C] text-[#0B3B2C]">
                  OCCUPIED
                </span>
                <h3 className="text-base font-black tracking-wide">
                  Table {tableName}
                </h3>
              </div>
              <p className="text-xs text-white/70 font-mono mt-0.5">
                {order?.order_number || "Live Dining Session"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Running Items List */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {order && order.items && order.items.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#0B3B2C]/70 pb-1">
                <span>Ordered Items ({order.items.length})</span>
                <span className="font-mono text-[11px] flex items-center gap-1 text-[#0B3B2C]">
                  <Clock size={12} /> Live Kitchen Sync
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {order.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[#0B3B2C]/10 flex items-center justify-between shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#0B3B2C] bg-[#E8F4EC] px-2 py-0.5 rounded-lg border border-[#0B3B2C]/15">
                          {it.quantity}x
                        </span>
                        <span className="font-bold text-xs text-[#0B3B2C]">
                          {it.product_name || it.item_name}
                        </span>
                      </div>
                      {it.selected_variant && (
                        <p className="text-[11px] text-[#0B3B2C]/70 font-mono font-semibold pl-8">
                          Option: {it.selected_variant}
                        </p>
                      )}
                      {it.selected_addons && it.selected_addons.length > 0 && (
                        <p className="text-[11px] text-[#0B3B2C]/70 font-mono font-semibold pl-8">
                          + {it.selected_addons.join(", ")}
                        </p>
                      )}
                      {it.kitchen_note && (
                        <p className="text-[11px] text-[#E5A93C] font-semibold italic pl-8">
                          "{it.kitchen_note}"
                        </p>
                      )}
                    </div>

                    <span className="font-mono text-xs font-black text-[#0B3B2C]">
                      ₹{it.line_total || it.total_price || ((it.unit_price || 0) * (it.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Summary */}
              <div className="p-4 rounded-2xl bg-white border border-[#0B3B2C]/12 space-y-1.5 font-mono text-xs text-[#0B3B2C]/80 shadow-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#0B3B2C]/60">
                  <span>GST (5%):</span>
                  <span>₹{order.total_tax}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#0B3B2C] pt-2 border-t border-[#0B3B2C]/10">
                  <span>Total Running Bill:</span>
                  <span className="text-[#0B3B2C]">₹{order.grand_total}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center space-y-2 bg-white rounded-2xl border border-dashed border-[#0B3B2C]/20">
              <ShoppingBag size={32} className="mx-auto text-[#0B3B2C]/30" />
              <p className="text-xs font-bold text-[#0B3B2C]/70">No active items for Table {tableName}.</p>
            </div>
          )}
        </div>

        {/* Modal Footer Action Buttons */}
        <div className="p-5 pt-0 bg-[#F8F6F0] grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              sound.tap();
              onAddMoreItems(tableName);
            }}
            className="w-full bg-white hover:bg-[#E8F4EC] text-[#0B3B2C] border-2 border-[#0B3B2C] font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-98"
          >
            <Plus size={16} />
            <span>+ Add More Items</span>
          </button>

          <button
            onClick={handleServeOrder}
            className="w-full bg-[#0B3B2C] hover:bg-[#082b20] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-[#0B3B2C]/20 cursor-pointer transition-all active:scale-98"
          >
            <Check size={16} />
            <span>Mark Served</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveTableModal;

