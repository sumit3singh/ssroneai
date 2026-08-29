import React, { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CategoryListPage } from "./categories/CategoryListPage";
import { CategoryFormDialog } from "./categories/CategoryFormDialog";
import { MenuItemMasterPage } from "./menu-items/MenuItemMasterPage";
import { MenuItemDialog } from "./menu-items/MenuItemDialog";
import { TableListPage } from "./tables/TableListPage";
import { TableFormDialog } from "./tables/TableFormDialog";
import { WaiterListPage } from "./waiters/WaiterListPage";
import { WaiterFormDialog } from "./waiters/WaiterFormDialog";
import { PaymentModeListPage } from "./payment-modes/PaymentModeListPage";
import { KitchenStationListPage } from "./kitchen-stations/KitchenStationListPage";
import { POSCategory, POSMenuItem, POSTable, POSWaiter } from "../../types";

interface POSMasterSectionProps {
  categories: POSCategory[];
  menuItems: POSMenuItem[];
  tables: POSTable[];
  waiters: POSWaiter[];
  onRefresh: () => void;
  onSaveMenuItem: (itemData: Partial<POSMenuItem>) => Promise<void>;
  onDeleteMenuItem: (id: number) => Promise<void>;
  onToggleAvailability: (item: POSMenuItem) => Promise<void>;
  onUpdateTableStatus: (tableId: string | number, status: POSTable["status"], guests: number, waiter: string) => Promise<void>;
  onCreateTable: (tableNumber: string, capacity: number, section: string) => Promise<void>;
  onUpdateTable?: (id: number | string, tableNumber: string, capacity: number, section: string) => Promise<void>;
  onDeleteTable?: (id: number | string) => Promise<void>;
  onCreateCategory: (name: string, icon: string, slug?: string, sort_order?: number, branch_id?: number | null, company_id?: number | null) => Promise<void>;
  onUpdateCategory: (id: number, name: string, icon: string, slug?: string, sort_order?: number, branch_id?: number | null, company_id?: number | null) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const POSMasterSection: React.FC<POSMasterSectionProps> = ({
  categories = [],
  menuItems = [],
  tables = [],
  waiters = [],
  onRefresh,
  onSaveMenuItem,
  onDeleteMenuItem,
  onToggleAvailability,
  onUpdateTableStatus,
  onCreateTable,
  onUpdateTable,
  onDeleteTable,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading = false
}) => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/pos/master/categories";

  // Determine active view strictly from sidebar URL path - Categories is #1 Architectural Master
  const isMenuItems = currentPath.includes("/menu-items");
  const isTables = currentPath.includes("/tables");
  const isWaiters = currentPath.includes("/waiters");
  const isPayments = currentPath.includes("/payment-modes");
  const isStations = currentPath.includes("/kitchen-stations");
  const isCategories = currentPath.includes("/categories") || (!isMenuItems && !isTables && !isWaiters && !isPayments && !isStations);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<POSMenuItem | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<POSCategory | null>(null);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<POSTable | null>(null);

  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Dynamic Master View Rendered Strictly via Sidebar Route (Golden Rule #4 Compliance) */}
      {isCategories ? (
        <CategoryListPage
          categories={categories}
          onOpenCreate={() => {
            setEditingCategory(null);
            setIsCatModalOpen(true);
          }}
          onOpenEdit={(cat: POSCategory) => {
            setEditingCategory(cat);
            setIsCatModalOpen(true);
          }}
          onDelete={onDeleteCategory}
          onCreateCategory={onCreateCategory}
          isLoading={isLoading}
        />
      ) : isTables ? (
        <TableListPage
          tables={tables}
          onOpenCreate={() => {
            setEditingTable(null);
            setIsTableModalOpen(true);
          }}
          onOpenEdit={(tbl: POSTable) => {
            setEditingTable(tbl);
            setIsTableModalOpen(true);
          }}
          onDeleteTable={onDeleteTable}
          isLoading={isLoading}
        />
      ) : isWaiters ? (
        <WaiterListPage
          waiters={waiters}
          onOpenCreate={() => setIsWaiterModalOpen(true)}
        />
      ) : isPayments ? (
        <PaymentModeListPage />
      ) : isStations ? (
        <KitchenStationListPage />
      ) : (
        /* Default Menu Items Master Page */
        <MenuItemMasterPage
          menuItems={menuItems}
          categories={categories}
          onOpenCreate={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
          onOpenEdit={(item: POSMenuItem) => {
            setEditingItem(item);
            setIsItemModalOpen(true);
          }}
          onDelete={(id: number) => onDeleteMenuItem(id)}
          onToggleAvailability={(item: POSMenuItem) => onToggleAvailability(item)}
        />
      )}

      {/* Item Modal */}
      <MenuItemDialog
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={async (itemData: any) => {
          await onSaveMenuItem(itemData);
          setIsItemModalOpen(false);
        }}
        editingItem={editingItem as any}
        categories={categories as any}
        selectedCategoryId={null}
      />

      {/* Category Modal */}
      <CategoryFormDialog
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSave={async (name: string, icon: string, formData?: { slug?: string; sort_order?: number; branch_id?: number | null; company_id?: number | null }) => {
          if (editingCategory) {
            await onUpdateCategory(editingCategory.id, name, icon, formData?.slug, formData?.sort_order, formData?.branch_id, formData?.company_id);
          } else {
            await onCreateCategory(name, icon, formData?.slug, formData?.sort_order, formData?.branch_id, formData?.company_id);
          }
          setIsCatModalOpen(false);
        }}
        editingCategory={editingCategory}
      />

      {/* Table Modal */}
      <TableFormDialog
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onSave={async (tableNumber: string, capacity: number, section: string) => {
          if (editingTable && onUpdateTable) {
            await onUpdateTable(editingTable.id, tableNumber, capacity, section);
          } else {
            await onCreateTable(tableNumber, capacity, section);
          }
          setIsTableModalOpen(false);
        }}
        editingTable={editingTable}
      />

      {/* Waiter Modal */}
      <WaiterFormDialog
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        onSave={async () => {
          onRefresh();
          setIsWaiterModalOpen(false);
        }}
      />
    </div>
  );
};
