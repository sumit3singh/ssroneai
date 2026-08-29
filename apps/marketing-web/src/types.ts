export interface VerticalSolution {
  id: string;
  name: string;
  badge: string;
  headline: string;
  description: string;
  accentColor: string;
  iconName: string;
  heroImage: string;
  keyFeatures: {
    title: string;
    description: string;
    iconName: string;
  }[];
  statMetric: {
    value: string;
    label: string;
  };
}

export interface PricingTier {
  id: string;
  name: string;
  tierBadge?: string;
  annualFeeINR: number;
  monthlyFeeINR: number;
  description: string;
  isPopular?: boolean;
  dbStrategy: string;
  features: string[];
  ctaLabel: string;
}

export interface DemoLeadForm {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  vertical: string;
  outletCount: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}
