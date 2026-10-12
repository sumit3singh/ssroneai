import React, { useState, useEffect, useMemo } from "react";
import {
  Palette,
  Sparkles,
  Store,
  Truck,
  CreditCard,
  Globe,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button, Badge, PageHeader, PageContainer } from "@ssrone/ui";
import { toast } from "sonner";
import {
  fetchAdminAppConfig,
  saveDraftAppConfig,
  publishAppConfig,
  resetDraftAppConfig,
  fetchCustomDomains,
  registerCustomDomain,
  verifyCustomDomain,
  deleteCustomDomain,
  type CustomDomainRecord,
  getTenantSlug,
  getBranchCode,
} from "@ssrone/api-client";

import { BrandThemeSettings } from "../components/BrandThemeSettings";
import { BannerPromoSettings } from "../components/BannerPromoSettings";
import { StoreOperationsSettings } from "../components/StoreOperationsSettings";
import { DeliveryChargesSettings } from "../components/DeliveryChargesSettings";
import { PaymentTaxSettings } from "../components/PaymentTaxSettings";
import { CustomDomainSettings } from "../components/CustomDomainSettings";
import { LiveDevicePreview } from "../components/LiveDevicePreview";

type StudioSection =
  | "brand"
  | "banner"
  | "operations"
  | "delivery"
  | "payments"
  | "domains";

const STUDIO_SECTIONS: {
  id: StudioSection;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}[] = [
  {
    id: "brand",
    title: "Brand & Theme",
    icon: Palette,
    description: "Store name, logo, luxury color palettes & socials",
  },
  {
    id: "banner",
    title: "Hero & Promos",
    icon: Sparkles,
    description: "Headline, background photo & announcement ticker",
  },
  {
    id: "operations",
    title: "Store & Hours",
    icon: Store,
    description: "Emergency closure switch, operating hours & modes",
  },
  {
    id: "delivery",
    title: "Delivery & Fees",
    icon: Truck,
    description: "Packaging fee, delivery charge & order minimums",
  },
  {
    id: "payments",
    title: "Payments & Tax",
    icon: CreditCard,
    description: "GST percentage, Razorpay online & counter settlement",
  },
  {
    id: "domains",
    title: "Custom Domain",
    icon: Globe,
    description: "White-labeled domain & DNS verification",
  },
];

