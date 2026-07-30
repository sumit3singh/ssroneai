import { describe, expect, it } from "vitest";
import { enterpriseRoadmap, getRoadmapProgress } from "./roadmap";

describe("enterprise roadmap", () => {
    it("exposes all planned phases and reports zero progress until execution begins", () => {
        const progress = getRoadmapProgress(enterpriseRoadmap);

        expect(enterpriseRoadmap.project).toBe("SSR One AI");
        expect(enterpriseRoadmap.phases).toHaveLength(12);
        expect(progress.total).toBe(12);
        expect(progress.completed).toBe(0);
        expect(progress.inProgress).toBe(0);
        expect(progress.pending).toBe(12);
        expect(progress.completionPercent).toBe(0);
    });
});
