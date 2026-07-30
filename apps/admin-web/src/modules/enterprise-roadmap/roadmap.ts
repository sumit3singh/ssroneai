export interface RoadmapPhase {
    phase: number;
    title: string;
    status: "Pending" | "In Progress" | "Completed";
    summary?: string;
}

export interface EnterpriseRoadmap {
    project: string;
    version: string;
    goal: string;
    phases: RoadmapPhase[];
}

export const enterpriseRoadmap: EnterpriseRoadmap = {
    project: "SSR One AI",
    version: "1.0 Enterprise Architecture Roadmap",
    goal: "Build a world-class AI-first ERP platform with enterprise-grade architecture, scalability, maintainability, security, and performance.",
    phases: [
        { phase: 1, title: "Repository & Monorepo Foundation", status: "Pending", summary: "Standardize workspace structure, shared configs, and package boundaries." },
        { phase: 2, title: "Feature Standardization", status: "Pending", summary: "Align modules around reusable patterns and common contracts." },
        { phase: 3, title: "Shared Packages & Design System", status: "Pending", summary: "Centralize UI, types, hooks, and platform primitives." },
        { phase: 4, title: "Routing, Navigation & Permissions", status: "Pending", summary: "Create a consistent, secure navigation model across apps." },
        { phase: 5, title: "Backend Clean Architecture", status: "Pending", summary: "Separate domain, application, and infrastructure responsibilities." },
        { phase: 6, title: "Metadata Driven Platform", status: "Pending", summary: "Enable dynamic entities, forms, workflows, and rules." },
        { phase: 7, title: "Enterprise Engines", status: "Pending", summary: "Introduce workflow, approval, notification, and orchestration engines." },
        { phase: 8, title: "AI Platform", status: "Pending", summary: "Layer copilots, guidance, and intelligent automation into the platform." },
        { phase: 9, title: "Plugin & SDK Architecture", status: "Pending", summary: "Open the platform for partner extensions and third-party integrations." },
        { phase: 10, title: "Performance & Scalability", status: "Pending", summary: "Optimize for growth, caching, concurrency, and resilience." },
        { phase: 11, title: "Security & DevOps", status: "Pending", summary: "Strengthen identity, compliance, deployment, and observability." },
        { phase: 12, title: "Documentation & Enterprise Quality", status: "Pending", summary: "Institutionalize engineering standards, quality gates, and adoption docs." },
    ],
};

export function getRoadmapProgress(roadmap: EnterpriseRoadmap) {
    const completed = roadmap.phases.filter((phase) => phase.status === "Completed").length;
    const inProgress = roadmap.phases.filter((phase) => phase.status === "In Progress").length;
    const pending = roadmap.phases.filter((phase) => phase.status === "Pending").length;
    const total = roadmap.phases.length;

    return {
        completed,
        inProgress,
        pending,
        total,
        completionPercent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
}
