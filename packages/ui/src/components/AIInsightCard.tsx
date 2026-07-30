/**
 * AIInsightCard - moved from apps/admin-web shared UI
 */
import { AlertTriangle, Info, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import type { InsightCard } from "@ssr-one-ai/types";
import { cn } from "@ssr-one-ai/utils";

const PRIORITY_CONFIG = {
    info: { icon: Info, color: "hsl(var(--ai-primary))" },
    warning: { icon: AlertTriangle, color: "#F59E0B" },
    critical: { icon: AlertCircle, color: "#EF4444" },
};

export function AIInsightCard({ insight }: { insight: InsightCard }) {
    const config = PRIORITY_CONFIG[insight.priority as keyof typeof PRIORITY_CONFIG];
    const Icon = config.icon;

    return (
        <div
            className="rounded-xl border p-4 transition-shadow hover:shadow-card-hover"
            style={{
                borderColor: `${config.color}30`,
                background: `linear-gradient(135deg, ${config.color}08, transparent)`,
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${config.color}15` }}
                >
                    <Icon size={16} style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Sparkles size={11} style={{ color: "hsl(var(--ai-primary))" }} />
                        <span className="text-2xs font-semibold uppercase tracking-wide" style={{ color: "hsl(var(--ai-primary))" }}>
                            AI Insight
                        </span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        {insight.description}
                    </p>
                    {insight.action_label && insight.action_url && (
                        <a
                            href={insight.action_url}
                            className="inline-flex items-center gap-1 text-xs font-medium hover:gap-1.5 transition-all"
                            style={{ color: config.color }}
                        >
                            {insight.action_label}
                            <ArrowRight size={12} />
                        </a>
                    )}
                </div>
                {insight.metric_value && (
                    <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold font-numeric text-foreground">{insight.metric_value}</p>
                        {insight.metric_change && (
                            <p className={cn("text-2xs font-medium", insight.metric_change.startsWith("+") ? "text-success" : "text-danger")}>
                                {insight.metric_change}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AIInsightCard;
