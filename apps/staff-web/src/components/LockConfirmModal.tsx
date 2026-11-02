import React from "react";
import { Lock, LogOut, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { sound } from "@/utils/audioFeedback";

interface LockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLock: () => void;
  staffName?: string;
  branchName?: string;
}

export const LockConfirmModal: React.FC<LockConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLock,
  staffName = "Staff",
  branchName = "Baithak Cafe",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#F8F6F0] border border-[#E8E4DA] text-slate-800 rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header (Deep Forest Green & Gold) */}
        <div className="p-4 sm:p-5 bg-[#0B3B2C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#144F3C] text-[#E5A93C] flex items-center justify-center shrink-0 shadow-xs border border-[#1C634C]">
              <Lock size={19} />
            </div>
            <div>
              <h3 className="font-black text-base text-white leading-tight">
                Lock POS Terminal?
              </h3>
              <p className="text-[11px] font-medium text-emerald-200/80">
                Touchscreen terminal protection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Are you sure you want to lock the touchscreen POS or switch staff? All open tables and saved orders will remain safe.
          </p>

          {/* Active Shift Profile Card */}
          <div className="p-3.5 rounded-2xl bg-[#E8F4EC] border border-[#C5E1CE] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0B3B2C] text-white flex items-center justify-center font-black text-sm shadow-xs">
                {staffName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  {staffName}
                </span>
                <span className="text-[10px] font-mono text-[#0B3B2C] font-bold block mt-0.5">
                  Active Shift • {branchName}
                </span>
              </div>
            </div>
            <ShieldCheck size={20} className="text-[#27AE60]" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-[#E8E4DA] flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="flex-1 min-h-[46px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-95"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onConfirmLock();
            }}
            className="flex-1 min-h-[46px] rounded-2xl bg-[#0B3B2C] hover:bg-[#072E22] text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-[#0B3B2C]/20 active:scale-95"
          >
            <Lock size={14} className="text-[#E5A93C]" />
            <span>Yes, Lock Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
