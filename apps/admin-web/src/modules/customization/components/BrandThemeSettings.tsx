import React from "react";
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  Instagram,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Label, Input } from "@ssrone/ui";

export interface BrandThemeSettingsProps {
  branding: {
    businessName?: string;
    tagline?: string;
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    phone?: string;
    address?: string;
    businessHours?: string;
    socialLinks?: {
      instagram?: string;
      whatsapp?: string;
      googleMaps?: string;
    };
  };
  onChange: (field: string, value: any) => void;
  onApplyPalette: (primary: string, accent: string) => void;
}

const PRESET_PALETTES = [
  {
    name: "Terracotta Chai",
    primary: "#EA580C",
    accent: "#F59E0B",
    description: "Warm, inviting Indian cafe tone",
  },
  {
    name: "Crimson Velvet",
    primary: "#E11D48",
    accent: "#F59E0B",
    description: "Bold dining & gourmet bistro",
  },
  {
    name: "Emerald Bistro",
    primary: "#059669",
    accent: "#D97706",
    description: "Fresh, organic cafe & bakery",
  },
  {
    name: "Royal Indigo",
    primary: "#4F46E5",
    accent: "#06B6D4",
    description: "Modern premium lounge & pub",
  },
  {
    name: "Obsidian Gold",
    primary: "#D97706",
    accent: "#FBBF24",
    description: "Luxury fine-dining aesthetic",
  },
  {
    name: "Sakura Modern",
    primary: "#DB2777",
    accent: "#8B5CF6",
    description: "Vibrant dessert bar & boba",
  },
];

export const BrandThemeSettings: React.FC<BrandThemeSettingsProps> = ({
  branding,
  onChange,
  onApplyPalette,
}) => {
  const currentPrimary = branding.primaryColor || "#EA580C";
  const currentAccent = branding.accentColor || "#F59E0B";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Identity & Name */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Palette size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Brand Identity</h4>
            <p className="text-xs text-muted-foreground">
              Your restaurant title, tagline, and brand marks displayed to customers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold">Store / Brand Name</Label>
            <Input
              value={branding.businessName || ""}
              onChange={(e) => onChange("businessName", e.target.value)}
              placeholder="e.g. Baithak Cafe"
              className="mt-1.5 text-xs h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Tagline / Slogan</Label>
            <Input
              value={branding.tagline || ""}
              onChange={(e) => onChange("tagline", e.target.value)}
              placeholder="e.g. Traditional Flavour, Modern Experience"
              className="mt-1.5 text-xs h-9"
            />
          </div>
        </div>

        {/* Logo URL with live mini preview */}
        <div>
          <Label className="text-xs font-semibold">Brand Logo URL</Label>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="w-12 h-12 rounded-lg border border-border bg-muted/40 shrink-0 flex items-center justify-center overflow-hidden">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo Preview"
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <ImageIcon size={18} className="text-muted-foreground/60" />
              )}
            </div>
            <div className="flex-1">
              <Input
                value={branding.logoUrl || ""}
                onChange={(e) => onChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="text-xs font-mono h-9"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Direct image link (PNG, SVG, or WebP with transparent background recommended).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Color Palette & Curated Presets */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Theme Colors</h4>
              <p className="text-xs text-muted-foreground">
                Define the primary brand color for buttons, badges, and accents.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Palettes Grid */}
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Curated Designer Palettes
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PRESET_PALETTES.map((pal) => {
              const isSelected =
                currentPrimary.toLowerCase() === pal.primary.toLowerCase() &&
                currentAccent.toLowerCase() === pal.accent.toLowerCase();

              return (
                <button
                  key={pal.name}
                  type="button"
                  onClick={() => onApplyPalette(pal.primary, pal.accent)}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border hover:border-border/80 hover:bg-muted/30 bg-background"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div
                      className="w-4 h-4 rounded-full shadow-xs"
                      style={{ backgroundColor: pal.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full shadow-xs"
                      style={{ backgroundColor: pal.accent }}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-foreground block leading-tight">
                      {pal.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {pal.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Hex Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div>
            <Label className="text-xs font-semibold">Primary Brand Color</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="color"
                value={currentPrimary}
                onChange={(e) => onChange("primaryColor", e.target.value)}
                className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-transparent shrink-0"
              />
              <Input
                value={currentPrimary}
                onChange={(e) => onChange("primaryColor", e.target.value)}
                placeholder="#EA580C"
                className="text-xs font-mono h-9 uppercase"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Applies to action buttons, hero badges, and active state highlights.
            </p>
          </div>

          <div>
            <Label className="text-xs font-semibold">Secondary Accent Color</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="color"
                value={currentAccent}
                onChange={(e) => onChange("accentColor", e.target.value)}
                className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-transparent shrink-0"
              />
              <Input
                value={currentAccent}
                onChange={(e) => onChange("accentColor", e.target.value)}
                placeholder="#F59E0B"
                className="text-xs font-mono h-9 uppercase"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Applies to promo tags, bestseller badges, and secondary highlights.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Contact & Location Information */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Share2 size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Contact & Social Links</h4>
            <p className="text-xs text-muted-foreground">
              Provide outlet phone, address, and social links for customer inquiries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Phone size={12} className="text-muted-foreground" />
              Customer Support Phone
            </Label>
            <Input
              value={branding.phone || ""}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className="mt-1.5 text-xs h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Clock size={12} className="text-muted-foreground" />
              Business Hours Text
            </Label>
            <Input
              value={branding.businessHours || ""}
              onChange={(e) => onChange("businessHours", e.target.value)}
              placeholder="e.g. 10:30 AM - 10:00 PM Daily"
              className="mt-1.5 text-xs h-9"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <MapPin size={12} className="text-muted-foreground" />
            Store Address / Outlet Location
          </Label>
          <Input
            value={branding.address || ""}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="e.g. Main Food Court, Central University of Haryana"
            className="mt-1.5 text-xs h-9"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <MessageCircle size={12} className="text-emerald-500" />
              WhatsApp Direct Link
            </Label>
            <Input
              value={branding.socialLinks?.whatsapp || ""}
              onChange={(e) =>
                onChange("socialLinks", {
                  ...(branding.socialLinks || {}),
                  whatsapp: e.target.value,
                })
              }
              placeholder="https://wa.me/919876543210"
              className="mt-1.5 text-xs h-9 font-mono"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Instagram size={12} className="text-pink-500" />
              Instagram Profile URL
            </Label>
            <Input
              value={branding.socialLinks?.instagram || ""}
              onChange={(e) =>
                onChange("socialLinks", {
                  ...(branding.socialLinks || {}),
                  instagram: e.target.value,
                })
              }
              placeholder="https://instagram.com/baithakcafe"
              className="mt-1.5 text-xs h-9 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandThemeSettings;
