import React from "react";
import { FolderPlus, Search, Utensils, RefreshCw, AlertTriangle } from "lucide-react";
import { Input } from "@/shared/ui/primitives/Input";
import { Button } from "@/shared/ui/primitives/Button";

export interface Category {
  id: number;
  name: string;
  icon?: string;
  slug?: string;
  sort_order?: number;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onOpenCategoryModal: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onOpenCategoryModal,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full lg:w-72 bg-card border border-border rounded-2xl p-4 flex flex-col gap-4 shadow-card">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Utensils size={18} className="text-primary" />
          <h2 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">
            Categories
          </h2>
        </div>
        <Button
          onClick={onOpenCategoryModal}
          size="sm"
          className="h-8 px-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-2xs uppercase tracking-wider rounded-lg"
        >
          <FolderPlus size={14} className="mr-1" />
          + Add
        </Button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="pl-8 h-9 text-xs bg-muted/30 border-border font-medium"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-xl space-y-2">
          <AlertTriangle size={20} className="mx-auto text-red-500" />
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline" className="h-7 text-xs font-bold gap-1">
              <RefreshCw size={12} /> Retry
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all ${
              selectedCategoryId === null
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "hover:bg-muted/60 text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🍽️</span>
              <span>All Categories</span>
            </span>
            <span className="text-[10px] opacity-80 font-mono">({categories.length})</span>
          </button>

          {filteredCategories.length === 0 ? (
            <div className="py-6 text-center text-xs font-semibold text-muted-foreground">
              No categories found
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{cat.icon || "🍛"}</span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
