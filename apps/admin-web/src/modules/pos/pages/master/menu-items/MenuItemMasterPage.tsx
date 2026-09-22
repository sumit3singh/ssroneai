import React, { useState } from "react";
import { Plus, Search, Utensils, Edit2, Trash2, Layers, Package, Sparkles, ChevronDown, ChevronUp, Tag, AlertCircle, CheckCircle2, X, Zap, Scale } from "lucide-react";
import { Button, Input, PageHeader, PageContainer } from "@ssrone/ui";
import { POSMenuItem, POSCategory } from "../../../types";
import { MenuTagMasterModal } from "../MenuTagMasterModal";
import { ItemVariantsAddonsModal } from "../ItemVariantsAddonsModal";
import { RecipeBOMModal } from "../RecipeBOMModal";

interface MenuItemMasterPageProps {
  menuItems: POSMenuItem[];
  categories: POSCategory[];
  onOpenCreate: () => void;
  onOpenEdit: (item: POSMenuItem) => void;
  onDelete: (id: number) => Promise<void>;
  onToggleAvailability: (item: POSMenuItem) => Promise<void>;
  onTogglePopular?: (item: POSMenuItem) => Promise<void>;
  isLoading?: boolean;
}

export const MenuItemMasterPage: React.FC<MenuItemMasterPageProps> = ({
  menuItems = [],
  categories = [],
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onToggleAvailability,
  onTogglePopular,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "veg" | "non_veg" | "in_stock" | "out_of_stock" | "variants">("all");
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  // Sub-modals state for Enterprise Features
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [variantModalItem, setVariantModalItem] = useState<POSMenuItem | null>(null);
  const [recipeModalItem, setRecipeModalItem] = useState<POSMenuItem | null>(null);

  // Compute KPI Statistics
  const totalCount = menuItems.length;
  const inStockCount = menuItems.filter((i) => i.is_available).length;
  const outOfStockCount = totalCount - inStockCount;
  const vegCount = menuItems.filter((i) => i.is_veg).length;
  const nonVegCount = totalCount - vegCount;
  const variantCount = menuItems.filter((i) => i.variant_groups && i.variant_groups.length > 0).length;

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.item_code && item.item_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((item as any).itemCode && (item as any).itemCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedCatId && String(item.category_id) !== String(selectedCatId)) return false;

    if (filterMode === "veg") return item.is_veg;
    if (filterMode === "non_veg") return !item.is_veg;
    if (filterMode === "in_stock") return item.is_available;
    if (filterMode === "out_of_stock") return !item.is_available;
    if (filterMode === "variants") return item.variant_groups && item.variant_groups.length > 0;

    return true;
  });

  const toggleExpandRow = (id: number) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  const hasActiveFilters = searchTerm !== "" || selectedCatId !== null || filterMode !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCatId(null);
    setFilterMode("all");
  };

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Dish Catalog & Master"
        description="Configure menu items, prices, stations, portion variants, and modifiers"
        icon={<Utensils size={18} />}
        badge={`${totalCount} Dishes`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsTagModalOpen(true)}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Tag size={14} /> Menu Tags
            </Button>
            <Button
              onClick={onOpenCreate}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={15} /> Add New Dish
            </Button>
          </div>
        }
      />

        {/* Top Summary KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            onClick={() => setFilterMode("all")}
            className={`p-3 rounded-md border transition-colors cursor-pointer ${
              filterMode === "all"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border hover:bg-muted/40 text-foreground"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Dishes</div>
            <div className="text-lg font-bold font-mono mt-0.5">{totalCount}</div>
          </div>

          <div
            onClick={() => setFilterMode("in_stock")}
            className={`p-3 rounded-md border transition-colors cursor-pointer ${
              filterMode === "in_stock"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-card border-border hover:bg-muted/40 text-foreground"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <CheckCircle2 size={12} /> In Stock
            </div>
            <div className="text-lg font-bold font-mono mt-0.5">{inStockCount}</div>
          </div>

          <div
            onClick={() => setFilterMode("out_of_stock")}
            className={`p-3 rounded-md border transition-colors cursor-pointer ${
              filterMode === "out_of_stock"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-card border-border hover:bg-muted/40 text-foreground"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <AlertCircle size={12} /> Out of Stock
            </div>
            <div className="text-lg font-bold font-mono mt-0.5">{outOfStockCount}</div>
          </div>

          <div
            onClick={() => setFilterMode("veg")}
            className={`p-3 rounded-md border transition-colors cursor-pointer ${
              filterMode === "veg"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-card border-border hover:bg-muted/40 text-foreground"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Diet Type</div>
            <div className="text-xs font-semibold mt-1 flex items-center gap-1.5 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400">Veg: {vegCount}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-rose-600 dark:text-rose-400">Non-Veg: {nonVegCount}</span>
            </div>
          </div>

          <div
            onClick={() => setFilterMode("variants")}
            className={`p-3 rounded-md border transition-colors cursor-pointer ${
              filterMode === "variants"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border hover:bg-muted/40 text-foreground"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Layers size={12} /> Variants
            </div>
            <div className="text-lg font-bold font-mono mt-0.5">{variantCount}</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dish by name or description..."
              icon={<Search size={14} />}
              className="h-9 text-xs"
            />
          </div>

          <select
            value={selectedCatId || ""}
            onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : null)}
            className="h-9 px-2.5 rounded border border-border bg-background text-xs text-foreground cursor-pointer shrink-0 focus:outline-none"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon || "🍛"} {c.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-2.5 shrink-0 gap-1"
            >
              <X size={13} /> Reset
            </Button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider shrink-0 mr-1">Filter View:</span>
          {[
            { id: "all", label: "All Items" },
            { id: "veg", label: "Veg Only" },
            { id: "non_veg", label: "Non-Veg Only" },
            { id: "in_stock", label: "In Stock" },
            { id: "out_of_stock", label: "Out of Stock" },
            { id: "variants", label: "Has Size Variants" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterMode(pill.id as any)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                filterMode === pill.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Main Dishes Table Container */}
        <div className="bg-card border border-border rounded-md overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="p-2.5 w-8"></th>
                  <th className="p-2.5">Item Code</th>
                  <th className="p-2.5">Dish Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Diet Type</th>
                  <th className="p-2.5">KDS Station</th>
                  <th className="p-2.5 text-center">Packaging Fee</th>
                  <th className="p-2.5 text-right">Selling Price</th>
                  <th className="p-2.5 text-center">Stock Availability</th>
                  <th className="p-2.5 text-center">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={10} className="p-4">
                      <div className="h-6 bg-slate-200/60 dark:bg-slate-800/60 animate-pulse rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Utensils size={36} className="text-slate-300 dark:text-slate-700" />
                      <p className="text-xs text-slate-500 font-bold">No menu items found matching search & filter criteria.</p>
                      {hasActiveFilters ? (
                        <button
                          onClick={clearFilters}
                          className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 underline font-bold bg-transparent border-none cursor-pointer"
                        >
                          Clear active filters
                        </button>
                      ) : (
                        <button
                          onClick={onOpenCreate}
                          className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 underline font-bold bg-transparent border-none cursor-pointer"
                        >
                          + Add your first dish to PostgreSQL database
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const hasVariants = item.variant_groups && item.variant_groups.length > 0;
                  const hasAddons = item.addon_groups && item.addon_groups.length > 0;
                  const price = item.selling_price || item.base_price;
                  const cat = categories.find((c) => String(c.id) === String(item.category_id));
                  const isExpanded = expandedItemId === item.id;
                  const displayCode = item.item_code || (item as any).itemCode || `P${item.id}`;

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                          isExpanded ? "bg-muted/50" : ""
                        }`}
                      >
                        <td className="p-2.5 text-center text-muted-foreground" onClick={() => toggleExpandRow(item.id)}>
                          {(hasVariants || hasAddons || item.description) && (
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-muted border-none bg-transparent cursor-pointer text-muted-foreground"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400" onClick={() => toggleExpandRow(item.id)}>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60">
                            {displayCode}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium text-foreground" onClick={() => toggleExpandRow(item.id)}>
                          <div className="flex items-center gap-2">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-7 w-7 rounded object-cover border border-border shrink-0"
                              />
                            ) : (
                              <span
                                className={`h-3.5 w-3.5 border rounded flex items-center justify-center p-0.5 shrink-0 ${
                                  item.is_veg ? "border-emerald-600 bg-emerald-500/10" : "border-rose-600 bg-rose-500/10"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${item.is_veg ? "bg-emerald-600" : "bg-rose-600"}`} />
                              </span>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                {onTogglePopular && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTogglePopular(item);
                                    }}
                                    title={
                                      item.is_popular
                                        ? "Remove from Top 12 Express Bestseller Hotbar"
                                        : "Pin to Top 12 Express Bestseller Hotbar (Shift+F1–F12)"
                                    }
                                    className="cursor-pointer p-0.5 hover:scale-110 transition-transform"
                                  >
                                    <Zap
                                      size={14}
                                      className={
                                        item.is_popular
                                          ? "text-amber-500 fill-amber-500"
                                          : "text-muted-foreground/30 hover:text-amber-500"
                                      }
                                    />
                                  </button>
                                )}
                                <span className="font-semibold text-xs text-foreground">{item.name}</span>
                                {item.is_popular && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    Hotbar
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-xs">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 text-muted-foreground text-xs font-medium">
                          <span className="inline-flex items-center gap-1">
                            {cat?.icon || "🍛"} {cat?.name || `Cat #${item.category_id}`}
                          </span>
                        </td>
                        <td className="p-2.5 text-xs font-medium">
                          {item.is_veg ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Veg
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400">
                              Non-Veg
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-xs text-muted-foreground">{item.kds_station || "Main Kitchen"}</td>
                        <td className="p-2.5 text-center font-mono text-xs text-muted-foreground">
                          {item.packaging_charge ? `₹${item.packaging_charge}` : "--"}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-foreground">
                          {hasVariants ? (
                            <span className="text-[10px] font-medium font-mono px-1.5 py-0.2 rounded border border-border bg-muted text-muted-foreground">
                              {item.variant_groups?.[0]?.options?.length || 0} Sizes
                            </span>
                          ) : (
                            `₹${price}`
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleAvailability(item);
                            }}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded border cursor-pointer transition-colors ${
                              item.is_available
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : "text-muted-foreground bg-muted border-border"
                            }`}
                          >
                            {item.is_available ? "In Stock" : "Out of Stock"}
                          </button>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVariantModalItem(item);
                              }}
                              title="Configure Portion Sizes & Addons"
                              className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border-none bg-transparent cursor-pointer"
                            >
                              <Layers size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecipeModalItem(item);
                              }}
                              title="Recipe Bill of Materials (BOM) & Inventory Deduction"
                              className="p-1 rounded text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors border-none bg-transparent cursor-pointer"
                            >
                              <Scale size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenEdit(item);
                              }}
                              title="Edit Dish"
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                              }}
                              title="Delete Dish"
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Drawer: Portion Variants & Addons Quick View */}
                      {isExpanded && (
                        <tr className="bg-muted/20 border-b border-border">
                          <td colSpan={10} className="p-3 pl-10">
                            <div className="bg-card border border-border rounded-md p-3 space-y-2 text-xs">
                              <div className="flex items-center justify-between border-b border-border pb-1.5">
                                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                  <Sparkles size={13} className="text-primary" />
                                  <span>Dish Specifications & Portion Pricing: {item.name}</span>
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground">ID #{item.id}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Portion Variants Column */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
                                    <Layers size={12} />
                                    <span>Portion Size Prices:</span>
                                  </div>

                                  {hasVariants ? (
                                    <div className="border border-border rounded overflow-hidden text-xs">
                                      {item.variant_groups?.map((vg, vgIdx) => (
                                        <div key={vgIdx} className="p-2 space-y-1">
                                          <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase">{vg.name}</div>
                                          <div className="divide-y divide-border">
                                            {vg.options.map((opt: any, optIdx: number) => {
                                              const optPrice = opt.sellingPrice ?? opt.selling_price ?? opt.price ?? 0;
                                              return (
                                                <div key={optIdx} className="flex items-center justify-between py-1">
                                                  <span className="font-medium text-foreground">{opt.name}</span>
                                                  <span className="font-mono font-bold text-foreground">
                                                    ₹{optPrice}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-2 bg-muted/30 rounded border border-border text-xs text-muted-foreground">
                                      Base Price: <span className="font-mono font-bold text-foreground">₹{price}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Size-Linked Addons Column */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
                                    <Tag size={12} />
                                    <span>Configured Addons & Modifiers:</span>
                                  </div>

                                  {hasAddons ? (
                                    <div className="border border-border rounded overflow-hidden text-xs">
                                      {item.addon_groups?.map((ag, agIdx) => (
                                        <div key={agIdx} className="p-2 space-y-1">
                                          <div className="text-[10px] font-mono font-semibold text-muted-foreground uppercase">{ag.name}</div>
                                          <div className="divide-y divide-border">
                                            {ag.options?.map((opt: any, optIdx: number) => {
                                              const vp = opt.variant_prices || opt.variantPrices || {};
                                              const hasVpKeys = Object.keys(vp).length > 0;
                                              return (
                                                <div key={optIdx} className="py-1 space-y-0.5">
                                                  <div className="flex items-center justify-between">
                                                    <span className="font-medium text-foreground">{opt.name}</span>
                                                    <span className="font-mono text-muted-foreground">
                                                      +₹{opt.price || 0}
                                                    </span>
                                                  </div>
                                                  {hasVpKeys && (
                                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                                      {Object.entries(vp).map(([sKey, sVal]) => (
                                                        <span key={sKey} className="text-[10px] font-mono bg-muted text-muted-foreground px-1 py-0.2 rounded border border-border">
                                                          {sKey}: +₹{String(sVal)}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-2 bg-muted/30 rounded border border-border text-xs text-muted-foreground">
                                      No size-linked addons or toppings configured.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Enterprise Sub-Modals */}
      <MenuTagMasterModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />

      <ItemVariantsAddonsModal
        isOpen={!!variantModalItem}
        menuItem={variantModalItem}
        onClose={() => setVariantModalItem(null)}
      />

      <RecipeBOMModal
        isOpen={!!recipeModalItem}
        menuItem={recipeModalItem}
        onClose={() => setRecipeModalItem(null)}
      />
    </PageContainer>
  );
};

