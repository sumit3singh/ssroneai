import React, { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { useAuthStore } from "@ssrone/auth";
import type { POSCategory, POSMenuItem, POSTable, POSWaiter, POSOrder } from "../../types";
import { POSDashboardPage } from "./POSDashboardPage";
import { POSMasterSection } from "../master/POSMasterSection";
import { POSTransactionSection } from "../transaction/POSTransactionSection";
import { POSReportsPage } from "../report/POSReportsPage";
import { POSSettingsPage } from "../settings/POSSettingsPage";

export const POSPage: React.FC = () => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/pos";

  // Domain Data State initialized strictly from PostgreSQL DB API
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [menuItems, setMenuItems] = useState<POSMenuItem[]>([]);
  const [tables, setTables] = useState<POSTable[]>([]);
  const [waiters, setWaiters] = useState<POSWaiter[]>([]);
  const [orders, setOrders] = useState<POSOrder[]>([]);

  const selectedBranch = useAuthStore((s: any) => s.selected_branch);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPOSDomainData = async () => {
    setIsLoading(true);
    try {
      const bId = selectedBranch?.id ? Number(selectedBranch.id) : null;
      const bParam = bId ? `?branch_id=${bId}` : "";
      const [catsRes, itemsRes, tablesRes, waitersRes, ordersRes] = await Promise.all([
        api.get<any>(`/restaurant/categories${bParam}`).catch(() => []),
        api.get<any>(`/restaurant/menu-items${bParam}`).catch(() => []),
        api.get<any>(`/restaurant/tables${bParam}`).catch(() => []),
        api.get<any>(`/restaurant/waiters${bParam}`).catch(() => []),
        api.get<any>(`/orders${bParam}`).catch(() => [])
      ]);

      const loadedCats = Array.isArray(catsRes) ? catsRes : (catsRes?.data || catsRes?.categories || []);
      const loadedItems = Array.isArray(itemsRes) ? itemsRes : (itemsRes?.data || itemsRes?.items || []);
      const tList = Array.isArray(tablesRes) ? tablesRes : (tablesRes?.data || []);
      const wList = Array.isArray(waitersRes) ? waitersRes : (waitersRes?.data || []);
      const oList = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.items || ordersRes?.data || []);

      setCategories(loadedCats);
      setMenuItems(loadedItems);
      setTables(tList);
      setWaiters(wList);
      setOrders(oList);
    } catch (err: any) {
      console.error("Failed to load PostgreSQL POS data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPOSDomainData();
  }, [selectedBranch?.id]);

  // Strict Branch Scoping Filter: Display only records matching active branch
  const activeBranchId = selectedBranch?.id ? String(selectedBranch.id) : null;
  const filteredMenuItems = activeBranchId
    ? menuItems.filter(m => !m.branch_id || String(m.branch_id) === activeBranchId)
    : menuItems;

  const filteredCategories = activeBranchId
    ? categories.filter(c => !c.branch_id || String(c.branch_id) === activeBranchId)
    : categories;

  const filteredTables = activeBranchId
    ? tables.filter(t => !t.branch_id || String(t.branch_id) === activeBranchId)
    : tables;

  const filteredWaiters = activeBranchId
    ? waiters.filter(w => !w.branch_id || String(w.branch_id) === activeBranchId)
    : waiters;

  // Handler mutations strictly enforcing PostgreSQL DB as Single Source of Truth (SSOT)
  const handleSaveMenuItem = async (itemData: Partial<POSMenuItem>) => {
    const payload = {
      ...itemData,
      branch_id: selectedBranch?.id ? Number(selectedBranch.id) : (itemData.branch_id ? Number(itemData.branch_id) : undefined)
    };

    try {
      const res = itemData.id
        ? await api.put<any>(`/restaurant/menu-items/${itemData.id}`, payload)
        : await api.post<any>("/restaurant/menu-items", payload);

      if (!res || !res.id) {
        throw new Error("PostgreSQL database returned invalid response");
      }

      if (itemData.id) {
        setMenuItems(prev => prev.map(m => String(m.id) === String(itemData.id) ? { ...m, ...res } : m));
      } else {
        setMenuItems(prev => [res, ...prev]);
      }

      toast.success(itemData.id ? "Dish updated in PostgreSQL Database!" : "New dish saved to PostgreSQL Database!");
      await fetchPOSDomainData();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || "Failed to save dish to PostgreSQL Database";
      toast.error(`Database Save Failed: ${detail}`);
      console.error("PostgreSQL DB Save Failure:", err);
      throw err;
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (confirm("Delete dish from database?")) {
      try {
        setMenuItems(prev => prev.filter(m => String(m.id) !== String(id)));
        await api.delete(`/restaurant/menu-items/${id}`);
        toast.success("Dish deleted successfully");
        await fetchPOSDomainData();
      } catch (err: any) {
        toast.error("Failed to delete dish");
        console.error("Failed to delete dish", err);
      }
    }
  };

  const handleToggleAvailability = async (item: POSMenuItem) => {
    const newStatus = !item.is_available;
    try {
      setMenuItems(prev => prev.map(m => String(m.id) === String(item.id) ? { ...m, is_available: newStatus } : m));
      await api.put(`/restaurant/menu-items/${item.id}`, {
        ...item,
        is_available: newStatus
      });
      toast.success(`${item.name} is now ${newStatus ? "In Stock" : "Out of Stock"}`);
      await fetchPOSDomainData();
    } catch (err) {
      toast.error("Failed to update item availability");
      console.error("Failed to toggle item status", err);
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
      await fetchPOSDomainData();
    } catch (err: any) {
      console.error("Failed to update table status", err);
    }
  };

  const handleCreateTable = async (table_number: string, capacity: number, section: string) => {
    try {
      await api.post<any>("/restaurant/tables", {
        table_number,
        capacity,
        section,
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1
      });
      toast.success(`Table #${table_number} created successfully!`);
      await fetchPOSDomainData();
    } catch (err: any) {
      console.error("Failed to create table", err);
      const detailMsg = err?.response?.data?.detail || err?.detail || err?.message || "Failed to create dining table";
      toast.error(detailMsg);
    }
  };

  const handleUpdateTable = async (id: number | string, table_number: string, capacity: number, section: string) => {
    try {
      await api.put<any>(`/restaurant/tables/${id}`, {
        table_number,
        capacity,
        section,
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1
      });
      toast.success(`Table #${table_number} updated successfully!`);
      await fetchPOSDomainData();
    } catch (err: any) {
      console.error("Failed to update table", err);
      const detailMsg = err?.response?.data?.detail || err?.detail || err?.message || "Failed to update dining table";
      toast.error(detailMsg);
    }
  };

  const handleDeleteTable = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this dining table?")) return;
    try {
      await api.delete<any>(`/restaurant/tables/${id}`);
      toast.success("Dining table deleted successfully!");
      await fetchPOSDomainData();
    } catch (err: any) {
      console.error("Failed to delete table", err);
      const detailMsg = err?.response?.data?.detail || err?.detail || err?.message || "Failed to delete dining table";
      toast.error(detailMsg);
    }
  };

  const handleCreateCategory = async (
    name: string,
    icon: string,
    slug?: string,
    sort_order?: number,
    branch_id?: number | null,
    company_id?: number | null
  ) => {
    try {
      const res = await api.post<any>("/restaurant/categories", {
        name,
        icon: icon || "🍛",
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category",
        sort_order: Number(sort_order) || 1,
        branch_id: branch_id ?? (selectedBranch?.id ? Number(selectedBranch.id) : 1),
        company_id: company_id ?? 1,
      });
      if (res && res.id) {
        setCategories(prev => [res, ...prev.filter(c => String(c.id) !== String(res.id))]);
        toast.success(`Category "${name}" saved to PostgreSQL Database!`);
      }
      await fetchPOSDomainData();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || "Failed to save category";
      toast.error(`Database Error: ${detail}`);
      console.error("Failed to create category in PostgreSQL", err);
    }
  };

  const handleUpdateCategory = async (
    id: number,
    name: string,
    icon: string,
    slug?: string,
    sort_order?: number,
    branch_id?: number | null,
    company_id?: number | null
  ) => {
    try {
      const res = await api.put<any>(`/restaurant/categories/${id}`, {
        name,
        icon: icon || "🍛",
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category",
        sort_order: Number(sort_order) || 1,
        branch_id: branch_id ?? (selectedBranch?.id ? Number(selectedBranch.id) : 1),
        company_id: company_id ?? 1,
      });
      if (res && res.id) {
        setCategories(prev => prev.map(c => String(c.id) === String(id) ? { ...c, ...res } : c));
        toast.success(`Category "${name}" updated in PostgreSQL Database!`);
      }
      await fetchPOSDomainData();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || "Failed to update category";
      toast.error(`Database Error: ${detail}`);
      console.error("Failed to update category in PostgreSQL", err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      setCategories(prev => prev.filter(c => String(c.id) !== String(id)));
      await api.delete(`/restaurant/categories/${id}`);
      toast.success("Category deactivated in PostgreSQL Database");
      await fetchPOSDomainData();
    } catch (err: any) {
      toast.error("Failed to delete category");
      console.error("Failed to soft-deactivate category in PostgreSQL", err);
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
        packaging_charge: newOrder.packaging_charge || 0,
        tax_amount: newOrder.tax_amount || 0,
        discount_amount: newOrder.discount_amount || 0,
        net_amount: newOrder.net_amount || 0,
        payment_method: newOrder.payment_method || "CASH",
        status: newOrder.status || "COMPLETED"
      };

      const res = await api.post<any>("/orders", payload);
      if (!res || !res.id) {
        throw new Error("Failed to create order in PostgreSQL Database");
      }
      await fetchPOSDomainData();
    } catch (err: any) {
      console.error("Order creation error", err);
      const detail = err?.response?.data?.detail || err?.message || "Failed to save order to PostgreSQL Database";
      toast.error(`Order Failed: ${detail}`);
      throw err;
    }
  };

  // Determine active view from URL path
  const isMasterView = currentPath.includes("/pos/master") || currentPath.includes("/pos/categories") || currentPath.includes("/pos/menu-items") || currentPath.includes("/pos/tables") || currentPath.includes("/pos/waiters") || currentPath.includes("/pos/payment-modes") || currentPath.includes("/pos/kitchen-stations");
  const isTransactionView = currentPath.includes("/pos/transaction") || currentPath.includes("/pos/billing") || currentPath.includes("/pos/kds");
  const isReportsView = currentPath.includes("/pos/reports") || currentPath.includes("/pos/report");
  const isSettingsView = currentPath.includes("/pos/settings");

  return (
    <div className="space-y-4">
      {/* Main Working Area */}
      {isMasterView ? (
        <POSMasterSection
          categories={filteredCategories}
          menuItems={filteredMenuItems}
          tables={filteredTables}
          waiters={filteredWaiters}
          onRefresh={fetchPOSDomainData}
          onSaveMenuItem={handleSaveMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
          onToggleAvailability={handleToggleAvailability}
          onUpdateTableStatus={handleUpdateTableStatus}
          onCreateTable={handleCreateTable}
          onUpdateTable={handleUpdateTable}
          onDeleteTable={handleDeleteTable}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          isLoading={isLoading}
        />
      ) : isTransactionView ? (
        <POSTransactionSection
          categories={filteredCategories}
          menuItems={filteredMenuItems}
          tables={filteredTables}
          waiters={filteredWaiters}
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
          onNavigateToBilling={() => { }}
          onNavigateToKDS={() => { }}
          onRefresh={fetchPOSDomainData}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