export const CustomizationStudioPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<StudioSection>("brand");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [configVersion, setConfigVersion] = useState(1);

  // Settings State
  const [branding, setBranding] = useState<Record<string, any>>({
    businessName: "Baithak Cafe",
    tagline: "Traditional Flavour, Modern Experience",
    logoUrl: "",
    primaryColor: "#EA580C",
    accentColor: "#F59E0B",
    phone: "+91 98765 43210",
    address: "Main Campus, Central University of Haryana",
    businessHours: "10:30 AM - 10:00 PM Daily",
    socialLinks: {
      whatsapp: "https://wa.me/919876543210",
      instagram: "https://instagram.com/baithakcafe",
    },
  });

  const [banner, setBanner] = useState<Record<string, any>>({
    headline: "Welcome to Our Kitchen",
    subtext: "Freshly crafted delicious meals prepared with love and care.",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80",
  });

  const [announcement, setAnnouncement] = useState<Record<string, any>>({
    enabled: true,
    text: "🎉 Flat 10% off on all online orders above ₹499! Mention at billing.",
    badgeText: "SPECIAL OFFER",
  });

  const [operatingHours, setOperatingHours] = useState<Record<string, any>>({
    enabled: true,
    openTime: "10:30",
    closeTime: "22:00",
    isManuallyClosed: false,
    closedMessage: "We are currently closed. We look forward to serving you soon!",
  });

  const [features, setFeatures] = useState<Record<string, any>>({
    tableQrOrdering: true,
    takeaway: true,
    delivery: true,
    onlinePayment: true,
  });

  const [charges, setCharges] = useState<Record<string, any>>({
    enablePackingCharge: true,
    packingChargeAmount: 10,
    enableDeliveryCharge: false,
    deliveryChargeAmount: 30,
  });

  const [deliverySettings, setDeliverySettings] = useState<Record<string, any>>({
    minOrderValue: 200,
  });

  const [taxSettings, setTaxSettings] = useState<Record<string, any>>({
    applyGst: false,
    gstRate: 5.0,
    pricesIncludeTax: true,
  });

  const [paymentOptions, setPaymentOptions] = useState<Record<string, any>>({
    enableRazorpay: false,
    enablePayAtCounter: true,
    enableCashOnDelivery: true,
    enableUpiQr: true,
  });

  const [onlineApproval, setOnlineApproval] = useState<Record<string, any>>({
    requireApprovalForTakeawayAndDelivery: true,
  });

  const [orderConfirmationMessage, setOrderConfirmationMessage] = useState(
    "Thank you for dining with us! Your order has been placed directly with the kitchen."
  );

  // Custom Domains
  const [domains, setDomains] = useState<CustomDomainRecord[]>([]);

  const tenantSlug = getTenantSlug() || "baithak-cafe";
  const branchCode = getBranchCode() || "BAITHAK-CUH";

  // Initial Data Load
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setLoading(true);
      try {
        const [globalRes, foodRes, domainList] = await Promise.allSettled([
          fetchAdminAppConfig("global"),
          fetchAdminAppConfig("customer-food-web"),
          fetchCustomDomains(),
        ]);

        if (!isMounted) return;

        // Global Branding
        if (globalRes.status === "fulfilled" && globalRes.value) {
          const cfg =
            globalRes.value.draft_config?.branding ||
            globalRes.value.published_config?.branding;
          if (cfg) {
            setBranding((prev) => ({ ...prev, ...cfg }));
          }
        }

        // Food Web Config
        if (foodRes.status === "fulfilled" && foodRes.value) {
          const foodDraft =
            foodRes.value.draft_config || foodRes.value.published_config || {};

          if (foodDraft.banner) setBanner((prev) => ({ ...prev, ...foodDraft.banner }));
          if (foodDraft.announcement)
            setAnnouncement((prev) => ({ ...prev, ...foodDraft.announcement }));
          if (foodDraft.operatingHours)
            setOperatingHours((prev) => ({ ...prev, ...foodDraft.operatingHours }));
          if (foodDraft.features) setFeatures((prev) => ({ ...prev, ...foodDraft.features }));
          if (foodDraft.charges) setCharges((prev) => ({ ...prev, ...foodDraft.charges }));
          if (foodDraft.deliverySettings)
            setDeliverySettings((prev) => ({ ...prev, ...foodDraft.deliverySettings }));
          if (foodDraft.taxSettings)
            setTaxSettings((prev) => ({ ...prev, ...foodDraft.taxSettings }));
          if (foodDraft.paymentOptions)
            setPaymentOptions((prev) => ({ ...prev, ...foodDraft.paymentOptions }));
          if (foodDraft.onlineApproval)
            setOnlineApproval((prev) => ({ ...prev, ...foodDraft.onlineApproval }));
          if (foodDraft.orderConfirmationMessage)
            setOrderConfirmationMessage(foodDraft.orderConfirmationMessage);

          setConfigVersion(foodRes.value.config_version || 1);
          setIsModified(foodRes.value.is_draft_modified);
        }

        // Custom Domains
        if (domainList.status === "fulfilled" && Array.isArray(domainList.value)) {
          setDomains(domainList.value);
        }
      } catch (err: any) {
        toast.error("Could not load customization settings", {
          description: err?.message || "Using active defaults",
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live preview URL
  const previewUrl = useMemo(() => {
    return `http://localhost:3000/t/${tenantSlug}/b/${branchCode}?preview_draft=true`;
  }, [tenantSlug, branchCode]);

  // Handle Draft Save
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const foodPayload = {
        banner,
        announcement,
        operatingHours,
        features,
        charges,
        deliverySettings,
        taxSettings,
        paymentOptions,
        onlineApproval,
        orderConfirmationMessage,
        branding,
      };

      const globalPayload = {
        branding,
      };

      await Promise.all([
        saveDraftAppConfig("global", globalPayload),
        saveDraftAppConfig("customer-food-web", foodPayload),
      ]);

      setIsModified(true);
      toast.success("Draft saved successfully! 💾", {
        description: "Your changes are ready to preview. Click 'Publish Live' to push to customers.",
      });
    } catch (err: any) {
      toast.error("Failed to save draft", {
        description: err?.message || "Please check your network connection.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Publish Live
  const handlePublishLive = async () => {
    if (
      !window.confirm(
        "Publish changes live to all connected customer food apps and website immediately?"
      )
    ) {
      return;
    }

    setIsPublishing(true);
    try {
      // First save latest state
      const foodPayload = {
        banner,
        announcement,
        operatingHours,
        features,
        charges,
        deliverySettings,
        taxSettings,
        paymentOptions,
        onlineApproval,
        orderConfirmationMessage,
        branding,
      };
      await Promise.all([
        saveDraftAppConfig("global", { branding }),
        saveDraftAppConfig("customer-food-web", foodPayload),
      ]);

      // Then publish both
      const [resGlobal, resFood] = await Promise.all([
        publishAppConfig("global"),
        publishAppConfig("customer-food-web"),
      ]);

      setConfigVersion(resFood.config_version);
      setIsModified(false);

      toast.success(`Published v${resFood.config_version} Live to Customers! 🎉`, {
        description: "Customer food web is now updated with your latest branding and settings.",
      });
    } catch (err: any) {
      toast.error("Failed to publish configuration", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle Discard
  const handleDiscardChanges = async () => {
    if (!window.confirm("Discard all unsaved changes and revert to live published settings?")) {
      return;
    }

    setIsResetting(true);
    try {
      const [resGlobal, resFood] = await Promise.all([
        resetDraftAppConfig("global"),
        resetDraftAppConfig("customer-food-web"),
      ]);

      if (resGlobal.published_config?.branding) {
        setBranding(resGlobal.published_config.branding);
      }
      const p = resFood.published_config || {};
      if (p.banner) setBanner(p.banner);
      if (p.announcement) setAnnouncement(p.announcement);
      if (p.operatingHours) setOperatingHours(p.operatingHours);
      if (p.features) setFeatures(p.features);
      if (p.charges) setCharges(p.charges);
      if (p.deliverySettings) setDeliverySettings(p.deliverySettings);
      if (p.taxSettings) setTaxSettings(p.taxSettings);
      if (p.paymentOptions) setPaymentOptions(p.paymentOptions);
      if (p.onlineApproval) setOnlineApproval(p.onlineApproval);
      if (p.orderConfirmationMessage) setOrderConfirmationMessage(p.orderConfirmationMessage);

      setIsModified(false);
      toast.info("Draft reset to live published settings.");
    } catch (err: any) {
      toast.error("Could not reset draft", { description: err?.message });
    } finally {
      setIsResetting(false);
    }
  };

  // Custom Domain Handlers
  const handleRegisterDomain = async (domain: string, targetApp: string) => {
    try {
      const created = await registerCustomDomain({
        domain,
        app_name: targetApp,
      });
      setDomains((prev) => [...prev, created]);
      toast.success(`Domain ${created.domain} registered! Add DNS records to activate.`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to register domain");
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const updated = await verifyCustomDomain(domainId);
      setDomains((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      if (updated.status === "verified") {
        toast.success(`Domain ${updated.domain} verified and active!`);
      } else {
        toast.warning(
          `DNS records pending: ${updated.error_message || "Retry in a few minutes after propagation"}`
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Verification check failed");
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!window.confirm("Are you sure you want to disconnect this custom domain?")) return;
    try {
      await deleteCustomDomain(domainId);
      setDomains((prev) => prev.filter((d) => d.id !== domainId));
      toast.success("Domain mapping removed.");
    } catch (err: any) {
      toast.error("Failed to delete domain");
    }
  };

  return (
    <PageContainer>
      {/* 1. Header with Status & Action Buttons */}
      <PageHeader
        title="Website & Food App Customization Studio"
        description="Design your customer-facing digital ordering experience with real-time live preview."
        icon={<Palette size={18} />}
        badge="Live Visual Engine"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs mr-1">
              <span className="text-muted-foreground font-mono">v{configVersion}</span>
              {isModified ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30">
                  Unpublished Changes
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                  Live Synced
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
              disabled={!isModified || isResetting}
              className="text-xs h-8 cursor-pointer"
            >
              <RotateCcw size={13} className="mr-1" />
              Discard
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="text-xs h-8 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <Save size={13} className="mr-1" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              size="sm"
              onClick={handlePublishLive}
              disabled={isPublishing}
              className="text-xs h-8 font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
            >
              <Send size={13} className="mr-1" />
              {isPublishing ? "Publishing..." : "Publish Live 🚀"}
            </Button>
          </div>
        }
      />

      {/* 2. Studio Category Navigation Tabs */}
      <div className="bg-card border border-border rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-xs">
        {STUDIO_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isCurrent = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon size={14} />
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main 2-Column Split Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
          {activeSection === "brand" && (
            <BrandThemeSettings
              branding={branding}
              onChange={(field, val) => {
                setBranding((prev) => ({ ...prev, [field]: val }));
                setIsModified(true);
              }}
              onApplyPalette={(primary, accent) => {
                setBranding((prev) => ({
                  ...prev,
                  primaryColor: primary,
                  accentColor: accent,
                }));
                setIsModified(true);
                toast.success("Theme palette applied!");
              }}
            />
          )}

          {activeSection === "banner" && (
            <BannerPromoSettings
              banner={banner}
              announcement={announcement}
              onBannerChange={(field, val) => {
                setBanner((prev) => ({ ...prev, [field]: val }));
                setIsModified(true);
              }}
              onAnnouncementChange={(field, val) => {
                setAnnouncement((prev) => ({ ...prev, [field]: val }));
                setIsModified(true);
              }}
            />
          )}

          {activeSection === "operations" && (
            <StoreOperationsSettings
              operatingHours={operatingHours}
              features={features}
              onlineApproval={onlineApproval}
              onOperatingHoursChange={(field, val) => {
                setOperatingHours((prev) => ({ ...prev, [field]: val }));
                setIsModified(true);
              }}
              onFeatureToggle={(key, val) => {
                setFeatures((prev) => ({ ...prev, [key]: val }));
                setIsModified(true);
              }}
              onApprovalToggle={(val) => {
                setOnlineApproval((prev) => ({
                  ...prev,
                  requireApprovalForTakeawayAndDelivery: val,
                }));
                setIsModified(true);
              }}
            />
          )}

          {activeSection === "delivery" && (
            <DeliveryChargesSettings
              charges={charges}
              deliverySettings={deliverySettings}
              onChargesChange={(field, val) => {
                setCharges((prev) => ({ ...prev, [field]: val }));
                setIsModified(true);
              }}
              onDeliverySettingsChange={(field, val) => {
                setDeliverySettings((prev) => ({ ...prev, [field]: val }));
                setIsModified(true);
              }}
            />
          )}

          {activeSection === "payments" && (
            <PaymentTaxSettings
              taxSettings={taxSettings}
              paymentOptions={paymentOptions}
              orderConfirmationMessage={orderConfirmationMessage}
              onTaxChange={(field, val) => {
                setTaxSettings((prev) => ({ ...prev, [field]: val }));
                setIsModified(true);
              }}
              onPaymentChange={(field, val) => {
                setPaymentOptions((prev) => ({ ...prev, [field]: val }));
                setIsModified(true);
              }}
              onMessageChange={(val) => {
                setOrderConfirmationMessage(val);
                setIsModified(true);
              }}
            />
          )}

          {activeSection === "domains" && (
            <CustomDomainSettings
              domains={domains}
              onRegisterDomain={handleRegisterDomain}
              onVerifyDomain={handleVerifyDomain}
              onDeleteDomain={handleDeleteDomain}
            />
          )}
        </div>

        {/* Right Column: Live Interactive Device Preview Pane (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-4 min-h-[640px] shadow-xs sticky top-4">
          <LiveDevicePreview
            branding={branding}
            banner={banner}
            announcement={announcement}
            operatingHours={operatingHours}
            features={features}
            deliverySettings={deliverySettings}
            charges={charges}
            previewUrl={previewUrl}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default CustomizationStudioPage;
