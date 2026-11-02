import React, { useState } from "react";
import { X, Minus, Plus, Utensils, Check, Sparkles } from "lucide-react";
import { sound } from "@/utils/audioFeedback";

interface PosCustomizationModalProps {
  item: any;
  onClose: () => void;
  onConfirm: (customizedItem: any) => void;
}

const PRESET_INSTRUCTIONS = [
  "⚡ Rush Order",
  "🌶️ Extra Spicy",
  "🍃 Mild / Less Spicy",
  "🚫 No Onion Garlic",
  "📦 Parcel Packing",
  "🧂 Less Salt",
  "🔥 Serve Very Hot",
  "🧊 Less Ice / Chilled",
];

const QUICK_QUANTITIES = [1, 2, 3, 4, 5];

export const PosCustomizationModal: React.FC<PosCustomizationModalProps> = ({
  item,
  onClose,
  onConfirm,
}) => {
  const variantGroups = item.variantGroups || item.variant_groups || [];
  const addonGroups = item.addonGroups || item.addon_groups || [];

  // Default to first variant
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
    ? Number(selectedVariant.sellingPrice ?? selectedVariant.price ?? item.selling_price ?? item.basePrice ?? 180)
    : Number(item.selling_price ?? item.basePrice ?? 180);

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

  const togglePresetInstruction = (preset: string) => {
    sound.tap();
    if (kitchenNote.includes(preset)) {
      setKitchenNote(kitchenNote.replace(preset, "").replace(/,\s*,/g, ",").replace(/^,\s*|,\s*$/g, "").trim());
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#F8F6F0] border border-[#E8E4DA] text-slate-800 rounded-[32px] w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Simple & Clean Header: Only Dish Name & Veg/Non-Veg, Zero Clutter */}
        <div className="p-4 sm:p-5 border-b border-[#E8E4DA] flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Veg / Non-Veg Indicator Icon */}
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                item.isVeg ? "border-emerald-600" : "border-rose-600"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  item.isVeg ? "bg-emerald-600" : "bg-rose-600"
                }`}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-base sm:text-lg text-slate-900 truncate">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                {item.description || "Delicate, fresh & freshly prepared"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition shrink-0 active:scale-95"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body: Only Clean Field Names, Zero Numbers, 100% User Friendly */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Form Section 1: Portion Size */}
          {variantGroups.length > 0 && variantGroups[0].options?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block">
                Portion Size
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {variantGroups[0].options.map((vOpt: any) => {
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
                      className={`min-h-[56px] p-3 rounded-2xl border-2 text-left flex items-center justify-between transition cursor-pointer active:scale-95 ${
                        isSelected
                          ? "bg-[#E8F4EC] border-[#0B3B2C] text-[#0B3B2C] shadow-xs"
                          : "bg-white border-[#E8E4DA] text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <span className="font-extrabold text-sm block leading-tight">{vOpt.name}</span>
                        <span className="font-mono text-xs font-bold text-slate-600 mt-0.5 block">₹{vPrice}</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                          isSelected ? "bg-[#0B3B2C] text-white" : "border border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Section 2: Add-ons (Optional) */}
          {addonGroups.length > 0 && addonGroups[0].options?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block">
                Add-ons
              </label>
              <div className="grid grid-cols-2 gap-2">
                {addonGroups[0].options.map((aOpt: any) => {
                  const isChecked = selectedAddons.some((a) => a.id === aOpt.id || a.name === aOpt.name);
                  const effectivePrice = getAddonPrice(aOpt);
                  return (
                    <button
                      key={aOpt.id || aOpt.name}
                      type="button"
                      onClick={() => toggleAddon(aOpt)}
                      className={`min-h-[46px] px-3 py-2 rounded-xl border-2 text-xs font-bold flex items-center justify-between transition cursor-pointer active:scale-95 ${
                        isChecked
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate">{aOpt.name}</span>
                      <span className="font-mono font-black text-xs text-emerald-700 shrink-0 ml-1">+₹{effectivePrice}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Section 3: Kitchen Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block">
              Kitchen Instructions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_INSTRUCTIONS.map((preset) => {
                const isActive = kitchenNote.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => togglePresetInstruction(preset)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95 ${
                      isActive
                        ? "bg-[#E8F4EC] text-[#0B3B2C] border-[#0B3B2C] font-extrabold shadow-2xs"
                        : "bg-white border-[#E8E4DA] text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Custom Notes Textbox */}
            <input
              type="text"
              value={kitchenNote}
              onChange={(e) => setKitchenNote(e.target.value)}
              placeholder="Or type specific preparation instructions..."
              className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E8E4DA] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] transition mt-1"
            />
          </div>

          {/* Form Section 4: Quantity & Quick Steppers (Modern Feature) */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block">
              Quantity
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#E8E4DA]">
              {/* Quick Select Buttons (Touchscreen Fast Speed) */}
              <div className="flex items-center gap-1.5">
                {QUICK_QUANTITIES.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      sound.step();
                      setQty(num);
                    }}
                    className={`w-9 h-9 rounded-xl font-mono text-xs font-extrabold cursor-pointer transition active:scale-95 ${
                      qty === num
                        ? "bg-[#0B3B2C] text-white shadow-xs"
                        : "bg-[#F8F6F0] border border-[#E8E4DA] text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Stepper [-] QTY [+] */}
              <div className="flex items-center gap-2 bg-[#F8F6F0] p-1 rounded-xl border border-[#E8E4DA] shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    sound.step();
                    setQty(Math.max(1, qty - 1));
                  }}
                  className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition font-bold"
                  title="Decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-mono font-black text-sm text-slate-900">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.step();
                    setQty(qty + 1);
                  }}
                  className="w-8 h-8 rounded-lg bg-[#0B3B2C] text-white hover:bg-[#072E22] flex items-center justify-center cursor-pointer transition font-bold shadow-xs"
                  title="Increase"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Sticky Bottom Action: Perfectly Visible, Never Cut Off */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-[#E8E4DA] flex items-center justify-between gap-3 shrink-0">
          <div className="leading-tight">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
              Item Total:
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#0B3B2C]">
              ₹{totalPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 min-h-[48px] px-6 rounded-2xl bg-[#0B3B2C] hover:bg-[#072E22] active:scale-95 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#0B3B2C]/20 cursor-pointer transition"
          >
            <Utensils size={16} className="text-[#E5A93C]" />
            <span>Add to Cart • ₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
