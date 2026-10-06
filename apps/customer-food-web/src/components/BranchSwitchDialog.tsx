import { motion, AnimatePresence } from "framer-motion";
import { Store, X, Check, ArrowRight } from "lucide-react";
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
          className="relative w-full max-w-md bg-white border border-[#E8E3DC] rounded-3xl p-6 shadow-2xl z-10 overflow-hidden text-[#2D241E] font-sans"
        >
          {/* Close Icon */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F8F6F2] text-[#7A746B] hover:text-[#2D241E] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#9E6B38]/10 text-[#9E6B38] mb-4 mx-auto border border-[#9E6B38]/20 shadow-xs">
            <Store className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="font-serif text-xl font-bold text-center mb-2 text-[#2D241E]">
            Switch Restaurant Location?
          </h3>

          <p className="text-sm text-[#7A746B] text-center mb-5 leading-relaxed">
            Are you sure you want to switch to{" "}
            <span className="font-bold text-[#2D241E]">
              {targetBranch.name} ({targetBranch.code})
            </span>
            ? Available menu items, offers, and cart items are specific to each store outlet.
          </p>

          {currentBranchName && (
            <div className="bg-[#F8F6F2] rounded-2xl p-3.5 mb-6 text-xs flex items-center justify-around border border-[#E8E3DC]">
              <div className="text-center">
                <span className="text-[#7A746B] block text-[10px] uppercase font-bold tracking-wider">Current Outlet</span>
                <span className="font-semibold text-[#2D241E] break-words block mt-0.5">{currentBranchName}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9E6B38] shrink-0" />
              <div className="text-center">
                <span className="text-[#2D241E] block text-[10px] uppercase font-bold tracking-wider">New Outlet</span>
                <span className="font-bold text-[#2D241E] break-words block mt-0.5">{targetBranch.name}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full border border-[#E8E3DC] text-[#2D241E] font-semibold hover:bg-[#F8F6F2] transition text-sm cursor-pointer"
            >
              No, Keep Current
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white font-bold hover:opacity-95 shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Yes, Switch Outlet
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BranchSwitchDialog;

