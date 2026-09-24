import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Leaf, Maximize2, Minimize2, Sparkles, Coffee, Utensils, Pizza, Sandwich, Flame, LayoutGrid, Zap, X, Tv, Palette } from "lucide-react";
import { Input } from "@ssrone/ui";
import { toast } from "sonner";
import { POSCategory, POSMenuItem, POSTable, POSWaiter, getParsedVariantGroups, getParsedAddonGroups, POSCartItem } from "../../types";
import { POSExpressHotbar } from "../../components/POSExpressHotbar";
import { POSVoiceOrderButton } from "../../components/POSVoiceOrderButton";
import { getCategoryColor, CategoryColorTheme } from "../../utils/posCategoryColors";

interface POSItemGridProps {
  categories: POSCategory[];
  menuItems: POSMenuItem[];
  cartItems?: POSCartItem[];
  tables?: POSTable[];
  waiters?: POSWaiter[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddToCart: (item: POSMenuItem, explicitVariant?: any) => void;
  isFullScreenPOS?: boolean;
  onToggleFullScreen?: () => void;
  onNavigateToTables?: () => void;
}

interface POSItemCardProps {
  item: POSMenuItem;
  idx: number;
  isHighlighted: boolean;
  matchedActiveVariant: any | null;
  onAddToCart: (item: POSMenuItem, explicitVariant?: any) => void;
  categoryTheme?: CategoryColorTheme;
  isColorCoded?: boolean;
}

const POSItemCard: React.FC<POSItemCardProps> = React.memo(({
  item,
  idx,
  isHighlighted,
  matchedActiveVariant,
  onAddToCart,
  categoryTheme,
  isColorCoded = false,
}) => {
  const variantGroups = getParsedVariantGroups(item);
  const hasVariants = variantGroups.length > 0;

  const activePrice = matchedActiveVariant
    ? Number(matchedActiveVariant.sellingPrice ?? matchedActiveVariant.price ?? 0)
    : null;
  const price = activePrice !== null ? activePrice : (item.selling_price || item.base_price);

  const handleCardClick = () => {
    if (matchedActiveVariant) {
      onAddToCart(item, matchedActiveVariant);
      return;
    }
    if (hasVariants && variantGroups[0]?.options?.length > 0) {
      const defaultVar = variantGroups[0].options.find((o: any) => o.is_default) || variantGroups[0].options[0];
      onAddToCart(item, defaultVar);
      return;
    }
    onAddToCart(item);
  };

  return (
    <div
      id={`pos-item-card-${idx}`}
      onClick={handleCardClick}
      style={{ contentVisibility: "auto", containIntrinsicSize: "76px" }}
      className={`group border rounded-lg p-2 flex flex-col justify-between cursor-pointer shadow-2xs transition-all duration-150 relative min-h-[72px] h-auto shrink-0 active:scale-[0.99] select-none ${
        isHighlighted
          ? "ring-2 ring-primary/80 shadow-md scale-[1.01] " + (isColorCoded && categoryTheme ? `${categoryTheme.bg} ${categoryTheme.border}` : "bg-primary/5 border-primary")
          : isColorCoded && categoryTheme
          ? `${categoryTheme.bg} ${categoryTheme.border} hover:brightness-95 hover:shadow-xs`
          : "bg-card border-border hover:border-primary/80 hover:shadow-xs"
      }`}
    >
      {/* Header: [Index] Menu Item Name & Rate */}
      <div className="flex items-start justify-between gap-1.5 w-full">
        <div className="flex items-start gap-1 min-w-0 flex-1">
          {!item.is_veg && (
            <span
              title="Non-Vegetarian"
              className="h-3 w-3 border border-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-sm flex items-center justify-center p-0.5 mt-0.5 shrink-0"
            >
              <span className="h-1 w-1 rounded-full bg-rose-600" />
            </span>
          )}
          <span className="text-[10px] font-mono opacity-65 font-medium text-muted-foreground shrink-0">
            [{idx + 1}]
          </span>
          <h4 className="font-medium text-[12px] text-foreground leading-snug group-hover:text-primary transition-colors tracking-normal break-words">
            {item.name}
          </h4>
        </div>
        {!hasVariants && (
          <span className="font-mono font-semibold text-xs text-foreground shrink-0 pl-1 tabular-nums">
            ₹{price}
          </span>
        )}
      </div>

      {/* 1-Click Instant Variant Size Chips (Half ₹60, Full ₹80) */}
      {hasVariants && variantGroups[0]?.options && (
        <div className="flex flex-wrap items-center gap-1 pt-1.5 max-w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {variantGroups[0].options.map((opt: any, optIdx: number) => {
            const optPrice = Number(opt.sellingPrice ?? opt.price ?? 0);
            const isChipActive = matchedActiveVariant && (matchedActiveVariant.id || matchedActiveVariant.name) === (opt.id || opt.name);
            return (
              <button
                key={opt.id || opt.name || optIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item, opt);
                }}
                className={`px-1.5 py-0.5 rounded-sm text-[9.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 tabular-nums ${
                  isChipActive
                    ? "bg-sky-600 text-white border border-sky-500 shadow-xs"
                    : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                }`}
                title={`Click to add ${opt.name} ₹${optPrice}`}
              >
                {opt.name.split(" ")[0]} ₹{optPrice}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export const POSItemGrid: React.FC<POSItemGridProps> = ({
  categories,
  menuItems,
  cartItems = [],
  selectedCategoryId,
  setSelectedCategoryId,
  searchTerm,
  setSearchTerm,
  onAddToCart,
  isFullScreenPOS,
  onToggleFullScreen,
  onNavigateToTables
}) => {
  const navigate = useNavigate();
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [vegOnlyFilter, setVegOnlyFilter] = useState<boolean>(false);
  // Default Side Categories to OPEN (true) as requested
  const [isVerticalCategories, setIsVerticalCategories] = useState<boolean>(true);
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("");
  const [activeVariantFilter, setActiveVariantFilter] = useState<any | null>(null);

  // Category Color Tint Toggle State (Persisted in localStorage; default is false/normal)
  const [isColorCodedItems, setIsColorCodedItems] = useState<boolean>(() => {
    try {
      return localStorage.getItem("pos_color_coded_items") === "true";
    } catch {
      return false;
    }
  });

  const toggleColorCodedItems = () => {
    setIsColorCodedItems((prev) => {
      const nextVal = !prev;
      try {
        localStorage.setItem("pos_color_coded_items", String(nextVal));
      } catch {}
      toast.info(nextVal ? "🎨 Category color tint ON dishes" : "⚪ Normal dish card style");
      return nextVal;
    });
  };

  // Shortcut key Alt+/ to focus Category Search Filter
  React.useEffect(() => {
    const focusCategorySearch = () => {
      setIsVerticalCategories(true);
      setTimeout(() => {
        const inputEl = document.getElementById("pos-category-search-input") as HTMLInputElement | null;
        if (inputEl) {
          inputEl.focus();
          inputEl.select();
        }
      }, 50);
    };

    const handleCategoryShortcut = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "/" || e.key === "?" || e.code === "Slash")) {
        e.preventDefault();
        focusCategorySearch();
      }
    };

    const handleCustomFocus = () => focusCategorySearch();

    window.addEventListener("keydown", handleCategoryShortcut);
    window.addEventListener("pos-focus-category", handleCustomFocus);
    return () => {
      window.removeEventListener("keydown", handleCategoryShortcut);
      window.removeEventListener("pos-focus-category", handleCustomFocus);
    };
  }, []);

  // Check if branch contains any non-veg items (for pure-veg branch toggle hiding)
  const hasNonVegItems = React.useMemo(() => {
    return menuItems.some((i) => !i.is_veg);
  }, [menuItems]);

  // Filtered categories by name, code, or index number [1, 2, 3]
  const filteredCategories = React.useMemo(() => {
    const term = categorySearchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c, idx) => {
      const matchesName = c.name.toLowerCase().includes(term);
      const matchesCode =
        c.slug?.toLowerCase().includes(term) ||
        ((c as any).code && String((c as any).code).toLowerCase().includes(term));
      const indexStr = String(idx + 1);
      const matchesIndex = term === indexStr || term === `[${indexStr}]` || term === `#${indexStr}`;
      return matchesName || matchesCode || matchesIndex;
    });
  }, [categories, categorySearchTerm]);

