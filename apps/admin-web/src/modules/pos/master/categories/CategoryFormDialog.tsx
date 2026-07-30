import React, { useState, useEffect } from "react";
import { FolderPlus, X } from "lucide-react";
import { Input } from "@/shared/ui/primitives/Input";
import { Button } from "@/shared/ui/primitives/Button";
import { POSCategory } from "../../types";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, icon: string) => Promise<void>;
  editingCategory?: POSCategory | null;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory
}) => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍛");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || "");
      setIcon(editingCategory.icon || "🍛");
    } else {
      setName("");
      setIcon("🍛");
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave(name, icon);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-extrabold text-base text-foreground">
            {editingCategory ? "Edit Category" : "Add New Menu Category"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Category Title *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starters & Momos"
              required
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Icon Emoji</label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. 🥟 or 🍕"
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-primary text-white font-bold">
              {isSaving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
