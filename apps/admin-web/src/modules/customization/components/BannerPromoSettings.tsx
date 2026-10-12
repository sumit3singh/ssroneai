import React from "react";
import { Sparkles, Image as ImageIcon, Megaphone, Check } from "lucide-react";
import { Label, Input } from "@ssrone/ui";

export interface BannerPromoSettingsProps {
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
  onBannerChange: (field: string, value: any) => void;
  onAnnouncementChange: (field: string, value: any) => void;
}

const SAMPLE_BANNER_IMAGES = [
  {
    name: "Indian Feast & Curries",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80",
    description: "Rich traditional thali and curries",
  },
  {
    name: "Artisanal Cafe & Bakery",
    url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    description: "Cozy cafe atmosphere and breakfast",
  },
  {
    name: "Street Food & Snacks",
    url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy tandoori, samosas and chai",
  },
  {
    name: "Burgers & Pizza Lounge",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    description: "Cheesy pizza and fast food snacks",
  },
];

export const BannerPromoSettings: React.FC<BannerPromoSettingsProps> = ({
  banner,
  announcement,
  onBannerChange,
  onAnnouncementChange,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Hero Promo Banner */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Hero Promotional Banner</h4>
            <p className="text-xs text-muted-foreground">
              Main landing banner shown at the top of your digital food menu and ordering web app.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Banner Main Headline</Label>
            <Input
              value={banner.headline || ""}
              onChange={(e) => onBannerChange("headline", e.target.value)}
              placeholder="e.g. Welcome to Baithak Cafe"
              className="mt-1.5 text-xs h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Supporting Tagline / Description</Label>
            <Input
              value={banner.subtext || ""}
              onChange={(e) => onBannerChange("subtext", e.target.value)}
              placeholder="e.g. Freshly crafted delicacies, hot snacks, and signature beverages."
              className="mt-1.5 text-xs h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Custom Banner Image URL</Label>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                value={banner.imageUrl || ""}
                onChange={(e) => onBannerChange("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="text-xs font-mono h-9"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Recommended: 1200x400 or 16:9 ratio high-resolution landscape photo.
            </p>
          </div>

          {/* Quick 1-Click Banner Image Presets */}
          <div>
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Or Pick from Curated High-Definition Food Photos
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_BANNER_IMAGES.map((sample) => {
                const isSelected = banner.imageUrl === sample.url;
                return (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => onBannerChange("imageUrl", sample.url)}
                    className={`relative rounded-lg overflow-hidden border text-left transition group cursor-pointer ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex flex-col justify-end text-white">
                      <span className="font-bold text-[10px] truncate leading-tight">
                        {sample.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Announcement Ticker / Promo Bar */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Megaphone size={16} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Announcement Ticker</h4>
              <p className="text-xs text-muted-foreground">
                Highlight special deals, festival offers, or operating notices to customers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onAnnouncementChange("enabled", !(announcement?.enabled ?? false))
            }
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              announcement?.enabled
                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                announcement?.enabled ? "bg-emerald-500" : "bg-muted-foreground/50"
              }`}
            />
            <span>{announcement?.enabled ? "Ticker Active" : "Ticker Hidden"}</span>
          </button>
        </div>

        {announcement?.enabled && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <Label className="text-xs font-semibold">Badge Tag</Label>
                <Input
                  value={announcement?.badgeText || "SPECIAL OFFER"}
                  onChange={(e) => onAnnouncementChange("badgeText", e.target.value)}
                  placeholder="e.g. FESTIVAL DEAL"
                  className="mt-1.5 text-xs h-9 uppercase font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <Label className="text-xs font-semibold">Announcement Message</Label>
                <Input
                  value={announcement?.text || ""}
                  onChange={(e) => onAnnouncementChange("text", e.target.value)}
                  placeholder="e.g. Flat 10% off on all orders above ₹499! Mention offer at billing counter."
                  className="mt-1.5 text-xs h-9"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] uppercase">
                {announcement?.badgeText || "OFFER"}
              </span>
              <span className="truncate">
                {announcement?.text || "Your announcement message will stream live here across customer devices."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerPromoSettings;
