import { motion, AnimatePresence } from "framer-motion";
import { Store, X, Check } from "lucide-react";
import type { BranchInfo } from "@ssrone/api-client";

interface BranchSwitchDialogProps {
  isOpen: boolean;
  targetBranch: BranchInfo | null;
  currentBranchName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BranchSwitchDialog = ({
  isOpen,
  targetBranch,
  currentBranchName,
  onConfirm,
  onCancel,
}: BranchSwitchDialogProps) => {
  if (!isOpen || !targetBranch) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-popover border border-border rounded-2xl p-6 shadow-2xl z-10 overflow-hidden text-popover-foreground"
        >
          {/* Close Icon */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 mx-auto">
            <Store className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-display font-bold text-center mb-2">
            Switch Restaurant Location?
          </h3>

          <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
            Are you sure you want to switch to{" "}
            <span className="font-semibold text-foreground">
              {targetBranch.name} ({targetBranch.code})
            </span>
            ? Available menu items, offers, and cart items are specific to each store outlet.
          </p>

          {currentBranchName && (
            <div className="bg-muted/50 rounded-xl p-3 mb-6 text-xs flex items-center justify-around border border-border/50">
              <div className="text-center">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Current Outlet</span>
                <span className="font-medium text-foreground truncate max-w-[140px] block">{currentBranchName}</span>
              </div>
              <span className="text-primary font-bold">➔</span>
              <div className="text-center">
                <span className="text-primary block text-[10px] uppercase font-bold">New Outlet</span>
                <span className="font-semibold text-primary truncate max-w-[140px] block">{targetBranch.name}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition text-sm"
            >
              No, Keep Current
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-md transition text-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Yes, Switch Outlet
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BranchSwitchDialog;
