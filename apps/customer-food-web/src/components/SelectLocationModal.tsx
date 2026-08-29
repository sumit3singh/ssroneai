import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Store, ChevronRight, X } from "lucide-react";
import type { BranchInfo } from "@ssrone/api-client";

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
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-popover border border-border rounded-2xl p-6 shadow-2xl z-10 overflow-hidden text-popover-foreground max-h-[85vh] flex flex-col"
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3 mx-auto flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-display font-bold text-center mb-1">
            Select Restaurant Location
          </h3>
          <p className="text-xs text-muted-foreground text-center mb-5">
            Please choose a store location or outlet to view available menu items and order.
          </p>

          {/* List of Outlets */}
          <div className="overflow-y-auto space-y-2.5 pr-1 mb-2 flex-1">
            {branches.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Loading available store locations...
              </div>
            ) : (
              branches.map((b) => {
                const isSelected = b.code === currentBranchCode;
                return (
                  <button
                    key={b.code}
                    onClick={() => onSelectBranch(b.code)}
                    className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between group ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                        }`}
                      >
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground leading-tight">
                          {b.name}
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          {b.address || `Code: ${b.code}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground group-hover:translate-x-0.5"
                        }`}
                      />
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
