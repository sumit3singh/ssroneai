import React from "react";
import {
  Package,
  Utensils,
  Sparkles,
  Flame,
  Pizza,
  Coffee,
  Crown,
  Wheat,
  Award,
  Sandwich,
  Soup,
  Beer,
  CupSoda,
  Tag
} from "lucide-react";
import { POSCategory } from "../types";

export interface CategoryColorTheme {
  id: string;
  name: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
}

export const SOBER_CATEGORY_COLORS: CategoryColorTheme[] = [
  {
    id: "amber",
    name: "Warm Amber",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200/80 dark:border-amber-800/80",
    text: "text-amber-900 dark:text-amber-200",
    dot: "bg-amber-400",
  },
  {
    id: "orange",
    name: "Peach Orange",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200/80 dark:border-orange-800/80",
    text: "text-orange-900 dark:text-orange-200",
    dot: "bg-orange-400",
  },
  {
    id: "emerald",
    name: "Sage Emerald",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200/80 dark:border-emerald-800/80",
    text: "text-emerald-900 dark:text-emerald-200",
    dot: "bg-emerald-400",
  },
  {
    id: "sky",
    name: "Soft Sky",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200/80 dark:border-sky-800/80",
    text: "text-sky-900 dark:text-sky-200",
    dot: "bg-sky-400",
  },
  {
    id: "violet",
    name: "Lavender",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200/80 dark:border-violet-800/80",
    text: "text-violet-900 dark:text-violet-200",
    dot: "bg-violet-400",
  },
  {
    id: "rose",
    name: "Blush Rose",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200/80 dark:border-rose-800/80",
    text: "text-rose-900 dark:text-rose-200",
    dot: "bg-rose-400",
  },
  {
    id: "teal",
    name: "Gentle Teal",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200/80 dark:border-teal-800/80",
    text: "text-teal-900 dark:text-teal-200",
    dot: "bg-teal-400",
  },
  {
    id: "indigo",
    name: "Muted Indigo",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200/80 dark:border-indigo-800/80",
    text: "text-indigo-900 dark:text-indigo-200",
    dot: "bg-indigo-400",
  },
  {
    id: "yellow",
    name: "Soft Cream",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    border: "border-yellow-200/80 dark:border-yellow-800/80",
    text: "text-yellow-900 dark:text-yellow-200",
    dot: "bg-yellow-400",
  },
  {
    id: "slate",
    name: "Sober Slate",
    bg: "bg-slate-100 dark:bg-slate-800/60",
    border: "border-slate-200 dark:border-slate-700",
    text: "text-slate-800 dark:text-slate-200",
    dot: "bg-slate-400",
  },
];

/**
 * Parses icon field to extract base icon and color key.
 * Format: "icon_name|color_id" e.g. "package|amber" or "🍛|emerald"
 */
export function parseCategoryIcon(rawIcon?: string): { icon: string; colorId?: string } {
  if (!rawIcon) return { icon: "🍛", colorId: undefined };
  if (rawIcon.includes("|")) {
    const parts = rawIcon.split("|");
    return { icon: parts[0] || "🍛", colorId: parts[1] };
  }
  return { icon: rawIcon, colorId: undefined };
}

/**
 * Combines icon and color key into a single string for storage.
 */
export function buildCategoryIcon(icon: string, colorId?: string): string {
  const cleanIcon = (icon || "🍛").trim();
  if (colorId) {
    return `${cleanIcon}|${colorId}`;
  }
  return cleanIcon;
}

/**
 * Retrieves the color theme for a category.
 * If explicitly saved, uses that color. Otherwise, picks deterministically by ID/name.
 */
export function getCategoryColor(cat: POSCategory | any, fallbackIndex = 0): CategoryColorTheme {
  const { colorId } = parseCategoryIcon(cat?.icon);
  if (colorId) {
    const found = SOBER_CATEGORY_COLORS.find((c) => c.id === colorId);
    if (found) return found;
  }
  const numericId = typeof cat?.id === "number" ? cat.id : fallbackIndex;
  return SOBER_CATEGORY_COLORS[Math.abs(numericId) % SOBER_CATEGORY_COLORS.length];
}

/**
 * Safely renders category icon (Lucide component if known name, or emoji string).
 */
export function renderCategoryIcon(iconRaw?: string, size = 16): React.ReactNode {
  const { icon } = parseCategoryIcon(iconRaw);
  const normalized = icon.trim().toLowerCase();

  switch (normalized) {
    case "package":
      return <Package size={size} />;
    case "utensils":
      return <Utensils size={size} />;
    case "bowl-rice":
    case "bowl-food":
    case "soup":
      return <Soup size={size} />;
    case "sparkles":
      return <Sparkles size={size} />;
    case "sandwich":
      return <Sandwich size={size} />;
    case "flame":
    case "fire":
      return <Flame size={size} />;
    case "pizza":
      return <Pizza size={size} />;
    case "cup-soda":
    case "drink":
      return <CupSoda size={size} />;
    case "coffee":
    case "tea":
      return <Coffee size={size} />;
    case "crown":
      return <Crown size={size} />;
    case "wheat":
    case "bread":
      return <Wheat size={size} />;
    case "award":
      return <Award size={size} />;
    default:
      // If it's a Unicode emoji or single character
      if (icon.length <= 4) {
        return <span className="text-base select-none">{icon}</span>;
      }
      return <Tag size={size} />;
  }
}
