import React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useZeroWaitOrderSync } from "../hooks/useZeroWaitOrderSync";

interface POSSyncStatusBarProps {
  branchId?: number | string;
  className?: string;
}

export const POSSyncStatusBar: React.FC<POSSyncStatusBarProps> = ({
  branchId = 1,
  className = "",
}) => {
  const { isOnline, pendingCount, drainOfflineQueue } = useZeroWaitOrderSync(branchId);
  const [isDraining, setIsDraining] = React.useState(false);

  const handleManualSync = async () => {
    if (isDraining) return;
    setIsDraining(true);
    try {
      await drainOfflineQueue();
    } finally {
      setIsDraining(false);
    }
  };

  if (!isOnline || pendingCount > 0) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-2xs font-mono font-bold select-none transition-all ${
          !isOnline
            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse"
            : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
        } ${className}`}
        title={
          !isOnline
            ? "Working completely offline. Orders are saved safely to local IndexedDB."
            : `${pendingCount} orders pending sync to central server.`
        }
      >
        {!isOnline ? <WifiOff size={11} className="text-amber-600 shrink-0" /> : <Wifi size={11} className="text-sky-600 shrink-0" />}
        <span>
          {!isOnline ? "Offline Mode" : "Syncing"} {pendingCount > 0 ? `(${pendingCount} queued)` : ""}
        </span>
        {isOnline && pendingCount > 0 && (
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isDraining}
            className="p-0.5 rounded hover:bg-muted cursor-pointer"
            title="Force Sync Offline Orders Now"
          >
            <RefreshCw size={10} className={isDraining ? "animate-spin" : ""} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-2xs font-mono font-bold select-none ${className}`}
      title="POS terminal is online and 100% synchronized with PostgreSQL backend"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
      <span className="hidden sm:inline">Live • Synced</span>
      <span className="sm:hidden">Online</span>
    </div>
  );
};
