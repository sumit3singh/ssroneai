import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

interface IndianLiveClockProps {
  compact?: boolean;
  className?: string;
  showSeconds?: boolean;
  showDate?: boolean;
}

export const IndianLiveClock: React.FC<IndianLiveClockProps> = ({
  compact = false,
  className = "",
  showSeconds = true,
  showDate = true,
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date in Indian style e.g. "Mon, 14 Sep 2026"
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: compact ? undefined : "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(now);

  // Format time in Indian 12-hour style e.g. "03:02:15 PM"
  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(now);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/60 border border-border/80 font-mono text-2xs text-foreground select-none ${className}`}
        title={`Indian Standard Time (IST): ${formattedDate} ${formattedTime}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        {showDate && <span className="font-semibold text-muted-foreground">{formattedDate}</span>}
        {showDate && <span className="text-border">|</span>}
        <span className="font-black tracking-tight text-foreground">{formattedTime}</span>
        <span className="text-[9px] px-1 py-0.2 rounded bg-primary/10 text-primary font-bold">IST</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-card/90 border border-primary/20 shadow-2xs font-mono text-xs text-foreground select-none ${className}`}
      title={`Indian Standard Time (IST): ${formattedDate} ${formattedTime}`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        {showDate && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-foreground">
            <Calendar size={12} className="text-primary shrink-0" />
            {formattedDate}
          </span>
        )}
      </div>

      {showDate && <span className="text-border/80">|</span>}

      <div className="flex items-center gap-1 font-black text-foreground text-xs sm:text-[12.5px] tracking-tight">
        <Clock size={12} className="text-amber-500 shrink-0" />
        <span>{formattedTime}</span>
        <span className="text-[9px] px-1 py-0.2 ml-0.5 rounded bg-primary/15 text-primary font-extrabold uppercase">
          IST
        </span>
      </div>
    </div>
  );
};
