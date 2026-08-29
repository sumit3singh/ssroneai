import { categories as defaultCategories, Category } from "@/data/mockMenu";
import { fetchCategories } from "@ssrone/api-client";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  vegOnly: boolean;
  onVegToggle: (v: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
  branchCode?: string;
}

const CategorySidebar = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  vegOnly,
  onVegToggle,
  isOpen,
  onClose,
  branchCode,
}: CategorySidebarProps) => {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories(branchCode).then((cats) => {
      setCategoriesList(Array.isArray(cats) ? cats : []);
    }).catch(() => {
      setCategoriesList([]);
    });
  }, [branchCode]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-full md:h-auto w-72 bg-card border-r border-border z-50 md:z-auto transition-transform duration-300 overflow-y-auto",
          "md:translate-x-0 md:block",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 space-y-4">
          {/* Close on mobile */}
          <div className="flex items-center justify-between md:hidden">
            <h2 className="font-display text-lg font-semibold">Menu</h2>
            <button onClick={onClose} className="p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Veg toggle */}
          <button
            onClick={() => onVegToggle(!vegOnly)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              vegOnly ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            <span className="text-lg">🥬</span>
            Veg Only
          </button>

          {/* Categories */}
          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory("all")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted"
              )}
            >
              <span className="text-lg">🍽️</span>
              All Items
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { onSelectCategory(cat.id); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted"
                )}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.name}
              </button>
            ))}

          </div>
        </div>
      </aside>
    </>
  );
};

export default CategorySidebar;
