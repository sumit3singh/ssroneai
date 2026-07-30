import React, { useState } from "react";
import { FolderPlus, Search, Utensils, Edit2, Trash2, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { POSCategory } from "../../types";

interface CategoryListPageProps {
  categories: POSCategory[];
  onOpenCreate: () => void;
  onOpenEdit: (cat: POSCategory) => void;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const CategoryListPage: React.FC<CategoryListPageProps> = ({
  categories = [],
  onOpenCreate,
  onOpenEdit,
  onDelete,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <Utensils size={18} className="text-primary" />
            Menu Categories Master ({categories.length})
          </h3>
          <p className="text-3xs text-muted-foreground">
            Configure dish categories, sorting order, and icon representations for POS counter
          </p>
        </div>

        <Button
          onClick={onOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <FolderPlus size={16} /> + Add Category
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search category name..."
          className="pl-8 h-9 text-xs bg-muted/30 font-medium"
        />
      </div>

      {/* Categories Grid / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-xs font-semibold text-muted-foreground">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-muted/30 border border-border/70 rounded-xl p-3.5 flex items-center justify-between hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl p-2 rounded-xl bg-card border border-border">
                  {cat.icon || "🍛"}
                </span>
                <div>
                  <h4 className="font-extrabold text-xs text-foreground">{cat.name}</h4>
                  <span className="text-3xs text-muted-foreground font-mono">slug: {cat.slug || cat.name.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenEdit(cat)}
                  className="p-1.5 hover:bg-card rounded-lg text-muted-foreground hover:text-primary transition-all border-none bg-transparent cursor-pointer"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(cat.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-all border-none bg-transparent cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
