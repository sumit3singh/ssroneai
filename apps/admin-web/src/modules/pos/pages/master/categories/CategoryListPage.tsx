import React, { useState } from "react";
import { FolderPlus, Search, Utensils, Edit2, Power, CheckCircle2, Sparkles } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { POSCategory } from "../../../types";

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
    <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Utensils size={22} />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base md:text-lg text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              Menu Categories Master ({categories.length})
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Architectural #1 Master: Configure dish categories, sort order, and icons before menu items
            </p>
          </div>
        </div>

        <Button
          onClick={onOpenCreate}
          variant="primary"
          size="md"
          className="text-xs uppercase tracking-wider gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/25"
        >
          <FolderPlus size={16} /> Add New Category
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search category name..."
          icon={<Search size={16} />}
          className="h-10 text-xs md:text-sm font-bold"
        />
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-slate-200/60 dark:bg-slate-800/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 inline-block">
            <Utensils size={32} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">No Categories in PostgreSQL Database</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-medium">Create your first dish category manually or seed standard menu categories with 1 click.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button onClick={onOpenCreate} size="sm" variant="primary" className="gap-1.5">
              <FolderPlus size={14} /> Create Category
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
                className="gap-1.5"
              >
                <Sparkles size={14} /> {isSeeding ? "Seeding to Database..." : "Seed Default Categories into DB"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="group backdrop-blur-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-500/50 shadow-xs hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {cat.icon || "🍛"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{cat.name}</h4>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">slug: {cat.slug || cat.name.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenEdit(cat)}
                  title="Edit Category"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deactivate/Close Category "${cat.name}"? (Soft status update in database)`)) {
                      onDelete(cat.id);
                    }
                  }}
                  title="Close / Deactivate Category"
                  className="p-2 hover:bg-amber-500/10 rounded-xl text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <Power size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
