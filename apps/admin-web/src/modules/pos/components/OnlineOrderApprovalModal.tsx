import React, { useState } from "react";
import {
  Bell,
  X,
  CheckCircle,
  XCircle,
  Edit3,
  Phone,
  MapPin,
  Clock,
  Printer,
  ShoppingBag,
  Truck,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";
import {
  acceptOnlineOrder,
  rejectOnlineOrder,
  modifyAndAcceptOnlineOrder,
} from "@ssrone/api-client";
import { printKOTSlipsDirectly, StationKOTSlip } from "./ThermalKOTPrintableArea";
import { printCustomerReceiptDirectly } from "../utils/printUtils";

interface OnlineOrderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrders: any[];
  onRefresh: () => void;
  onModifyOrder?: (order: any) => void;
  onPrintReceipt?: (order: any) => void;
}

export const OnlineOrderApprovalModal: React.FC<OnlineOrderApprovalModalProps> = ({
  isOpen,
  onClose,
  pendingOrders,
  onRefresh,
  onModifyOrder,
  onPrintReceipt,
}) => {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("Kitchen is currently at maximum capacity");
  const [modifyingOrder, setModifyingOrder] = useState<any | null>(null);
  const [modifiedItems, setModifiedItems] = useState<any[]>([]);
  const [modificationNotes, setModificationNotes] = useState<string>("");

  React.useEffect(() => {
    if (!isOpen) return;
    onRefresh();
    const interval = setInterval(onRefresh, 3000);
    return () => clearInterval(interval);
  }, [isOpen, onRefresh]);

  if (!isOpen) return null;

  const handleAccept = async (order: any) => {
    setProcessingId(order.id);
    try {
      const res = await acceptOnlineOrder(order.id);
      if (res?.success) {
        toast.success(`Order #${order.order_number} Accepted! 🎉`, {
          description: "Sent to kitchen and moved to active orders.",
        });

        // 1. Automatically trigger thermal KOT printing for kitchen stations
        let slipsToPrint: StationKOTSlip[] = [];
        if (res?.generated_slips && Array.isArray(res.generated_slips) && res.generated_slips.length > 0) {
          slipsToPrint = res.generated_slips.map((s: any) => ({
            stationName: s.stationName || "Kitchen",
            stationCode: s.stationCode,
            printerName: s.printerName,
            orderNumber: String(s.orderNumber || order.order_number),
            orderType: String(s.orderType || order.order_type || "TAKEAWAY").toUpperCase(),
            tableName: s.tableName || order.table_name || "Table",
            waiterName: s.waiterName || order.waiter_name || "Food App Order",
            kotType: (s.kotType as any) || "NEW",
            timestamp: s.timestamp || new Date().toLocaleString(),
            items: (s.items || []).map((it: any) => ({
              name: it.name || it.item_name || "Dish Item",
              quantity: Number(it.quantity || 1),
              variant_name: it.variant_name,
              addons: it.addons,
              notes: it.notes,
              is_veg: it.is_veg,
            })),
          }));
        }

        // Fail-safe client fallback if backend slips were empty:
        if (slipsToPrint.length === 0 && order.items && order.items.length > 0) {
          const activeItems = (order.items || []).filter((it: any) => !it.is_voided);
          if (activeItems.length > 0) {
            const ordType = String(order.order_type || order.order_mode || "TAKEAWAY").toUpperCase();
            let tblName = order.table_name || order.table_number;
            if (!tblName || String(tblName).toLowerCase().includes("food")) {
              tblName = ordType.includes("DELIV") ? "Delivery ★" : ordType.includes("TAKE") ? "Takeaway ★" : "Table";
            }
            slipsToPrint = [{
              stationName: "Kitchen",
              orderNumber: String(order.order_number),
              orderType: ordType,
              tableName: String(tblName),
              waiterName: order.waiter_name || "Food App Order",
              kotType: "NEW",
              timestamp: new Date().toLocaleString(),
              items: activeItems.map((it: any) => ({
                name: it.product_name || it.item_name || it.name || "Dish Item",
                quantity: Number(it.quantity || 1),
                variant_name: it.variant_name,
                addons: it.addons || it.selected_addons || [],
                notes: it.notes || it.preparation_notes,
                is_veg: it.is_veg,
              })),
            }];
          }
        }

        if (slipsToPrint.length > 0) {
          try {
            await printKOTSlipsDirectly(slipsToPrint);
            toast.info("Kitchen KOT slip sent to printer 🖨️");
          } catch (printErr) {
            console.warn("KOT print trigger error:", printErr);
          }
        }

        onRefresh();
        if (pendingOrders.length <= 1) {
          onClose();
        }
      } else {
        toast.error("Could not accept order", {
          description: res?.message || "Please try again",
        });
      }
    } catch (err: any) {
      toast.error("Failed to accept order", {
        description: err?.response?.data?.detail || err?.message || "Please try again",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async (orderId: number) => {
    setProcessingId(orderId);
    try {
      await rejectOnlineOrder(orderId, rejectReason);
      toast.info("Order declined", {
        description: "Customer has been notified that the order cannot be fulfilled.",
      });
      setRejectingId(null);
      onRefresh();
      if (pendingOrders.length <= 1) {
        onClose();
      }
    } catch (err: any) {
      toast.error("Failed to reject order", {
        description: err?.response?.data?.detail || err?.message || "Please try again",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const startModify = (order: any) => {
    setModifyingOrder(order);
    setModifiedItems(
      (order.items || []).filter((it: any) => !it.is_voided).map((it: any) => ({
        id: it.id,
        item_id: it.product_id || it.id,
        name: it.product_name || it.name || "Item",
        quantity: Number(it.quantity || 1),
        unit_price: Number(it.unit_price || 0),
        variant_name: it.variant_name,
      }))
    );
    setModificationNotes(order.notes || "Item modified after customer confirmation");
  };

  const handleSaveModification = async () => {
    if (!modifyingOrder) return;
    setProcessingId(modifyingOrder.id);
    try {
      const activeItems = modifiedItems.filter((it) => it.quantity > 0);
      if (activeItems.length === 0) {
        toast.error("Order must contain at least 1 item. Decline the order instead if cancelled.");
        setProcessingId(null);
        return;
      }

      const res = await modifyAndAcceptOnlineOrder(modifyingOrder.id, {
        items: activeItems,
        notes: modificationNotes,
      });

      toast.success(`Order #${modifyingOrder.order_number} Modified & Accepted! ✏️`, {
        description: "Updated totals saved and sent to kitchen printer.",
      });

      let slipsToPrint: StationKOTSlip[] = [];
      if (res?.generated_slips && Array.isArray(res.generated_slips) && res.generated_slips.length > 0) {
        slipsToPrint = res.generated_slips.map((s: any) => ({
          stationName: s.stationName || "Kitchen",
          stationCode: s.stationCode,
          printerName: s.printerName,
          orderNumber: String(s.orderNumber || modifyingOrder.order_number),
          orderType: String(s.orderType || modifyingOrder.order_type || "TAKEAWAY").toUpperCase(),
          tableName: s.tableName || modifyingOrder.table_name || "Table",
          waiterName: s.waiterName || modifyingOrder.waiter_name || "Food App Order",
          kotType: "UPDATE" as const,
          timestamp: s.timestamp || new Date().toLocaleString(),
          items: (s.items || []).map((it: any) => ({
            name: it.name || it.item_name || "Dish Item",
            quantity: Number(it.quantity || 1),
            variant_name: it.variant_name,
            addons: it.addons,
            notes: it.notes,
            is_veg: it.is_veg,
          })),
        }));
      }

      if (slipsToPrint.length === 0 && activeItems.length > 0) {
        const ordType = String(modifyingOrder.order_type || modifyingOrder.order_mode || "TAKEAWAY").toUpperCase();
        let tblName = modifyingOrder.table_name || modifyingOrder.table_number;
        if (!tblName || String(tblName).toLowerCase().includes("food")) {
          tblName = ordType.includes("DELIV") ? "Delivery ★" : ordType.includes("TAKE") ? "Takeaway ★" : "Table";
        }
        slipsToPrint = [{
          stationName: "Kitchen",
          orderNumber: String(modifyingOrder.order_number),
          orderType: ordType,
          tableName: String(tblName),
          waiterName: modifyingOrder.waiter_name || "Food App Order",
          kotType: "UPDATE",
          timestamp: new Date().toLocaleString(),
          items: activeItems.map((it: any) => ({
            name: it.name || "Dish Item",
            quantity: Number(it.quantity || 1),
            variant_name: it.variant_name,
            addons: [],
            notes: "Modified by Staff",
          })),
        }];
      }

      if (slipsToPrint.length > 0) {
        try {
          await printKOTSlipsDirectly(slipsToPrint);
          toast.info("Kitchen KOT slip sent to printer 🖨️");
        } catch (printErr) {
          console.warn("KOT print trigger error:", printErr);
        }
      }

      setModifyingOrder(null);
      onRefresh();
      if (pendingOrders.length <= 1) {
        onClose();
      }
    } catch (err: any) {
      toast.error("Failed to modify order", {
        description: err?.response?.data?.detail || err?.message || "Please retry",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-foreground tracking-tight">
                  Online Food App Orders
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white animate-pulse">
                  {pendingOrders.length} Pending
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review incoming takeaway and home delivery orders awaiting cafe confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 gap-1 text-xs cursor-pointer"
              title="Refresh Pending Orders"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500/70" />
              <p className="font-bold text-foreground text-sm">All Caught Up!</p>
              <p className="text-xs">No pending online food app orders waiting for approval.</p>
            </div>
          ) : (
            pendingOrders.map((order) => {
              const isTakeaway = (order.order_type || order.order_mode || "").toLowerCase().includes("take");
              const isDelivery = (order.order_type || order.order_mode || "").toLowerCase().includes("deliv");
              const isBusy = processingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-background border border-amber-500/40 rounded-xl p-4 shadow-sm space-y-3 transition hover:border-amber-500/60"
                >
                  {/* Top Bar: Order Number, Channel Badge, Type & Time */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                        #{order.order_number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isDelivery
                            ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {isDelivery ? <Truck size={12} /> : <ShoppingBag size={12} />}
                        <span>{isDelivery ? "Home Delivery" : "Takeaway"}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Customer App
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <Clock size={12} />
                      <span>{order.created_at ? new Date(order.created_at).toLocaleTimeString() : "Just now"}</span>
                    </div>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-muted/20 p-2.5 rounded-lg border border-border/50">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground font-bold block">Customer</span>
                      <p className="font-bold text-foreground">{order.customer_name || "Guest Customer"}</p>
                      {order.customer_phone && (
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="font-mono text-primary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={11} /> {order.customer_phone}
                        </a>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground font-bold block">
                        {isDelivery ? "Delivery Address" : "Pickup Note"}
                      </span>
                      <p className="text-muted-foreground line-clamp-2">
                        {order.delivery_address || (isDelivery ? "Address not specified" : "Counter pickup")}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Ordered Dishes ({(order.items || []).filter((it: any) => !it.is_voided).length} items)
                    </span>
                    <div className="divide-y divide-border/40 border border-border/60 rounded-lg overflow-hidden text-xs">
                      {(order.items || []).filter((it: any) => !it.is_voided).map((it: any, idx: number) => (
                        <div key={idx} className="p-2 flex items-center justify-between bg-card">
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-bold text-foreground">
                              {it.product_name || it.name || "Dish"}
                            </span>
                            {it.variant_name && (
                              <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
                                {it.variant_name}
                              </span>
                            )}
                            {it.notes && (
                              <p className="text-[10px] text-muted-foreground italic mt-0.5">Note: {it.notes}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <span className="font-bold text-foreground mr-3">Qty: {it.quantity}</span>
                            <span className="font-semibold text-muted-foreground">₹{it.line_total || it.unit_price * it.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Payment Method */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">
                      Payment Mode: <strong className="text-foreground uppercase">{order.payment_method || "Cash / COD"}</strong>
                    </span>
                    <div className="text-right">
                      <span className="text-muted-foreground mr-2">Grand Total:</span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                        ₹{Number(order.grand_total || order.subtotal || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Reject Prompt (if currently rejecting this order) */}
                  {rejectingId === order.id && (
                    <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-300 dark:bg-rose-950/20 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold">
                        <AlertTriangle size={14} />
                        <span>Specify reason for declining order:</span>
                      </div>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Out of delivery area / Dish ingredients not available"
                        className="w-full h-8 px-2.5 rounded border border-rose-300 bg-background text-xs"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setRejectingId(null);
                          }}
                          className="h-7 text-xs cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRejectConfirm(order.id);
                          }}
                          disabled={isBusy}
                          className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                        >
                          Confirm Decline
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  {rejectingId !== order.id && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRejectingId(order.id);
                        }}
                        disabled={isBusy}
                        className="h-8 text-xs font-bold text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                      >
                        <XCircle size={14} className="mr-1" />
                        <span>Decline Order</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onModifyOrder) {
                            onModifyOrder(order);
                          } else {
                            startModify(order);
                          }
                        }}
                        disabled={isBusy}
                        className="h-8 text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50 cursor-pointer"
                        title="Open this order in POS Cart to modify items, add discounts, or adjust quantities"
                      >
                        <Edit3 size={14} className="mr-1" />
                        <span>Modify in Cart</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAccept(order);
                        }}
                        disabled={isBusy}
                        className="h-8 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-4 shadow-sm"
                      >
                        {isBusy ? (
                          <RefreshCw size={14} className="animate-spin mr-1" />
                        ) : (
                          <CheckCircle size={14} className="mr-1" />
                        )}
                        <span>Accept & Print (Receipt + KOT) 🖨️</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal: Modify Order Dialog */}
        {modifyingOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-card text-card-foreground border border-border rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-sm text-foreground">
                    Modify Items for Order #{modifyingOrder.order_number}
                  </h4>
                </div>
                <button onClick={() => setModifyingOrder(null)} className="p-1 text-muted-foreground hover:bg-muted rounded">
                  <X size={16} />
                </button>
              </div>

              <div className="text-xs text-muted-foreground">
                Coordinate with customer (<strong className="text-foreground">{modifyingOrder.customer_name}</strong> - {modifyingOrder.customer_phone}) to finalize the changes:
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-lg p-2 text-xs">
                {modifiedItems.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-bold text-foreground">{it.name}</span>
                      {it.variant_name && <span className="ml-1 text-[10px] text-amber-700 font-bold">({it.variant_name})</span>}
                      <span className="block text-[11px] text-muted-foreground">₹{it.unit_price} each</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...modifiedItems];
                          updated[idx].quantity = Math.max(0, updated[idx].quantity - 1);
                          setModifiedItems(updated);
                        }}
                        className="w-6 h-6 rounded bg-muted hover:bg-muted/80 flex items-center justify-center cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono font-bold w-4 text-center">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...modifiedItems];
                          updated[idx].quantity = updated[idx].quantity + 1;
                          setModifiedItems(updated);
                        }}
                        className="w-6 h-6 rounded bg-muted hover:bg-muted/80 flex items-center justify-center cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Modification Note / Customer Agreement:
                </label>
                <input
                  type="text"
                  value={modificationNotes}
                  onChange={(e) => setModificationNotes(e.target.value)}
                  placeholder="e.g. Substituted momos portion as agreed over phone"
                  className="w-full h-8 px-2.5 rounded border border-border bg-background text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setModifyingOrder(null)} className="h-8 text-xs cursor-pointer">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveModification}
                  disabled={processingId !== null}
                  className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                >
                  Save & Accept Modified Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineOrderApprovalModal;
