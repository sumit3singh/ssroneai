/**
 * SSR One AI ERP - POS Menu Item Form Dialog with Variant & Size-Linked Addon Group Builders
 */

import React, { useState, useEffect } from "react";
import { X, Utensils, Plus, Trash2, Layers, Tag, Package, Sparkles } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { POSMenuItem, POSCategory, POSVariantGroup, POSAddonGroup } from "../../../types";

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<POSMenuItem>) => Promise<void>;
  editingItem?: POSMenuItem | null;
  categories: POSCategory[];
  selectedCategoryId?: number | null;
}

const MASTER_VARIANT_PRESETS = [
  {
    id: "pizza",
    label: "🍕 Pizza Sizes (Small 7\" / Medium 10\" / Large 12\")",
    groupName: "Pizza Size",
    options: [
      { name: "Small (7\")", price: 150 },
      { name: "Medium (10\")", price: 180 },
      { name: "Large (12\")", price: 230 },
    ]
  },
  {
    id: "portion",
    label: "🍲 Portion Sizes (Half / Full)",
    groupName: "Portion Size",
    options: [
      { name: "Half", price: 100 },
      { name: "Full", price: 180 },
    ]
  },
  {
    id: "beverage",
    label: "🥤 Beverage Sizes (Regular 300ml / Large 500ml)",
    groupName: "Beverage Size",
    options: [
      { name: "Regular (300ml)", price: 60 },
      { name: "Large (500ml)", price: 90 },
    ]
  },
  {
    id: "quantity",
    label: "🍗 Quantity Packs (Single / Double / Family Pack)",
    groupName: "Quantity Pack",
    options: [
      { name: "Single (1 Pc)", price: 120 },
      { name: "Double (2 Pcs)", price: 220 },
      { name: "Family Pack (4 Pcs)", price: 400 },
    ]
  }
];

const MASTER_ADDON_PRESETS = [
  {
    id: "crust",
    label: "🧀 Crust Upgrades & Extra Cheese",
    groupName: "Crust Upgrade & Addons",
    options: [
      { name: "Cheese Burst Crust", price: 80, variantPrices: { "Small (7\")": 50, "Medium (10\")": 80, "Large (12\")": 100 } },
      { name: "Extra Mozzarella Cheese", price: 40, variantPrices: { "Small (7\")": 30, "Medium (10\")": 40, "Large (12\")": 60 } },
    ]
  },
  {
    id: "dips",
    label: "🧄 Dips & Sauces (Garlic, Peri Peri, Mint)",
    groupName: "Dips & Sauces",
    options: [
      { name: "Cheesy Garlic Dip", price: 35, variantPrices: {} },
      { name: "Peri Peri Mayo Dip", price: 25, variantPrices: {} },
      { name: "Special Mint Chutney", price: 20, variantPrices: {} },
    ]
  },
  {
    id: "toppings",
    label: "🍕 Extra Veg Toppings (Paneer, Jalapeno, Mushroom)",
    groupName: "Extra Toppings",
    options: [
      { name: "Fresh Paneer Cubes", price: 45, variantPrices: { "Half": 30, "Full": 45 } },
      { name: "Jalapeños & Black Olives", price: 35, variantPrices: { "Half": 25, "Full": 35 } },
      { name: "Button Mushrooms", price: 35, variantPrices: { "Half": 25, "Full": 35 } },
    ]
  }
];

