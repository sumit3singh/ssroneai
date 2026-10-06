import { fetchCategories } from "@ssrone/api-client";
import { cn } from "@/lib/utils";
import { Search, X, LayoutGrid, Utensils, Coffee, Pizza, Sandwich, Salad, Soup, Cake, CupSoda, Flame, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export const renderCategoryIcon = (name: string, className = "w-4 h-4") => {
  const n = (name || "").toLowerCase();
  if (n.includes("momo") || n.includes("dimsum")) return <Sparkles className={className} />;
  if (n.includes("roll") || n.includes("wrap") || n.includes("burger") || n.includes("sandwich")) return <Sandwich className={className} />;
  if (n.includes("noodle") || n.includes("rice") || n.includes("chowmein") || n.includes("pasta") || n.includes("soup")) return <Soup className={className} />;
  if (n.includes("pizza")) return <Pizza className={className} />;
  if (n.includes("drink") || n.includes("beverage") || n.includes("shake") || n.includes("soda")) return <CupSoda className={className} />;
  if (n.includes("tea") || n.includes("coffee") || n.includes("chai")) return <Coffee className={className} />;
  if (n.includes("tandoor") || n.includes("chaap") || n.includes("tikka") || n.includes("grill")) return <Flame className={className} />;
  if (n.includes("salad") || n.includes("healthy") || n.includes("diet")) return <Salad className={className} />;
  if (n.includes("dessert") || n.includes("sweet") || n.includes("cake") || n.includes("pastry")) return <Cake className={className} />;
  return <Utensils className={className} />;
};

export const getCategoryEmoji = (_name: string, _icon?: string): string => "";

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isOpen: boolean;
  onClose: () => void;
  branchCode?: string;
  categories?: any[];
}

const CategorySidebar = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isOpen,
  onClose,
  branchCode,
  categories: propCategories,
}: CategorySidebarProps) => {
  const [categoriesList, setCategoriesList] = useState<any[]>(propCategories || []);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategoriesList(propCategories);
      return;
    }
    fetchCategories(branchCode).then((cats) => {
      setCategoriesList(Array.isArray(cats) ? cats : []);
    }).catch(() => {
      setCategoriesList([]);
    });
  }, [branchCode, propCategories]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-4rem)] bg-white border-r border-[#E8E3DC] z-50 md:z-20 transition-all duration-300 overflow-y-auto shrink-0",
          isOpen
            ? "translate-x-0 w-72 md:w-64 md:opacity-100"
            : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden md:opacity-0 pointer-events-none md:pointer-events-none"
        )}
      >
        <div className="p-4 space-y-4 font-sans">
          {/* Close on mobile */}
          <div className="flex items-center justify-between md:hidden">
            <h2 className="font-serif text-lg font-bold text-[#2D241E]">Menu Categories</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F8F6F2] text-[#7A746B] hover:text-[#2D241E] transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A746B]" />
            <input
              type="text"
              placeholder="Search dishes or categories"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
            />
          </div>

          {/* Categories */}
          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory("all")}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer",
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white shadow-xs"
                  : "hover:bg-[#F8F6F2] text-[#2D241E]"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-[#F8F6F2] text-[#7A746B]"
              )}>
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span>All Items</span>
            </button>

            {categoriesList.map((cat) => {
              const catIdStr = String(cat.id);
              const isSelected = String(selectedCategory) === catIdStr;
              return (
                <button
                  key={cat.id}
                  onClick={() => { onSelectCategory(catIdStr); onClose(); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer",
                    isSelected
                      ? "bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white shadow-xs"
                      : "hover:bg-[#F8F6F2] text-[#2D241E]"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-white/20 text-white" : "bg-[#F8F6F2] text-[#7A746B]"
                  )}>
                    {renderCategoryIcon(cat.name)}
                  </div>
                  <span className="break-words leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default CategorySidebar;

