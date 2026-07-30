import React, { useState } from "react";
import { Plus, Search, Utensils, Edit2, Trash2, Tag as TagIcon, ChefHat } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { POSMenuItem, POSCategory } from "../../types";

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

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCatId) return item.category_id === selectedCatId;
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <Utensils size={18} className="text-primary" />
            Dish Catalog & Portion Variant Master ({menuItems.length})
          </h3>
          <p className="text-3xs text-muted-foreground">
            Configure dishes, portion selling prices, KDS stations, GST taxation, and addon options
          </p>
        </div>

        <Button
          onClick={onOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus size={16} /> + Add Dish
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dish by name..."
            className="pl-8 h-9 text-xs bg-muted/30 font-medium"
          />
        </div>

        <select
          value={selectedCatId || ""}
          onChange={(e) => setSelectedCatId(e.target.value ? Number(e.target.value) : null)}
          className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] font-black uppercase text-muted-foreground">
              <th className="py-2.5">Dish Name</th>
              <th className="py-2.5">Type</th>
              <th className="py-2.5">KDS Station</th>
              <th className="py-2.5 text-right">Selling Price</th>
              <th className="py-2.5 text-center">Status</th>
              <th className="py-2.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
            {filteredItems.map((item) => {
              const hasVariants = item.variant_groups && item.variant_groups.length > 0;
              const price = item.selling_price || item.base_price;

              return (
                <tr key={item.id} className="hover:bg-muted/10">
                  <td className="py-3 font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <span className={`h-3.5 w-3.5 border-2 rounded-xs flex items-center justify-center p-0.5 ${
                        item.is_veg ? "border-green-600" : "border-red-600"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                      </span>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3">{item.is_veg ? "Veg" : "Non-Veg"}</td>
                  <td className="py-3 font-mono text-[10px]">{item.kds_station || "Main Kitchen"}</td>
                  <td className="py-3 text-right font-mono font-black text-foreground">
                    {hasVariants ? "Variants Defined" : `₹${price}`}
                  </td>
                  <td className="py-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleAvailability(item)}
                      className={`h-7 px-2 text-2xs font-bold ${
                        item.is_available ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {item.is_available ? "In Stock" : "Out of Stock"}
                    </Button>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenEdit(item)}
                        className="p-1 text-muted-foreground hover:text-primary transition-all border-none bg-transparent cursor-pointer"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-all border-none bg-transparent cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
