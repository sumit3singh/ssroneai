import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@ssrone/utils";
import type { KPICard as KPICardType } from "@ssrone/types";

interface KPICardProps {
    data: KPICardType;
    icon: LucideIcon;
}

export function KPICard({ data, icon: Icon }: KPICardProps) {
    const TrendIcon = data.trend === "up" ? TrendingUp : data.trend === "down" ? TrendingDown : Minus;
    const trendColor =
        data.trend === "up" 
          ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" 
          : data.trend === "down" 
            ? "text-rose-600 bg-rose-500/10 border-rose-500/20" 
            : "text-slate-500 bg-slate-500/10 border-slate-500/20";

    return (
        <div className="group bg-card border border-border hover:border-slate-300 dark:hover:border-slate-700 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between cursor-pointer">
            <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">{data.label}</p>
                <div
                    className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 border border-border"
                    style={{ background: `${data.color}15`, borderColor: `${data.color}30` }}
                >
                    <Icon size={16} style={{ color: data.color }} />
                </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground font-mono tracking-tight">{data.value}</p>
            {data.change !== null && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                    <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.2 rounded-sm text-[11px] font-semibold border", trendColor)}>
                        <TrendIcon size={11} />
                        <span>{data.change > 0 ? "+" : ""}{data.change}%</span>
                    </div>
                    {data.change_label && (
                        <span className="text-[10px] text-muted-foreground font-normal truncate max-w-[120px]">{data.change_label}</span>
                    )}
                </div>
            )}
        </div>
    );
}

export default KPICard;
