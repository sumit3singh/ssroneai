import React, { useState, useEffect } from "react";
import { 
  Receipt, Search, Filter, Clock, ChefHat, CheckCircle2, 
  XCircle, Edit3, ArrowRight, RefreshCw, Plus, Printer, Trash2
} from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { POSOrder } from "../../types";
import { useNavigate } from "@tanstack/react-router";
import { POSPaymentSettlementModal } from "./pos-billing/POSPaymentSettlementModal";
import { ThermalReceiptModal } from "./pos-billing/ThermalReceiptModal";

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const POSOrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Settlement & Receipt Modal State
  const [selectedOrderForSettle, setSelectedOrderForSettle] = useState<POSOrder | null>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const activeBranchId = localStorage.getItem("active_branch_id");
      const param = activeBranchId ? `?branch_id=${activeBranchId}` : "";
      const res = await api.get<any>(`/orders${param}`);
      const list = Array.isArray(res) ? res : res?.items || [];
      setOrders(list);
    } catch (err) {
      console.error("Failed to fetch live orders", err);
      toast.error("Failed to load orders from server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const matchStatus = (ordStatus: string | undefined, filter: string) => {
    const st = (ordStatus || "").toLowerCase();
    if (filter === "ALL") return true;
    if (filter === "OPEN") return st === "open" || st === "kot_sent" || st === "pending" || st === "draft";
    if (filter === "KITCHEN") return st === "in_kitchen" || st === "preparing" || st === "kitchen";
    if (filter === "READY") return st === "ready" || st === "served" || st === "prepared";
    if (filter === "COMPLETED") return st === "completed" || st === "paid" || st === "settled";
    if (filter === "CANCELLED") return st === "cancelled" || st === "canceled";
    return true;
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      (ord.customer_name && ord.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (ord.table_name && ord.table_name.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    return matchStatus(ord.status, statusFilter);
  });

  const handleEditOrderInCart = (ord: POSOrder) => {
    try {
      localStorage.setItem("edit_pos_order", JSON.stringify(ord));
      toast.success(`Order #${ord.order_number} loaded into Billing Cart!`);
      navigate({ to: "/pos/transaction/billing" });
    } catch (err) {
      toast.error("Failed to load order into cart");
    }
  };

  const handleOpenSettleModal = (ord: POSOrder) => {
    setSelectedOrderForSettle(ord);
    setIsSettleModalOpen(true);
  };

  const handleConfirmSettle = async (method: string, tender: number, change: number) => {
    if (!selectedOrderForSettle) return;
    setIsSettling(true);
    try {
      await api.patch(`/orders/${selectedOrderForSettle.id}/status?status=completed`);
      toast.success(`Bill #${selectedOrderForSettle.order_number} settled via ${method}!`);
      
      setReceiptData({
        orderNumber: selectedOrderForSettle.order_number,
        orderType: selectedOrderForSettle.order_mode?.toUpperCase() || selectedOrderForSettle.order_type || "DINE_IN",
        tableName: selectedOrderForSettle.table_name,
        waiterName: selectedOrderForSettle.waiter_name,
        items: selectedOrderForSettle.items || [],
        subtotal: selectedOrderForSettle.subtotal || 0,
        packagingChargeTotal: selectedOrderForSettle.packaging_charge || 0,
        taxAmount: selectedOrderForSettle.tax_amount || 0,
        discountAmount: selectedOrderForSettle.discount_amount || 0,
        netAmount: selectedOrderForSettle.net_amount || selectedOrderForSettle.grand_total || 0,
        paymentMethod: method,
        timestamp: new Date().toLocaleString()
      });
      
      setIsSettleModalOpen(false);
      setIsReceiptModalOpen(true);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to complete order settlement");
    } finally {
      setIsSettling(false);
    }
  };

  const handleCancelOrder = async (id: number | string, num: string) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${num}?`)) return;
    try {
      await api.patch(`/orders/${id}/status?status=cancelled`);
      toast.success(`Order #${num} cancelled`);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to cancel order");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "KOT_SENT":
      case "PENDING":
      case "OPEN":
        return (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 uppercase">
            KOT Sent
          </span>
        );
      case "IN_KITCHEN":
      case "PREPARING":
        return (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 uppercase">
            In Kitchen
          </span>
        );
      case "READY":
      case "SERVED":
        return (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 uppercase">
            Ready / Served
          </span>
        );
      case "COMPLETED":
      case "PAID":
        return (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-muted text-muted-foreground border-border uppercase">
            Settled
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 uppercase">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-muted text-muted-foreground border-border uppercase">
            {status || "Active"}
          </span>
        );
    }
  };

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Live Orders & Bill Management"
        description="Real-time tracking of open dining orders, kitchen prep statuses, and bill settlements"
        icon={<Receipt size={18} />}
        badge={`${orders.length} Orders`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Refresh Order List"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
            <Button
              onClick={() => navigate({ to: "/pos/transaction/billing" })}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> New Counter Order
            </Button>
          </div>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-card border border-border rounded-md p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {[
            { id: "ALL", label: "All Orders", count: orders.length },
            { id: "OPEN", label: "Open / KOT Sent", count: orders.filter((o) => matchStatus(o.status, "OPEN")).length },
            { id: "KITCHEN", label: "In Kitchen", count: orders.filter((o) => matchStatus(o.status, "KITCHEN")).length },
            { id: "READY", label: "Ready / Served", count: orders.filter((o) => matchStatus(o.status, "READY")).length },
            { id: "COMPLETED", label: "Settled", count: orders.filter((o) => matchStatus(o.status, "COMPLETED")).length },
            { id: "CANCELLED", label: "Cancelled", count: orders.filter((o) => matchStatus(o.status, "CANCELLED")).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] ml-1 opacity-80">
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-56 shrink-0">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order #, Customer..."
            className="w-full pl-8 pr-2.5 py-1 text-xs font-medium bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Mode / Table</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Dishes & Menu Items</th>
                <th className="py-2.5 px-3">Waiter</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Net Amount</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground font-medium">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                      #{ord.order_number}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {ord.order_mode ? ord.order_mode.toUpperCase() : ord.order_type || "DINE_IN"} 
                      {ord.table_name && <span className="ml-1 text-muted-foreground font-mono">({ord.table_name})</span>}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">
                      {ord.customer_name || "Walk-in Guest"}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {ord.items && ord.items.length > 0 ? (
                          ord.items.map((item: any, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 bg-muted text-foreground px-1.5 py-0.2 rounded text-[11px] font-medium border border-border"
                            >
                              <span>{item.name || item.product_name || item.item_name || "Item"}</span>
                              {item.variant_name && (
                                <span className="text-[9px] font-mono text-muted-foreground">
                                  [{item.variant_name}]
                                </span>
                              )}
                              <span className="font-mono text-muted-foreground">
                                ×{item.quantity}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">No item details</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {ord.waiter_name || "-"}
                    </td>
                    <td className="py-2.5 px-3">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                      ₹{safeNum(ord.net_amount || ord.grand_total || ord.total_amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit Order (Only allowed for active/open orders) */}
                        {!["completed", "paid", "cancelled"].includes((ord.status || "").toLowerCase()) && (
                          <button
                            onClick={() => handleEditOrderInCart(ord)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                            title="Edit Order in Cart"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}

                        {/* Settle Payment (Disabled for already completed/paid/cancelled orders) */}
                        {!["completed", "paid", "cancelled"].includes((ord.status || "").toLowerCase()) && (ord.payment_status || "").toLowerCase() !== "paid" ? (
                          <button
                            onClick={() => handleOpenSettleModal(ord)}
                            className="px-2 py-0.5 bg-primary text-primary-foreground font-semibold rounded text-[11px] transition-colors cursor-pointer"
                          >
                            Settle Bill
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-muted text-muted-foreground border-border">
                            Settled
                          </span>
                        )}

                        {/* Thermal Receipt Print */}
                        <button
                          onClick={() => {
                            setReceiptData({
                              orderNumber: ord.order_number,
                              orderType: ord.order_mode?.toUpperCase() || ord.order_type || "DINE_IN",
                              tableName: ord.table_name,
                              waiterName: ord.waiter_name,
                              items: ord.items || [],
                              subtotal: ord.subtotal || 0,
                              packagingChargeTotal: ord.packaging_charge || 0,
                              taxAmount: ord.tax_amount || 0,
                              discountAmount: ord.discount_amount || 0,
                              netAmount: ord.net_amount || ord.grand_total || 0,
                              paymentMethod: ord.payment_method || "CASH",
                              timestamp: new Date().toLocaleString()
                            });
                            setIsReceiptModalOpen(true);
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                          title="Print Receipt"
                        >
                          <Printer size={13} />
                        </button>

                        {/* Cancel Order */}
                        {ord.status !== "CANCELLED" && ord.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleCancelOrder(ord.id, ord.order_number)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                            title="Cancel Order"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Settlement Modal */}
      {selectedOrderForSettle && (
        <POSPaymentSettlementModal
          isOpen={isSettleModalOpen}
          onClose={() => setIsSettleModalOpen(false)}
          orderNumber={selectedOrderForSettle.order_number}
          netAmount={safeNum(selectedOrderForSettle.net_amount || selectedOrderForSettle.grand_total || selectedOrderForSettle.total_amount)}
          customerName={selectedOrderForSettle.customer_name || "Walk-in Guest"}
          onConfirmSettlement={handleConfirmSettle}
          isSubmitting={isSettling}
        />
      )}

      {/* Thermal Receipt Modal */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptData={receiptData}
      />
    </PageContainer>
  );
};
