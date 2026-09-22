import React, { useState, useEffect } from "react";
import { X, Utensils, Plus, Trash2, CheckCircle2, Package, Scale, AlertCircle } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { POSMenuItem } from "../../types";

interface RecipeIngredient {
  id: number;
  menu_item_id: number;
  inventory_item_id: number;
  inventory_item_name: string;
  unit_of_measure: string;
  quantity_required: number;
  wastage_percentage: number;
}

interface InventoryProduct {
  id: number;
  name: string;
  code: string;
  unit_of_measure: string;
  selling_price?: number;
}

interface RecipeBOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: POSMenuItem | null;
  onUpdated?: () => void;
}

export const RecipeBOMModal: React.FC<RecipeBOMModalProps> = ({
  isOpen,
  onClose,
  menuItem,
  onUpdated,
}) => {
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>("1.0");
  const [wastage, setWastage] = useState<string>("0");

  const loadData = async () => {
    if (!menuItem) return;
    try {
      setLoading(true);
      const [recipeRes, prodRes] = await Promise.all([
        api.get<RecipeIngredient[]>(`/restaurant/menu-items/${menuItem.id}/recipe`),
        api.get<any>("/inventory/products?page_size=100"),
      ]);

      setIngredients(Array.isArray(recipeRes) ? recipeRes : []);

      const pList = prodRes?.items || prodRes?.products || prodRes || [];
      if (Array.isArray(pList)) {
        setProducts(pList);
        if (pList.length > 0 && !selectedProductId) {
          setSelectedProductId(pList[0].id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load recipe bill of materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && menuItem) {
      loadData();
    }
  }, [isOpen, menuItem]);

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItem) return;
    if (!selectedProductId) {
      toast.error("Please select an inventory item");
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/restaurant/menu-items/${menuItem.id}/recipe`, {
        inventory_item_id: Number(selectedProductId),
        quantity_required: qty,
        wastage_percentage: parseFloat(wastage) || 0.0,
      });
      toast.success("Ingredient added to dish recipe!");
      setQuantity("1.0");
      setWastage("0");
      loadData();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to add ingredient");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIngredient = async (ingredientId: number) => {
    try {
      await api.delete(`/restaurant/recipe/${ingredientId}`);
      toast.success("Ingredient removed from recipe");
      setIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove ingredient");
    }
  };

  if (!isOpen || !menuItem) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Bill of Materials (BOM) & Recipe: {menuItem.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Automatically deplete inventory raw materials upon KDS order completion & checkout
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Add Ingredient Form */}
          <form onSubmit={handleAddIngredient} className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus size={14} className="text-primary" /> Add Raw Material to Recipe
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Inventory Item</label>
                <select
                  value={selectedProductId || ""}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
                >
                  {products.length === 0 && <option value="">No inventory items found</option>}
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) [{p.unit_of_measure}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Qty per Dish ({currentProduct?.unit_of_measure || "units"})
                </label>
                <Input
                  type="number"
                  step="0.001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Wastage %</label>
                <Input
                  type="number"
                  step="0.5"
                  value={wastage}
                  onChange={(e) => setWastage(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || !selectedProductId}
                  className="w-full text-xs h-8 gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add
                </Button>
              </div>
            </div>
          </form>

          {/* Current Recipe Ingredients List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Recipe Ingredients ({ingredients.length})</span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-muted/60 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : ingredients.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No raw material ingredients mapped yet. Add items above to enable real-time inventory deduction.
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Raw Material</th>
                      <th className="p-2.5 text-center">Required Qty</th>
                      <th className="p-2.5 text-center">Wastage</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ingredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-medium text-foreground flex items-center gap-1.5">
                          <Package size={13} className="text-muted-foreground" />
                          <span>{ing.inventory_item_name}</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-semibold text-primary">
                          {ing.quantity_required} {ing.unit_of_measure}
                        </td>
                        <td className="p-2.5 text-center font-mono text-muted-foreground">
                          {ing.wastage_percentage ? `${ing.wastage_percentage}%` : "0%"}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleDeleteIngredient(ing.id)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer border-none bg-transparent"
                            title="Remove Ingredient"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
