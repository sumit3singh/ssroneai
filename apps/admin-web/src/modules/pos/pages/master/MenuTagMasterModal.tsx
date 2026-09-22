import React, { useState, useEffect } from "react";
import { X, Tag, Plus, Trash2, Palette, CheckCircle2, Sparkles } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";

interface MenuTag {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

interface MenuTagMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagsUpdated?: () => void;
}

const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#64748b", // Slate
];

const PRESET_ICONS = ["🔥", "⭐", "🌶️", "👑", "🌱", "🥩", "🧀", "🥤", "🍰", "⚡"];

export const MenuTagMasterModal: React.FC<MenuTagMasterModalProps> = ({
  isOpen,
  onClose,
  onTagsUpdated,
}) => {
  const [tags, setTags] = useState<MenuTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.get<MenuTag[]>("/restaurant/tags");
      if (Array.isArray(res)) {
        setTags(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load menu tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      setSaving(true);
      await api.post("/restaurant/tags", {
        name: tagName.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
      toast.success(`Tag "${tagName}" created successfully!`);
      setTagName("");
      fetchTags();
      onTagsUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete tag "${name}"?`)) return;
    try {
      await api.delete(`/restaurant/tags/${tagId}`);
      toast.success(`Tag "${name}" removed`);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      onTagsUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tag");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Tag size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Menu Tags Master</h2>
              <p className="text-xs text-muted-foreground">
                Highlight special dishes with badges (Chef's Special, Spicy, Bestseller)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Tag Creation Form */}
          <form onSubmit={handleCreateTag} className="bg-muted/30 border border-border p-4 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus size={14} className="text-primary" />
              <span>Create New Tag</span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="e.g. Chef's Special, Spicy, Vegan..."
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="text-xs h-9 flex-1"
              />
              <Button type="submit" size="sm" disabled={saving || !tagName.trim()} className="gap-1 text-xs shrink-0 cursor-pointer">
                <Plus size={14} /> Add Tag
              </Button>
            </div>

            {/* Icon Picker */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground">Badge Icon:</div>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-7 h-7 rounded border text-sm flex items-center justify-center transition-all cursor-pointer ${
                      selectedIcon === icon
                        ? "border-primary bg-primary/20 scale-110 shadow-xs"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette Picker */}
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Palette size={12} /> Badge Color:
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer border-2 ${
                      selectedColor === c ? "border-foreground scale-125 ring-2 ring-primary/40" : "border-transparent"
                    }`}
                  />
                ))}
                {/* Live Preview */}
                <div className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full text-white flex items-center gap-1 shadow-2xs" style={{ backgroundColor: selectedColor }}>
                  <span>{selectedIcon}</span>
                  <span>{tagName.trim() || "Preview Tag"}</span>
                </div>
              </div>
            </div>
          </form>

          {/* Active Tags List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Configured Menu Tags ({tags.length})</span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-9 bg-muted/60 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No custom tags configured yet. Create one above!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold text-white flex items-center gap-1 shadow-2xs"
                        style={{ backgroundColor: tag.color || "#3b82f6" }}
                      >
                        {tag.icon && <span>{tag.icon}</span>}
                        <span>{tag.name}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border-none bg-transparent"
                      title="Delete Tag"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
