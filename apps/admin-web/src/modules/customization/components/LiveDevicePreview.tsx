import React, { useState } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Utensils,
  Truck,
  Check,
  AlertTriangle,
  Clock,
} from "lucide-react";

export interface LiveDevicePreviewProps {
  branding: {
    businessName?: string;
    tagline?: string;
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
  };
  banner: {
    headline?: string;
    subtext?: string;
    imageUrl?: string;
  };
  announcement?: {
    enabled?: boolean;
    text?: string;
    badgeText?: string;
  };
  operatingHours?: {
    isManuallyClosed?: boolean;
    closedMessage?: string;
    openTime?: string;
    closeTime?: string;
  };
  features?: {
    tableQrOrdering?: boolean;
    takeaway?: boolean;
    delivery?: boolean;
  };
  deliverySettings?: {
    minOrderValue?: number;
  };
  charges?: {
    enablePackingCharge?: boolean;
    packingChargeAmount?: number;
  };
  previewUrl: string;
}

export const LiveDevicePreview: React.FC<LiveDevicePreviewProps> = ({
  branding,
  banner,
  announcement,
  operatingHours,
  features,
  deliverySettings,
  charges,
  previewUrl,
}) => {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [previewMode, setPreviewMode] = useState<"mock" | "iframe">("mock");
  const [selectedMockMode, setSelectedMockMode] = useState<"dine_in" | "takeaway" | "delivery">("dine_in");

  const primaryColor = branding.primaryColor || "#EA580C";
  const accentColor = branding.accentColor || "#F59E0B";
  const brandName = branding.businessName || "Baithak Cafe";
  const isClosed = Boolean(operatingHours?.isManuallyClosed);

  return (
    <div className="w-full flex flex-col items-center justify-start h-full">
      {/* Top Device & Mode Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg border border-border">
          <button
            type="button"
            title="Mobile (iPhone 375px)"
            onClick={() => setViewport("mobile")}
            className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              viewport === "mobile"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone size={13} />
            <span className="hidden sm:inline">Mobile</span>
          </button>

          <button
            type="button"
            title="Tablet (768px)"
            onClick={() => setViewport("tablet")}
            className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              viewport === "tablet"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tablet size={13} />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            title="Desktop Full"
            onClick={() => setViewport("desktop")}
            className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              viewport === "desktop"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor size={13} />
            <span className="hidden sm:inline">Desktop</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted p-0.5 rounded-md border border-border text-[11px]">
            <button
              type="button"
              onClick={() => setPreviewMode("mock")}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                previewMode === "mock" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
              }`}
            >
              Interactive Mock
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("iframe")}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                previewMode === "iframe" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
              }`}
            >
              Live Iframe
            </button>
          </div>

          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg border border-border bg-card text-primary hover:bg-muted text-xs font-mono flex items-center gap-1"
            title="Open in new browser tab"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Device Shell Viewport */}
      <div className="w-full flex-1 flex items-center justify-center overflow-auto py-2">
        {previewMode === "iframe" ? (
          <div
            className={`transition-all duration-300 shadow-2xl border-4 border-foreground/70 rounded-2xl overflow-hidden bg-background ${
              viewport === "mobile"
                ? "w-[375px] h-[640px]"
                : viewport === "tablet"
                ? "w-[560px] h-[640px]"
                : "w-full max-w-4xl h-[640px]"
            }`}
          >
            <iframe
              src={previewUrl}
              title="Live Customer Web App"
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <div
            className={`transition-all duration-300 shadow-2xl border-4 border-foreground/80 rounded-2xl overflow-hidden bg-background flex flex-col ${
              viewport === "mobile"
                ? "w-[375px] h-[640px]"
                : viewport === "tablet"
                ? "w-[560px] h-[640px]"
                : "w-full max-w-2xl h-[640px]"
            }`}
            style={
              {
                "--preview-primary": primaryColor,
                "--preview-accent": accentColor,
              } as React.CSSProperties
            }
          >
            {/* Phone Speaker Notch */}
            <div className="bg-foreground/80 h-4 w-full flex items-center justify-center shrink-0">
              <div className="w-12 h-1 bg-muted rounded-full" />
            </div>

            {/* Scrollable Food App Content */}
            <div className="flex-1 overflow-y-auto flex flex-col justify-between bg-card text-card-foreground text-xs select-none">
              <div>
                {/* Announcement Ticker */}
                {announcement?.enabled && announcement?.text && (
                  <div
                    className="py-1 px-3 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="px-1 py-0.2 rounded bg-black/30 text-[9px] uppercase tracking-wide">
                      {announcement.badgeText || "SPECIAL"}
                    </span>
                    <span className="truncate">{announcement.text}</span>
                  </div>
                )}

                {/* Top App Header */}
                <div className="p-3 border-b border-border/60 flex items-center justify-between bg-background sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    {branding.logoUrl ? (
                      <img
                        src={branding.logoUrl}
                        alt="Logo"
                        className="w-7 h-7 rounded-lg object-contain bg-muted"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {brandName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-extrabold text-xs text-foreground leading-tight">{brandName}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                        {branding.tagline || "Traditional Flavour, Modern Experience"}
                      </p>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white shadow-2xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Online Menu
                  </span>
                </div>

                {/* Emergency Closed Banner (if active) */}
                {isClosed && (
                  <div className="p-3 bg-rose-500/15 border-b border-rose-300 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                    <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[11px]">Store Temporarily Closed</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {operatingHours?.closedMessage || "We are currently closed. Back soon!"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hero Banner Promo */}
                <div className="p-3">
                  <div className="rounded-xl overflow-hidden relative shadow-md bg-muted/40 aspect-21/9 flex flex-col justify-end p-3.5 text-white">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt="Promo"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="relative z-1 space-y-0.5">
                      <span
                        className="inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Featured Kitchen
                      </span>
                      <h3 className="font-extrabold text-sm leading-tight text-white drop-shadow">
                        {banner.headline || "Welcome to Our Kitchen"}
                      </h3>
                      <p className="text-[10px] text-white/85 line-clamp-1">
                        {banner.subtext || "Freshly crafted delicious meals prepared with care."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Mode Switcher */}
                <div className="px-3 pb-2">
                  <div className="p-1 rounded-xl bg-muted flex items-center justify-between text-xs font-bold gap-1">
                    {features?.tableQrOrdering !== false && (
                      <button
                        type="button"
                        onClick={() => setSelectedMockMode("dine_in")}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                          selectedMockMode === "dine_in"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Utensils size={11} />
                        <span>Dine-In</span>
                      </button>
                    )}

                    {features?.takeaway !== false && (
                      <button
                        type="button"
                        onClick={() => setSelectedMockMode("takeaway")}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                          selectedMockMode === "takeaway"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        <ShoppingBag size={11} />
                        <span>Takeaway</span>
                      </button>
                    )}

                    {features?.delivery !== false && (
                      <button
                        type="button"
                        onClick={() => setSelectedMockMode("delivery")}
                        className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
                          selectedMockMode === "delivery"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Truck size={11} />
                        <span>Delivery</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sample Category Pills */}
                <div className="px-3 py-1 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
                  <span
                    className="px-2.5 py-1 rounded-full text-white shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ⭐ Bestsellers
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                    Main Course
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                    Snacks
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                    Chai & Beverages
                  </span>
                </div>

                {/* Sample Menu Items Grid */}
                <div className="p-3 grid grid-cols-2 gap-2.5">
                  {[
                    {
                      name: "Special Paneer Butter Masala",
                      price: 240,
                      tag: "Chef Special",
                      icon: "🍲",
                    },
                    {
                      name: "Kulhad Masala Chai",
                      price: 35,
                      tag: "Top Rated",
                      icon: "☕",
                    },
                    {
                      name: "Tandoori Roti Basket",
                      price: 60,
                      tag: "Fresh",
                      icon: "🫓",
                    },
                    {
                      name: "Crispy Samosa Platter",
                      price: 90,
                      tag: "Popular",
                      icon: "🥟",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-card border border-border rounded-xl p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-full h-14 rounded-lg bg-muted/40 flex items-center justify-center text-2xl mb-1">
                          {item.icon}
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[9px] font-bold uppercase px-1 py-0.2 rounded text-white"
                            style={{ backgroundColor: accentColor }}
                          >
                            {item.tag}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-foreground truncate mt-0.5">
                          {item.name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-extrabold text-xs text-foreground font-mono">
                          ₹{item.price}
                        </span>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-md text-[10px] font-black text-white shadow-2xs cursor-pointer"
                          style={{ backgroundColor: primaryColor }}
                        >
                          + ADD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Sticky Floating Cart Bar */}
              <div className="p-3 bg-background border-t border-border/60 sticky bottom-0">
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs text-white shadow-md flex items-center justify-between cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>View Cart · ₹275</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                    Checkout →
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDevicePreview;
