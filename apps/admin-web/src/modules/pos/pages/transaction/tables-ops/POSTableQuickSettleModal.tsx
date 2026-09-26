import React, { useState } from "react";
import {
  Receipt, X, Check, DollarSign, QrCode, CreditCard, User, UserPlus,
  AlertCircle, Sparkles, Percent, Tag, ArrowRight, Wallet,
  MessageSquare, Printer, CheckCircle2
} from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { useAuthStore } from "@ssrone/auth";
import { POSOrder, PaymentMethod } from "../../../types";
import { renderSafeString } from "../../../utils/renderSafeString";
import { DynamicUpiQrCode } from "../../../components/DynamicUpiQrCode";
import { playPaymentSuccessSound } from "@ssrone/utils";
import { printCustomerReceiptDirectly } from "../../../utils/printUtils";
import { cleanTableName, formatBranchAddress, formatItemWithVariantAndAddons } from "../../../utils/posPrintFormatters";

interface POSTableQuickSettleModalProps {
  order: POSOrder;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (settledOrder?: POSOrder) => void;
  onOptimisticOrderSettle?: (orderNumber: string, tableId?: number | string) => void;
  onPrintReceipt?: (receiptData: any) => void;
  customers?: any[];
  onRefreshCustomers?: () => Promise<void>;
}

