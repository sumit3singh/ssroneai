/**
 * ssrone ERP - Offline Conflict Resolution Engine
 * Handles strategy-driven resolution of offline transaction sync collisions.
 */

export type ResolutionStrategy = "ServerWins" | "ClientWins" | "FieldMerge" | "ManualReview";

export interface ConflictItem<T = any> {
  id: string | number;
  entity: string;
  localData: T;
  serverData: T;
  localTimestamp: string;
  serverTimestamp: string;
}

export interface ResolutionResult<T = any> {
  resolvedData: T;
  strategyUsed: ResolutionStrategy;
  requiresManualReview: boolean;
  notes: string;
}

export class OfflineConflictResolver {
  static resolve<T extends Record<string, any>>(
    conflict: ConflictItem<T>,
    defaultStrategy: ResolutionStrategy = "ServerWins"
  ): ResolutionResult<T> {
    const { localData, serverData, localTimestamp, serverTimestamp } = conflict;

    switch (defaultStrategy) {
      case "ServerWins":
        return {
          resolvedData: { ...serverData },
          strategyUsed: "ServerWins",
          requiresManualReview: false,
          notes: `Conflict resolved using ServerWins policy (Server timestamp: ${serverTimestamp}).`,
        };

      case "ClientWins":
        return {
          resolvedData: { ...localData },
          strategyUsed: "ClientWins",
          requiresManualReview: false,
          notes: `Conflict resolved using ClientWins policy (Client timestamp: ${localTimestamp}).`,
        };

      case "FieldMerge":
        const merged: Record<string, any> = { ...serverData };
        Object.keys(localData).forEach((key) => {
          if (localData[key] !== undefined && serverData[key] === undefined) {
            merged[key] = localData[key];
          }
        });
        return {
          resolvedData: merged as T,
          strategyUsed: "FieldMerge",
          requiresManualReview: false,
          notes: "Conflict resolved by merging non-overlapping fields.",
        };

      case "ManualReview":
      default:
        return {
          resolvedData: { ...serverData },
          strategyUsed: "ManualReview",
          requiresManualReview: true,
          notes: "Data collision detected. Flagged for manager review in System Settings.",
        };
    }
  }
}
