import React, { useState, useEffect } from "react";
import { Utensils, X, Image as ImageIcon, Percent, DollarSign, Tag as TagIcon, ChefHat } from "lucide-react";
import { Input } from "@/shared/ui/primitives/Input";
import { Button } from "@/shared/ui/primitives/Button";
import { Category } from "./CategorySidebar";
import { MenuItem } from "./MenuItemCard";
import { VariantEditor, VariantGroup } from "./VariantEditor";
import { AddonEditor, AddonGroup } from "./AddonEditor";

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<MenuItem>) => Promise<void>;
  editingItem: MenuItem | null;
  categories: Category[];
  selectedCategoryId: number | null;
}

export const MenuItemDialog: React.FC<MenuItemDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  categories = [],
  selectedCategoryId
}) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [imgUrl, setImgUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [isVeg, setIsVeg] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [gstPercent, setGstPercent] = useState(5);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [kdsStation, setKdsStation] = useState("Main");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const safeCategories = categories || [];
    if (editingItem) {
      setName(editingItem.name || "");
      setDesc(editingItem.description || "");
      setBasePrice(editingItem.base_price || 0);
      setImgUrl(editingItem.image_url || "");
      setCategoryId(editingItem.category_id || selectedCategoryId || (safeCategories[0]?.id || 1));
      setIsVeg(editingItem.is_veg ?? true);
      setIsPopular(editingItem.is_popular ?? false);
      setIsAvailable(editingItem.is_available ?? true);
      setGstPercent(editingItem.gst_percent ?? 5);
      setTags(editingItem.tags || []);
      setVariantGroups(editingItem.variant_groups || []);
      setAddonGroups(editingItem.addon_groups || []);
      setKdsStation(editingItem.kds_station || "Main");
    } else {
      setName("");
      setDesc("");
      setBasePrice(0);
      setImgUrl("");
      setCategoryId(selectedCategoryId || (safeCategories[0]?.id || 1));
      setIsVeg(true);
      setIsPopular(false);
      setIsAvailable(true);
      setGstPercent(5);
      setTags([]);
      setVariantGroups([]);
      setAddonGroups([]);
      setKdsStation("Main");
    }
  }, [editingItem, isOpen, selectedCategoryId, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Base price validation: optional if variants exist, required if no variants exist
    const hasVariants = variantGroups.length > 0 && variantGroups.some((g) => g.options.length > 0);
    if (!name.trim()) {
      alert("Item name is required");
      return;
    }
    if (!hasVariants && basePrice <= 0) {
      alert("Base price is required when no portion variants are defined");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name,
        description: desc,
        base_price: basePrice,
        image_url: imgUrl,
        category_id: categoryId,
        is_veg: isVeg,
        is_popular: isPopular,
        is_available: isAvailable,
        gst_percent: gstPercent,
        tags,
        variant_groups: variantGroups,
        addon_groups: addonGroups,
        kds_station: kdsStation
      });
      onClose();
    } catch (err) {
      console.error("Error submitting menu item", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-modal flex flex-col my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Utensils size={20} />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-foreground">
                {editingItem ? "Edit Dish & Master Data" : "Add New Dish to Database"}
              </h2>
              <p className="text-3xs text-muted-foreground">
                Configuring master item details, portion variants, addons, and taxation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Basic Metadata */}
            <div className="space-y-4 lg:col-span-1 border-r border-border/60 pr-0 lg:pr-6">
              <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">
                1. Basic Info
              </h3>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon || "🍛"} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Dish Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kurkure Veg Momos"
                  required
                  className="h-10 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Crispy fried momos with spicy garlic dip..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs uppercase font-bold text-muted-foreground">
                    Base Price (₹)
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                      className="pl-8 h-10 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs uppercase font-bold text-muted-foreground">GST %</label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                      className="pl-8 h-10 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <ChefHat size={12} className="text-primary" />
                  KDS Station
                </label>
                <select
                  value={kdsStation}
                  onChange={(e) => setKdsStation(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="Main">Main Kitchen</option>
                  <option value="Chinese">Chinese / Tandoor</option>
                  <option value="Beverages">Beverages & Bar</option>
                  <option value="Bakery">Bakery & Desserts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Image URL</label>
                <div className="relative">
                  <ImageIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="pl-8 h-10 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Tags</label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g. Bestseller, Spicy"
                    className="h-8 text-xs flex-1"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline" className="h-8 text-xs font-bold">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {tags.map((t) => (
                    <span key={t} className="bg-muted px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <TagIcon size={10} /> {t}
                      <button type="button" onClick={() => handleRemoveTag(t)} className="text-red-500 hover:text-red-700">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="space-y-2 border-t border-border pt-3">
                <label className="flex items-center gap-2 font-bold text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  Vegetarian Dish
                </label>

                <label className="flex items-center gap-2 font-bold text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  Chef Special / Popular
                </label>

                <label className="flex items-center gap-2 font-bold text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  Available for Billing
                </label>
              </div>
            </div>

            {/* Right 2 Columns: Variants & Addons */}
            <div className="space-y-6 lg:col-span-2">
              <VariantEditor
                variantGroups={variantGroups}
                defaultBasePrice={basePrice}
                onChange={setVariantGroups}
              />

              <AddonEditor
                addonGroups={addonGroups}
                onChange={setAddonGroups}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3 sticky bottom-0 bg-card z-10">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6"
            >
              {isSaving ? "Saving to Database..." : editingItem ? "Update Dish" : "Create Dish"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
