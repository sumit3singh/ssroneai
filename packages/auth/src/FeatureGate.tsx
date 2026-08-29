/**
 * SSR One AI – Subscription Feature Gate Component
 * Conditionally renders UI components based on tenant feature licensing & subscription tier.
 */
import React, { ReactNode } from "react";
import { useAuthStore } from "./index";

export type LicenseTier = "Starter" | "Professional" | "Enterprise";

export interface FeatureGateProps {
  featureKey?: string;
  minTier?: LicenseTier;
  children: ReactNode;
  fallback?: ReactNode;
}

const TIER_WEIGHTS: Record<LicenseTier, number> = {
  Starter: 1,
  Professional: 2,
  Enterprise: 3,
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  minTier = "Starter",
  children,
  fallback = null,
}) => {
  const { user } = useAuthStore();

  const currentTier: LicenseTier = (user?.tenant_plan as LicenseTier) || "Enterprise";
  const currentWeight = TIER_WEIGHTS[currentTier] || 3;
  const requiredWeight = TIER_WEIGHTS[minTier] || 1;

  if (currentWeight < requiredWeight) {
    return <>{fallback}</>;
  }

  if (featureKey) {
    const featureFlags: Record<string, boolean> = user?.feature_flags || {};
    if (featureFlags[featureKey] === false) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default FeatureGate;
