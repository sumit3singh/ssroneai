import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchPublicTenantConfig,
  type TenantAppConfigPayload,
  type GlobalBrandingConfig,
  type FoodWebConfig,
} from "@ssrone/api-client";
import { useTenantBranchContext } from "./useTenantBranchContext";

// Fallback hardcoded defaults guaranteeing Zero-Ruination Protocol
const DEFAULT_BRANDING: GlobalBrandingConfig = {
  businessName: "Baithak Cafe",
  tagline: "Traditional Flavour, Modern Experience",
  logoUrl: "",
  primaryColor: "#E11D48",
  accentColor: "#F59E0B",
  phone: "+91 98765 43210",
  address: "Main Campus, Central University of Haryana, Mahendragarh",
  businessHours: "09:00 AM - 10:00 PM",
};

const DEFAULT_FOOD_CONFIG: FoodWebConfig = {
  banner: {
    imageUrl: "",
    headline: "Welcome to Our Kitchen",
    subtext: "Freshly crafted delicious meals prepared with love and care.",
  },
  features: {
    tableQrOrdering: true,
    takeaway: true,
    delivery: true,
    onlinePayment: true,
  },
  orderConfirmationMessage:
    "Thank you for dining with us! Your order has been placed directly with the kitchen.",
  hiddenCategories: [],
  hiddenItems: [],
  featuredItems: [],
};

export interface TenantAppConfigState {
  branding: GlobalBrandingConfig;
  banner: NonNullable<FoodWebConfig["banner"]>;
  features: NonNullable<FoodWebConfig["features"]>;
  orderConfirmationMessage: string;
  hiddenCategories: string[];
  hiddenItems: string[];
  featuredItems: string[];
  isDraft: boolean;
  loading: boolean;
}

/**
 * Utility to convert Hex color to Tailwind-compatible HSL string: "h s% l%"
 */
function hexToHsl(hex: string): string | null {
  if (!hex || typeof hex !== "string") return null;
  const clean = hex.replace(/^#/, "").trim();
  if (clean.length !== 6) return null;

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const useTenantAppConfig = (): TenantAppConfigState => {
  const { tenantSlug, branchCode } = useTenantBranchContext();
  const [searchParams] = useSearchParams();

  const isDraft =
    searchParams.get("preview_draft") === "true" ||
    searchParams.get("draft") === "true";

  const [loading, setLoading] = useState(false);
  const [rawConfig, setRawConfig] = useState<TenantAppConfigPayload | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetchPublicTenantConfig(tenantSlug, branchCode, "customer-food-web", isDraft)
      .then((res) => {
        if (!isCancelled && res?.config) {
          setRawConfig(res.config);
        }
      })
      .catch(() => {
        // Safe fallback to defaults on error
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [tenantSlug, branchCode, isDraft]);

  // Merge loaded configuration with safe fallbacks
  const branding: GlobalBrandingConfig = useMemo(() => {
    return {
      ...DEFAULT_BRANDING,
      ...(rawConfig?.branding || {}),
    };
  }, [rawConfig]);

  const banner = useMemo(() => {
    return {
      ...DEFAULT_FOOD_CONFIG.banner,
      ...(rawConfig?.banner || {}),
    };
  }, [rawConfig]);

  const features = useMemo(() => {
    return {
      ...DEFAULT_FOOD_CONFIG.features,
      ...(rawConfig?.features || {}),
    };
  }, [rawConfig]);

  const orderConfirmationMessage =
    rawConfig?.orderConfirmationMessage ||
    DEFAULT_FOOD_CONFIG.orderConfirmationMessage!;

  const hiddenCategories = useMemo(
    () => rawConfig?.hiddenCategories || [],
    [rawConfig]
  );
  const hiddenItems = useMemo(
    () => rawConfig?.hiddenItems || [],
    [rawConfig]
  );
  const featuredItems = useMemo(
    () => rawConfig?.featuredItems || [],
    [rawConfig]
  );

  // Dynamic CSS token injection to root document
  useEffect(() => {
    if (branding.primaryColor) {
      const primaryHsl = hexToHsl(branding.primaryColor);
      if (primaryHsl) {
        document.documentElement.style.setProperty("--primary", primaryHsl);
        document.documentElement.style.setProperty("--ring", primaryHsl);
        document.documentElement.style.setProperty("--sidebar-primary", primaryHsl);
      }
      document.documentElement.style.setProperty(
        "--tenant-primary-color",
        branding.primaryColor
      );
    }

    if (branding.accentColor) {
      const accentHsl = hexToHsl(branding.accentColor);
      if (accentHsl) {
        document.documentElement.style.setProperty("--accent", accentHsl);
      }
      document.documentElement.style.setProperty(
        "--tenant-accent-color",
        branding.accentColor
      );
    }
  }, [branding.primaryColor, branding.accentColor]);

  return {
    branding,
    banner,
    features,
    orderConfirmationMessage,
    hiddenCategories,
    hiddenItems,
    featuredItems,
    isDraft,
    loading,
  };
};

export default useTenantAppConfig;
