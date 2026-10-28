import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Smartphone,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Utensils,
  AlertCircle,
  Database,
  ChevronDown,
  ChevronUp,
  Sliders,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button, Input, PageHeader, PageContainer } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";

export interface FoodAppItemConfig {
  id: number;
  name: string;
  item_code?: string;
  category_id?: number;
  category_name?: string;
  is_veg?: boolean;
  base_price?: number;
  selling_price?: number;
  is_available?: boolean; // POS in-store availability
  is_available_online: boolean; // Food App availability
  online_start_time?: string | null; // e.g. "18:00"
  online_end_time?: string | null; // e.g. "22:00"
}

interface CategoryOption {
  id: number;
  name: string;
}

export const FoodAppMenuCustomizationPage: React.FC = () => {
  const [items, setItems] = useState<FoodAppItemConfig[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ONLINE" | "TIMED" | "OFFLINE">("ALL");
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Time editing modal / drawer state
  const [editingTimeItem, setEditingTimeItem] = useState<FoodAppItemConfig | null>(null);
  const [startTimeInput, setStartTimeInput] = useState<string>("18:00");
  const [endTimeInput, setEndTimeInput] = useState<string>("22:00");

  const sqlQuery = `-- SSR One AI: Customer Food Web Menu Customization Columns
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS is_available_online BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS online_start_time VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS online_end_time VARCHAR(10) DEFAULT NULL;`;

  const copySqlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlQuery);
      setCopiedSql(true);
      toast.success("SQL query copied to clipboard!");
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      toast.error("Could not copy automatically. Please select and copy manually.");
    }
  };

  // Load Categories & Menu Items
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        api.get<any[]>("/restaurant/categories").catch(() => []),
        api.get<any[]>("/restaurant/menu-items").catch(() => []),
      ]);

      const catList = Array.isArray(catsRes) ? catsRes : [];
      setCategories(catList);
      const catMap = new Map<number, string>();
      catList.forEach((c) => catMap.set(Number(c.id), c.name));

      const rawItems = Array.isArray(itemsRes) ? itemsRes : [];
      const normalized: FoodAppItemConfig[] = rawItems.map((it) => {
        const nut = it.nutrition && typeof it.nutrition === "object" ? it.nutrition : {};
        const isOnline =
          it.is_available_online !== undefined
            ? Boolean(it.is_available_online)
            : nut.is_available_online !== undefined
            ? Boolean(nut.is_available_online)
            : true;

        const startTime = it.online_start_time || nut.online_start_time || null;
        const endTime = it.online_end_time || nut.online_end_time || null;

        return {
          id: Number(it.id),
          name: it.name || "Dish Item",
          item_code: it.item_code || `P${it.id}`,
          category_id: it.category_id,
          category_name: it.category_id ? catMap.get(Number(it.category_id)) || "General" : "General",
          is_veg: it.is_veg ?? true,
          base_price: Number(it.base_price || it.selling_price || it.price || 0),
          selling_price: Number(it.selling_price || it.base_price || it.price || 0),
          is_available: it.is_available ?? true,
          is_available_online: isOnline,
          online_start_time: startTime,
          online_end_time: endTime,
        };
      });

      setItems(normalized);
    } catch (err: any) {
      console.error("Failed to load food app menu items:", err);
      toast.error("Failed to load catalog data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle Food App Online Availability (0ms Optimistic UI)
  const handleToggleOnline = async (item: FoodAppItemConfig) => {
    const nextVal = !item.is_available_online;
    setIsSavingId(item.id);

    // Optimistic update
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, is_available_online: nextVal } : it))
    );

    try {
      await api.patch(`/restaurant/menu-items/${item.id}/online-availability`, {
        is_available_online: nextVal,
        online_start_time: item.online_start_time,
        online_end_time: item.online_end_time,
      });

      toast.success(
        nextVal
          ? `"${item.name}" is now Live on Customer Food App! 🚀`
          : `"${item.name}" is now Hidden on Customer Food App 🚫 (Still available in POS)`
      );
    } catch (err: any) {
      console.error("Online availability update error:", err);
      toast.error("Could not save availability state, rolling back");
      // Rollback
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_available_online: !nextVal } : it))
      );
    } finally {
      setIsSavingId(null);
    }
  };

  // Open Time Window Editor
  const openTimeEditor = (item: FoodAppItemConfig) => {
    setEditingTimeItem(item);
    setStartTimeInput(item.online_start_time || "18:00");
    setEndTimeInput(item.online_end_time || "22:00");
  };

  // Save Time Window
  const handleSaveTimeWindow = async () => {
    if (!editingTimeItem) return;
    const sTime = startTimeInput.trim();
    const eTime = endTimeInput.trim();

    setIsSavingId(editingTimeItem.id);

    // Optimistic update
    setItems((prev) =>
      prev.map((it) =>
        it.id === editingTimeItem.id
          ? { ...it, online_start_time: sTime || null, online_end_time: eTime || null }
          : it
      )
    );

    try {
      await api.patch(`/restaurant/menu-items/${editingTimeItem.id}/online-availability`, {
        is_available_online: editingTimeItem.is_available_online,
        online_start_time: sTime || null,
        online_end_time: eTime || null,
      });

      toast.success(
        sTime && eTime
          ? `⏰ Serving window set for "${editingTimeItem.name}": ${sTime} – ${eTime}`
          : `⏰ Timed window removed. "${editingTimeItem.name}" now served all day.`
      );
      setEditingTimeItem(null);
    } catch (err: any) {
      console.error("Time window update error:", err);
      toast.error("Could not save serving hours");
    } finally {
      setIsSavingId(null);
    }
  };

  // Clear Time Window (All Day)
  const handleClearTimeWindow = async (item: FoodAppItemConfig) => {
    setIsSavingId(item.id);
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id ? { ...it, online_start_time: null, online_end_time: null } : it
      )
    );

    try {
      await api.patch(`/restaurant/menu-items/${item.id}/online-availability`, {
        is_available_online: item.is_available_online,
        online_start_time: null,
        online_end_time: null,
      });
      toast.info(`"${item.name}" serving window reset to All Day.`);
    } catch {
      toast.error("Could not clear serving hours");
    } finally {
      setIsSavingId(null);
    }
  };

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const online = items.filter((it) => it.is_available_online).length;
    const timed = items.filter((it) => it.is_available_online && it.online_start_time && it.online_end_time).length;
    const offline = total - online;
    return { total, online, timed, offline };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      // Category filter
      if (selectedCategory !== "ALL" && String(it.category_id) !== selectedCategory) {
        return false;
      }
      // Status filter
      if (activeFilter === "ONLINE" && !it.is_available_online) return false;
      if (activeFilter === "OFFLINE" && it.is_available_online) return false;
      if (activeFilter === "TIMED" && (!it.is_available_online || !it.online_start_time || !it.online_end_time)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = it.name.toLowerCase().includes(q);
        const matchCode = (it.item_code || "").toLowerCase().includes(q);
        const matchCat = (it.category_name || "").toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCat) return false;
      }
      return true;
    });
  }, [items, selectedCategory, activeFilter, searchQuery]);

  return (
    <PageContainer>
      {/* ── Top Header ── */}
      <PageHeader
        title="Customer Food App Menu & Operating Hours"
        description="Configure item visibility and time-window availability exclusively for customer-food-web without affecting in-store ERP POS catalog."
        icon={<Smartphone size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSqlModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold border-amber-300 bg-amber-50/60 text-amber-900 hover:bg-amber-100"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Database Query (SQL)</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Catalog</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-foreground">{metrics.total}</span>
            <span className="text-xs text-muted-foreground font-semibold">Dishes</span>
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Active on Food App</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{metrics.online}</span>
            <span className="text-xs text-emerald-700/80 font-bold">Enabled</span>
          </div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Timed Serving Slots</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{metrics.timed}</span>
            <span className="text-xs text-amber-700/80 font-bold">e.g. 6PM–10PM</span>
          </div>
        </div>

        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/40 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Hidden on Food App</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{metrics.offline}</span>
            <span className="text-xs text-rose-700/80 font-bold">POS Only</span>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-xs space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dish name, code (e.g. Momos, Chai, SAB-002)..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 text-xs font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap",
              activeFilter === "ALL"
                ? "bg-[#9E6B38] text-white border-[#8C5E35] shadow-xs"
                : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
            )}
          >
            All Dishes ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("ONLINE")}
            className={cn(
              "px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeFilter === "ONLINE"
                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active on Food App ({metrics.online})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("TIMED")}
            className={cn(
              "px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeFilter === "TIMED"
                ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timed Slots Only ({metrics.timed})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("OFFLINE")}
            className={cn(
              "px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
              activeFilter === "OFFLINE"
                ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
            )}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Hidden on Food App ({metrics.offline})</span>
          </button>
        </div>
      </div>

      {/* ── Table Grid of Dishes ── */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Dish Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">POS Dine-In Price</th>
                <th className="py-3 px-4 text-center">Food App Visibility</th>
                <th className="py-3 px-4">Serving Time Window</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold">No dishes matching current filter.</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Try clearing your search query or selecting another filter.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const hasTimeWindow = Boolean(item.online_start_time && item.online_end_time);
                  const isSavingThis = isSavingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-muted/20 transition-colors",
                        !item.is_available_online && "bg-rose-50/20 dark:bg-rose-950/10"
                      )}
                    >
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-bold text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/60 text-[10.5px]">
                          {item.item_code}
                        </span>
                      </td>

                      {/* Name & Veg Dot */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2.5 h-2.5 rounded-full shrink-0",
                              item.is_veg ? "bg-emerald-600" : "bg-rose-600"
                            )}
                            title={item.is_veg ? "Vegetarian" : "Non-Vegetarian"}
                          />
                          <span className="font-bold text-foreground text-sm">{item.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-medium text-muted-foreground">
                        {item.category_name}
                      </td>

                      {/* POS Price */}
                      <td className="py-3 px-4 font-bold text-foreground">
                        ₹{item.selling_price || item.base_price}
                      </td>

                      {/* Food App Visibility Switch */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleOnline(item)}
                          disabled={isSavingThis}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95",
                            item.is_available_online
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
                          )}
                          title="Click to toggle food app availability (POS in-store remains active)"
                        >
                          {item.is_available_online ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Live on App</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hidden on App</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Serving Time Window */}
                      <td className="py-3 px-4">
                        {!item.is_available_online ? (
                          <span className="text-[11px] text-muted-foreground italic">Disabled on Food App</span>
                        ) : hasTimeWindow ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 text-[11px] font-bold">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>{item.online_start_time} – {item.online_end_time}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/60 text-muted-foreground text-[11px] font-semibold">
                            <span>All Day (Standard Store Hours)</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {item.is_available_online ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTimeEditor(item)}
                              className="h-7 px-2.5 text-[11px] font-bold text-amber-900 border-amber-300 hover:bg-amber-100/70"
                            >
                              <Clock className="w-3 h-3 mr-1 text-amber-600" />
                              <span>{hasTimeWindow ? "Edit Hours" : "Set Hours"}</span>
                            </Button>

                            {hasTimeWindow && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClearTimeWindow(item)}
                                className="h-7 px-2 text-[10.5px] font-bold text-muted-foreground hover:text-foreground"
                                title="Reset to All Day"
                              >
                                All Day
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">POS Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Time Window Editor Dialog ── */}
      {editingTimeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setEditingTimeItem(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 font-sans animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-foreground">
                  Serving Hours: {editingTimeItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTimeItem(null)}
                className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Define the time window when customers can order <strong>{editingTimeItem.name}</strong> on the food app (e.g. Steam Momos served from 6:00 PM to 10:00 PM). Outside this period, customers will see serving hours and cannot place orders.
            </p>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Quick Presets</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStartTimeInput("18:00");
                    setEndTimeInput("22:00");
                  }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-900 font-bold text-left transition"
                >
                  <p className="text-[11px]">Evening Special</p>
                  <p className="text-xs font-black">6:00 PM – 10:00 PM</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStartTimeInput("12:00");
                    setEndTimeInput("15:30");
                  }}
                  className="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground font-bold text-left transition"
                >
                  <p className="text-[11px]">Lunch Hours</p>
                  <p className="text-xs font-black">12:00 PM – 3:30 PM</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStartTimeInput("08:00");
                    setEndTimeInput("11:30");
                  }}
                  className="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground font-bold text-left transition"
                >
                  <p className="text-[11px]">Breakfast Slot</p>
                  <p className="text-xs font-black">8:00 AM – 11:30 AM</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStartTimeInput("21:00");
                    setEndTimeInput("01:00");
                  }}
                  className="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground font-bold text-left transition"
                >
                  <p className="text-[11px]">Late Night</p>
                  <p className="text-xs font-black">9:00 PM – 1:00 AM</p>
                </button>
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                  Start Time (24h)
                </label>
                <Input
                  type="time"
                  value={startTimeInput}
                  onChange={(e) => setStartTimeInput(e.target.value)}
                  className="h-10 text-sm font-mono font-bold rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                  End Time (24h)
                </label>
                <Input
                  type="time"
                  value={endTimeInput}
                  onChange={(e) => setEndTimeInput(e.target.value)}
                  className="h-10 text-sm font-mono font-bold rounded-xl"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartTimeInput("");
                  setEndTimeInput("");
                }}
                className="text-xs font-bold text-muted-foreground"
              >
                Clear (Serve All Day)
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTimeItem(null)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  onClick={handleSaveTimeWindow}
                  className="bg-[#9E6B38] hover:bg-[#8C5E35] text-white text-xs font-bold shadow-xs px-4"
                >
                  Save Hours
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SQL DDL Query Dialog ── */}
      {showSqlModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setShowSqlModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 font-sans animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-foreground">PostgreSQL Database Columns Query</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              As requested, here is the exact, collision-proof SQL statement to add native columns in PostgreSQL for food app customization:
            </p>

            <div className="relative bg-muted/80 rounded-xl p-3.5 border border-border font-mono text-xs text-foreground select-all">
              <pre className="whitespace-pre-wrap leading-relaxed">{sqlQuery}</pre>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>💡 Zero-Downtime Guarantee:</strong> The backend already stores all food app availability and serving hours in the existing <code>nutrition</code> JSONB column, so all features work <strong>instantly</strong> right now without any server errors! Run this query at your convenience for native column indexing.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSqlModal(false)}
                className="text-xs font-bold"
              >
                Close
              </Button>

              <Button
                size="sm"
                onClick={copySqlToClipboard}
                className="bg-[#9E6B38] hover:bg-[#8C5E35] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? "Copied!" : "Copy SQL Query"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default FoodAppMenuCustomizationPage;
