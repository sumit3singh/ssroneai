import React, { useState } from "react";
import {
  Users,
  Clock,
  Calendar,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Receipt,
  Award
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS } from "@/stores/useStaffPOSStore";

interface StaffLedgerViewProps {
  authName: string;
  branchName: string;
  onBackToDashboard: () => void;
}

export const StaffLedgerView: React.FC<StaffLedgerViewProps> = ({
  authName,
  branchName,
  onBackToDashboard,
}) => {
  const store = useStaffPOS();
  const [isPunchedIn, setIsPunchedIn] = useState(true);
  const [punchTime, setPunchTime] = useState("09:00 AM");

  const togglePunch = () => {
    sound.kotDispatched();
    setIsPunchedIn(!isPunchedIn);
    if (!isPunchedIn) {
      setPunchTime(
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#0B3B2C]/10">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onBackToDashboard();
          }}
          className="px-4 py-2 rounded-2xl bg-white border border-[#0B3B2C]/15 text-[#0B3B2C] hover:bg-[#E8F4EC] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Staff Hub</span>
        </button>

        <span className="text-xs font-mono font-bold text-[#0B3B2C]/70">
          Staff ID: #EMP-2026-08 • {branchName || "Baithak Cafe"}
        </span>
      </div>

      {/* Staff Profile & Attendance Hero Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#0B3B2C]/12 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0B3B2C] text-[#E5A93C] flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
            {authName ? authName.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-[#0B3B2C]">{authName || "Aman Singh"}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isPunchedIn ? "bg-[#E8F4EC] text-[#0B3B2C] border border-[#0B3B2C]/20" : "bg-slate-100 text-slate-600"
              }`}>
                {isPunchedIn ? "ON SHIFT" : "OFF DUTY"}
              </span>
            </div>
            <p className="text-xs text-[#0B3B2C]/70 font-medium mt-1">
              Floor Captain & POS Cashier • Morning Shift (9:00 AM - 6:00 PM)
            </p>
          </div>
        </div>

        {/* Punch In / Out Button */}
        <button
          type="button"
          onClick={togglePunch}
          className={`min-h-[46px] px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-sm active:scale-95 flex items-center gap-2 ${
            isPunchedIn
              ? "bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300"
              : "bg-[#0B3B2C] hover:bg-[#082b20] text-white shadow-[#0B3B2C]/20"
          }`}
        >
          <Clock size={16} />
          <span>{isPunchedIn ? "Punch Out Shift" : "Punch In Shift"}</span>
        </button>
      </div>

      {/* Shift Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-white border border-[#0B3B2C]/10 shadow-xs">
          <span className="text-[10px] font-bold text-[#0B3B2C]/60 uppercase tracking-wider block">Today Punch In</span>
          <span className="text-xl font-black font-mono text-[#0B3B2C] mt-1 block">{punchTime}</span>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border border-[#0B3B2C]/10 shadow-xs">
          <span className="text-[10px] font-bold text-[#0B3B2C]/60 uppercase tracking-wider block">Shift Hours</span>
          <span className="text-xl font-black font-mono text-[#0B3B2C] mt-1 block">4.5 Hrs</span>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border border-[#0B3B2C]/10 shadow-xs">
          <span className="text-[10px] font-bold text-[#0B3B2C]/60 uppercase tracking-wider block">Cash In Hand</span>
          <span className="text-xl font-black font-mono text-[#E5A93C] mt-1 block">₹1,840</span>
        </div>

        <div className="p-4.5 rounded-2xl bg-white border border-[#0B3B2C]/10 shadow-xs">
          <span className="text-[10px] font-bold text-[#0B3B2C]/60 uppercase tracking-wider block">Tips Recorded</span>
          <span className="text-xl font-black font-mono text-[#0B3B2C] mt-1 block">₹250</span>
        </div>
      </div>

      {/* Recent Shift History */}
      <div className="bg-white rounded-3xl border border-[#0B3B2C]/12 shadow-sm overflow-hidden space-y-3 p-5">
        <h3 className="font-extrabold text-sm text-[#0B3B2C] flex items-center gap-2">
          <Calendar size={18} className="text-[#E5A93C]" />
          <span>Attendance & Payout Logs (Last 7 Days)</span>
        </h3>

        <div className="divide-y divide-[#0B3B2C]/10 text-xs">
          {[
            { date: "Today (31 Oct 2026)", shift: "Morning Shift", in: punchTime, out: "--", hours: "4.5 Hrs", status: "Active" },
            { date: "Yesterday (30 Oct 2026)", shift: "Full Shift", in: "09:02 AM", out: "06:15 PM", hours: "9.2 Hrs", status: "Approved" },
            { date: "29 Oct 2026", shift: "Full Shift", in: "08:55 AM", out: "06:05 PM", hours: "9.1 Hrs", status: "Approved" },
            { date: "28 Oct 2026", shift: "Evening Shift", in: "01:00 PM", out: "10:30 PM", hours: "9.5 Hrs", status: "Approved" },
            { date: "27 Oct 2026", shift: "Weekly Off", in: "--", out: "--", hours: "0 Hrs", status: "Leave / Off" },
          ].map((log, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-[#0B3B2C]">
              <div>
                <span className="font-bold block">{log.date}</span>
                <span className="text-[11px] text-[#0B3B2C]/60 font-mono">In: {log.in} • Out: {log.out}</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold block">{log.hours}</span>
                <span className="text-[10px] text-[#0B3B2C] bg-[#E8F4EC] px-2 py-0.5 rounded-full font-bold uppercase">{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

