import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Palette, Globe, Smartphone, Monitor, Tablet, Save, Send, RotateCcw,
  CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Trash2, Plus,
  Layers, Utensils, Hotel, ChefHat, UserCheck, Hash, Eye, EyeOff, Sparkles, Check
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Input, Label, PageHeader, PageContainer
} from "@ssrone/ui";
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
  type AppConfigAdminResponse,
  type CustomDomainRecord,
  getTenantSlug,
  getBranchCode,
} from "@ssrone/api-client";

type AppType =
  | "global"
  | "customer-food-web"
  | "customer-stay-web"
  | "kds-web"
  | "staff-web"
  | "token-order-web";

type ViewportType = "desktop" | "tablet" | "mobile";

const APP_TABS: { id: AppType; name: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "global", name: "Global Branding", icon: Palette },
  { id: "customer-food-web", name: "Food Ordering Web", icon: Utensils },
  { id: "customer-stay-web", name: "Hotel Stay Web", icon: Hotel },
  { id: "kds-web", name: "Kitchen Display (KDS)", icon: ChefHat },
  { id: "staff-web", name: "Staff & Waiters", icon: UserCheck },
  { id: "token-order-web", name: "Queue & Tokens", icon: Hash },
];

export const CustomizationStudioPage: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<AppType>("customer-food-web");
  const [activeTab, setActiveTab] = useState<"builder" | "domains">("builder");
  const [viewport, setViewport] = useState<ViewportType>("mobile");

  // Config state
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [appConfigData, setAppConfigData] = useState<AppConfigAdminResponse | null>(null);
  const [draftConfig, setDraftConfig] = useState<Record<string, any>>({});
  const [globalBranding, setGlobalBranding] = useState<Record<string, any>>({});
  const [isModified, setIsModified] = useState(false);

  // Custom domains state
  const [domains, setDomains] = useState<CustomDomainRecord[]>([]);
  const [newDomainInput, setNewDomainInput] = useState("");
  const [domainAppTarget, setDomainAppTarget] = useState("customer-food-web");
  const [isRegisteringDomain, setIsRegisteringDomain] = useState(false);
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(null);

  // Context resolution
  const tenantSlug = getTenantSlug() || "baithak-cafe";
  const branchCode = getBranchCode() || "BAITHAK-CUH";

  // Load global branding once
  useEffect(() => {
    fetchAdminAppConfig("global")
      .then((res) => {
        const cfg = res.draft_config?.branding || res.published_config?.branding || {};
        setGlobalBranding(cfg);
      })
      .catch(() => {
        setGlobalBranding({
          businessName: "Baithak Cafe",
          tagline: "Traditional Flavour, Modern Experience",
          primaryColor: "#E11D48",
          accentColor: "#F59E0B",
        });
      });
  }, []);

  // Load selected app configuration
  const loadAppConfig = async (appName: AppType) => {
    setLoading(true);
    try {
      const res = await fetchAdminAppConfig(appName);
      setAppConfigData(res);
      setDraftConfig(res.draft_config || {});
      setIsModified(res.is_draft_modified);
    } catch (err: any) {
      toast.error(`Failed to load config for ${appName}: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "builder") {
      loadAppConfig(selectedApp);
    } else {
      loadCustomDomains();
    }
  }, [selectedApp, activeTab]);

  const loadCustomDomains = async () => {
    try {
      const list = await fetchCustomDomains();
      setDomains(list);
    } catch (err: any) {
      toast.error("Failed to load custom domains");
    }
  };

  const handleUpdateDraftField = (path: string[], value: any) => {
    setDraftConfig((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      let curr = copy;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!curr[key] || typeof curr[key] !== "object") {
          curr[key] = {};
        }
        curr = curr[key];
      }
      curr[path[path.length - 1]] = value;
      return copy;
    });
    setIsModified(true);
  };

  // Actions: Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const updated = await saveDraftAppConfig(selectedApp, draftConfig);
      setAppConfigData(updated);
      setIsModified(updated.is_draft_modified);
      if (selectedApp === "global" && draftConfig.branding) {
        setGlobalBranding(draftConfig.branding);
      }
      toast.success("Draft saved successfully. Changes are ready to preview.");
    } catch (err: any) {
      toast.error(`Error saving draft: ${err.message || "Request failed"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Actions: Publish
  const handlePublish = async () => {
    if (!window.confirm("Publish changes to live connected customer applications immediately?")) {
      return;
    }
    setIsPublishing(true);
    try {
      const updated = await publishAppConfig(selectedApp);
      setAppConfigData(updated);
      setDraftConfig(updated.published_config);
      setIsModified(false);
      toast.success(`Published v${updated.config_version} live to ${selectedApp}!`);
    } catch (err: any) {
      toast.error(`Failed to publish: ${err.message || "Request failed"}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Actions: Reset Draft
  const handleResetDraft = async () => {
    if (!window.confirm("Discard all unsaved draft changes and revert to published state?")) {
      return;
    }
    setIsResetting(true);
    try {
      const updated = await resetDraftAppConfig(selectedApp);
      setAppConfigData(updated);
      setDraftConfig(updated.draft_config);
      setIsModified(false);
      toast.info("Draft reset to live published configuration.");
    } catch (err: any) {
      toast.error("Failed to reset draft");
    } finally {
      setIsResetting(false);
    }
  };

  // Custom Domain Handlers
  const handleRegisterDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;
    setIsRegisteringDomain(true);
    try {
      const created = await registerCustomDomain({
        domain: newDomainInput.trim(),
        app_name: domainAppTarget,
      });
      setDomains((prev) => [...prev, created]);
      setNewDomainInput("");
      toast.success(`Domain ${created.domain} registered! Add DNS records to activate.`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to register domain");
    } finally {
      setIsRegisteringDomain(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomainId(domainId);
    try {
      const updated = await verifyCustomDomain(domainId);
      setDomains((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      if (updated.status === "verified") {
        toast.success(`Domain ${updated.domain} verified and active!`);
      } else {
        toast.warning(`DNS records not fully propagated: ${updated.error_message || "Retry in a few minutes"}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Verification check failed");
    } finally {
      setVerifyingDomainId(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!window.confirm("Are you sure you want to disconnect this custom domain?")) return;
    try {
      await deleteCustomDomain(domainId);
      setDomains((prev) => prev.filter((d) => d.id !== domainId));
      toast.success("Domain mapping removed.");
    } catch (err: any) {
      toast.error("Failed to delete custom domain");
    }
  };

  // Compute preview URL
  const previewUrl = useMemo(() => {
    const port = selectedApp === "customer-food-web" ? 3000 : 3001;
    return `http://localhost:${port}/t/${tenantSlug}/b/${branchCode}?preview_draft=true`;
  }, [selectedApp, tenantSlug, branchCode]);

  // Active primary branding colors
  const activePrimaryColor =
    selectedApp === "global"
      ? draftConfig?.branding?.primaryColor || "#E11D48"
      : globalBranding?.primaryColor || "#E11D48";

  const activeAccentColor =
    selectedApp === "global"
      ? draftConfig?.branding?.accentColor || "#F59E0B"
      : globalBranding?.accentColor || "#F59E0B";

  const activeBusinessName =
    selectedApp === "global"
      ? draftConfig?.branding?.businessName || "Baithak Cafe"
      : globalBranding?.businessName || "Baithak Cafe";

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        title="Website & App Customization Studio"
        description="Configure tenant branding, content, feature toggles, and custom domains with real-time preview."
        icon={<Palette size={18} />}
        badge="Zero-Code Multi-Tenant Engine"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab("builder")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "builder"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                App Builder & Theme
              </button>
              <button
                onClick={() => setActiveTab("domains")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "domains"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Custom Domains & DNS
              </button>
            </div>

            {activeTab === "builder" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDraft}
                  disabled={!isModified || isResetting}
                  className="text-xs h-8"
                >
                  <RotateCcw size={13} className="mr-1" />
                  Discard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="text-xs h-8 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Save size={13} className="mr-1" />
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send size={13} className="mr-1" />
                  {isPublishing ? "Publishing..." : "Publish Live"}
                </Button>
              </>
            )}
          </div>
        }
      />

      {activeTab === "builder" ? (
        <div className="space-y-4">
          {/* Sub-bar: App tabs + Status + Device switcher */}
          <div className="bg-card border border-border rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3">
            {/* Apps Picker */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {APP_TABS.map((tab) => {
                const Icon = tab.icon;
                const isCurrent = selectedApp === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedApp(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      isCurrent
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={14} />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Version & Device Viewport Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-mono font-semibold bg-muted px-2 py-0.5 rounded text-[11px]">
                  v{appConfigData?.config_version || 1}
                </span>
                {isModified ? (
                  <Badge variant="secondary" className="text-amber-600 border-amber-500/40 bg-amber-500/10 text-[10px]">
                    Draft Modified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-emerald-600 border-emerald-500/40 bg-emerald-500/10 text-[10px]">
                    Live Synced
                  </Badge>
                )}
              </div>

              <div className="h-4 w-[1px] bg-border" />

              {/* Viewport switcher */}
              <div className="flex items-center bg-muted p-0.5 rounded-md border border-border">
                <button
                  title="Desktop View"
                  onClick={() => setViewport("desktop")}
                  className={`p-1.5 rounded transition ${
                    viewport === "desktop" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor size={14} />
                </button>
                <button
                  title="Tablet View"
                  onClick={() => setViewport("tablet")}
                  className={`p-1.5 rounded transition ${
                    viewport === "tablet" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Tablet size={14} />
                </button>
                <button
                  title="Mobile View (375px)"
                  onClick={() => setViewport("mobile")}
                  className={`p-1.5 rounded transition ${
                    viewport === "mobile" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Main 2-Column Split Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Form Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
              {/* GLOBAL BRANDING FORM */}
              {selectedApp === "global" && (
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Palette size={16} className="text-primary" />
                      Global Tenant Identity
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Master theme colors and brand identity inherited across all tenant digital apps.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs">
                    <div>
                      <Label className="text-xs font-semibold">Store / Brand Name</Label>
                      <Input
                        value={draftConfig?.branding?.businessName || ""}
                        onChange={(e) => handleUpdateDraftField(["branding", "businessName"], e.target.value)}
                        placeholder="e.g. Baithak Cafe"
                        className="mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">Brand Tagline</Label>
                      <Input
                        value={draftConfig?.branding?.tagline || ""}
                        onChange={(e) => handleUpdateDraftField(["branding", "tagline"], e.target.value)}
                        placeholder="e.g. Traditional Flavour, Modern Experience"
                        className="mt-1 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold">Primary Theme Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={draftConfig?.branding?.primaryColor || "#E11D48"}
                            onChange={(e) => handleUpdateDraftField(["branding", "primaryColor"], e.target.value)}
                            className="w-8 h-8 rounded border border-border cursor-pointer p-0.5 bg-transparent"
                          />
                          <Input
                            value={draftConfig?.branding?.primaryColor || "#E11D48"}
                            onChange={(e) => handleUpdateDraftField(["branding", "primaryColor"], e.target.value)}
                            placeholder="#E11D48"
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold">Accent Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={draftConfig?.branding?.accentColor || "#F59E0B"}
                            onChange={(e) => handleUpdateDraftField(["branding", "accentColor"], e.target.value)}
                            className="w-8 h-8 rounded border border-border cursor-pointer p-0.5 bg-transparent"
                          />
                          <Input
                            value={draftConfig?.branding?.accentColor || "#F59E0B"}
                            onChange={(e) => handleUpdateDraftField(["branding", "accentColor"], e.target.value)}
                            placeholder="#F59E0B"
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">Brand Logo URL</Label>
                      <Input
                        value={draftConfig?.branding?.logoUrl || ""}
                        onChange={(e) => handleUpdateDraftField(["branding", "logoUrl"], e.target.value)}
                        placeholder="https://cdn.example.com/logo.png"
                        className="mt-1 text-xs font-mono"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Recommended: Square PNG/SVG with transparent background.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold">Support Phone</Label>
                        <Input
                          value={draftConfig?.branding?.phone || ""}
                          onChange={(e) => handleUpdateDraftField(["branding", "phone"], e.target.value)}
                          placeholder="+91 98765 43210"
                          className="mt-1 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold">Operating Hours</Label>
                        <Input
                          value={draftConfig?.branding?.businessHours || ""}
                          onChange={(e) => handleUpdateDraftField(["branding", "businessHours"], e.target.value)}
                          placeholder="09:00 AM - 10:00 PM"
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold">Store Address</Label>
                      <Input
                        value={draftConfig?.branding?.address || ""}
                        onChange={(e) => handleUpdateDraftField(["branding", "address"], e.target.value)}
                        placeholder="Campus / Street address"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CUSTOMER FOOD WEB FORM */}
              {selectedApp === "customer-food-web" && (
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Utensils size={16} className="text-primary" />
                      Food Ordering Web Experience
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Customer portal settings for QR table ordering, takeaway, and digital menus.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    {/* Hero Banner Section */}
                    <div className="bg-muted/40 p-3 rounded-lg border border-border space-y-3">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" />
                        Hero Banner Promo
                      </p>
                      <div>
                        <Label className="text-[11px]">Headline</Label>
                        <Input
                          value={draftConfig?.banner?.headline || ""}
                          onChange={(e) => handleUpdateDraftField(["banner", "headline"], e.target.value)}
                          placeholder="e.g. Welcome to Our Kitchen"
                          className="mt-1 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Subtext</Label>
                        <Input
                          value={draftConfig?.banner?.subtext || ""}
                          onChange={(e) => handleUpdateDraftField(["banner", "subtext"], e.target.value)}
                          placeholder="e.g. Freshly crafted delicious meals"
                          className="mt-1 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Promo Banner Image URL</Label>
                        <Input
                          value={draftConfig?.banner?.imageUrl || ""}
                          onChange={(e) => handleUpdateDraftField(["banner", "imageUrl"], e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="mt-1 text-xs bg-background font-mono"
                        />
                      </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="space-y-2">
                      <Label className="font-semibold">Channel Ordering Features</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: "tableQrOrdering", label: "Table QR Dine-In" },
                          { key: "takeaway", label: "Self Pick-up / Takeaway" },
                          { key: "delivery", label: "Home Delivery" },
                          { key: "onlinePayment", label: "Online UPI & Cards" },
                        ].map((feat) => {
                          const isEnabled = draftConfig?.features?.[feat.key] !== false;
                          return (
                            <div
                              key={feat.key}
                              onClick={() => handleUpdateDraftField(["features", feat.key], !isEnabled)}
                              className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                                isEnabled
                                  ? "bg-primary/10 border-primary/40 text-foreground"
                                  : "bg-muted/40 border-border text-muted-foreground"
                              }`}
                            >
                              <span className="font-medium text-[11px]">{feat.label}</span>
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                                  isEnabled ? "bg-primary" : "bg-muted-foreground/40"
                                }`}
                              >
                                {isEnabled && <Check size={12} strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Confirmation Message */}
                    <div>
                      <Label className="font-semibold">Custom Order Success Message</Label>
                      <textarea
                        value={draftConfig?.orderConfirmationMessage || ""}
                        onChange={(e) => handleUpdateDraftField(["orderConfirmationMessage"], e.target.value)}
                        placeholder="Thank you for dining with us! Your order has been placed with the kitchen."
                        rows={3}
                        className="w-full mt-1 p-2 text-xs rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CUSTOMER HOTEL STAY WEB FORM */}
              {selectedApp === "customer-stay-web" && (
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Hotel size={16} className="text-primary" />
                      Hotel Stay & Guest Portal
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Room guest services, digital checkout, and in-room dining features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs">
                    <div>
                      <Label className="font-semibold">Welcome Guest Banner Message</Label>
                      <Input
                        value={draftConfig?.welcomeMessage || ""}
                        onChange={(e) => handleUpdateDraftField(["welcomeMessage"], e.target.value)}
                        placeholder="e.g. Welcome to our boutique hotel"
                        className="mt-1 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Guest Portal Features</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { key: "roomServiceRequests", label: "In-Room Dining Service" },
                          { key: "housekeepingRequests", label: "Housekeeping & Linen Requests" },
                          { key: "digitalCheckout", label: "Express Digital Checkout" },
                        ].map((feat) => {
                          const isEnabled = draftConfig?.features?.[feat.key] !== false;
                          return (
                            <div
                              key={feat.key}
                              onClick={() => handleUpdateDraftField(["features", feat.key], !isEnabled)}
                              className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                                isEnabled
                                  ? "bg-primary/10 border-primary/40 text-foreground"
                                  : "bg-muted/40 border-border text-muted-foreground"
                              }`}
                            >
                              <span className="font-medium text-[11px]">{feat.label}</span>
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                                  isEnabled ? "bg-primary" : "bg-muted-foreground/40"
                                }`}
                              >
                                {isEnabled && <Check size={12} strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="font-semibold">Standard Check-In</Label>
                        <Input
                          value={draftConfig?.policies?.checkInTime || "12:00 PM"}
                          onChange={(e) => handleUpdateDraftField(["policies", "checkInTime"], e.target.value)}
                          className="mt-1 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="font-semibold">Standard Check-Out</Label>
                        <Input
                          value={draftConfig?.policies?.checkOutTime || "11:00 AM"}
                          onChange={(e) => handleUpdateDraftField(["policies", "checkOutTime"], e.target.value)}
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* KDS WEB FORM */}
              {selectedApp === "kds-web" && (
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <ChefHat size={16} className="text-primary" />
                      Kitchen Display (KDS) Settings
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Order ticket visibility and kitchen station routing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs">
                    <div>
                      <Label className="font-semibold">Display Theme</Label>
                      <select
                        value={draftConfig?.displayTheme || "standard"}
                        onChange={(e) => handleUpdateDraftField(["displayTheme"], e.target.value)}
                        className="w-full mt-1 p-2 rounded-md bg-background border border-border text-xs focus:outline-none"
                      >
                        <option value="standard">Standard Dark KDS</option>
                        <option value="high-contrast">High Contrast (Kitchen Lighting)</option>
                        <option value="compact">Compact Grid (High Volume)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="font-semibold">Default Station Name</Label>
                      <Input
                        value={draftConfig?.stationRouting?.defaultStation || "Main Kitchen"}
                        onChange={(e) => handleUpdateDraftField(["stationRouting", "defaultStation"], e.target.value)}
                        placeholder="Main Kitchen"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* STAFF WEB FORM */}
              {selectedApp === "staff-web" && (
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <UserCheck size={16} className="text-primary" />
                      Staff & Waiter Portal
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Floor permissions, table status indicators, and service workflows.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs">
                    <div
                      onClick={() =>
                        handleUpdateDraftField(
                          ["showHousekeepingToWaiters"],
                          !draftConfig?.showHousekeepingToWaiters
                        )
                      }
                      className="p-3 rounded-lg border border-border bg-muted/40 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">Show Housekeeping Tasks</p>
                        <p className="text-[11px] text-muted-foreground">Allow waitstaff to view room cleaning alerts</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                          draftConfig?.showHousekeepingToWaiters ? "bg-primary" : "bg-muted-foreground/40"
                        }`}
                      >
                        {draftConfig?.showHousekeepingToWaiters && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* TOKEN ORDER WEB FORM */}
              {selectedApp === "token-order-web" && (
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Hash size={16} className="text-primary" />
                      Queue & Token Display
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Public TV screen counter and token announcer branding.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs">
                    <div>
                      <Label className="font-semibold">'Now Serving' Display Text</Label>
                      <Input
                        value={draftConfig?.nowServingText || "Now Serving"}
                        onChange={(e) => handleUpdateDraftField(["nowServingText"], e.target.value)}
                        placeholder="Now Serving / Order Ready"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Live Interactive Device Preview Pane (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-muted/30 border border-border rounded-xl p-4 min-h-[580px]">
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground font-mono">
                    Live Preview: {activeBusinessName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-mono"
                  >
                    Open Tab <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              {/* Simulated Device Frame */}
              <div
                className={`transition-all duration-300 shadow-xl border-4 border-foreground/80 rounded-2xl overflow-hidden bg-background flex flex-col ${
                  viewport === "mobile"
                    ? "w-[375px] h-[640px]"
                    : viewport === "tablet"
                    ? "w-[560px] h-[640px]"
                    : "w-full h-[640px]"
                }`}
              >
                {/* Device Speaker / Notch */}
                <div className="bg-foreground/80 h-4 w-full flex items-center justify-center shrink-0">
                  <div className="w-12 h-1 bg-muted rounded-full" />
                </div>

                {/* Simulated Content / Live App Render */}
                <div className="flex-1 overflow-y-auto flex flex-col justify-between p-4 relative" style={{
                  ["--primary" as any]: activePrimaryColor,
                  ["--accent" as any]: activeAccentColor,
                }}>
                  {/* Mock Mobile App Preview */}
                  <div className="space-y-4">
                    {/* App Header */}
                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                      <div className="flex items-center gap-2">
                        {draftConfig?.branding?.logoUrl ? (
                          <img
                            src={draftConfig.branding.logoUrl}
                            alt="Logo"
                            className="w-7 h-7 rounded object-cover"
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs shadow"
                            style={{ backgroundColor: activePrimaryColor }}
                          >
                            {activeBusinessName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-xs text-foreground leading-none">{activeBusinessName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectedApp === "global"
                              ? draftConfig?.branding?.tagline || "Traditional Flavour"
                              : globalBranding?.tagline || "Traditional Flavour"}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white"
                        style={{ backgroundColor: activePrimaryColor }}
                      >
                        Dine-In / QR
                      </span>
                    </div>

                    {/* Food Web Promo Banner */}
                    {selectedApp === "customer-food-web" && (
                      <div className="rounded-xl overflow-hidden relative shadow-md bg-muted/80">
                        {draftConfig?.banner?.imageUrl ? (
                          <img
                            src={draftConfig.banner.imageUrl}
                            alt="Banner"
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-32 flex items-center justify-center text-white text-3xl font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${activePrimaryColor}, ${activeAccentColor})`,
                            }}
                          >
                            🍽️
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-end text-white">
                          <p className="font-bold text-sm leading-tight">
                            {draftConfig?.banner?.headline || "Welcome to Our Kitchen"}
                          </p>
                          <p className="text-[10px] text-white/80 line-clamp-1">
                            {draftConfig?.banner?.subtext || "Freshly crafted delicious meals prepared with care."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Simulated Menu / Features View */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">Featured Specialties</p>
                        <span className="text-[10px] text-primary font-semibold">View All</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Signature Paneer Tikka", price: "₹240", tag: "Bestseller" },
                          { name: "Special Kulhad Chai", price: "₹40", tag: "Popular" },
                        ].map((item, idx) => (
                          <div key={idx} className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-1">
                            <div className="w-full h-16 rounded bg-muted/60 flex items-center justify-center text-xl">
                              {idx === 0 ? "🍢" : "☕"}
                            </div>
                            <p className="font-semibold text-[11px] text-foreground truncate">{item.name}</p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="font-bold text-xs text-foreground">{item.price}</span>
                              <button
                                className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                                style={{ backgroundColor: activePrimaryColor }}
                              >
                                + ADD
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Simulated Bottom CTA Bar */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <button
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2"
                      style={{ backgroundColor: activePrimaryColor }}
                    >
                      <span>Start Ordering</span>
                      <span className="text-[10px] opacity-80">· Table CUH-04</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CUSTOM DOMAINS MANAGER */
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Add Domain Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                Connect Custom Domain
              </CardTitle>
              <CardDescription className="text-xs">
                Map your own domain or subdomain (e.g. <code>order.baithakcafe.com</code> or <code>tajfood.com</code>) to your online ordering portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterDomain} className="flex flex-wrap sm:flex-nowrap gap-2.5 items-end">
                <div className="flex-1 min-w-[240px]">
                  <Label className="text-xs font-semibold">Custom Domain</Label>
                  <Input
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    placeholder="e.g. order.baithakcafe.com"
                    className="mt-1 text-xs font-mono"
                    required
                  />
                </div>
                <div className="w-52">
                  <Label className="text-xs font-semibold">Connect Application</Label>
                  <select
                    value={domainAppTarget}
                    onChange={(e) => setDomainAppTarget(e.target.value)}
                    className="w-full mt-1 p-2 rounded-md bg-background border border-border text-xs focus:outline-none"
                  >
                    <option value="customer-food-web">Customer Food Web</option>
                    <option value="customer-stay-web">Customer Stay Web</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isRegisteringDomain || !newDomainInput.trim()}
                  className="text-xs h-9 bg-primary text-primary-foreground"
                >
                  <Plus size={14} className="mr-1" />
                  {isRegisteringDomain ? "Connecting..." : "Add Domain"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Domains List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground font-mono">
              Configured Custom Domains ({domains.length})
            </h3>

            {domains.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center space-y-2">
                  <Globe size={32} className="mx-auto text-muted-foreground/60" />
                  <p className="font-medium text-xs text-foreground">No custom domains connected yet</p>
                  <p className="text-[11px] text-muted-foreground">
                    Connect your brand domain above to provide a white-labeled customer experience.
                  </p>
                </CardContent>
              </Card>
            ) : (
              domains.map((dom) => (
                <Card key={dom.id} className="border-border overflow-hidden">
                  <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-border bg-card">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground font-mono">{dom.domain}</span>
                        {dom.status === "verified" ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] flex items-center gap-1">
                            <CheckCircle2 size={11} /> Verified & Active
                          </Badge>
                        ) : dom.status === "failed" ? (
                          <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/30 text-[10px] flex items-center gap-1">
                            <AlertCircle size={11} /> DNS Check Failed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] flex items-center gap-1">
                            <RefreshCw size={11} className="animate-spin" /> Pending DNS Propagation
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Target App: <span className="font-semibold text-foreground">{dom.app_name}</span>
                        {dom.verified_at && ` · Verified on ${new Date(dom.verified_at).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyDomain(dom.id)}
                        disabled={verifyingDomainId === dom.id}
                        className="text-xs h-8"
                      >
                        <RefreshCw size={12} className={`mr-1.5 ${verifyingDomainId === dom.id ? "animate-spin" : ""}`} />
                        Verify DNS
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDomain(dom.id)}
                        className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  {/* DNS Configuration Instructions */}
                  <div className="p-3.5 bg-muted/40 text-xs space-y-2">
                    <p className="font-semibold text-[11px] text-foreground">
                      Required DNS Records (at your domain registrar, e.g. GoDaddy, Cloudflare):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 font-mono text-[11px] bg-background p-2.5 rounded border border-border">
                      <div>
                        <span className="text-muted-foreground text-[10px] block">Type</span>
                        <span className="font-bold text-foreground">{dom.dns_instruction?.record_type || dom.record_type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] block">Host / Name</span>
                        <span className="font-bold text-foreground">{dom.dns_instruction?.host || "@"}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground text-[10px] block">Points to / Value</span>
                        <span className="font-bold text-primary break-all">{dom.dns_instruction?.target || dom.target_value}</span>
                      </div>
                    </div>
                    {dom.error_message && (
                      <p className="text-[11px] text-red-500 font-mono">
                        Error: {dom.error_message}
                      </p>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default CustomizationStudioPage;
