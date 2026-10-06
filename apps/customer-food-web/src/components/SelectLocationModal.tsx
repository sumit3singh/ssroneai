import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Store, ChevronRight, X, Check } from "lucide-react";
import type { BranchInfo } from "@ssrone/api-client";
import { cn } from "@/lib/utils";

interface SelectLocationModalProps {
  isOpen: boolean;
  branches: BranchInfo[];
  currentBranchCode?: string;
  onSelectBranch: (branchCode: string) => void;
  onClose?: () => void;
}

export const SelectLocationModal = ({
  isOpen,
  branches,
  currentBranchCode,
  onSelectBranch,
  onClose,
}: SelectLocationModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-sm bg-white border border-[#E8E3DC] rounded-3xl p-6 shadow-2xl z-10 overflow-hidden text-[#2D241E] max-h-[85vh] flex flex-col font-sans"
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F8F6F2] hover:bg-[#E8E3DC] text-[#7A746B] hover:text-[#2D241E] flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#9E6B38]/10 text-[#9E6B38] mb-3 mx-auto shrink-0 border border-[#9E6B38]/20 shadow-xs">
            <MapPin className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="font-serif text-lg font-bold text-center mb-1 text-[#2D241E]">
            Select Restaurant Location
          </h3>
          <p className="text-xs text-[#7A746B] text-center mb-4 leading-relaxed">
            Choose your dining outlet to view menu items and order.
          </p>

          {/* List of Outlets */}
          <div className="overflow-y-auto space-y-2.5 pr-0.5 mb-2 flex-1">
            {branches.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#7A746B]">
                Loading available locations
              </div>
            ) : (
              branches.map((b) => {
                const isSelected = b.code === currentBranchCode;
                return (
                  <button
                    key={b.code}
                    onClick={() => onSelectBranch(b.code)}
                    className={cn(
                      "w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between group cursor-pointer",
                      isSelected
                        ? "border-[#9E6B38] bg-[#9E6B38]/5 shadow-xs"
                        : "border-[#E8E3DC] hover:border-[#9E6B38]/40 hover:bg-[#F8F6F2]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={cn(
                          "p-2.5 rounded-xl shrink-0 transition-colors",
                          isSelected
                            ? "bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white"
                            : "bg-[#F8F6F2] text-[#7A746B] group-hover:text-[#9E6B38]"
                        )}
                      >
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#2D241E] leading-snug break-words">
                          {b.name}
                        </h4>
                        <span className="text-[11px] text-[#7A746B] break-words block mt-0.5">
                          {b.address || `Branch: ${b.code}`}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isSelected ? (
                        <span className="text-[11px] bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#7A746B] group-hover:text-[#9E6B38] group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SelectLocationModal;
