import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/utils/api-client";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
import type { InsightCard } from "@/shared/types";

export function useAIInsights() {
  return useQuery({
    queryKey: ["ai", "insights"],
    queryFn: async () => {
      if (isMockSession()) {
        return mockDB.get<InsightCard>("insights");
      }
      try {
        return await api.get<InsightCard[]>("/ai/insights");
      } catch (err) {
        if (isMockSession()) {
          console.warn("Could not load insights from backend, falling back to mockDB", err);
          return mockDB.get<InsightCard>("insights");
        }
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
