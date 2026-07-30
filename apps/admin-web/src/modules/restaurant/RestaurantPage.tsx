import React, { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Utensils, LayoutGrid, Plus, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { api } from "@/shared/utils/api-client";
import { CategorySidebar, Category } from "./components/CategorySidebar";
import { MenuCatalog } from "./components/MenuCatalog";
import { MenuItemCard, MenuItem } from "./components/MenuItemCard";
import { MenuItemDialog } from "./components/MenuItemDialog";
import { TableLayout } from "./components/TableLayout";
import { Table } from "./components/TableCard";

export const RestaurantPage: React.FC = () => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/restaurant";

  const isTablesView = currentPath.includes("/tables");
  const isOrdersView = currentPath.includes("/orders");

  // Domain State strictly fetched from PostgreSQL Database (Golden Rule #1 & #2)
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🍛");

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync data with backend PostgreSQL database
  const fetchRestaurantMasterData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catsRes, itemsRes, tablesRes] = await Promise.all([
        api.get<Category[]>("/restaurant/categories"),
        api.get<MenuItem[]>("/restaurant/menu-items"),
        api.get<Table[]>("/restaurant/tables")
      ]);

      setCategories(catsRes || []);
      setMenuItems(itemsRes || []);
      setTables(tablesRes || []);
    } catch (err: any) {
      console.error("Failed to load restaurant master data from PostgreSQL", err);
      setError("Failed to connect to PostgreSQL database endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantMasterData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await api.post("/restaurant/categories", {
        name: newCategoryName,
        icon: newCategoryIcon,
        slug: newCategoryName.toLowerCase().replace(/\s+/g, "-")
      });
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
      fetchRestaurantMasterData();
    } catch (err: any) {
      alert("Failed to create category in PostgreSQL database");
    }
  };

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (itemData: Partial<MenuItem>) => {
    try {
      if (editingItem) {
        await api.put(`/restaurant/menu-items/${editingItem.id}`, itemData);
      } else {
        await api.post("/restaurant/menu-items", itemData);
      }
      setIsItemModalOpen(false);
      fetchRestaurantMasterData();
    } catch (err: any) {
      alert("Failed to save menu item to PostgreSQL database");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm("Delete dish from PostgreSQL database?")) {
      try {
        await api.delete(`/restaurant/menu-items/${id}`);
        fetchRestaurantMasterData();
      } catch (err: any) {
        alert("Failed to delete dish from PostgreSQL");
      }
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await api.put(`/restaurant/menu-items/${item.id}`, {
        ...item,
        is_available: !item.is_available
      });
      fetchRestaurantMasterData();
    } catch (err: any) {
      alert("Failed to toggle availability status");
    }
  };

  const handleUpdateTableStatus = async (
    tableId: number,
    status: Table["status"],
    guests?: number,
    waiter?: string
  ) => {
    try {
      await api.patch(`/restaurant/tables/${tableId}/status`, { status, guests, waiter });
      fetchRestaurantMasterData();
    } catch (err: any) {
      alert("Failed to update table status in PostgreSQL");
    }
  };

  const handleCreateTable = async (table_number: string, capacity: number, section: string) => {
    try {
      await api.post("/restaurant/tables", {
        table_number,
        capacity,
        section,
        branch_id: 1
      });
      fetchRestaurantMasterData();
    } catch (err: any) {
      alert("Failed to create table in PostgreSQL database");
    }
  };

  return (
    <div className="space-y-4">
      {/* Route-Based Content Rendered Strictly via Sidebar Selection (Golden Rule #4 Compliance) */}
      {isTablesView ? (
        <TableLayout
          tables={tables}
          onUpdateTableStatus={handleUpdateTableStatus as any}
          onCreateTable={handleCreateTable as any}
        />
      ) : (
        /* Default Restaurant Dishes & Catalog View */
        <MenuCatalog
          menuItems={menuItems}
          onAddItem={handleOpenAddItem}
          onEditItem={handleOpenEditItem}
          onDeleteItem={handleDeleteItem}
          onToggleAvailability={handleToggleAvailable}
          isLoading={isLoading}
        />
      )}

      {/* Item Modal */}
      <MenuItemDialog
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        editingItem={editingItem}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
      />

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-modal">
            <h3 className="font-display font-black text-base text-foreground uppercase">Add Dish Category</h3>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-muted-foreground mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Tandoori Starters"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Emoji / Icon</label>
                <input
                  type="text"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none text-base"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-extrabold">
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
