/**
 * KPICard - moved from apps/admin-web shared UI
 */
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@ssr-one-ai/utils";
import type { KPICard as KPICardType } from "@ssr-one-ai/types";

interface KPICardProps {
    data: KPICardType;
    icon: LucideIcon;
}

export function KPICard({ data, icon: Icon }: KPICardProps) {
    const TrendIcon = data.trend === "up" ? TrendingUp : data.trend === "down" ? TrendingDown : Minus;
    const trendColor =
        data.trend === "up" ? "text-success" : data.trend === "down" ? "text-danger" : "text-muted-foreground";

    return (
        <div className="kpi-card">
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{data.label}</p>
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${data.color}15` }}
                >
                    <Icon size={16} style={{ color: data.color }} />
                </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground font-numeric">{data.value}</p>
            {data.change !== null && (
                <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trendColor)}>
                    <TrendIcon size={13} />
                    <span>{data.change > 0 ? "+" : ""}{data.change}%</span>
                    {data.change_label && (
                        <span className="text-muted-foreground font-normal">{data.change_label}</span>
                    )}
                </div>
            )}
        </div>
    );
}

export default KPICard;
