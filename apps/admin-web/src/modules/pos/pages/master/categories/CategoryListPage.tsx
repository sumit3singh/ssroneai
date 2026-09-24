import React, { useState } from "react";
import { FolderPlus, Search, Utensils, Edit2, Power, Sparkles } from "lucide-react";
import { Button, Input, PageHeader, PageContainer } from "@ssrone/ui";
import { POSCategory } from "../../../types";
import { getCategoryColor, renderCategoryIcon } from "../../../utils/posCategoryColors";

interface CategoryListPageProps {
  categories: POSCategory[];
  onOpenCreate: () => void;
  onOpenEdit: (cat: POSCategory) => void;
  onDelete: (id: number) => Promise<void>;
  onCreateCategory?: (name: string, icon: string) => Promise<void>;
  isLoading?: boolean;
}

export const CategoryListPage: React.FC<CategoryListPageProps> = ({
  categories = [],
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onCreateCategory,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Menu Categories Master"
        description="Configure dish categories, sort order, and display icons"
        icon={<FolderPlus size={18} />}
        badge={`${categories.length} Categories`}
        actions={
          <Button
            onClick={onOpenCreate}
            size="sm"
            className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
          >
            <FolderPlus size={14} /> Add New Category
          </Button>
        }
      />

      {/* Search Toolbar */}
      <div className="relative max-w-sm">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search category name..."
          icon={<Search size={14} />}
          className="h-9 text-xs"
        />
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-md space-y-3">
          <div className="p-2.5 rounded-md bg-muted text-muted-foreground inline-block">
            <Utensils size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-foreground">No Categories Found</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs mx-auto">Create your first dish category manually or seed standard menu categories with 1 click.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button onClick={onOpenCreate} size="sm" className="gap-1.5 text-xs">
              <FolderPlus size={13} /> Create Category
            </Button>
            {onCreateCategory && (
              <Button
                onClick={async () => {
                  setIsSeeding(true);
                  try {
                    const defaultNames = [
                      { name: "Special Chai & Tea", icon: "☕" },
                      { name: "Artisanal Coffee", icon: "☕" },
                      { name: "Quick Bites & Snacks", icon: "🍟" },
                      { name: "Gourmet Burgers & Wraps", icon: "🍔" },
                      { name: "Pizzas & Garlic Breads", icon: "🍕" },
                      { name: "Desserts & Beverages", icon: "🍰" },
                    ];
                    for (const item of defaultNames) {
                      await onCreateCategory(item.name, item.icon);
                    }
                  } finally {
                    setIsSeeding(false);
                  }
                }}
                disabled={isSeeding}
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
              >
                <Sparkles size={13} /> {isSeeding ? "Seeding..." : "Seed Default Categories"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredCategories.map((cat, idx) => {
            const theme = getCategoryColor(cat, idx);
            return (
              <div
                key={cat.id}
                className={`${theme.bg} ${theme.border} border rounded-xl p-3 flex items-center justify-between hover:shadow-xs transition-all`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 ${theme.text} ${theme.border} border shrink-0 flex items-center justify-center shadow-2xs`}>
                    {renderCategoryIcon(cat.icon, 18)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`font-bold text-xs ${theme.text} truncate`}>{cat.name}</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        Active
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">slug: {cat.slug || cat.name.toLowerCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onOpenEdit(cat)}
                    title="Edit Category"
                    className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deactivate/Close Category "${cat.name}"?`)) {
                        onDelete(cat.id);
                      }
                    }}
                    title="Deactivate Category"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <Power size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