export const POSTableQuickSettleModal: React.FC<POSTableQuickSettleModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
  onOptimisticOrderSettle,
  onPrintReceipt,
  customers = [],
  onRefreshCustomers,
}) => {
  const { selected_branch, selected_company } = useAuthStore();
  const originalNet = Number(order?.net_amount || order?.grand_total || order?.subtotal || 0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "CREDIT_ACCOUNT">("CASH");
  const [immediatePaymentMethod, setImmediatePaymentMethod] = useState<"CASH" | "UPI">("CASH");
  const [tenderedAmount, setTenderedAmount] = useState<number>(() => originalNet);
  const [underpaymentResolution, setUnderpaymentResolution] = useState<"DISCOUNT" | "DEBT">("DEBT");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>(() => order?.customer_id || "");
  const [whatsappPhoneInput, setWhatsappPhoneInput] = useState<string>(() => order?.customer_phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever order or open status changes
  React.useEffect(() => {
    if (order && isOpen) {
      const net = Number(order.net_amount || order.grand_total || order.subtotal || 0);
      setTenderedAmount(net);
      setSelectedCustomerId(order.customer_id || "");
      const selCust = customers.find((c) => String(c.id) === String(order.customer_id));
      setWhatsappPhoneInput(selCust?.phone || order.customer_phone || "");
      setPaymentMethod("CASH");
      setImmediatePaymentMethod("CASH");
      setUnderpaymentResolution("DEBT");
    }
  }, [order?.order_number, order?.net_amount, isOpen]);

  // New Customer Modal inside Settlement
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [isCreatingCust, setIsCreatingCust] = useState(false);

  // Robust Mathematical Resolution for all settlement scenarios
  const isCreditAccountMode = paymentMethod === "CREDIT_ACCOUNT";
  const validTendered = Math.max(0, Number(tenderedAmount || 0));
  const unpaidDifference = Math.max(0, originalNet - validTendered);

  const isDiscount = !isCreditAccountMode && unpaidDifference > 0 && underpaymentResolution === "DISCOUNT";
  const isDebt = isCreditAccountMode || (unpaidDifference > 0 && underpaymentResolution === "DEBT");

  const finalDiscount = isDiscount ? unpaidDifference : Number(order.discount_amount || 0);
  const finalNetAmount = isDiscount ? Math.max(0, originalNet - unpaidDifference) : originalNet;

  const amountPaid = isCreditAccountMode ? Math.min(originalNet, validTendered) : (isDiscount ? validTendered : Math.min(originalNet, validTendered));
  const balanceDue = isDebt ? Math.max(0, originalNet - amountPaid) : 0;
  const targetPaymentStatus = balanceDue === 0 ? "paid" : (amountPaid > 0 ? "partial" : "unpaid");
  const targetPaymentMethod = isCreditAccountMode ? (amountPaid > 0 ? immediatePaymentMethod : "CREDIT_ACCOUNT") : paymentMethod;

  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      toast.error("Customer name and phone number are required!");
      return;
    }
    setIsCreatingCust(true);
    try {
      const activeCompanyId = localStorage.getItem("active_company_id");
      const activeBranchId = localStorage.getItem("active_branch_id");
      const res = await api.post<any>("/customers", {
        name: custName.trim(),
        phone: custPhone.trim(),
        email: custEmail.trim() || undefined,
        company_id: activeCompanyId ? Number(activeCompanyId) : undefined,
        branch_id: activeBranchId ? Number(activeBranchId) : undefined,
      });
      toast.success(`Customer "${custName}" registered successfully!`);
      if (onRefreshCustomers) await onRefreshCustomers();
      if (res && res.id) {
        setSelectedCustomerId(res.id);
      }
      setCustName("");
      setCustPhone("");
      setCustEmail("");
      setIsNewCustModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create customer", err);
      toast.error(err?.response?.data?.detail || "Failed to create customer record");
    } finally {
      setIsCreatingCust(false);
    }
  };

  const handleCompleteSettlement = async (action: "whatsapp" | "print" | "close") => {
    if (isDebt && balanceDue > 0 && !selectedCustomerId) {
      toast.error("Customer selection is strictly required for Udhar / Debt settlement! Please select or register a customer.");
      return;
    }

    setIsSubmitting(true);

    // 1. Zero-Wait Optimistic UI Mutation (< 0.1ms): Free table & complete order immediately
    onOptimisticOrderSettle?.(order.order_number, order.table_id);

    // 2. Format Receipt & Venue Payload
    const selCust = customers.find((c) => String(c.id) === String(selectedCustomerId));
    const rawCustName = renderSafeString(selCust ? selCust.name : order.customer_name);
    const rawCustPhone = renderSafeString(whatsappPhoneInput || (selCust ? selCust.phone : order.customer_phone));
    const rawCustAddr = renderSafeString(selCust ? selCust.address : order.customer_address);

    const venueName = renderSafeString(selected_branch?.name || selected_company?.name || "BAITHAK CAFE CUH");
    const venueAddress = formatBranchAddress((selected_branch as any)?.address || (selected_company as any)?.address);
    const venueGstin = renderSafeString((selected_branch as any)?.gstin || (selected_company as any)?.gstin);
    const venuePhone = renderSafeString((selected_branch as any)?.phone || (selected_company as any)?.phone);
    const venueFssai = renderSafeString((selected_branch as any)?.fssai_number || (selected_company as any)?.fssai_number);

    const orderNumber = renderSafeString(order.order_number);
    const orderType = renderSafeString(order.order_mode || order.order_type || "DINE_IN").toUpperCase();
    const cleanTable = order.table_name ? cleanTableName(order.table_name) : "";
    const waiterName = renderSafeString(order.waiter_name);
    const effectivePaymentMethod = balanceDue > 0 && amountPaid > 0
      ? `${targetPaymentMethod} (₹${amountPaid}) + UDHAR (₹${balanceDue})`
      : balanceDue > 0
      ? "CREDIT / DEBT ACCOUNT"
      : targetPaymentMethod;
    const currentTimestamp = new Date().toLocaleString();

    const receiptPayload = {
      orderNumber,
      orderType,
      tableName: cleanTable,
      waiterName,
      customerName: rawCustName || "Walk-in Guest",
      customerPhone: rawCustPhone,
      customerAddress: rawCustAddr,
      items: order.items || [],
      subtotal: Number(order.subtotal || 0),
      packagingChargeTotal: Number(order.packaging_charge || 0),
      taxAmount: Number(order.tax_amount || 0),
      discountAmount: finalDiscount,
      netAmount: finalNetAmount,
      paymentMethod: effectivePaymentMethod,
      timestamp: currentTimestamp,
      venueName,
      venueAddress,
      venueGstin,
      venuePhone,
      venueFssai,
    };

    // 3. Dispatch Selected Action directly (No secondary preview screen)
    if (action === "print") {
      printCustomerReceiptDirectly(receiptPayload);
      toast.success(`⚡ Bill #${order.order_number} settled & printed directly!`);
    } else if (action === "whatsapp") {
      let phoneToSend = rawCustPhone.replace(/\D/g, "");
      if (!phoneToSend || phoneToSend.length < 10) {
        const promptPhone = window.prompt("Enter customer 10-digit WhatsApp number:", "");
        if (promptPhone) {
          phoneToSend = promptPhone.replace(/\D/g, "");
        }
      }
      const cleanPhone = phoneToSend && phoneToSend.length === 10 ? `91${phoneToSend}` : phoneToSend;

      const lines: string[] = [];
      lines.push("╔═══════════════════════════════════╗");
      lines.push(`   🍽️ *${venueName.toUpperCase()}*`);
      lines.push("╚═══════════════════════════════════╝");
      if (venueAddress) lines.push(`📍 *Address:* ${venueAddress}`);
      if (venueGstin) lines.push(`🧾 *Gst:* ${venueGstin}`);
      if (venuePhone) lines.push(`📞 *Mobile no.* ${venuePhone}`);
      lines.push("------------------------------------");
      lines.push(`*Order No:* ${orderNumber} ,*Mode:* ${orderType}`);
      lines.push(`*Date/Time:* ${currentTimestamp}`);
      if (cleanTable) lines.push(`*Dining Table:* ${cleanTable}`);
      lines.push("------------------------------------");
      lines.push(`👤 *Customer Name:* ${rawCustName || "Walk-in Guest"}`);
      lines.push("------------------------------------");
      lines.push("*ITEM & SIZE*        *QTY X PRICE*   *AMT*");
      lines.push("------------------------------------");

      (order.items || []).forEach((it: any) => {
        const rawName = renderSafeString(it.name || it.product_name || it.item_name || "Item");
        const variantName = renderSafeString(it.variant_name);
        const addonsList = it.addons || it.selected_addons || it.addon_options || [];
        const itemTitle = formatItemWithVariantAndAddons(rawName, variantName, addonsList, "compact");
        const qtyPriceStr = `${it.quantity} x ₹${Number(it.unit_price).toFixed(2)}`;
        const amtStr = `₹${(it.quantity * it.unit_price).toFixed(0)}`;

        lines.push(`• *${itemTitle}*`);
        lines.push(`   ${qtyPriceStr} = ${amtStr}`);
      });

      lines.push("------------------------------------");
      lines.push(`Subtotal: ₹${order.subtotal || 0}`);
      if (Number(order.packaging_charge || 0) > 0) {
        lines.push(`Packaging Fee: +₹${order.packaging_charge}`);
      }
      if (finalDiscount > 0) {
        lines.push(`Discount: -₹${finalDiscount}`);
      }
      lines.push(`GST: ₹${order.tax_amount || 0}`);
      lines.push(`*Grand Total: ₹${finalNetAmount}*`);
      if (effectivePaymentMethod) {
        lines.push(`Paid Via: ${effectivePaymentMethod}`);
      }
      lines.push("------------------------------------");
      lines.push("✨ *Thank You For Dining With Us! Visit Again* ✨");

      const message = lines.join("\n");
      const encoded = encodeURIComponent(message);
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;
      window.open(waUrl, "_blank");
      toast.success(`⚡ Bill #${order.order_number} settled & WhatsApp opened${cleanPhone ? ` for +${cleanPhone}` : ""}!`);
    } else {
      // action === "close"
      if (balanceDue > 0 && amountPaid > 0) {
        toast.success(`⚡ Bill #${order.order_number} settled: ₹${amountPaid} paid via ${targetPaymentMethod}, ₹${balanceDue} saved to Udhar Khata (${rawCustName || "Customer"})!`);
      } else if (balanceDue > 0) {
        toast.success(`⚡ Bill #${order.order_number} transferred to Customer Debt Account (${rawCustName || "Customer"})!`);
      } else if (isDiscount) {
        toast.success(`⚡ Bill #${order.order_number} settled with ₹${finalDiscount} discount concession!`);
      } else {
        toast.success(`⚡ Bill #${order.order_number} settled successfully via ${targetPaymentMethod}!`);
      }
    }

    playPaymentSuccessSound();

    const completedOrder: POSOrder = {
      ...order,
      status: "completed",
      payment_status: "paid",
      net_amount: finalNetAmount,
      payment_method: targetPaymentMethod,
    };

    // Close modal instantly for 0ms cashier interaction
    setIsSubmitting(false);
    onClose();
    onSuccess(completedOrder);

    // 3. Fire-and-forget background synchronization to PostgreSQL
    try {
      const targetIdentifier = order.id && !String(order.id).startsWith("local-")
        ? order.id
        : order.order_number;

      let synced = false;
      try {
        await api.patch(`/orders/${targetIdentifier}/status`, null, {
          params: {
            status: "completed",
            payment_status: targetPaymentStatus,
            amount_paid: amountPaid,
            discount_amount: isDiscount ? finalDiscount : undefined,
            balance_due: balanceDue > 0 ? balanceDue : undefined,
            customer_id: selectedCustomerId ? Number(selectedCustomerId) : undefined,
            payment_method: targetPaymentMethod,
          }
        });
        synced = true;
      } catch (patchErr: any) {
        // If order does not exist on backend yet (404), create and settle directly via POST /orders
        if (patchErr?.response?.status === 404 || String(order.id).startsWith("local-")) {
          const activeBranchId = localStorage.getItem("active_branch_id") || 1;
          const createPayload = {
            order_number: order.order_number,
            branch_id: Number(activeBranchId),
            order_type: (order.order_mode || order.order_type || "DINE_IN").toUpperCase(),
            order_mode: (order.order_mode || order.order_type || "dine_in").toLowerCase(),
            customer_id: selectedCustomerId ? Number(selectedCustomerId) : null,
            table_id: order.table_id || null,
            table_name: order.table_name || undefined,
            waiter_id: order.waiter_id || null,
            waiter_name: order.waiter_name || undefined,
            items: order.items || [],
            subtotal: Number(order.subtotal || 0),
            packaging_charge: Number(order.packaging_charge || 0),
            tax_amount: Number(order.tax_amount || 0),
            discount_amount: isDiscount ? finalDiscount : Number(order.discount_amount || 0),
            net_amount: finalNetAmount,
            payment_method: targetPaymentMethod,
            payment_status: targetPaymentStatus,
            amount_paid: amountPaid,
            balance_due: balanceDue,
            status: "COMPLETED",
          };
          await api.post("/orders", createPayload);
          synced = true;
        } else {
          throw patchErr;
        }
      }

      if (order.table_id) {
        await api.patch(`/restaurant/tables/${order.table_id}/status`, {
          status: "free",
          current_order_id: null
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error("Failed to sync bill settlement to database", err);
      toast.error(err?.response?.data?.detail || err?.message || "Failed to synchronize bill settlement");
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-4 sm:p-5 space-y-3.5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Receipt size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground leading-none">
                  Settle Bill {order.order_number}
                </h3>
                {order.table_name && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Table {order.table_name}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Quick table settlement, auto-discount for underpayments & customer debt account.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {/* Order Summary Box */}
          <div className="bg-muted/40 border border-border rounded-lg p-2.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-mono">
              <span className="text-muted-foreground">Original Total:</span>
              <strong className="text-foreground text-sm">₹{originalNet.toLocaleString("en-IN")}</strong>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="pt-1.5 border-t border-border/50 max-h-24 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {order.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground truncate max-w-[70%]">
                      {it.quantity}x {it.name || it.product_name || "Item"} {it.variant_name ? `(${it.variant_name})` : ""}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      ₹{Number(it.unit_price || it.price || 0) * Number(it.quantity || 1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Selector Pills */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("CASH");
                  setTenderedAmount(originalNet);
                }}
                className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  paymentMethod === "CASH"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <DollarSign size={16} />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("UPI");
                  setTenderedAmount(originalNet);
                }}
                className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  paymentMethod === "UPI"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <QrCode size={16} />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("CARD");
                  setTenderedAmount(originalNet);
                }}
                className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  paymentMethod === "CARD"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <CreditCard size={16} />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("CREDIT_ACCOUNT");
                  // Default to 0 cash paid for full Udhar (user can type 150 for split!)
                  setTenderedAmount(0);
                }}
                className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  paymentMethod === "CREDIT_ACCOUNT"
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs font-bold"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Wallet size={16} />
                <span>Udhar / Debt</span>
              </button>
            </div>
          </div>

          {/* Dynamic UPI QR Code Display for instant customer scan */}
          {paymentMethod === "UPI" && (
            <div className="flex flex-col items-center justify-center p-3 bg-muted/30 border border-border rounded-xl shadow-xs animate-in fade-in duration-150">
              <DynamicUpiQrCode
                amount={finalNetAmount}
                orderNumber={order.order_number}
                vpa="merchant@upi"
                payeeName="SSR One Resto"
                size={140}
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                Scan with PhonePe, GPay, Paytm or any UPI App & click Settle
              </p>
            </div>
          )}

          {/* Dedicated Input Card when Udhar / Debt is Selected */}
          {isCreditAccountMode && (
            <div className="space-y-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                    Immediate Cash / UPI Received (Optional)
                  </label>
                  <p className="text-[10px] text-muted-foreground">
                    Leave ₹0 for 100% credit, or enter advance/partial cash paid (e.g. ₹150).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <select
                    value={immediatePaymentMethod}
                    onChange={(e) => setImmediatePaymentMethod(e.target.value as "CASH" | "UPI")}
                    className="h-8 text-xs font-semibold bg-background border border-border rounded-md px-2 text-foreground"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / QR</option>
                  </select>
                  <div className="w-28">
                    <Input
                      type="number"
                      min={0}
                      max={originalNet}
                      value={tenderedAmount === 0 ? "" : tenderedAmount}
                      placeholder="₹0"
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = raw === "" ? 0 : Number(raw);
                        setTenderedAmount(Math.min(originalNet, Math.max(0, val)));
                      }}
                      className="h-8 text-xs font-mono font-bold text-right bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Visual Breakdown of Cash vs Udhar */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-xs font-mono">
                <div className="bg-card/90 border border-border rounded-lg p-2">
                  <span className="text-[10px] uppercase text-muted-foreground font-sans block">Paid Now ({immediatePaymentMethod})</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm block">
                    ₹{amountPaid.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-2">
                  <span className="text-[10px] uppercase text-amber-700 dark:text-amber-300 font-sans block font-bold">
                    Added to Udhar Khata
                  </span>
                  <strong className="text-amber-600 dark:text-amber-400 font-black text-sm block">
                    ₹{balanceDue.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Tendered Amount & Partial Payment Auto-Discount Calculation for Cash/UPI/Card */}
          {!isCreditAccountMode && (
            <div className="space-y-2 bg-card border border-border rounded-lg p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-semibold text-foreground block">Tendered / Collected Amount</label>
                  <p className="text-[10px] text-muted-foreground">Enter actual cash/UPI amount received from guest.</p>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    min={0}
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(Number(e.target.value))}
                    className="h-8 text-xs font-mono font-bold text-right"
                  />
                </div>
              </div>

              {/* Partial Payment Resolution Selector */}
              {unpaidDifference > 0 && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle size={14} /> Remaining Balance:
                    </span>
                    <span className="font-mono font-bold text-sm">₹{unpaidDifference.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-foreground block">
                      Choose how to handle remaining ₹{unpaidDifference}:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <label className={`p-2 rounded-md border cursor-pointer flex items-start gap-2 transition-colors ${
                        underpaymentResolution === "DEBT"
                          ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-semibold"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}>
                        <input
                          type="radio"
                          name="underpay_mode"
                          checked={underpaymentResolution === "DEBT"}
                          onChange={() => setUnderpaymentResolution("DEBT")}
                          className="mt-0.5 accent-amber-500"
                        />
                        <div>
                          <span className="block text-xs text-foreground font-bold">Customer Debt (Udhar)</span>
                          <span className="text-[10px] text-muted-foreground block">
                            Collect ₹{validTendered} now, save ₹{unpaidDifference} to Customer Udhar Khata.
                          </span>
                        </div>
                      </label>

                      <label className={`p-2 rounded-md border cursor-pointer flex items-start gap-2 transition-colors ${
                        underpaymentResolution === "DISCOUNT"
                          ? "bg-primary/10 border-primary text-foreground font-semibold"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}>
                        <input
                          type="radio"
                          name="underpay_mode"
                          checked={underpaymentResolution === "DISCOUNT"}
                          onChange={() => setUnderpaymentResolution("DISCOUNT")}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <span className="block text-xs text-foreground font-bold">Concession / Discount</span>
                          <span className="text-[10px] text-muted-foreground block">
                            Waive ₹{unpaidDifference} as discount & settle bill as fully paid.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Selection & Debt Ledger Assignment */}
          <div className="space-y-1.5 bg-card border border-border rounded-lg p-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User size={13} className="text-primary" />
                <span>Customer Account</span>
                {(isDebt && balanceDue > 0) && (
                  <span className="text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] uppercase font-mono">
                    Required for Udhar
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => setIsNewCustModalOpen(true)}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus size={11} /> + Register Customer
              </button>
            </div>

            {(isDebt && balanceDue > 0) && !selectedCustomerId && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <span>Customer selection is <strong>strictly required</strong> for Udhar / Debt. Select or register a customer to enable settlement.</span>
              </div>
            )}

            <select
              value={selectedCustomerId}
              onChange={(e) => {
                const custId = e.target.value;
                setSelectedCustomerId(custId);
                const selCust = customers.find((c) => String(c.id) === String(custId));
                if (selCust && selCust.phone) {
                  setWhatsappPhoneInput(selCust.phone);
                }
              }}
              className={`w-full h-8 bg-background border rounded px-2 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary outline-none transition-colors ${
                paymentMethod === "CREDIT_ACCOUNT" && !selectedCustomerId
                  ? "border-amber-500 ring-1 ring-amber-500/30"
                  : "border-border"
              }`}
            >
              <option value="">
                {paymentMethod === "CREDIT_ACCOUNT"
                  ? "⚠️ Select Customer for Debt Account (Required)..."
                  : "Walk-in Guest (General / Unassigned)"}
              </option>
              {customers.map((c) => {
                const cName = renderSafeString(c.name, "Guest");
                const cPhone = renderSafeString(c.phone);
                return (
                  <option key={c.id} value={c.id}>
                    {cName} ({cPhone || "No Phone"})
                  </option>
                );
              })}
            </select>

            {/* Quick WhatsApp / Mobile Phone Input for Direct WhatsApp Receipts */}
            <div className="flex items-center gap-2 pt-1 border-t border-border/40">
              <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
                <MessageSquare size={12} className="text-green-600" /> WhatsApp Mobile:
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit customer mobile (for instant WhatsApp bill)..."
                value={whatsappPhoneInput}
                onChange={(e) => setWhatsappPhoneInput(e.target.value.replace(/\D/g, ""))}
                className="flex-1 h-7 bg-background border border-border rounded px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              {isDebt ? "Total Bill Amount" : "Final Settlement"}
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-base font-extrabold text-foreground">
                ₹{originalNet.toLocaleString("en-IN")}
              </span>
              {isDebt && balanceDue > 0 && amountPaid > 0 && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  (₹{amountPaid} {targetPaymentMethod} + ₹{balanceDue} Udhar)
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-medium cursor-pointer">
              Cancel
            </Button>

            {/* 1. Complete & WhatsApp */}
            <button
              type="button"
              disabled={isSubmitting || (isDebt && balanceDue > 0 && !selectedCustomerId)}
              onClick={() => handleCompleteSettlement("whatsapp")}
              className={`h-9 inline-flex items-center gap-1.5 text-xs font-bold px-3 text-white shadow-xs hover:shadow transition-all active:scale-98 rounded-lg cursor-pointer ${
                isDebt && balanceDue > 0 && !selectedCustomerId
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border border-border"
                  : "bg-green-600 hover:bg-green-700 active:bg-green-800"
              }`}
              title="Complete settlement & send receipt directly to WhatsApp"
            >
              <MessageSquare size={14} className="shrink-0" />
              <span>Complete & WhatsApp</span>
            </button>

            {/* 2. Complete & Print */}
            <button
              type="button"
              disabled={isSubmitting || (isDebt && balanceDue > 0 && !selectedCustomerId)}
              onClick={() => handleCompleteSettlement("print")}
              className={`h-9 inline-flex items-center gap-1.5 text-xs font-bold px-3 text-white shadow-xs hover:shadow transition-all active:scale-98 rounded-lg cursor-pointer ${
                isDebt && balanceDue > 0 && !selectedCustomerId
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border border-border"
                  : "bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900"
              }`}
              title="Complete settlement & print 80mm thermal receipt directly"
            >
              <Printer size={14} className="shrink-0" />
              <span>Complete & Print</span>
            </button>

            {/* 3. Complete & Close */}
            <button
              type="button"
              disabled={isSubmitting || (isDebt && balanceDue > 0 && !selectedCustomerId)}
              onClick={() => handleCompleteSettlement("close")}
              className={`h-9 inline-flex items-center gap-1.5 text-xs font-bold px-3 text-white shadow-xs hover:shadow transition-all active:scale-98 rounded-lg cursor-pointer ${
                isDebt && balanceDue > 0 && !selectedCustomerId
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed border border-border"
                  : "bg-slate-700 hover:bg-slate-800 active:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500"
              }`}
              title="Complete settlement & close screen immediately (no print, no WhatsApp)"
            >
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Complete & Close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inline Quick Customer Registration Sub-Modal */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <UserPlus size={14} className="text-primary" /> Register New Customer
              </h4>
              <button onClick={() => setIsNewCustModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold p-1 cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleRegisterCustomer} className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Full Name *</label>
                <Input
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="h-7 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Mobile Phone *</label>
                <Input
                  required
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="h-7 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Email (Optional)</label>
                <Input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="h-7 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsNewCustModalOpen(false)} className="h-7 text-xs cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingCust} size="sm" className="h-7 text-xs cursor-pointer">
                  {isCreatingCust ? "Saving..." : "Save Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