  // Reset highlighted index when filter results change (active index if searching, else -1)
  React.useEffect(() => {
    setHighlightedIndex(searchTerm.trim() ? 0 : -1);
  }, [searchTerm, selectedCategoryId, vegOnlyFilter]);

  // Auto-scroll catalog grid when navigating with arrow keys
  React.useEffect(() => {
    if (highlightedIndex >= 0) {
      const el = document.getElementById(`pos-item-card-${highlightedIndex}`);
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex]);

  // Reset active variant filter when changing category
  React.useEffect(() => {
    setActiveVariantFilter(null);
  }, [selectedCategoryId]);

  // Live calculation of item counts in cart per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (!cartItems || cartItems.length === 0) return counts;
    const itemCatMap = new Map<string, string>();
    menuItems.forEach((m) => {
      if (m.category_id) itemCatMap.set(String(m.id), String(m.category_id));
    });
    cartItems.forEach((c) => {
      const catId = itemCatMap.get(String(c.item_id));
      if (catId) {
        counts[catId] = (counts[catId] || 0) + c.quantity;
      }
    });
    return counts;
  }, [cartItems, menuItems]);

  const totalCartCount = React.useMemo(() => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const filteredMenuItems = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (item.is_deleted || item.is_available === false) return false;
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        (item.item_code && item.item_code.toLowerCase().includes(term));
      if (!matchesSearch) return false;
      if (selectedCategoryId && String(item.category_id) !== String(selectedCategoryId)) return false;
      if (vegOnlyFilter && !item.is_veg) return false;
      return true;
    });
  }, [menuItems, searchTerm, selectedCategoryId, vegOnlyFilter]);

  // Discover common variant options (e.g. Sizes) available across current category or dishes
  const availableVariantOptions = React.useMemo(() => {
    const candidateItems = selectedCategoryId
      ? menuItems.filter((m) => String(m.category_id) === String(selectedCategoryId))
      : filteredMenuItems;

    const optMap = new Map<string, any>();
    candidateItems.forEach((item) => {
      const vGroups = getParsedVariantGroups(item);
      if (vGroups.length > 0 && vGroups[0]?.options) {
        vGroups[0].options.forEach((opt: any) => {
          const key = (opt.name || "").trim().toLowerCase();
          if (key && !optMap.has(key)) {
            optMap.set(key, opt);
          }
        });
      }
    });
    return Array.from(optMap.values());
  }, [menuItems, selectedCategoryId, filteredMenuItems]);

  // Helper to match size codes like 's', 'm', 'l', 'reg', 'med', 'lrg'
  const findVariantBySizeCode = (item: POSMenuItem, code: string) => {
    const vGroups = getParsedVariantGroups(item);
    if (!vGroups || vGroups.length === 0 || !vGroups[0]?.options) return null;
    const c = code.toLowerCase().trim();
    return (
      vGroups[0].options.find((opt: any) => {
        const name = (opt.name || "").toLowerCase();
        if (["s", "reg", "regular", "small", "7", "7\""].includes(c)) {
          return name.includes("reg") || name.includes("small") || name.includes("7") || name.startsWith("s");
        }
        if (["m", "med", "medium", "10", "10\""].includes(c)) {
          return name.includes("med") || name.includes("10") || name.startsWith("m");
        }
        if (["l", "lrg", "large", "12", "12\""].includes(c)) {
          return name.includes("larg") || name.includes("12") || name.startsWith("l");
        }
        return name.startsWith(c);
      }) || vGroups[0].options[0]
    );
  };

  // Helper to resolve an item by identifier (e.g. "1.1", "MN01", "1", "dosa")
  const resolveItemByIdentifier = (identifier: string): POSMenuItem | null => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return null;

    // 1. Direct match on item_code (e.g. "1.1" or "PZ01" or "101")
    const codeMatch = menuItems.find(
      (m) =>
        (m.item_code && m.item_code.trim().toLowerCase() === clean) ||
        ((m as any).code && String((m as any).code).trim().toLowerCase() === clean) ||
        String(m.id) === clean
    );
    if (codeMatch) return codeMatch;

    // 2. Notation "CatIndex.ItemIndex" e.g. "1.1" (Category 1, Item 1) or "2.3"
    const dotParts = clean.split(".");
    if (dotParts.length === 2 && !isNaN(Number(dotParts[0])) && !isNaN(Number(dotParts[1]))) {
      const catIndex = parseInt(dotParts[0]) - 1;
      const itemIndex = parseInt(dotParts[1]) - 1;
      if (categories[catIndex]) {
        const catId = categories[catIndex].id;
        const catItems = menuItems.filter(
          (m) => String(m.category_id) === String(catId) && !m.is_deleted && m.is_available !== false
        );
        if (catItems[itemIndex]) {
          return catItems[itemIndex];
        }
      }
    }

    // 3. If identifier is a pure integer e.g. "1" or "12"
    if (/^\d+$/.test(clean)) {
      const idx = parseInt(clean);
      // First check if an item has item_code === "1"
      const itemWithNumCode = menuItems.find(
        (m) => m.item_code && m.item_code.trim() === clean
      );
      if (itemWithNumCode) return itemWithNumCode;

      // Fall back to 1-based index in current grid or menu list
      if (filteredMenuItems[idx - 1]) return filteredMenuItems[idx - 1];
      if (menuItems[idx - 1]) return menuItems[idx - 1];
    }

    // 4. Match by exact or prefix dish name
    const exactNameMatch = menuItems.find((m) => m.name.toLowerCase() === clean);
    if (exactNameMatch) return exactNameMatch;

    const prefixMatch = menuItems.find((m) => m.name.toLowerCase().startsWith(clean));
    if (prefixMatch) return prefixMatch;

    return null;
  };

  // Numpad Multiplier & Code Parser Engine (e.g. 1*1.1, 5*1, 2*1m, 1.1, 1m, pizza m)
  const handleNumpadEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const raw = searchTerm.trim();
      if (!raw) return;

      // Pattern 1: Multiplier with Code/Identifier and optional Variant Size
      // Matches: "1*1.1", "2*1.1m", "5*1", "3xPZ01", "2*dosa l", "10*2.1", "1*1.1 m"
      const multMatch = raw.match(/^(\d+)[\*xX]([^\s]+)(?:\s+([a-zA-Z]+))?$/);
      if (multMatch) {
        const qty = Math.max(1, parseInt(multMatch[1]));
        let itemIdentifier = multMatch[2];
        let sizeCode = multMatch[3];

        if (!sizeCode) {
          const sizeSuffixMatch = itemIdentifier.match(/^([a-zA-Z0-9\._\-]+?)([sSmMlL]|reg|med|lrg)$/i);
          if (sizeSuffixMatch && (/^\d+(\.\d+)?$/.test(sizeSuffixMatch[1]) || /^[A-Z0-9]+$/i.test(sizeSuffixMatch[1]))) {
            itemIdentifier = sizeSuffixMatch[1];
            sizeCode = sizeSuffixMatch[2];
          }
        }

        const targetItem = resolveItemByIdentifier(itemIdentifier);
        if (targetItem) {
          const matchedVar = sizeCode
            ? findVariantBySizeCode(targetItem, sizeCode)
            : activeVariantFilter
            ? findVariantBySizeCode(targetItem, activeVariantFilter.name)
            : undefined;

          for (let i = 0; i < qty; i++) {
            onAddToCart(targetItem, matchedVar);
          }
          toast.success(`Added ${qty}x ${targetItem.name} ${matchedVar ? `(${matchedVar.name})` : ""}`, { icon: "⚡" });
          setSearchTerm("");
          return;
        }
      }

      // Pattern 2: Single Item Code with optional Size e.g. "1.1", "PZ01", "1m", "1.1m"
      const singleCodeMatch = raw.match(/^([a-zA-Z0-9\._\-]+)(?:\s+([a-zA-Z]+))?$/);
      if (singleCodeMatch) {
        let itemIdentifier = singleCodeMatch[1];
        let sizeCode = singleCodeMatch[2];

        if (!sizeCode) {
          const sizeSuffixMatch = itemIdentifier.match(/^([a-zA-Z0-9\._\-]+?)([sSmMlL]|reg|med|lrg)$/i);
          if (sizeSuffixMatch && (/^\d+(\.\d+)?$/.test(sizeSuffixMatch[1]) || /^[A-Z0-9]+$/i.test(sizeSuffixMatch[1]))) {
            itemIdentifier = sizeSuffixMatch[1];
            sizeCode = sizeSuffixMatch[2];
          }
        }

        const targetItem = resolveItemByIdentifier(itemIdentifier);
        if (targetItem) {
          const matchedVar = sizeCode
            ? findVariantBySizeCode(targetItem, sizeCode)
            : activeVariantFilter
            ? findVariantBySizeCode(targetItem, activeVariantFilter.name)
            : undefined;

          onAddToCart(targetItem, matchedVar);
          toast.success(`Added 1x ${targetItem.name} ${matchedVar ? `(${matchedVar.name})` : ""}`, { icon: "⚡" });
          setSearchTerm("");
          return;
        }
      }

      // Pattern 3: Dish Name with Size Shorthand e.g. "pizza m", "margh l", "dosa r"
      const textVarMatch = raw.match(/^(.*?)\s+([sSmMlL]|reg|med|lrg|small|medium|large)$/i);
      if (textVarMatch) {
        const queryText = textVarMatch[1].trim().toLowerCase();
        const sizeCode = textVarMatch[2].trim();
        const candidate = menuItems.find(
          (m) =>
            m.name.toLowerCase().includes(queryText) ||
            (m.item_code && m.item_code.toLowerCase().includes(queryText))
        );
        if (candidate) {
          const matchedVar = findVariantBySizeCode(candidate, sizeCode);
          onAddToCart(candidate, matchedVar);
          toast.success(`Added ${candidate.name} ${matchedVar ? `(${matchedVar.name})` : ""}`, { icon: "⚡" });
          setSearchTerm("");
          return;
        }
      }

      // Standard Search Selection (Top / Highlighted Item in current filtered grid)
      if (filteredMenuItems.length > 0) {
        const idx = Math.min(highlightedIndex, filteredMenuItems.length - 1);
        const targetItem = filteredMenuItems[idx] || filteredMenuItems[0];
        const optToAdd = activeVariantFilter
          ? findVariantBySizeCode(targetItem, activeVariantFilter.name)
          : undefined;
        onAddToCart(targetItem, optToAdd);
        toast.success(`Added 1x ${targetItem.name} ${optToAdd ? `(${optToAdd.name})` : ""}`, { icon: "⚡" });
        setSearchTerm("");
      }
    }
  };


  return (
    <div className="space-y-2 flex flex-col h-full max-h-full overflow-hidden">
      {/* Express Bestseller Hotbar */}
      <POSExpressHotbar menuItems={menuItems} onAddToCart={onAddToCart} />

      {/* Search Input, Category Tabs & Controls Header Bar */}
      <div className="bg-card border border-border rounded-lg p-2 shadow-2xs space-y-1.5 shrink-0">
        {/* Top Control Bar: Search Input + Tools in ONE SINGLE NON-WRAPPING ROW */}
        <div className="flex items-center gap-1.5 w-full overflow-x-auto scrollbar-none">
          {/* Search Input (Flexible width, in front of tools line) */}
          <div className="relative flex-1 min-w-[130px] max-w-sm shrink">
            <Input
              id="pos-menu-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const gridEl = document.getElementById("pos-catalog-grid");
                  let cols = 4;
                  if (gridEl) {
                    const comp = window.getComputedStyle(gridEl);
                    const tmpl = comp.getPropertyValue("grid-template-columns");
                    if (tmpl) cols = tmpl.split(/\s+/).filter(Boolean).length || 4;
                  }
                  setHighlightedIndex((prev) => {
                    const current = prev < 0 ? 0 : prev;
                    const next = current + cols;
                    return next < filteredMenuItems.length ? next : Math.min(filteredMenuItems.length - 1, current);
                  });
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const gridEl = document.getElementById("pos-catalog-grid");
                  let cols = 4;
                  if (gridEl) {
                    const comp = window.getComputedStyle(gridEl);
                    const tmpl = comp.getPropertyValue("grid-template-columns");
                    if (tmpl) cols = tmpl.split(/\s+/).filter(Boolean).length || 4;
                  }
                  setHighlightedIndex((prev) => {
                    const current = prev < 0 ? 0 : prev;
                    return Math.max(0, current - cols);
                  });
                } else if (e.key === "ArrowRight") {
                  e.preventDefault();
                  setHighlightedIndex((prev) => Math.min(filteredMenuItems.length - 1, Math.max(0, prev + 1)));
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setHighlightedIndex((prev) => Math.max(0, prev - 1));
                } else if (e.key === "Enter") {
                  if (highlightedIndex >= 0 && filteredMenuItems[highlightedIndex]) {
                    e.preventDefault();
                    const item = filteredMenuItems[highlightedIndex];
                    const optToAdd = activeVariantFilter
                      ? findVariantBySizeCode(item, activeVariantFilter.name)
                      : undefined;
                    onAddToCart(item, optToAdd);
                    toast.success(`Added 1x ${item.name}`, { icon: "⚡" });
                    setSearchTerm("");
                    setHighlightedIndex(-1);
                    return;
                  }
                  handleNumpadEnter(e);
                }
              }}
              placeholder="Search dish / code (or 5*1)..."
              icon={<Search size={14} className="text-muted-foreground" />}
              className="h-8 text-xs font-medium bg-background border-border focus:ring-1 focus:ring-primary rounded-md pr-14"
            />
            {searchTerm && filteredMenuItems.length > 0 ? (
              <kbd className="absolute right-2 top-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-extrabold pointer-events-none select-none animate-in fade-in flex items-center gap-1">
                <span>↵ Enter</span>
              </kbd>
            ) : (
              !searchTerm && (
                <kbd className="absolute right-2 top-1.5 px-1.5 py-0.5 rounded bg-muted/80 border border-border text-[9px] font-mono font-bold text-muted-foreground pointer-events-none select-none hidden sm:inline">
                  /
                </kbd>
              )
            )}
          </div>

          {/* Multilingual AI Voice Order Taking Button */}
          <POSVoiceOrderButton menuItems={menuItems} onAddToCart={onAddToCart} />

          {/* Table Floor Tracker Button */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateToTables) {
                onNavigateToTables();
              } else {
                navigate({ to: "/pos/transaction/tables" });
              }
            }}
            className="h-8 px-2.5 rounded-md text-xs font-extrabold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            title="View & Assign Dining Tables Floor Layout (Alt+T)"
          >
            <LayoutGrid size={13} className="text-white" />
            <span>Tables</span>
            <span className="px-1 py-0.2 rounded bg-amber-700/60 border border-amber-400/40 text-[9px] font-mono font-extrabold text-amber-100 shadow-2xs">
              Alt+T
            </span>
          </button>

          {/* Veg Only Toggle (Auto-hidden for pure-veg branches) */}
          {hasNonVegItems && (
            <button
              type="button"
              onClick={() => setVegOnlyFilter((prev) => !prev)}
              className={`h-8 px-2 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer shrink-0 ${
                vegOnlyFilter
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Leaf size={12} className={vegOnlyFilter ? "text-emerald-600" : "text-muted-foreground"} />
              <span>Veg</span>
            </button>
          )}

          {/* Toggle Category Bar Position */}
          <button
            type="button"
            onClick={() => setIsVerticalCategories((prev) => !prev)}
            className="h-8 px-2 rounded-md text-xs font-semibold bg-background border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            title="Toggle category list position (Top Bar vs Left Sidebar)"
          >
            <Sparkles size={12} className="text-primary" />
            <span>{isVerticalCategories ? "Top Cats" : "Side Cats"}</span>
          </button>

          {/* Full-Screen Workspace Toggle Button */}
          {onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              title={isFullScreenPOS ? "Exit Fullscreen Kiosk Mode" : "Enter Fullscreen Kiosk Mode"}
              className={`h-8 px-2 sm:px-2.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
                isFullScreenPOS
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20"
              }`}
            >
              {isFullScreenPOS ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isFullScreenPOS ? "Exit Kiosk (F11)" : "Kiosk Fullscreen (F11)"}</span>
            </button>
          )}
        </div>

        {/* Horizontal Category Bar */}
        {!isVerticalCategories && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-thin border-t border-border pt-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                selectedCategoryId === null
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>ALL ITEMS</span>
              {totalCartCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                  selectedCategoryId === null
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-primary/15 text-primary border border-primary/30"
                }`}>
                  {totalCartCount}
                </span>
              )}
            </button>
            {categories.map((c, idx) => {
              const catCount = categoryCounts[String(c.id)] || 0;
              const isSelected = selectedCategoryId === c.id;
              const theme = getCategoryColor(c, idx);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-bold border border-slate-900 dark:border-white"
                      : `${theme.bg} ${theme.border} ${theme.text} border hover:brightness-95`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${theme.dot} shrink-0`} />
                  <span className="text-[10px] font-mono opacity-70 font-bold">[{idx + 1}]</span>
                  <span>{c.name}</span>
                  {catCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                      isSelected
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-slate-900/10 dark:bg-white/15 text-slate-800 dark:text-slate-200 border border-slate-400/30"
                    }`}>
                      {catCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Horizontal Variant Strip (S / M / L) */}
        {availableVariantOptions.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto py-1 px-0.5 border-t border-border/40 scrollbar-none animate-in fade-in">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase mr-1 flex items-center gap-1 shrink-0">
              <Sparkles size={11} className="text-primary" /> Size:
            </span>
            <button
              type="button"
              onClick={() => setActiveVariantFilter(null)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 ${
                activeVariantFilter === null
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground border border-border"
              }`}
            >
              ALL SIZES
            </button>
            {availableVariantOptions.map((opt) => {
              const isActive = activeVariantFilter && (activeVariantFilter.name || "").toLowerCase() === (opt.name || "").toLowerCase();
              return (
                <button
                  key={opt.id || opt.name}
                  type="button"
                  onClick={() => setActiveVariantFilter(isActive ? null : opt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 flex items-center gap-1 ${
                    isActive
                      ? "bg-sky-600 text-white shadow-xs border border-sky-500"
                      : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                  }`}
                >
                  <span>{opt.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Item Display Workspace Container */}
      <div className="flex-1 min-h-0 flex gap-2 overflow-hidden">
        {/* Left Vertical Category Sidebar */}
        {isVerticalCategories && (
          <div className="w-32 sm:w-44 shrink-0 bg-card border border-border rounded-lg p-1.5 flex flex-col gap-1.5 overflow-hidden">
            {/* Sidebar Top Header with Color Tint Toggle & Close Button */}
            <div className="flex items-center justify-between px-1 pt-0.5 pb-1 border-b border-border/60 shrink-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles size={11} className="text-primary" />
                Categories
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleColorCodedItems}
                  className={`p-1 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                    isColorCodedItems
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  title={isColorCodedItems ? "Category Color Tint ON Dishes (Click for Normal Cards)" : "Category Color Tint OFF (Click to Color Items by Category)"}
                >
                  <Palette size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsVerticalCategories(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Close Side Categories (Switch to Top Bar)"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Category Search Input with [Alt+C] Shortcut & Instant Numeric Selection */}
            <div className="relative shrink-0">
              <Input
                id="pos-category-search-input"
                value={categorySearchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategorySearchTerm(val);
                  const clean = val.trim().toLowerCase();
                  if (!clean) return;
                  if (clean === "0" || clean === "all") {
                    setSelectedCategoryId(null);
                    return;
                  }
                  // Instant numeric resolution (e.g. typing "1" selects Category 1 immediately without Enter)
                  if (/^\d+$/.test(clean)) {
                    const idx = parseInt(clean, 10) - 1;
                    if (categories[idx]) {
                      setSelectedCategoryId(categories[idx].id);
                    }
                  } else {
                    const match = categories.find((c) => c.name.toLowerCase().startsWith(clean) || c.name.toLowerCase() === clean);
                    if (match) {
                      setSelectedCategoryId(match.id);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (categorySearchTerm.trim() === "0" || categorySearchTerm.trim().toLowerCase() === "all") {
                      setSelectedCategoryId(null);
                      setCategorySearchTerm("");
                      toast.info("Selected: ALL ITEMS");
                      return;
                    }
                    if (filteredCategories.length > 0) {
                      setSelectedCategoryId(filteredCategories[0].id);
                      toast.info(`Selected category: ${filteredCategories[0].name}`);
                      setCategorySearchTerm("");
                    }
                  }
                }}
                placeholder="Search cats (Alt+/, #, code)..."
                className="h-7 text-[11px] bg-background border-border px-2 py-0.5 rounded pr-12"
              />
              {categorySearchTerm ? (
                <button
                  type="button"
                  onClick={() => setCategorySearchTerm("")}
                  className="absolute right-1.5 top-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear category search"
                >
                  <X size={11} />
                </button>
              ) : (
                <kbd className="absolute right-1.5 top-1.5 px-1 py-0.2 rounded bg-muted/80 border border-border text-[8px] font-mono font-bold text-muted-foreground pointer-events-none select-none">
                  Alt+/
                </kbd>
              )}
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-1 pr-0.5">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full px-2 py-1.5 rounded text-xs font-bold text-left truncate cursor-pointer transition-all flex items-center justify-between ${
                  selectedCategoryId === null
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="truncate">ALL ITEMS</span>
                {totalCartCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black shrink-0 ${
                    selectedCategoryId === null
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-primary/15 text-primary border border-primary/30"
                  }`}>
                    {totalCartCount}
                  </span>
                )}
              </button>

              {filteredCategories.map((c) => {
                const originalIndex = categories.findIndex((orig) => orig.id === c.id) + 1;
                const catCount = categoryCounts[String(c.id)] || 0;
                const isSelected = selectedCategoryId === c.id;
                const theme = getCategoryColor(c, originalIndex - 1);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`w-full px-2 py-1.5 rounded text-xs font-semibold text-left truncate cursor-pointer transition-all flex items-center justify-between gap-1 ${
                      isSelected
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-bold border border-slate-900 dark:border-white"
                        : `${theme.bg} ${theme.border} ${theme.text} border hover:brightness-95`
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full ${theme.dot} shrink-0`} />
                      <span className="text-[10px] font-mono opacity-70 font-bold shrink-0">[{originalIndex}]</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    {catCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-slate-900/10 dark:bg-white/15 text-slate-800 dark:text-slate-200 border border-slate-400/30"
                      }`}>
                        {catCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Catalog Auto-Fit Product Grid */}
        <div
          id="pos-catalog-grid"
          className="flex-1 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 min-h-0 overflow-y-auto p-1.5 scrollbar-thin auto-rows-max items-start"
        >
        {filteredMenuItems.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-border rounded-lg">
            <Utensils size={28} className="mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-xs font-semibold text-muted-foreground">No dishes matching search filter.</p>
          </div>
        ) : (
          filteredMenuItems.map((item, idx) => {
            const variantGroups = getParsedVariantGroups(item);
            const matchedActiveVariant = activeVariantFilter && variantGroups.length > 0 && variantGroups[0]?.options
              ? variantGroups[0].options.find(
                  (o: any) => (o.name || "").trim().toLowerCase() === (activeVariantFilter.name || "").trim().toLowerCase()
                ) || null
              : null;

            const itemCat = categories.find((c) => String(c.id) === String(item.category_id));
            const itemCatIdx = categories.findIndex((c) => String(c.id) === String(item.category_id));
            const catTheme = getCategoryColor(itemCat, itemCatIdx >= 0 ? itemCatIdx : 0);

            return (
              <POSItemCard
                key={item.id}
                item={item}
                idx={idx}
                isHighlighted={idx === highlightedIndex}
                matchedActiveVariant={matchedActiveVariant}
                onAddToCart={onAddToCart}
                categoryTheme={catTheme}
                isColorCoded={isColorCodedItems}
              />
            );
          })
        )}
      </div>
    </div>
  </div>
);
};