export const MenuItemDialog: React.FC<MenuItemDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  categories = [],
}) => {
  const [localCategories, setLocalCategories] = useState<POSCategory[]>(categories || []);
  const [activeTab, setActiveTab] = useState<"general" | "variants" | "addons">("general");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [packagingCharge, setPackagingCharge] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [kdsStation, setKdsStation] = useState("Main Kitchen");
  const [kdsStationsList, setKdsStationsList] = useState<{ id: number | string; name: string }[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variantGroups, setVariantGroups] = useState<POSVariantGroup[]>([]);
  const [addonGroups, setAddonGroups] = useState<POSAddonGroup[]>([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setLocalCategories(categories);
    } else if (isOpen) {
      api.get<any>("/restaurant/categories")
        .then((res) => {
          const list = Array.isArray(res) ? res : (res?.data || res?.categories || []);
          if (list.length > 0) {
            setLocalCategories(list);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, categories]);

  useEffect(() => {
    if (isOpen) {
      api.get<any[]>("/restaurant/kitchen-stations")
        .then((res) => {
          const list = Array.isArray(res) ? res : [];
          if (list.length > 0) {
            setKdsStationsList(list.map((s) => ({ id: s.id, name: s.name })));
            if (!editingItem && list[0]?.name) {
              setKdsStation(list[0].name);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (localCategories.length > 0 && !categoryId) {
      setCategoryId(Number(localCategories[0].id));
    }
  }, [localCategories, categoryId]);

  useEffect(() => {
    const defaultCatId = categories.length > 0 ? Number(categories[0].id) : 1;
    if (editingItem) {
      setName(editingItem.name || "");
      setPrice(Number(editingItem.selling_price || editingItem.base_price || editingItem.price || 0));
      setPackagingCharge(Number(editingItem.packaging_charge || 0));
      
      const matchCat = categories.find(c => String(c.id) === String(editingItem.category_id));
      setCategoryId(matchCat ? Number(matchCat.id) : (editingItem.category_id ? Number(editingItem.category_id) : defaultCatId));
      
      setKdsStation(editingItem.kds_station || "Main Kitchen");
      setImageUrl(editingItem.image_url || "");
      setIsVeg(editingItem.is_veg ?? true);
      setDescription(editingItem.description || "");
      setVariantGroups(editingItem.variant_groups || []);
      setAddonGroups(editingItem.addon_groups || []);
    } else {
      setName("");
      setPrice(0);
      setPackagingCharge(0);
      setCategoryId(defaultCatId);
      setKdsStation("Main Kitchen");
      setImageUrl("");
      setIsVeg(true);
      setDescription("");
      setVariantGroups([]);
      setAddonGroups([]);
    }
    setActiveTab("general");
  }, [editingItem, categories, isOpen]);

  useEffect(() => {
    if (categories.length > 0) {
      const exists = categories.some(c => String(c.id) === String(categoryId));
      if (!exists) {
        setCategoryId(Number(categories[0].id));
      }
    }
  }, [categories, categoryId]);

  if (!isOpen) return null;

  const handleLoadVariantPreset = (presetId: string) => {
    if (!presetId) return;
    const preset = MASTER_VARIANT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const baseP = price > 0 ? price : 150;
    const newGroup: POSVariantGroup = {
      id: `vg-${Date.now()}`,
      name: preset.groupName,
      min_selection: 1,
      max_selection: 1,
      is_required: true,
      options: preset.options.map((opt, idx) => {
        const calculatedPrice = idx === 0 ? baseP : Math.round(baseP * (1 + idx * 0.35));
        return {
          id: `opt-${Date.now()}-${idx}`,
          name: opt.name,
          sellingPrice: calculatedPrice,
          selling_price: calculatedPrice,
          price: calculatedPrice,
          is_default: idx === 0
        };
      })
    };
    setVariantGroups([...variantGroups, newGroup]);
  };

  const handleLoadAddonPreset = (presetId: string) => {
    if (!presetId) return;
    const preset = MASTER_ADDON_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const newGroup: POSAddonGroup = {
      id: `ag-${Date.now()}`,
      name: preset.groupName,
      options: preset.options.map((opt, idx) => ({
        id: `ao-${Date.now()}-${idx}`,
        name: opt.name,
        price: opt.price,
        variantPrices: opt.variantPrices || {}
      }))
    };
    setAddonGroups([...addonGroups, newGroup]);
  };

  // Add / Remove Variant Handlers
  const handleAddVariantGroup = () => {
    const newGroup: POSVariantGroup = {
      id: `vg-${Date.now()}`,
      name: "Pizza Size",
      min_selection: 1,
      max_selection: 1,
      is_required: true,
      options: [
        { id: `opt-${Date.now()}-1`, name: "Small (7\")", sellingPrice: 150, is_default: false },
        { id: `opt-${Date.now()}-2`, name: "Medium (10\")", sellingPrice: 180, is_default: true },
        { id: `opt-${Date.now()}-3`, name: "Large (12\")", sellingPrice: 230, is_default: false },
      ]
    };
    setVariantGroups([...variantGroups, newGroup]);
  };

  const handleRemoveVariantGroup = (index: number) => {
    setVariantGroups(variantGroups.filter((_, i) => i !== index));
  };

  const handleAddVariantOption = (groupIndex: number) => {
    const updated = [...variantGroups];
    updated[groupIndex].options.push({
      id: `opt-${Date.now()}`,
      name: "Custom Size",
      sellingPrice: price || 100,
      is_default: false
    });
    setVariantGroups(updated);
  };

  const handleRemoveVariantOption = (groupIndex: number, optIndex: number) => {
    const updated = [...variantGroups];
    updated[groupIndex].options = updated[groupIndex].options.filter((_, i) => i !== optIndex);
    setVariantGroups(updated);
  };

  // Add / Remove Addon Handlers
  const handleAddAddonGroup = () => {
    const newGroup: POSAddonGroup = {
      id: `ag-${Date.now()}`,
      name: "Crust Upgrade & Addons",
      options: [
        { 
          id: `ao-${Date.now()}-1`, 
          name: "Cheese Burst Crust", 
          price: 80,
          variantPrices: { "Small (7\")": 50, "Medium (10\")": 80, "Large (12\")": 100 }
        },
        { 
          id: `ao-${Date.now()}-2`, 
          name: "Extra Mozzarella Cheese", 
          price: 40,
          variantPrices: { "Small (7\")": 30, "Medium (10\")": 40, "Large (12\")": 60 }
        },
      ]
    };
    setAddonGroups([...addonGroups, newGroup]);
  };

  const handleRemoveAddonGroup = (index: number) => {
    setAddonGroups(addonGroups.filter((_, i) => i !== index));
  };

  const handleAddAddonOption = (groupIndex: number) => {
    const updated = [...addonGroups];
    updated[groupIndex].options.push({
      id: `ao-${Date.now()}`,
      name: "Extra Topping",
      price: 30,
      variantPrices: {}
    });
    setAddonGroups(updated);
  };

  const handleRemoveAddonOption = (groupIndex: number, optIndex: number) => {
    const updated = [...addonGroups];
    updated[groupIndex].options = updated[groupIndex].options.filter((_, i) => i !== optIndex);
    setAddonGroups(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let targetCatId = categoryId;
    if (!targetCatId || !categories.some(c => String(c.id) === String(targetCatId))) {
      targetCatId = Number(categories[0]?.id || 1);
    }

    const cleanVariantGroups = variantGroups.map(vg => ({
      name: vg.name.trim(),
      min_selection: vg.min_selection ?? vg.minSelection ?? 1,
      max_selection: vg.max_selection ?? vg.maxSelection ?? 1,
      is_required: vg.is_required ?? vg.isRequired ?? true,
      sort_order: 1,
      options: (vg.options || []).map((opt: any) => {
        const val = Number(opt.sellingPrice ?? opt.selling_price ?? opt.price ?? 0);
        return {
          name: opt.name.trim(),
          selling_price: val,
          price: val,
          is_default: opt.is_default ?? opt.isDefault ?? false,
          is_available: opt.is_available ?? opt.isAvailable ?? true,
          sort_order: 1
        };
      })
    }));

    const cleanAddonGroups = addonGroups.map(ag => ({
      name: ag.name.trim(),
      min_selection: ag.min_selection ?? ag.minSelection ?? 0,
      max_selection: ag.max_selection ?? ag.maxSelection ?? 5,
      sort_order: 1,
      options: (ag.options || []).map((opt: any) => ({
        name: opt.name.trim(),
        price: Number(opt.price ?? 0),
        variant_prices: opt.variant_prices ?? opt.variantPrices ?? {},
        is_available: opt.is_available ?? opt.isAvailable ?? true,
        sort_order: 1
      }))
    }));

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingItem?.id,
        name: name.trim(),
        base_price: Number(price),
        selling_price: Number(price),
        packaging_charge: Number(packagingCharge),
        category_id: targetCatId,
        is_veg: isVeg,
        is_available: true,
        kds_station: kdsStation,
        image_url: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
        variant_groups: cleanVariantGroups as any,
        addon_groups: cleanAddonGroups as any
      });
      onClose();
    } catch (err) {
      console.error("Error saving dish in dialog:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Utensils size={20} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base md:text-lg text-slate-900 dark:text-white tracking-tight">
                {editingItem ? "Edit Menu Item" : "Create New Menu Item"}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Configure portion variants, size-linked addons, and packaging charges</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "general" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            General & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("variants")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "variants" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Layers size={14} /> Portion / Size Variants ({variantGroups.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("addons")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "addons" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Tag size={14} /> Size-Linked Addons ({addonGroups.length})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">Dish / Item Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Veg Loaded Pizza / Kadai Paneer / Chai"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">Base Selling Price (₹)</label>
                  <Input
                    type="number"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="180"
                    required
                  />
                </div>
                <div>
                  <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">Packaging Fee (₹/Dish)</label>
                  <Input
                    type="number"
                    value={packagingCharge || ""}
                    onChange={(e) => setPackagingCharge(Number(e.target.value))}
                    placeholder="10"
                    icon={<Package size={14} />}
                  />
                </div>
                <div>
                  <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">Category</label>
                  <select
                    value={String(categoryId || "")}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full h-10 bg-white/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-700/80 rounded-xl px-3 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30"
                    required
                  >
                    {localCategories.length === 0 && <option value="">No categories found (Create category first)</option>}
                    {localCategories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.icon || "🍛"} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">Diet Type</label>
                  <div className="flex gap-4 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        checked={isVeg}
                        onChange={() => setIsVeg(true)}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">🟢 Veg</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isVeg}
                        onChange={() => setIsVeg(false)}
                        className="w-4 h-4 accent-rose-500"
                      />
                      <span className="text-rose-600 dark:text-rose-400 font-bold">🔴 Non-Veg</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">KDS Kitchen Station</label>
                  <select
                    value={kdsStation}
                    onChange={(e) => setKdsStation(e.target.value)}
                    className="w-full h-10 bg-white/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-700/80 rounded-xl px-3 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {kdsStationsList.length > 0 ? (
                      kdsStationsList.map((st) => (
                        <option key={st.id || st.name} value={st.name}>
                          {st.name}
                        </option>
                      ))
                    ) : (
                      <option value="Main Kitchen">Main Kitchen</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">Dish Image URL (Optional)</label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1513104890138-7c749659a591"
                    className="flex-1 text-xs"
                  />
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                  )}
                </div>
              </div>

              <div>
                <label className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 font-mono block mb-1.5">Short Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Hand-tossed pizza crust loaded with capsicum, onion, tomato, jalapenos, and mozzarella."
                  rows={2}
                  className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-700/80 rounded-xl p-3 text-xs md:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
          )}

          {activeTab === "variants" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/60 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-200/50 dark:border-indigo-800/40">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <span>Quick Load Standard Size Template:</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    onChange={(e) => {
                      handleLoadVariantPreset(e.target.value);
                      e.target.value = "";
                    }}
                    className="h-8 text-xs font-bold bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg px-2 text-indigo-900 dark:text-indigo-100 flex-1 sm:flex-initial"
                    defaultValue=""
                  >
                    <option value="" disabled>⚡ Select Template (Zero Spelling Mistakes)</option>
                    {MASTER_VARIANT_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddVariantGroup} className="text-xs gap-1.5 h-8">
                    <Plus size={14} /> Add Size Group
                  </Button>
                </div>
              </div>

              {variantGroups.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-400">
                  No size variants configured. Select a template above or click "Add Size Group" to create Small (₹150), Medium (₹180), Large (₹230) options.
                </div>
              ) : (
                variantGroups.map((vg, gIdx) => (
                  <div key={vg.id} className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={vg.name}
                        onChange={(e) => {
                          const updated = [...variantGroups];
                          updated[gIdx].name = e.target.value;
                          setVariantGroups(updated);
                        }}
                        placeholder="Group Name (e.g. Pizza Size / Portion Size)"
                        className="h-9 text-xs font-bold"
                      />
                      <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveVariantGroup(gIdx)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>

                    <div className="space-y-2 pl-3 border-l-2 border-indigo-500/40">
                      {vg.options.map((opt, oIdx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <Input
                            value={opt.name}
                            onChange={(e) => {
                              const updated = [...variantGroups];
                              updated[gIdx].options[oIdx].name = e.target.value;
                              setVariantGroups(updated);
                            }}
                            placeholder="Size Label (e.g. Medium 10&quot;)"
                            className="h-8 text-xs flex-1"
                          />
                          <Input
                            type="number"
                            value={opt.sellingPrice ?? opt.selling_price ?? opt.price ?? ""}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = [...variantGroups];
                              updated[gIdx].options[oIdx].sellingPrice = val;
                              updated[gIdx].options[oIdx].selling_price = val;
                              updated[gIdx].options[oIdx].price = val;
                              setVariantGroups(updated);
                            }}
                            placeholder="Price (₹)"
                            className="h-8 text-xs w-32"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantOption(gIdx, oIdx)}
                            className="text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddVariantOption(gIdx)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-1 hover:underline cursor-pointer"
                      >
                        <Plus size={12} /> Add Size Option
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "addons" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <span>Quick Load Standard Addon Template:</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    onChange={(e) => {
                      handleLoadAddonPreset(e.target.value);
                      e.target.value = "";
                    }}
                    className="h-8 text-xs font-bold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg px-2 text-amber-900 dark:text-amber-100 flex-1 sm:flex-initial"
                    defaultValue=""
                  >
                    <option value="" disabled>⚡ Select Addon Template</option>
                    {MASTER_ADDON_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddAddonGroup} className="text-xs gap-1.5 h-8">
                    <Plus size={14} /> Add Addon Group
                  </Button>
                </div>
              </div>

              {addonGroups.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-400">
                  No size-linked addons configured. Select an Addon Template above or click "Add Addon Group".
                </div>
              ) : (
                addonGroups.map((ag, gIdx) => (
                  <div key={ag.id} className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={ag.name}
                        onChange={(e) => {
                          const updated = [...addonGroups];
                          updated[gIdx].name = e.target.value;
                          setAddonGroups(updated);
                        }}
                        placeholder="Addon Group Name (e.g. Crust Upgrade & Addons)"
                        className="h-9 text-xs font-bold"
                      />
                      <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveAddonGroup(gIdx)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>

                    <div className="space-y-3 pl-3 border-l-2 border-amber-500/40">
                      {ag.options.map((opt, oIdx) => (
                        <div key={opt.id} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={opt.name}
                              onChange={(e) => {
                                const updated = [...addonGroups];
                                updated[gIdx].options[oIdx].name = e.target.value;
                                setAddonGroups(updated);
                              }}
                              placeholder="Addon Name (e.g. Cheese Burst Crust)"
                              className="h-8 text-xs flex-1 font-bold"
                            />
                            <Input
                              type="number"
                              value={opt.price || ""}
                              onChange={(e) => {
                                const updated = [...addonGroups];
                                updated[gIdx].options[oIdx].price = Number(e.target.value);
                                setAddonGroups(updated);
                              }}
                              placeholder="Base Addon Fee (₹80)"
                              className="h-8 text-xs w-36"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveAddonOption(gIdx, oIdx)}
                              className="text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Per-Size Linked Price Inputs */}
                          {(() => {
                            const configuredSizes = variantGroups.flatMap((vg) => (vg.options || []).map((o) => o.name.trim())).filter(Boolean);
                            const activeSizes = configuredSizes.length > 0 ? Array.from(new Set(configuredSizes)) : ["Small", "Medium", "Large"];
                            const currentVp = opt.variantPrices || opt.variant_prices || {};

                            return (
                              <div className="space-y-1 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400 block mb-1">
                                  Size Override Prices (+₹) {configuredSizes.length === 0 && "(Default Sizes)"}
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {activeSizes.map((sizeKey) => {
                                    const val = currentVp[sizeKey] ?? "";
                                    return (
                                      <div key={sizeKey}>
                                        <span className="text-[10px] font-mono font-bold text-slate-500 truncate block mb-0.5" title={sizeKey}>
                                          {sizeKey}
                                        </span>
                                        <Input
                                          type="number"
                                          value={val !== undefined && val !== null ? val : ""}
                                          onChange={(e) => {
                                            const numVal = e.target.value !== "" ? Number(e.target.value) : 0;
                                            const updated = [...addonGroups];
                                            const vp = { ...(updated[gIdx].options[oIdx].variantPrices || updated[gIdx].options[oIdx].variant_prices || {}) };
                                            vp[sizeKey] = numVal;
                                            updated[gIdx].options[oIdx].variantPrices = vp;
                                            updated[gIdx].options[oIdx].variant_prices = vp;
                                            setAddonGroups(updated);
                                          }}
                                          placeholder={`Base (₹${opt.price || 0})`}
                                          className="h-7 text-xs font-mono"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddAddonOption(gIdx)}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1 hover:underline cursor-pointer"
                      >
                        <Plus size={12} /> Add Size-Linked Addon
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-500">
              <Sparkles size={12} /> PostgreSQL Database Isolated
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                {editingItem ? "Save Changes" : "Create Dish"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
