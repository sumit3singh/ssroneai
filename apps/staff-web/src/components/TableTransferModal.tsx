import React, { useState } from "react";
import { ArrowRightLeft, Layers, X, Check, AlertCircle } from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { TableItem } from "@/stores/useStaffPOSStore";

interface TableTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string;
  allTables: TableItem[];
  onConfirmTransfer: (sourceTable: string, targetTable: string, mode: "transfer" | "merge") => void;
}

export const TableTransferModal: React.FC<TableTransferModalProps> = ({
  isOpen,
  onClose,
  currentTable,
  allTables,
  onConfirmTransfer,
}) => {
  const [targetTable, setTargetTable] = useState("");
  const [opMode, setOpMode] = useState<"transfer" | "merge">("transfer");

  if (!isOpen) return null;

  const availableTables = allTables.filter(
    (t) => t.number !== currentTable && (opMode === "merge" ? t.status === "occupied" : t.status === "available")
  );

  const handleExecute = () => {
    if (!targetTable) return;
    sound.tap();
    onConfirmTransfer(currentTable, targetTable, opMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#F8F6F0] border border-[#E8E4DA] text-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E8E4DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B3B2C] text-[#E5A93C] flex items-center justify-center shrink-0 shadow-xs">
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                Table Transfer &amp; Merge
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Active Source: Table {currentTable}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-[#E8E4DA]">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setOpMode("transfer");
                setTargetTable("");
              }}
              className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                opMode === "transfer"
                  ? "bg-[#0B3B2C] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ArrowRightLeft size={13} />
              <span>Transfer Order</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.tap();
                setOpMode("merge");
                setTargetTable("");
              }}
              className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                opMode === "merge"
                  ? "bg-[#0B3B2C] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Layers size={13} />
              <span>Merge Tables</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600">
            {opMode === "transfer"
              ? `Move all running items and tickets from Table ${currentTable} to a clean, available table.`
              : `Combine Table ${currentTable} items into another active dining table.`}
          </p>

          {/* Target Table Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Select Destination Table *
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-[180px] overflow-y-auto p-1 bg-white rounded-2xl border border-[#E8E4DA]">
              {availableTables.length === 0 ? (
                <div className="col-span-4 p-4 text-center text-xs text-slate-400">
                  No {opMode === "transfer" ? "free" : "occupied"} tables available.
                </div>
              ) : (
                availableTables.map((t) => (
                  <button
                    key={t.number}
                    type="button"
                    onClick={() => {
                      sound.tap();
                      setTargetTable(t.number);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-mono font-black border transition cursor-pointer active:scale-95 ${
                      targetTable === t.number
                        ? "bg-[#0B3B2C] text-white border-[#0B3B2C] shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {t.number}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E8E4DA] flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[46px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!targetTable}
            onClick={handleExecute}
            className="flex-1 min-h-[46px] rounded-2xl bg-[#0B3B2C] hover:bg-[#072E22] active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 transition cursor-pointer shadow-md shadow-[#0B3B2C]/20"
          >
            <Check size={15} />
            <span>Confirm {opMode === "transfer" ? "Transfer" : "Merge"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
