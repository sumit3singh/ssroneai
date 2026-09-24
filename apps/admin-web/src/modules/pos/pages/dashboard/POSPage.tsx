import React, { useState, useEffect, useRef } from "react";
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
import { syncLocalOrderSequenceWithOrders } from "../../utils/order-sequence";

export const POSPage: React.FC = () => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/pos";

  // Domain Data State initialized with instant 0ms sessionStorage cache + PostgreSQL DB sync
  const [categories, setCategories] = useState<POSCategory[]>(() => {
    try {
      const cached = sessionStorage.getItem("pos_cache_categories");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [menuItems, setMenuItems] = useState<POSMenuItem[]>(() => {
    try {
      const cached = sessionStorage.getItem("pos_cache_menu_items");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [tables, setTables] = useState<POSTable[]>(() => {
    try {
      const cached = sessionStorage.getItem("pos_cache_tables");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [waiters, setWaiters] = useState<POSWaiter[]>(() => {
    try {
      const cached = sessionStorage.getItem("pos_cache_waiters");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [orders, setOrders] = useState<POSOrder[]>(() => {
    try {
      const cached = sessionStorage.getItem("pos_cache_orders");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  const selectedBranch = useAuthStore((s: any) => s.selected_branch);
  const [isLoading, setIsLoading] = useState(false);

  // Settlement State Lock: Locks settled orders and their tables for 60s to prevent premature background server polls from reverting tables to occupied
  const settledOrdersLockRef = useRef<Map<string, { timestamp: number; tableId?: string | number }>>(new Map());

  const fetchPOSDomainData = async (isSilent = false, fullCatalog = false) => {
    if (!isSilent && menuItems.length === 0) setIsLoading(true);
    try {
      const bId = selectedBranch?.id ? Number(selectedBranch.id) : null;
      const bParam = bId ? `?branch_id=${bId}` : "";

      // Ultra-Fast Zero-Wait Polling: Always poll live tables & orders
      const fetchPromises: Promise<any>[] = [
        api.get<any>(`/restaurant/tables${bParam}`).catch(() => []),
        api.get<any>(`/orders${bParam}`).catch(() => [])
      ];

      // Only fetch catalog (categories, menu items, waiters) on initial load, window focus, or explicit full refresh
      const shouldFetchCatalog = fullCatalog || categories.length === 0 || menuItems.length === 0;
      if (shouldFetchCatalog) {
        fetchPromises.push(
          api.get<any>(`/restaurant/categories${bParam}`).catch(() => []),
          api.get<any>(`/restaurant/menu-items${bParam}`).catch(() => []),
          api.get<any>(`/restaurant/waiters${bParam}`).catch(() => [])
        );
      }

      const results = await Promise.all(fetchPromises);
      const tablesRes = results[0];
      const ordersRes = results[1];
      const catsRes = shouldFetchCatalog ? results[2] : null;
      const itemsRes = shouldFetchCatalog ? results[3] : null;
      const waitersRes = shouldFetchCatalog ? results[4] : null;

      if (shouldFetchCatalog) {
        const loadedCats = Array.isArray(catsRes) ? catsRes : (catsRes?.data || catsRes?.categories || []);
        const loadedItems = Array.isArray(itemsRes) ? itemsRes : (itemsRes?.data || itemsRes?.items || []);
        const wList = Array.isArray(waitersRes) ? waitersRes : (waitersRes?.data || []);

        if (loadedCats && loadedCats.length > 0) {
          setCategories(loadedCats);
          try { sessionStorage.setItem("pos_cache_categories", JSON.stringify(loadedCats)); } catch (e) {}
        }
        if (loadedItems && loadedItems.length > 0) {
          setMenuItems(loadedItems);
          try { sessionStorage.setItem("pos_cache_menu_items", JSON.stringify(loadedItems)); } catch (e) {}
        }
        if (wList && wList.length > 0) {
          setWaiters(wList);
          try { sessionStorage.setItem("pos_cache_waiters", JSON.stringify(wList)); } catch (e) {}
        }
      }

      const tList = Array.isArray(tablesRes) ? tablesRes : (tablesRes?.data || []);
      const oList = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.items || ordersRes?.data || []);

      if (oList && oList.length > 0) {
        syncLocalOrderSequenceWithOrders(oList);
      }

      // Reconcile Orders: Merge server orders with local pending optimistic orders (id: "local-...")
      setOrders((prev) => {
        const serverOrderNumbers = new Set(oList.map((o: any) => String(o.order_number || "")));
        const serverOrderIds = new Set(oList.map((o: any) => String(o.id)));

        // Keep any active optimistic orders that have not yet appeared in server oList
        const now = Date.now();
        const pendingOptimistic = prev.filter((p) => {
          if (!String(p.id).startsWith("local-")) return false;
          const numStr = String(p.order_number || "");
          if (serverOrderNumbers.has(numStr) || serverOrderIds.has(String(p.id))) {
            return false;
          }
          const st = (p.status || "").toLowerCase();
          if (["completed", "paid", "cancelled"].includes(st)) {
            return false;
          }
          const parts = String(p.id).split("-");
          const ts = parts.length > 1 ? Number(parts[1]) : 0;
          if (ts > 0 && now - ts > 120_000) {
            return false; // Auto-purge stale local order after 2 minutes
          }
          return true;
        });

        // Deduplicate merged orders by order_number (prefer server orders as SSOT, respecting active settlement locks)
        const orderMap = new Map<string, POSOrder>();
        const lockNow = Date.now();

        // Prune stale settlement locks older than 60s
        for (const [lockNum, lockData] of settledOrdersLockRef.current.entries()) {
          if (lockNow - lockData.timestamp > 60_000) {
            settledOrdersLockRef.current.delete(lockNum);
          }
        }

        for (const o of oList) {
          if (o && o.order_number) {
            const numStr = String(o.order_number);
            const lockData = settledOrdersLockRef.current.get(numStr);
            if (lockData && lockNow - lockData.timestamp <= 60_000) {
              // Retain completed/paid status during lock window so premature background fetches cannot revert the table
              orderMap.set(numStr, { ...o, status: "completed", payment_status: "paid" });
            } else {
              orderMap.set(numStr, o);
            }
          }
        }
        for (const p of pendingOptimistic) {
          if (p && p.order_number && !orderMap.has(String(p.order_number))) {
            orderMap.set(String(p.order_number), p);
          }
        }

        const mergedOrders = Array.from(orderMap.values());
        try {
          sessionStorage.setItem("pos_cache_orders", JSON.stringify(mergedOrders));
        } catch (e) {}
        return mergedOrders;
      });

      // Reconcile Tables: PostgreSQL DB is Single Source of Truth, respecting active settlement locks
      setTables(() => {
        const lockNow = Date.now();
        const lockedTableIds = new Set<string>();
        for (const lockData of settledOrdersLockRef.current.values()) {
          if (lockData.tableId !== undefined && lockData.tableId !== null && lockNow - lockData.timestamp <= 60_000) {
            lockedTableIds.add(String(lockData.tableId).toLowerCase());
          }
        }

        const reconciledTables = tList.map((t: any) => {
          const tId = String(t.id).toLowerCase();
          const tNum = String(t.table_number || "").toLowerCase();
          if (lockedTableIds.has(tId) || lockedTableIds.has(tNum)) {
            return { ...t, status: "free" as const, current_order_id: null };
          }
          return t;
        });

        try {
          sessionStorage.setItem("pos_cache_tables", JSON.stringify(reconciledTables));
        } catch (e) {}
        return reconciledTables;
      });
    } catch (err: any) {
      console.error("Failed to load PostgreSQL POS data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with full catalog on mount or branch change
    fetchPOSDomainData(false, true);

    // Superfast 3-Second Real-Time Auto-Polling (Tables & Orders only: 60% less network overhead)
    const interval = setInterval(() => {
      fetchPOSDomainData(true, false);
    }, 3000);

    // Instant Sync with full catalog on Window/Tab Focus
    const handleFocus = () => {
      fetchPOSDomainData(true, true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [selectedBranch?.id]);

  // Strict Branch Scoping Filter: Display only records matching active branch (with fallback if branch has 0 items)
  const activeBranchId = selectedBranch?.id ? String(selectedBranch.id) : null;

  const branchMatchingItems = activeBranchId && activeBranchId !== "0"
    ? menuItems.filter(m => !m.branch_id || String(m.branch_id) === activeBranchId)
    : menuItems;

  const filteredMenuItems = branchMatchingItems.length > 0 ? branchMatchingItems : menuItems;

  const branchMatchingCategories = activeBranchId && activeBranchId !== "0"
    ? categories.filter(c => !c.branch_id || String(c.branch_id) === activeBranchId)
    : categories;

  const filteredCategories = branchMatchingCategories.length > 0 ? branchMatchingCategories : categories;

  const filteredTables = activeBranchId && activeBranchId !== "0"
    ? (tables.filter(t => !t.branch_id || String(t.branch_id) === activeBranchId).length > 0 ? tables.filter(t => !t.branch_id || String(t.branch_id) === activeBranchId) : tables)
    : tables;

  const filteredWaiters = activeBranchId && activeBranchId !== "0"
    ? (waiters.filter(w => !w.branch_id || String(w.branch_id) === activeBranchId).length > 0 ? waiters.filter(w => !w.branch_id || String(w.branch_id) === activeBranchId) : waiters)
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
      fetchPOSDomainData(true).catch(() => {});
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
        fetchPOSDomainData(true).catch(() => {});
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
      fetchPOSDomainData(true).catch(() => {});
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
      fetchPOSDomainData(true).catch(() => {});
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
      fetchPOSDomainData(true).catch(() => {});
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
      fetchPOSDomainData(true).catch(() => {});
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
      fetchPOSDomainData(true).catch(() => {});
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
    company_id?: number | null,
    color?: string
  ) => {
    try {
      const res = await api.post<any>("/restaurant/categories", {
        name,
        icon: icon || "🍛",
        color: color || null,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category",
        sort_order: Number(sort_order) || 1,
        branch_id: branch_id ?? (selectedBranch?.id ? Number(selectedBranch.id) : 1),
        company_id: company_id ?? 1,
      });
      if (res && res.id) {
        setCategories(prev => [res, ...prev.filter(c => String(c.id) !== String(res.id))]);
        toast.success(`Category "${name}" saved to PostgreSQL Database!`);
      }
      fetchPOSDomainData(true).catch(() => {});
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
    company_id?: number | null,
    color?: string
  ) => {
    try {
      const res = await api.put<any>(`/restaurant/categories/${id}`, {
        name,
        icon: icon || "🍛",
        color: color || null,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category",
        sort_order: Number(sort_order) || 1,
        branch_id: branch_id ?? (selectedBranch?.id ? Number(selectedBranch.id) : 1),
        company_id: company_id ?? 1,
      });
      if (res && res.id) {
        setCategories(prev => prev.map(c => String(c.id) === String(id) ? { ...c, ...res } : c));
        toast.success(`Category "${name}" updated in PostgreSQL Database!`);
      }
      fetchPOSDomainData(true).catch(() => {});
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
      fetchPOSDomainData(true).catch(() => {});
    } catch (err: any) {
      toast.error("Failed to delete category");
      console.error("Failed to soft-deactivate category in PostgreSQL", err);
    }
  };


  const handleCreateOrder = async (newOrder: Partial<POSOrder>) => {
    try {
      const modeStr = (newOrder.order_mode || newOrder.order_type || "dine_in").toLowerCase();
      const isTakeaway = modeStr.includes("take") || modeStr.includes("pickup");
      const isDelivery = modeStr.includes("deliv");
      const typeStr = isTakeaway ? "TAKEAWAY" : (isDelivery ? "DELIVERY" : "DINE_IN");
      const isDineIn = typeStr === "DINE_IN";

      const payload = {
        order_number: newOrder.order_number || undefined,
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1,
        order_type: typeStr,
        order_mode: isTakeaway ? "takeaway" : (isDelivery ? "delivery" : "dine_in"),
        customer_id: newOrder.customer_id ? Number(newOrder.customer_id) : null,
        table_id: isDineIn && newOrder.table_id ? Number(newOrder.table_id) : null,
        table_name: isDineIn ? (newOrder.table_name || undefined) : undefined,
        waiter_id: isDineIn && newOrder.waiter_id ? Number(newOrder.waiter_id) : null,
        waiter_name: isDineIn ? (newOrder.waiter_name || undefined) : undefined,
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
      setOrders(prev => [res, ...prev.filter(o => String(o.id) !== String(res.id))]);
      return res;
    } catch (err: any) {
      console.error("Order creation error in PostgreSQL", err);
      throw err;
    }
  };

  const handleOptimisticOrderCreate = (
    optimisticOrder: POSOrder,
    tableUpdate?: { tableId: number | string; status: POSTable["status"] }
  ) => {
    setOrders((prev) => {
      const next = [
        optimisticOrder,
        ...prev.filter(
          (o) =>
            String(o.order_number) !== String(optimisticOrder.order_number) &&
            String(o.id) !== String(optimisticOrder.id)
        ),
      ];
      try {
        sessionStorage.setItem("pos_cache_orders", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (tableUpdate) {
      setTables((prev) =>
        prev.map((t) =>
          String(t.id) === String(tableUpdate.tableId) ||
          String(t.table_number).toLowerCase() === String(tableUpdate.tableId).toLowerCase()
            ? { ...t, status: tableUpdate.status }
            : t
        )
      );
    }
  };

  const handleOptimisticOrderSettle = (orderNumber: string, tableId?: number | string) => {
    const targetTableId = tableId !== undefined && tableId !== null ? String(tableId) : "";
    let updatedOrdersList: POSOrder[] = [];

    // Register active settlement lock for this order and table
    settledOrdersLockRef.current.set(String(orderNumber), {
      timestamp: Date.now(),
      tableId: tableId !== undefined && tableId !== null ? tableId : undefined,
    });

    setOrders((prev) => {
      updatedOrdersList = prev.map((o) =>
        String(o.order_number) === String(orderNumber)
          ? { ...o, status: "completed", payment_status: "paid" }
          : o
      );
      try {
        sessionStorage.setItem("pos_cache_orders", JSON.stringify(updatedOrdersList));
      } catch {}
      return updatedOrdersList;
    });

    if (tableId) {
      setTables((prev) => {
        // Check if another active order is still running on this table
        const hasOtherActiveOrder = updatedOrdersList.some(
          (o) =>
            String(o.order_number) !== String(orderNumber) &&
            !["completed", "paid", "cancelled"].includes((o.status || "").toLowerCase()) &&
            (String(o.table_id) === targetTableId ||
              (o.table_name && targetTableId && String(o.table_name).trim().toLowerCase() === targetTableId.toLowerCase()))
        );

        const updatedTables = prev.map((t) => {
          const isMatch =
            String(t.id) === targetTableId ||
            String(t.table_number).toLowerCase() === targetTableId.toLowerCase();
          if (!isMatch) return t;

          if (hasOtherActiveOrder) {
            return { ...t, status: "occupied" as const };
          }
          return { ...t, status: "free" as const, current_order_id: null };
        });

        try {
          sessionStorage.setItem("pos_cache_tables", JSON.stringify(updatedTables));
        } catch {}
        return updatedTables;
      });
    }
  };

  // Determine active view from URL path
  const isMasterView = currentPath.includes("/pos/master");
  const isTransactionView = currentPath.includes("/pos/transaction") || currentPath.includes("/pos/billing") || currentPath.includes("/pos/kds") || currentPath.includes("/pos/orders");
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
          onOptimisticOrderCreate={handleOptimisticOrderCreate}
          onOptimisticOrderSettle={handleOptimisticOrderSettle}
          onRefresh={(serverOrder) => {
            if (serverOrder && serverOrder.order_number) {
              setOrders((prev) => [
                serverOrder,
                ...prev.filter(
                  (o) =>
                    o.order_number !== serverOrder.order_number &&
                    String(o.id) !== String(serverOrder.id)
                ),
              ]);
            }
            fetchPOSDomainData(true);
          }}
          isLoading={isLoading}
        />
      ) : isReportsView ? (
        <POSReportsPage
          orders={orders}
          categories={filteredCategories}
          menuItems={filteredMenuItems}
          tables={filteredTables}
          waiters={filteredWaiters}
          selectedBranch={selectedBranch}
          onRefresh={fetchPOSDomainData}
          isLoading={isLoading}
        />
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
