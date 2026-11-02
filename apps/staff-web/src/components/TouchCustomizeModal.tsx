import React, { useState } from "react";
import { X, Minus, Plus, ChefHat, Sparkles, MessageSquare, Check, Flame } from "lucide-react";
import { sound } from "@/utils/audioFeedback";

interface TouchCustomizeModalProps {
  item: any;
  onClose: () => void;
  onConfirm: (customizedItem: any) => void;
}

const COMMON_PRESET_NOTES = [
  "⚡ Rush / Urgent",
  "🌶️ Extra Spicy",
  "🍃 Mild / Less Spicy",
  "🚫 No Onion Garlic",
  "📦 Parcel / Takeaway",
  "🧂 Less Salt",
  "🔥 Serve Hot",
  "🧊 Less Ice",
];

export const TouchCustomizeModal: React.FC<TouchCustomizeModalProps> = ({
  item,
  onClose,
  onConfirm,
}) => {
  const variantGroups = item.variantGroups || item.variant_groups || [];
  const addonGroups = item.addonGroups || item.addon_groups || [];

  const [selectedVariant, setSelectedVariant] = useState<any>(() => {
    if (variantGroups.length > 0 && variantGroups[0].options?.length > 0) {
      return variantGroups[0].options[0];
    }
    return null;
  });

  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [kitchenNote, setKitchenNote] = useState("");
  const [qty, setQty] = useState(1);

  const getAddonPrice = (addonOpt: any): number => {
    if (selectedVariant && selectedVariant.name) {
      const vName = selectedVariant.name;
      const vp = addonOpt.variantPrices || addonOpt.variant_prices;
      if (vp && typeof vp === "object" && vp[vName] !== undefined) {
        return Number(vp[vName]);
      }
    }
    return Number(addonOpt.price || 0);
  };

  const basePrice = selectedVariant
    ? Number(selectedVariant.sellingPrice ?? selectedVariant.price ?? item.selling_price ?? item.basePrice ?? 150)
    : Number(item.selling_price ?? item.basePrice ?? 150);

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + getAddonPrice(a), 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * qty;

  const toggleAddon = (addonOpt: any) => {
    sound.tap();
    const exists = selectedAddons.some((a) => a.id === addonOpt.id || a.name === addonOpt.name);
    if (exists) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addonOpt.id && a.name !== addonOpt.name));
    } else {
      setSelectedAddons([...selectedAddons, addonOpt]);
    }
  };

  const togglePresetNote = (preset: string) => {
    sound.tap();
    if (kitchenNote.includes(preset)) {
      setKitchenNote(kitchenNote.replace(preset, "").replace(/\s\s+/g, " ").trim());
    } else {
      setKitchenNote((prev) => (prev ? `${prev}, ${preset}` : preset));
    }
  };

  const handleAdd = () => {
    sound.itemAdd();
    onConfirm({
      ...item,
      selectedVariant,
      selectedAddons: selectedAddons.map((a) => ({ ...a, effectivePrice: getAddonPrice(a) })),
      kitchenNote: kitchenNote.trim(),
      unitPrice,
      totalPrice,
      quantity: qty,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-white/10 text-slate-100 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600/30 to-indigo-600/30 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <ChefHat size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    item.isVeg ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-rose-500 shadow-sm shadow-rose-500/50"
                  }`}
                />
                <h3 className="font-black text-base sm:text-lg text-white">
                  {item.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {item.description || "Customize portion, addons, and kitchen instructions"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Customization Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* 1. Portion / Size Selection */}
          {variantGroups.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <span>1. Select Portion / Size</span>
                <span className="text-sky-400">({variantGroups[0].name || "Size"})</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(variantGroups[0].options || []).map((vOpt: any) => {
                  const isSelected = selectedVariant?.id === vOpt.id || selectedVariant?.name === vOpt.name;
                  const vPrice = Number(vOpt.sellingPrice ?? vOpt.price ?? item.selling_price ?? 0);
                  return (
                    <button
                      key={vOpt.id || vOpt.name}
                      type="button"
                      onClick={() => {
                        sound.tap();
                        setSelectedVariant(vOpt);
                      }}
                      className={`min-h-[54px] p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? "bg-sky-600/20 border-sky-500 text-white shadow-lg shadow-sky-500/20 ring-1 ring-sky-500"
                          : "bg-slate-950 border-white/10 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs sm:text-sm">{vOpt.name}</span>
                        {isSelected && <Check size={14} className="text-sky-400" />}
                      </div>
                      <span className="font-mono text-xs font-black text-sky-400 mt-1">
                        ₹{vPrice}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Add-ons Selection */}
          {addonGroups.length > 0 && addonGroups[0].options?.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                2. Extras & Add-ons (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(addonGroups[0].options || []).map((aOpt: any) => {
                  const isChecked = selectedAddons.some((a) => a.id === aOpt.id || a.name === aOpt.name);
                  const effectivePrice = getAddonPrice(aOpt);
                  return (
                    <button
                      key={aOpt.id || aOpt.name}
                      type="button"
                      onClick={() => toggleAddon(aOpt)}
                      className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl border flex items-center justify-between transition cursor-pointer active:scale-[0.98] ${
                        isChecked
                          ? "bg-emerald-500/15 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500"
                          : "bg-slate-950 border-white/10 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                            isChecked
                              ? "bg-emerald-500 border-emerald-400 text-slate-950"
                              : "border-slate-600 bg-slate-900"
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold">{aOpt.name}</span>
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-400">
                        +₹{effectivePrice}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Waiter Quick Presets (One-tap speed) */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>3. Waiter Kitchen Remarks</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESET_NOTES.map((preset) => {
                const isActive = kitchenNote.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => togglePresetNote(preset)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95 ${
                      isActive
                        ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm"
                        : "bg-slate-950 border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Free-form Custom Note */}
            <div className="relative pt-1">
              <MessageSquare size={15} className="absolute left-3.5 top-5 text-slate-500" />
              <input
                type="text"
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                placeholder="Or type specific instructions for Chef..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* 4. Quantity Stepper & Quick Pills */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono block">
              4. Quantity
            </span>
            <div className="flex items-center justify-between gap-3">
              {/* Quick number pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[1, 2, 3, 4, 5, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      sound.step();
                      setQty(n);
                    }}
                    className={`w-10 h-10 rounded-xl text-xs font-black font-mono transition cursor-pointer ${
                      qty === n
                        ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                        : "bg-slate-950 border border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Large Stepper */}
              <div className="flex items-center gap-2 bg-slate-950 border border-white/10 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    sound.step();
                    setQty(Math.max(1, qty - 1));
                  }}
                  className="w-11 h-11 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-mono font-black text-base text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.step();
                    setQty(qty + 1);
                  }}
                  className="w-11 h-11 rounded-xl bg-sky-600 text-white hover:bg-sky-500 flex items-center justify-center cursor-pointer transition active:scale-95 shadow-md shadow-sky-600/30"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-white/10 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-sky-400">
              ₹{totalPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 min-h-[52px] px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 cursor-pointer transition"
          >
            <ChefHat size={18} />
            <span>Add to Order Pad • ₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
