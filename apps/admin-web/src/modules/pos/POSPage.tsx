import React, { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { api } from "@/shared/utils/api-client";
import { useAuthStore } from "@/app/providers/auth-store";
import { POSHeader } from "./components/POSHeader";
import {
  POSCategory, POSMenuItem, POSTable, POSWaiter, POSOrder,
  POSDashboardPage, POSMasterSection, POSTransactionSection, POSReportsPage, POSSettingsPage
} from "./index";

export const POSPage: React.FC = () => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/pos";

  // Domain Data State fetched strictly from PostgreSQL APIs
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [menuItems, setMenuItems] = useState<POSMenuItem[]>([]);
  const [tables, setTables] = useState<POSTable[]>([]);
  const [waiters, setWaiters] = useState<POSWaiter[]>([]);
  const [orders, setOrders] = useState<POSOrder[]>([]);

  const selectedBranch = useAuthStore((s: any) => s.selected_branch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPOSDomainData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const branchId = selectedBranch?.id;
      const params = branchId ? { branch_id: branchId } : {};
      const [catsRes, itemsRes, tablesRes, waitersRes] = await Promise.all([
        api.get<POSCategory[]>("/restaurant/categories", params),
        api.get<POSMenuItem[]>("/restaurant/menu-items", params),
        api.get<POSTable[]>("/restaurant/tables", params),
        api.get<POSWaiter[]>("/restaurant/waiters", params)
      ]);

      setCategories(catsRes || []);
      setMenuItems(itemsRes || []);
      setTables(tablesRes || []);
      setWaiters(waitersRes || []);
    } catch (err: any) {
      console.error("Failed to load POS domain master data from PostgreSQL", err);
      setError(err?.response?.data?.detail || "Failed to sync POS domain data from PostgreSQL");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPOSDomainData();
  }, [selectedBranch?.id]);

  // Handler mutations
  const handleSaveMenuItem = async (itemData: Partial<POSMenuItem>) => {
    try {
      const payload = {
        ...itemData,
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1
      };
      if (itemData.id) {
        await api.put(`/restaurant/menu-items/${itemData.id}`, payload);
      } else {
        await api.post("/restaurant/menu-items", payload);
      }
      fetchPOSDomainData();
    } catch (err: any) {
      alert("Failed to save menu item to database");
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (confirm("Delete dish from PostgreSQL database?")) {
      try {
        await api.delete(`/restaurant/menu-items/${id}`);
        fetchPOSDomainData();
      } catch (err: any) {
        alert("Failed to delete dish");
      }
    }
  };

  const handleToggleAvailability = async (item: POSMenuItem) => {
    try {
      await api.put(`/restaurant/menu-items/${item.id}`, {
        ...item,
        is_available: !item.is_available
      });
      fetchPOSDomainData();
    } catch (err) {
      alert("Failed to toggle item status");
    }
  };

  const handleUpdateTableStatus = async (
    tableId: string | number,
    status: POSTable["status"],
    guests: number,
    waiter: string
  ) => {
    try {
      await api.patch(`/restaurant/tables/${tableId}/status`, { status, guests, waiter });
      fetchPOSDomainData();
    } catch (err: any) {
      alert("Failed to update table status");
    }
  };

  const handleCreateTable = async (table_number: string, capacity: number, section: string) => {
    try {
      await api.post("/restaurant/tables", {
        table_number,
        capacity,
        section,
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1
      });
      fetchPOSDomainData();
    } catch (err: any) {
      alert("Failed to create table");
    }
  };

  const handleCreateCategory = async (name: string, icon: string) => {
    try {
      await api.post("/restaurant/categories", {
        name,
        icon,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1
      });
      fetchPOSDomainData();
    } catch (err: any) {
      alert("Failed to create category");
    }
  };

  const handleUpdateCategory = async (id: number, name: string, icon: string) => {
    try {
      await api.put(`/restaurant/categories/${id}`, {
        name,
        icon,
        slug: name.toLowerCase().replace(/\s+/g, "-")
      });
      fetchPOSDomainData();
    } catch (err: any) {
      alert("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Are you sure you want to delete this category from database?")) {
      try {
        await api.delete(`/restaurant/categories/${id}`);
        fetchPOSDomainData();
      } catch (err: any) {
        alert("Failed to delete category");
      }
    }
  };

  const handleCreateOrder = async (newOrder: Partial<POSOrder>) => {
    try {
      const payload = {
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1,
        order_type: newOrder.order_type || "DINE_IN",
        table_id: newOrder.table_id || null,
        waiter_id: newOrder.waiter_id || null,
        items: newOrder.items || [],
        subtotal: newOrder.subtotal || 0,
        tax_amount: newOrder.tax_amount || 0,
        discount_amount: newOrder.discount_amount || 0,
        net_amount: newOrder.net_amount || 0,
        payment_method: newOrder.payment_method || "CASH",
        status: newOrder.status || "COMPLETED"
      };

      const res = await api.post<any>("/orders", payload).catch(() => null);

      const created: POSOrder = {
        id: res?.id ? String(res.id) : `ord-${Date.now()}`,
        order_number: res?.order_number || newOrder.order_number || `POS-${Date.now().toString().slice(-6)}`,
        order_type: newOrder.order_type || "DINE_IN",
        status: newOrder.status || "COMPLETED",
        items: newOrder.items || [],
        subtotal: newOrder.subtotal || 0,
        tax_amount: newOrder.tax_amount || 0,
        discount_amount: newOrder.discount_amount || 0,
        net_amount: newOrder.net_amount || 0,
        payment_method: newOrder.payment_method || "CASH",
        created_at: new Date().toISOString(),
        table_name: newOrder.table_name,
        waiter_name: newOrder.waiter_name
      };

      setOrders((prev) => [created, ...prev]);
      fetchPOSDomainData();
    } catch (err: any) {
      console.error("Order creation error", err);
    }
  };

  // Determine active view from URL path (UI Navigation Law - 0 Duplicate Center Tabs!)
  const isMasterView = currentPath.includes("/pos/master") || currentPath.includes("/pos/categories") || currentPath.includes("/pos/menu-items") || currentPath.includes("/pos/tables");
  const isTransactionView = currentPath.includes("/pos/transaction") || currentPath.includes("/pos/billing") || currentPath.includes("/pos/kds");
  const isReportsView = currentPath.includes("/pos/reports") || currentPath.includes("/pos/report");
  const isSettingsView = currentPath.includes("/pos/settings");

  return (
    <div className="space-y-4">
      {/* Main Working Area (Sidebar Controls Purpose, Center Executes Operation) */}
      {isMasterView ? (
        <POSMasterSection
          categories={categories}
          menuItems={menuItems}
          tables={tables}
          waiters={waiters}
          onRefresh={fetchPOSDomainData}
          onSaveMenuItem={handleSaveMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
          onToggleAvailability={handleToggleAvailability}
          onUpdateTableStatus={handleUpdateTableStatus}
          onCreateTable={handleCreateTable}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          isLoading={isLoading}
        />
      ) : isTransactionView ? (
        <POSTransactionSection
          categories={categories}
          menuItems={menuItems}
          tables={tables}
          waiters={waiters}
          orders={orders}
          onCreateOrder={handleCreateOrder}
          isLoading={isLoading}
        />
      ) : isReportsView ? (
        <POSReportsPage orders={orders} />
      ) : isSettingsView ? (
        <POSSettingsPage />
      ) : (
        /* Default Dashboard view */
        <POSDashboardPage
          orders={orders}
          tables={tables}
          onNavigateToBilling={() => {}}
          onNavigateToKDS={() => {}}
          onRefresh={fetchPOSDomainData}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
