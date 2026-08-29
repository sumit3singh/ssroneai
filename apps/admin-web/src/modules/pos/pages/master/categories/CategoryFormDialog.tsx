import React, { useState, useEffect } from "react";
import { FolderPlus, X, Sparkles } from "lucide-react";
import { Input, Button } from "@ssrone/ui";
import { POSCategory } from "../../../types";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, icon: string, formData?: { slug?: string; sort_order?: number; branch_id?: number | null; company_id?: number | null }) => Promise<void>;
  editingCategory?: POSCategory | null;
}

const EMOJI_PRESETS = ["🍛", "🍕", "🥟", "🍹", "🍰", "🍔", "☕", "🍟", "🥗", "🍨", "🍜", "🍞"];

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory
}) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍛");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || "");
      setIcon(editingCategory.icon || "🍛");
      setSortOrder(editingCategory.sort_order ?? 1);
    } else {
      setName("");
      setIcon("🍛");
      setSortOrder(1);
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const generatedSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave(name.trim(), icon, {
        slug: generatedSlug || "category",
        sort_order: Number(sortOrder) || 1,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Dialog Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editingCategory ? "Edit Category Master" : "Add Category Master"}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">PostgreSQL Single Source of Truth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-none bg-transparent cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name Input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              Category Title *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starters & Momos"
              required
              className="h-10 text-xs font-bold"
            />
            {name.trim() && (
              <p className="text-[10px] font-mono text-slate-400 pt-0.5">
                Generated Slug: <span className="text-slate-700 dark:text-slate-300 font-bold">{generatedSlug || "n-a"}</span>
              </p>
            )}
          </div>

          {/* Category Icon Emoji Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              Category Icon Emoji
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                {icon || "🍛"}
              </span>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Type emoji..."
                className="h-10 text-xs font-bold flex-1"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-base p-1.5 rounded-lg border transition-all cursor-pointer ${icon === emoji
                      ? "bg-slate-900 text-white dark:bg-slate-100 border-slate-900 dark:border-slate-100 scale-105"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:scale-105"
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              Sort Order
            </label>
            <Input
              type="number"
              min={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
              className="h-10 text-xs font-bold"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-extrabold shadow-sm cursor-pointer"
            >
              {isSaving ? "Saving to PostgreSQL..." : editingCategory ? "Update Category" : "Save Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
