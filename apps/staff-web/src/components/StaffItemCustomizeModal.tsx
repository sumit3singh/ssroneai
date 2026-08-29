import React, { useState } from "react";
import { X, Minus, Plus, ChefHat, Check, Sparkles, MessageSquare } from "lucide-react";

interface StaffItemCustomizeModalProps {
  item: any;
  onClose: () => void;
  onConfirm: (customizedItem: any) => void;
}

export const StaffItemCustomizeModal: React.FC<StaffItemCustomizeModalProps> = ({
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
    ? Number(selectedVariant.sellingPrice ?? selectedVariant.price ?? item.selling_price ?? item.base_price ?? 150)
    : Number(item.selling_price ?? item.base_price ?? 150);

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + getAddonPrice(a), 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * qty;

  const toggleAddon = (addonOpt: any) => {
    const exists = selectedAddons.some((a) => a.id === addonOpt.id || a.name === addonOpt.name);
    if (exists) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addonOpt.id && a.name !== addonOpt.name));
    } else {
      setSelectedAddons([...selectedAddons, addonOpt]);
    }
  };

  const handleAdd = () => {
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${item.is_veg !== false && item.isVeg !== false ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                {item.is_veg !== false && item.isVeg !== false ? "VEG" : "NON-VEG"}
              </span>
              <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-900 dark:text-white">
                <ChefHat className="text-indigo-600 dark:text-indigo-400 shrink-0" size={18} /> {item.name}
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">{item.description || "Customize portion size, extra toppings, and cooking notes"}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Portion / Size Selection */}
        {variantGroups.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
              1. Select Portion / Size ({variantGroups[0].name || "Size"})
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(variantGroups[0].options || []).map((opt: any, idx: number) => {
                const isSelected = selectedVariant?.id === opt.id || selectedVariant?.name === opt.name;
                const price = Number(opt.sellingPrice ?? opt.price ?? opt.base_price ?? 0);
                return (
                  <button
                    key={opt.id || opt.name || idx}
                    type="button"
                    onClick={() => setSelectedVariant(opt)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500/40"
                    }`}
                  >
                    <span className="text-xs truncate w-full text-center">{opt.name}</span>
                    <span className={`font-mono text-xs mt-0.5 font-black ${isSelected ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`}>
                      ₹{price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Addon Groups */}
        {addonGroups.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
              2. Extra Crust & Addons
            </span>
            {addonGroups.map((ag: any) => (
              <div key={ag.id || ag.name} className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  {(ag.options || []).map((opt: any) => {
                    const isSelected = selectedAddons.some((a) => a.id === opt.id || a.name === opt.name);
                    const dynamicPrice = getAddonPrice(opt);
                    return (
                      <button
                        key={opt.id || opt.name}
                        type="button"
                        onClick={() => toggleAddon(opt)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-500/40"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"}`}>
                            {isSelected && <Check size={12} />}
                          </span>
                          <span className="truncate text-xs">{opt.name}</span>
                        </span>
                        <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
                          +₹{dynamicPrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Special Cooking Note / Remarks */}
        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
            <MessageSquare size={11} /> Cooking Remarks / Note for Kitchen
          </label>
          <input
            type="text"
            placeholder="e.g. Less spicy, serve extra hot, no onions..."
            value={kitchenNote}
            onChange={(e) => setKitchenNote(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Footer Quantity Stepper & Add Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="font-mono font-bold text-sm w-6 text-center text-slate-900 dark:text-white">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
          >
            <Sparkles size={14} />
            <span>Add to Order · ₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffItemCustomizeModal;
