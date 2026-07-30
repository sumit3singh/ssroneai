import React from "react";
import { Plus, Search, Filter, RefreshCw, AlertTriangle, UtensilsCrossed } from "lucide-react";
import { Input } from "@/shared/ui/primitives/Input";
import { Button } from "@/shared/ui/primitives/Button";
import { MenuItemCard, MenuItem } from "./MenuItemCard";

interface MenuCatalogProps {
  menuItems: MenuItem[];
  selectedCategoryName?: string;
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: number) => void;
  onToggleAvailability: (item: MenuItem) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  menuItems,
  selectedCategoryName = "All Items",
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleAvailability,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [vegFilter, setVegFilter] = React.useState<"all" | "veg" | "nonveg">("all");

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (vegFilter === "veg") return item.is_veg === true;
    if (vegFilter === "nonveg") return item.is_veg === false;
    return true;
  });

  return (
    <div className="flex-1 space-y-4">
      {/* Top Header & Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-card">
        <div>
          <h2 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider">
            {selectedCategoryName}
          </h2>
          <p className="text-3xs text-muted-foreground">
            Manage pricing, portion variants, KDS stations, and dish availability
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="pl-8 h-9 text-xs bg-muted/30 border-border font-medium"
            />
          </div>

          {/* Veg / NonVeg Filter */}
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
            <button
              onClick={() => setVegFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all ${
                vegFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter("veg")}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all ${
                vegFilter === "veg" ? "bg-green-600 text-white shadow-sm" : "text-muted-foreground"
              }`}
            >
              Veg
            </button>
            <button
              onClick={() => setVegFilter("nonveg")}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all ${
                vegFilter === "nonveg" ? "bg-red-600 text-white shadow-sm" : "text-muted-foreground"
              }`}
            >
              Non-Veg
            </button>
          </div>

          <Button
            onClick={onAddItem}
            className="h-9 px-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5"
          >
            <Plus size={16} />
            Add Dish
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-card border border-border/60 rounded-2xl p-4 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-2xl space-y-3">
          <AlertTriangle size={24} className="mx-auto text-red-500" />
          <h3 className="font-extrabold text-sm text-red-700 dark:text-red-300">Failed to Load Menu Catalog</h3>
          <p className="text-xs text-red-600/80 dark:text-red-400/80 max-w-md mx-auto">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline" className="text-xs font-bold gap-1 mx-auto">
              <RefreshCw size={14} /> Retry Database Query
            </Button>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl space-y-3 bg-card/50">
          <UtensilsCrossed size={32} className="mx-auto text-muted-foreground/60" />
          <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">No Menu Items Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No dishes match your search query or selected category. Click "Add Dish" to create a new item in the database.
          </p>
          <Button onClick={onAddItem} size="sm" className="bg-primary text-white font-bold text-xs uppercase tracking-wider">
            + Add New Dish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onToggleAvailability={onToggleAvailability}
            />
          ))}
        </div>
      )}
    </div>
  );
};
