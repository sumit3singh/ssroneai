import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Leaf, Maximize2, Minimize2, Sparkles, Coffee, Utensils, Pizza, Sandwich, Flame, LayoutGrid, Zap, X, Tv } from "lucide-react";
import { Input } from "@ssrone/ui";
import { toast } from "sonner";
import { POSCategory, POSMenuItem, POSTable, POSWaiter, getParsedVariantGroups, getParsedAddonGroups, POSCartItem } from "../../types";
import { POSExpressHotbar } from "../../components/POSExpressHotbar";
import { POSVoiceOrderButton } from "../../components/POSVoiceOrderButton";

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
}

const POSItemCard: React.FC<POSItemCardProps> = React.memo(({
  item,
  idx,
  isHighlighted,
  matchedActiveVariant,
  onAddToCart,
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
      onClick={handleCardClick}
      style={{ contentVisibility: "auto", containIntrinsicSize: "82px" }}
      className={`group border rounded-lg p-2 flex flex-col justify-between cursor-pointer shadow-2xs transition-all duration-150 relative min-h-[76px] sm:min-h-[82px] shrink-0 active:scale-[0.99] select-none ${
        isHighlighted
          ? "bg-primary/5 border-primary ring-2 ring-primary/60 shadow-md shadow-primary/10 scale-[1.01]"
          : "bg-card border-border hover:border-primary/80 hover:shadow-xs"
      }`}
    >
      {/* Top Row: Veg/Non-Veg [Index] on Left | RATE / PRICE IN TOP MIDDLE | Status/Custom Badge on Right */}
      <div className="flex items-center justify-between gap-1 pb-1 border-b border-border/40">
        {/* Left: Veg/Non-veg Dot + Index */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            title={item.is_veg ? "Vegetarian" : "Non-Vegetarian"}
            className={`h-3 w-3 border rounded-sm flex items-center justify-center p-0.5 ${
              item.is_veg ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "border-rose-600 bg-rose-50 dark:bg-rose-950/40"
            }`}
          >
            <span className={`h-1 w-1 rounded-full ${item.is_veg ? "bg-emerald-600" : "bg-rose-600"}`} />
          </span>
          <span className="text-[9px] font-mono opacity-60 font-bold">[{idx + 1}]</span>
        </div>

        {/* Top Middle: Rate / Price */}
        <div className="font-mono font-black text-xs sm:text-[13px] text-foreground text-center tracking-tight flex items-center gap-1">
          <span>₹{price}</span>
          {matchedActiveVariant && (
            <span className="text-[8px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/15 px-1 rounded-xs">
              {matchedActiveVariant.name.split(" ")[0]}
            </span>
          )}
        </div>

        {/* Right: Enter / Sizes Badge */}
        <div className="flex items-center gap-1 shrink-0">
          {isHighlighted && (
            <span className="text-[9px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1 py-0.2 rounded">
              ↵ Enter
            </span>
          )}
          {hasVariants && (
            <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-1 py-0.2 rounded-sm uppercase">
              Sizes
            </span>
          )}
        </div>
      </div>

      {/* Card Body: Dish Name + 1-Click Variant Chips */}
      <div className="pt-1 flex-1 flex flex-col justify-between">
        <h4 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {item.name}
        </h4>

        {/* 1-CLICK INSTANT VARIANT SIZE CHIPS */}
        {hasVariants && variantGroups[0]?.options && (
          <div className="flex flex-wrap items-center gap-1 pt-1 max-w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
                  className={`px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 ${
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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [vegOnlyFilter, setVegOnlyFilter] = useState<boolean>(false);
  // Default Side Categories to OPEN (true) as requested
  const [isVerticalCategories, setIsVerticalCategories] = useState<boolean>(true);
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("");
  const [activeVariantFilter, setActiveVariantFilter] = useState<any | null>(null);

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

  // Reset highlighted index when filter results change
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, selectedCategoryId, vegOnlyFilter]);

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
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Input
              id="pos-menu-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                  e.preventDefault();
                  setHighlightedIndex((prev) => Math.min(filteredMenuItems.length - 1, prev + 1));
                } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  setHighlightedIndex((prev) => Math.max(0, prev - 1));
                } else if (e.key === "Enter") {
                  handleNumpadEnter(e);
                }
              }}
              placeholder="Numpad e.g. 5*1 or 2*6 or search name/code..."
              icon={<Search size={14} className="text-muted-foreground" />}
              className="h-8 text-xs font-medium bg-background border-border focus:ring-1 focus:ring-primary rounded-md pr-20 sm:pr-28"
            />
            {searchTerm && filteredMenuItems.length > 0 ? (
              <kbd className="absolute right-2 top-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-extrabold pointer-events-none select-none animate-in fade-in flex items-center gap-1">
                <span>Enter ↵</span>
                <span className="opacity-70 text-[8px] hidden sm:inline">(Item #{highlightedIndex + 1})</span>
              </kbd>
            ) : (
              !searchTerm && (
                <kbd className="absolute right-2 top-1.5 px-1.5 py-0.5 rounded bg-muted/80 border border-border text-[9px] font-mono font-bold text-muted-foreground pointer-events-none select-none hidden sm:inline">
                  / or Ctrl+K
                </kbd>
              )
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {/* Multilingual AI Voice Order Taking Button */}
            <POSVoiceOrderButton menuItems={menuItems} onAddToCart={onAddToCart} />

            {/* Customer-Facing Display (CFD 2nd Monitor) Launcher */}
            <button
              type="button"
              onClick={() => window.open("/pos/cfd", "_blank", "width=1200,height=800")}
              className="h-8 px-2 sm:px-2.5 rounded text-xs font-semibold bg-background border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
              title="Open Customer-Facing Display (2nd Screen Kiosk Window)"
            >
              <Tv size={13} className="text-primary" />
              <span className="hidden sm:inline">2nd Screen</span>
            </button>

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
              className="h-8 px-2.5 sm:px-3 rounded-md text-xs font-extrabold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 shadow-xs active:scale-95 transition-all cursor-pointer"
              title="View & Assign Dining Tables Floor Layout"
            >
              <LayoutGrid size={14} className="text-white" />
              <span className="hidden xs:inline">Table Floor Grid</span>
              <span className="xs:hidden">Tables</span>
            </button>

            {/* Veg Only Toggle (Auto-hidden for pure-veg branches) */}
            {hasNonVegItems && (
              <button
                type="button"
                onClick={() => setVegOnlyFilter((prev) => !prev)}
                className={`h-8 px-2 sm:px-2.5 rounded text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
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
              className="h-8 px-2 sm:px-2.5 rounded text-xs font-semibold bg-background border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
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
                className={`h-8 px-2 sm:px-2.5 rounded font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
                  isFullScreenPOS
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20"
                }`}
              >
                {isFullScreenPOS ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span className="hidden sm:inline">{isFullScreenPOS ? "Exit Kiosk (F11)" : "Kiosk Fullscreen (F11)"}</span>
              </button>
            )}
          </div>
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
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] font-mono opacity-60 font-bold">[{idx + 1}]</span>
                  <span>{c.name}</span>
                  {catCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                      isSelected
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-primary/15 text-primary border border-primary/30"
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
            {/* Sidebar Top Header with Close Button */}
            <div className="flex items-center justify-between px-1 pt-0.5 pb-1 border-b border-border/60 shrink-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles size={11} className="text-primary" />
                Categories
              </span>
              <button
                type="button"
                onClick={() => setIsVerticalCategories(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Close Side Categories (Switch to Top Bar)"
              >
                <X size={13} />
              </button>
            </div>

            {/* Category Search Input */}
            <div className="relative shrink-0">
              <Input
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
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
                placeholder="Search cats (#, code)..."
                className="h-7 text-[11px] bg-background border-border px-2 py-0.5 rounded pr-6"
              />
              {categorySearchTerm && (
                <button
                  type="button"
                  onClick={() => setCategorySearchTerm("")}
                  className="absolute right-1.5 top-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear category search"
                >
                  <X size={11} />
                </button>
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
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`w-full px-2 py-1.5 rounded text-xs font-semibold text-left truncate cursor-pointer transition-all flex items-center justify-between gap-1 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                        : "bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] font-mono opacity-70 font-bold shrink-0">[{originalIndex}]</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    {catCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-primary/15 text-primary border border-primary/30"
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
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 min-h-0 overflow-y-auto p-1.5 scrollbar-thin auto-rows-max items-start">
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

            return (
              <POSItemCard
                key={item.id}
                item={item}
                idx={idx}
                isHighlighted={idx === highlightedIndex}
                matchedActiveVariant={matchedActiveVariant}
                onAddToCart={onAddToCart}
              />
            );
          })
        )}
      </div>
    </div>
  </div>
);
};
