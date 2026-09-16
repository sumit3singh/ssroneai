import React from "react";
import { X, BookOpen } from "lucide-react";

interface KDSRecipeModalProps {
  itemName: string | null;
  onClose: () => void;
}

export function KDSRecipeModal({ itemName, onClose }: KDSRecipeModalProps) {
  if (!itemName) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              {itemName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Recipe Knowledge Base
            </p>
          </div>
        </div>

        <div className="p-8 text-center space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No recipe instructions configured for this item.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recipes can be linked to menu items directly in Admin Web → Menu Master.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#103B2B] hover:bg-[#0d2f22] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default KDSRecipeModal;
