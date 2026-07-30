export const posFeatureFlags = {
  enableQROrdering: true,
  enableLoyaltyProgram: true,
  enableKitchenDisplay: true,
  enableHappyHourPricing: true,
  enableOfflineSync: true,
  enableSplitBilling: true,
  enableHoldBills: true
} as const;

export type POSFeatureFlag = keyof typeof posFeatureFlags;

export const isFeatureEnabled = (flag: POSFeatureFlag): boolean => {
  return posFeatureFlags[flag] ?? false;
};
