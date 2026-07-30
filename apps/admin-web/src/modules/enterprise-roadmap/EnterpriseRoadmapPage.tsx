import { CheckCircle2, Circle, Sparkles, ArrowRight } from "lucide-react";
import { enterpriseRoadmap, getRoadmapProgress } from "./roadmap";

export function EnterpriseRoadmapPage() {
    const progress = getRoadmapProgress(enterpriseRoadmap);

    return (
        <div className="space-y-6 p-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                            <Sparkles size={16} />
                            Enterprise architecture roadmap
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight">{enterpriseRoadmap.project}</h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">{enterpriseRoadmap.goal}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background/70 px-4 py-3 text-sm">
                        <div className="text-muted-foreground">Version</div>
                        <div className="font-semibold">{enterpriseRoadmap.version}</div>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-background/70 p-4">
                        <div className="text-sm text-muted-foreground">Completion</div>
                        <div className="mt-2 text-3xl font-semibold">{progress.completionPercent}%</div>
                    </div>
                    <div className="rounded-xl border border-border bg-background/70 p-4">
                        <div className="text-sm text-muted-foreground">Completed phases</div>
                        <div className="mt-2 text-3xl font-semibold">{progress.completed}/{progress.total}</div>
                    </div>
                    <div className="rounded-xl border border-border bg-background/70 p-4">
                        <div className="text-sm text-muted-foreground">Pending</div>
                        <div className="mt-2 text-3xl font-semibold">{progress.pending}</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {enterpriseRoadmap.phases.map((phase) => {
                    const isCompleted = phase.status === "Completed";
                    const isInProgress = phase.status === "In Progress";

                    return (
                        <div key={phase.phase} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    {isCompleted ? (
                                        <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-500" />
                                    ) : isInProgress ? (
                                        <Sparkles className="mt-1 h-5 w-5 text-amber-500" />
                                    ) : (
                                        <Circle className="mt-1 h-5 w-5 text-muted-foreground" />
                                    )}
                                    <div>
                                        <div className="text-sm font-semibold text-muted-foreground">Phase {phase.phase}</div>
                                        <h2 className="text-lg font-semibold">{phase.title}</h2>
                                        {phase.summary ? <p className="mt-1 text-sm text-muted-foreground">{phase.summary}</p> : null}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm font-medium">
                                    <span>{phase.status}</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
