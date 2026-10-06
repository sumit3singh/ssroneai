import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Bike, Store, X, Check, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChangeOrderModeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddressSelect?: () => void;
  onOpenTableScan?: () => void;
}

export const ChangeOrderModeDialog: React.FC<ChangeOrderModeDialogProps> = ({
  isOpen,
  onClose,
  onOpenAddressSelect,
  onOpenTableScan,
}) => {
  const { orderMode, setOrderMode } = useAuthStore();
  const { toast } = useToast();
  const [pendingMode, setPendingMode] = useState<"dine-in" | "takeaway" | "delivery" | null>(null);

  if (!isOpen) return null;

  const currentMode = orderMode || "dine-in";

  const modeOptions = [
    {
      id: "dine-in" as const,
      title: "Dine-In",
      desc: "Fresh table service inside restaurant",
      icon: <Utensils className="w-5 h-5 text-[#9E6B38]" />,
      tag: "At Table",
    },
    {
      id: "takeaway" as const,
      title: "Takeaway",
      desc: "Order packed fresh for quick counter collection",
      icon: <Store className="w-5 h-5 text-[#9E6B38]" />,
      tag: "Counter Pickup",
    },
    {
      id: "delivery" as const,
      title: "Delivery",
      desc: "Order delivered hot to your doorstep or hostel",
      icon: <Bike className="w-5 h-5 text-[#9E6B38]" />,
      tag: "Home Delivery",
    },
  ];

  const handleSelectMode = (newMode: "dine-in" | "takeaway" | "delivery") => {
    if (newMode === currentMode) {
      onClose();
      return;
    }
    setPendingMode(newMode);
  };

  const handleConfirmSwitch = () => {
    if (!pendingMode) return;
    const chosen = pendingMode;
    setOrderMode(chosen);
    setPendingMode(null);
    onClose();

    toast({
      title: "Dining Mode Updated",
      description: `Switched to ${chosen.replace("-", " ").toUpperCase()}`,
    });

    if (chosen === "dine-in" && onOpenTableScan) {
      setTimeout(() => onOpenTableScan(), 150);
    } else if (chosen === "delivery" && onOpenAddressSelect) {
      setTimeout(() => onOpenAddressSelect(), 150);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-white border border-[#E8E3DC] rounded-3xl p-5 sm:p-6 shadow-2xl text-[#2D241E] overflow-hidden font-sans"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setPendingMode(null);
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F8F6F2] text-[#7A746B] hover:text-[#2D241E] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {!pendingMode ? (
            /* Mode Selection List */
            <>
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#9E6B38]/10 text-[#9E6B38] flex items-center justify-center mx-auto mb-2.5 border border-[#9E6B38]/20 shadow-xs">
                  <Utensils className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2D241E]">
                  Select Dining Mode
                </h3>
                <p className="text-xs text-[#7A746B] mt-0.5 leading-relaxed">
                  Choose how you want to receive your order
                </p>
              </div>

              <div className="space-y-2.5 mb-2">
                {modeOptions.map((opt) => {
                  const isCurrent = opt.id === currentMode;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectMode(opt.id)}
                      className={cn(
                        "w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between group cursor-pointer",
                        isCurrent
                          ? "border-[#9E6B38] bg-[#9E6B38]/5 shadow-xs"
                          : "border-[#E8E3DC] hover:border-[#9E6B38]/40 hover:bg-[#F8F6F2]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className={cn(
                            "p-2.5 rounded-xl shrink-0 transition-colors",
                            isCurrent
                              ? "bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white"
                              : "bg-[#F8F6F2] text-[#7A746B] group-hover:bg-[#9E6B38]/10 group-hover:text-[#9E6B38]"
                          )}
                        >
                          {opt.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-[#2D241E]">
                              {opt.title}
                            </h4>
                            <span className="text-[10px] font-semibold text-[#7A746B] bg-[#F8F6F2] border border-[#E8E3DC] px-2 py-0.5 rounded-full">
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A746B] break-words leading-tight mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span className="text-[11px] bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-[#7A746B] group-hover:text-[#9E6B38] group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Are You Sure? Confirmation Step */
            <div className="py-2 text-center space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#9E6B38]/10 text-[#9E6B38] flex items-center justify-center mx-auto border border-[#9E6B38]/20 shadow-xs">
                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-[#2D241E]">
                  Switch to {pendingMode.replace("-", " ").toUpperCase()}?
                </h3>
                <p className="text-xs text-[#7A746B] mt-1 max-w-xs mx-auto leading-relaxed">
                  Are you sure you want to change your dining mode from{" "}
                  <strong className="text-[#2D241E] uppercase">
                    {currentMode.replace("-", " ")}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-[#9E6B38] uppercase">
                    {pendingMode.replace("-", " ")}
                  </strong>
                  ?
                </p>
              </div>

              <div className="p-3.5 bg-[#F8F6F2] rounded-2xl text-[11px] text-[#7A746B] border border-[#E8E3DC] text-left leading-relaxed">
                {pendingMode === "dine-in" && (
                  <p>
                    <strong className="text-[#2D241E]">Dine-In Notice:</strong> You will be prompted to scan or verify your table QR sticker code so food is served at your table.
                  </p>
                )}
                {pendingMode === "takeaway" && (
                  <p>
                    <strong className="text-[#2D241E]">Takeaway Notice:</strong> Food will be packed for collection directly from the counter when ready.
                  </p>
                )}
                {pendingMode === "delivery" && (
                  <p>
                    <strong className="text-[#2D241E]">Delivery Notice:</strong> You will be prompted to confirm your delivery address for rider dispatch.
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingMode(null)}
                  className="flex-1 min-h-[44px] py-2.5 rounded-full border border-[#E8E3DC] text-[#2D241E] hover:bg-[#F8F6F2] text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSwitch}
                  className="flex-1 min-h-[44px] py-2.5 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] hover:opacity-95 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" /> Yes, Switch
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChangeOrderModeDialog;

