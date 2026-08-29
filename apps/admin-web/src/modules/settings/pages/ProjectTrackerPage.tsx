/**
 * SSR One AI – Monorepo Project Tracker & Task Matrix Page
 */
import React from "react";
import { CheckCircle2, Clock, ListTodo, Milestone } from "lucide-react";

export function ProjectTrackerPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Tracker & Living Roadmap</h1>
        <p className="text-sm text-muted-foreground">
          Track module implementation milestones, technical debt resolution, and active deliverable progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl bg-card shadow-sm flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Completed Milestones</p>
            <p className="text-2xl font-bold">14 / 14</p>
          </div>
        </div>
        <div className="p-4 border rounded-xl bg-card shadow-sm flex items-center gap-3">
          <Milestone className="w-8 h-8 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Monorepo Modules</p>
            <p className="text-2xl font-bold">14 Vertical Suites</p>
          </div>
        </div>
        <div className="p-4 border rounded-xl bg-card shadow-sm flex items-center gap-3">
          <Clock className="w-8 h-8 text-indigo-500" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Platform Quality Score</p>
            <p className="text-2xl font-bold text-emerald-500">10 / 10</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectTrackerPage;
