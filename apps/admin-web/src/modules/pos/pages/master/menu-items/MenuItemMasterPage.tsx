import React, { useState } from "react";
import { Plus, Search, Utensils, Edit2, Trash2, Layers, Package, Sparkles, ChevronDown, ChevronUp, Tag, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { POSMenuItem, POSCategory } from "../../../types";

interface MenuItemMasterPageProps {
  menuItems: POSMenuItem[];
  categories: POSCategory[];
  onOpenCreate: () => void;
  onOpenEdit: (item: POSMenuItem) => void;
  onDelete: (id: number) => Promise<void>;
  onToggleAvailability: (item: POSMenuItem) => Promise<void>;
  isLoading?: boolean;
}

export const MenuItemMasterPage: React.FC<MenuItemMasterPageProps> = ({
  menuItems = [],
  categories = [],
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onToggleAvailability,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "veg" | "non_veg" | "in_stock" | "out_of_stock" | "variants">("all");
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

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
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Utensils size={22} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base md:text-lg text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                Dish Catalog & Portion Variant Master ({totalCount})
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Configure dishes, portion selling prices, KDS stations, size-linked addons, and packaging fees
              </p>
            </div>
          </div>

          <Button
            onClick={onOpenCreate}
            variant="primary"
            size="md"
            className="text-xs uppercase tracking-wider gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/25 shrink-0"
          >
            <Plus size={16} /> Add New Dish
          </Button>
        </div>

        {/* Top Summary KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            onClick={() => setFilterMode("all")}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              filterMode === "all"
                ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/40 shadow-xs"
                : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/60"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase font-mono text-slate-400">Total Dishes</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
          </div>

          <div
            onClick={() => setFilterMode("in_stock")}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              filterMode === "in_stock"
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/40 shadow-xs"
                : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/60"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> In Stock
            </div>
            <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">{inStockCount}</div>
          </div>

          <div
            onClick={() => setFilterMode("out_of_stock")}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              filterMode === "out_of_stock"
                ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-500/40 shadow-xs"
                : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/60"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={11} /> Out of Stock
            </div>
            <div className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">{outOfStockCount}</div>
          </div>

          <div
            onClick={() => setFilterMode("veg")}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              filterMode === "veg"
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/40 shadow-xs"
                : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/60"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase font-mono text-slate-400">Diet Type</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400">🟢 {vegCount}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-rose-600 dark:text-rose-400">🔴 {nonVegCount}</span>
            </div>
          </div>

          <div
            onClick={() => setFilterMode("variants")}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              filterMode === "variants"
                ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/40 shadow-xs"
                : "bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/60"
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Layers size={11} /> Portion Variants
            </div>
            <div className="text-xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-0.5">{variantCount}</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dish by name or description..."
              icon={<Search size={16} />}
              className="h-10 text-xs md:text-sm font-bold"
            />
          </div>

          <select
            value={selectedCatId || ""}
            onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : null)}
            className="bg-white/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs md:text-sm font-bold text-slate-900 dark:text-white w-full sm:w-56 focus:ring-2 focus:ring-indigo-500/30"
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
              variant="outline"
              size="sm"
              className="h-10 px-3 text-xs gap-1 cursor-pointer shrink-0 text-slate-500"
            >
              <X size={14} /> Clear
            </Button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400 mr-1">Filter View:</span>
          {[
            { id: "all", label: "All Items", icon: null },
            { id: "veg", label: "🟢 Veg Only", icon: null },
            { id: "non_veg", label: "🔴 Non-Veg Only", icon: null },
            { id: "in_stock", label: "⚡ In Stock", icon: null },
            { id: "out_of_stock", label: "⚠️ Out of Stock", icon: null },
            { id: "variants", label: "🍕 Has Size Variants", icon: null },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterMode(pill.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                filterMode === pill.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dishes Table */}
      <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">
                <th className="p-3.5 w-8"></th>
                <th className="p-3.5">Dish Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Diet Type</th>
                <th className="p-3.5">KDS Station</th>
                <th className="p-3.5 text-center">Packaging Fee</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-center">Stock Availability</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={9} className="p-4">
                      <div className="h-6 bg-slate-200/60 dark:bg-slate-800/60 animate-pulse rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
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

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer ${
                          isExpanded ? "bg-indigo-50/40 dark:bg-indigo-950/30" : ""
                        }`}
                      >
                        <td className="p-3.5 text-center text-slate-400" onClick={() => toggleExpandRow(item.id)}>
                          {(hasVariants || hasAddons || item.description) && (
                            <button
                              type="button"
                              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 border-none bg-transparent cursor-pointer text-slate-400"
                            >
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white" onClick={() => toggleExpandRow(item.id)}>
                          <div className="flex items-center gap-2.5">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                              />
                            ) : (
                              <span
                                className={`h-4 w-4 border-2 rounded-md flex items-center justify-center p-0.5 shrink-0 ${
                                  item.is_veg ? "border-emerald-600 bg-emerald-500/10" : "border-rose-600 bg-rose-500/10"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${item.is_veg ? "bg-emerald-600" : "bg-rose-600"}`} />
                              </span>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{item.name}</span>
                                {item.is_popular && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                    Popular
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg text-[11px] font-bold border border-slate-200/50 dark:border-slate-700/50">
                            {cat?.icon || "🍛"} {cat?.name || `Cat #${item.category_id}`}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {item.is_veg ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              🟢 Veg
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                              🔴 Non-Veg
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">{item.kds_station || "Main Kitchen"}</td>
                        <td className="p-3.5 text-center font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {item.packaging_charge ? `₹${item.packaging_charge}` : "--"}
                        </td>
                        <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                          {hasVariants ? (
                            <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase border border-indigo-500/20">
                              <Layers size={11} /> {item.variant_groups?.[0]?.options?.length || 0} Sizes
                            </span>
                          ) : (
                            `₹${price}`
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleAvailability(item);
                            }}
                            className={`h-7 px-2.5 text-xs font-bold rounded-xl cursor-pointer ${
                              item.is_available
                                ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                                : "text-slate-500 bg-slate-500/10 border border-slate-500/20 hover:bg-slate-500/20"
                            }`}
                          >
                            {item.is_available ? "In Stock" : "Out of Stock"}
                          </Button>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenEdit(item);
                              }}
                              title="Edit Dish & Variants"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                              }}
                              title="Delete Dish"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Drawer: Portion Variants & Addons Quick View */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/30 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40">
                          <td colSpan={9} className="p-4 pl-12">
                            <div className="bg-white/90 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl p-4 shadow-lg space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
                                  <Sparkles size={14} className="text-indigo-500" />
                                  <span>Dish Specifications & Portion Pricing breakdown: {item.name}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">ID #{item.id}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Portion Variants Column */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <Layers size={13} className="text-indigo-500" />
                                    <span>Portion Size Selling Prices:</span>
                                  </div>

                                  {hasVariants ? (
                                    <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-xl overflow-hidden text-xs">
                                      {item.variant_groups?.map((vg, vgIdx) => (
                                        <div key={vgIdx} className="p-2 space-y-1">
                                          <div className="text-[10px] font-mono font-extrabold text-slate-400 uppercase">{vg.name}</div>
                                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {vg.options.map((opt: any, optIdx: number) => {
                                              const optPrice = opt.sellingPrice ?? opt.selling_price ?? opt.price ?? 0;
                                              return (
                                                <div key={optIdx} className="flex items-center justify-between py-1 px-1">
                                                  <span className="font-bold text-slate-800 dark:text-slate-200">{opt.name}</span>
                                                  <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
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
                                    <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold text-slate-500">
                                      Single Standard Portion Base Price: <span className="font-mono font-extrabold text-slate-900 dark:text-white">₹{price}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Size-Linked Addons Column */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <Tag size={13} className="text-amber-500" />
                                    <span>Size-Linked Addons & Customizations:</span>
                                  </div>

                                  {hasAddons ? (
                                    <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-2 space-y-2 text-xs">
                                      {item.addon_groups?.map((ag, agIdx) => (
                                        <div key={agIdx} className="space-y-1">
                                          <div className="text-[10px] font-mono font-extrabold text-slate-400 uppercase">{ag.name}</div>
                                          <div className="space-y-1">
                                            {ag.options.map((opt: any, optIdx: number) => {
                                              const vp = opt.variantPrices || opt.variant_prices || {};
                                              const hasVpKeys = Object.keys(vp).length > 0;
                                              return (
                                                <div key={optIdx} className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg space-y-1">
                                                  <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{opt.name}</span>
                                                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                                      Base: +₹{opt.price || 0}
                                                    </span>
                                                  </div>
                                                  {hasVpKeys && (
                                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                      {Object.entries(vp).map(([sKey, sVal]) => (
                                                        <span key={sKey} className="text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20">
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
                                    <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-400 font-medium">
                                      No size-linked addons or toppings configured for this dish.
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
    </div>
  );
};

