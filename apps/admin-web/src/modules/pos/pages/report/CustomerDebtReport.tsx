import React, { useMemo, useState, useEffect } from "react";
import {
  BookOpen,
  DollarSign,
  Search,
  Phone,
  Printer,
  Download,
  AlertCircle,
  User,
  Clock,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { POSOrder } from "../../types";
import { CustomerDebtRegisterModal } from "../../components/CustomerDebtRegisterModal";
import { renderSafeString } from "../../utils/renderSafeString";

interface CustomerDebtReportProps {
  orders: POSOrder[];
  dateLabel?: string;
  onRefresh?: () => void;
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const CustomerDebtReport: React.FC<CustomerDebtReportProps> = ({
  orders,
  dateLabel = "Today",
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"debtors" | "bills">("debtors");
  const [debtSummary, setDebtSummary] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Modal for settling customer debt
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedCustomerIdForModal, setSelectedCustomerIdForModal] = useState<number | null>(null);

  const fetchDebtsSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await api.get<any>("/orders/debts/summary");
      setDebtSummary(res);
    } catch (err) {
      console.error("Failed to load debts summary from backend", err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchDebtsSummary();
  }, []);

  // Filter orders that have debt (balance_due > 0, status is unpaid/partial, or method is CREDIT_ACCOUNT)
  const debtOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const bDue = safeNum(o.balance_due);
      const isCredit = (o.payment_method || "").toUpperCase() === "CREDIT_ACCOUNT";
      const isUnpaidOrPartial =
        (o.payment_status || "").toLowerCase() === "unpaid" ||
        (o.payment_status || "").toLowerCase() === "partial";
      return bDue > 0 || isCredit || isUnpaidOrPartial;
    });
  }, [orders]);

  const filteredDebtOrders = useMemo(() => {
    if (!searchTerm.trim()) return debtOrders;
    const term = searchTerm.toLowerCase();
    return debtOrders.filter(
      (o: any) =>
        o.order_number?.toLowerCase().includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_phone?.toLowerCase().includes(term) ||
        o.table_name?.toLowerCase().includes(term)
    );
  }, [debtOrders, searchTerm]);

  // Debtors list from backend summary or fallback from in-memory orders
  const debtorsList = useMemo(() => {
    if (debtSummary?.debtors && debtSummary.debtors.length > 0) {
      if (!searchTerm.trim()) return debtSummary.debtors;
      const term = searchTerm.toLowerCase();
      return debtSummary.debtors.filter(
        (d: any) =>
          d.customer_name?.toLowerCase().includes(term) ||
          d.customer_phone?.toLowerCase().includes(term)
      );
    }

    // Fallback computed from in-memory orders
    const map: Record<string, any> = {};
    debtOrders.forEach((o: any) => {
      const cId = o.customer_id ? String(o.customer_id) : `guest-${o.id}`;
      const cName = o.customer_name || (o.customer_id ? `Customer #${o.customer_id}` : "Walk-in Guest");
      const cPhone = o.customer_phone || "";
      const bDue = safeNum(o.balance_due || (o.payment_status === "unpaid" ? o.net_amount : 0));
      const gTotal = safeNum(o.net_amount || o.grand_total);
      const paid = safeNum(o.amount_paid);

      if (!map[cId]) {
        map[cId] = {
          customer_id: o.customer_id || o.id,
          customer_name: cName,
          customer_phone: cPhone,
          unpaid_orders_count: 0,
          total_billed: 0,
          total_paid: 0,
          total_balance_due: 0,
          last_order_date: o.created_at,
        };
      }
      map[cId].unpaid_orders_count += 1;
      map[cId].total_billed += gTotal;
      map[cId].total_paid += paid;
      map[cId].total_balance_due += bDue;
    });

    const list = Object.values(map);
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (d: any) =>
        d.customer_name?.toLowerCase().includes(term) ||
        d.customer_phone?.toLowerCase().includes(term)
    );
  }, [debtSummary, debtOrders, searchTerm]);

  const totalOutstanding = useMemo(() => {
    if (debtSummary && typeof debtSummary.total_outstanding_debt === "number") {
      return debtSummary.total_outstanding_debt;
    }
    return debtOrders.reduce(
      (s, o: any) =>
        s + safeNum(o.balance_due || (o.payment_status === "unpaid" ? o.net_amount : 0)),
      0
    );
  }, [debtSummary, debtOrders]);

  const totalDebtorsCount = useMemo(() => {
    if (debtSummary && typeof debtSummary.total_debtors_count === "number") {
      return debtSummary.total_debtors_count;
    }
    return debtorsList.length;
  }, [debtSummary, debtorsList]);

  const handleOpenSettleModal = (customerId?: number) => {
    setSelectedCustomerIdForModal(customerId || null);
    setIsDebtModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "Unpaid Orders Count",
      "Total Billed (INR)",
      "Total Paid (INR)",
      "Total Balance Due / Debt (INR)",
      "Last Order Date",
    ];

    const rows = debtorsList.map((d: any) => [
      `"${d.customer_name}"`,
      `"${d.customer_phone || ""}"`,
      d.unpaid_orders_count,
      safeNum(d.total_billed).toFixed(2),
      safeNum(d.total_paid).toFixed(2),
      safeNum(d.total_balance_due).toFixed(2),
      `"${d.last_order_date ? new Date(d.last_order_date).toLocaleDateString("en-IN") : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `customer_debt_ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-amber-500" />
            Customer Debt Register & Udhar Khata Ledger
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Customer outstanding market balances, credit settlements, and recovery tracking ({dateLabel})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="text-xs font-semibold gap-1.5 cursor-pointer h-7 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => handleOpenSettleModal()}
          >
            <Wallet size={13} /> Settle / Collect Debt
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 cursor-pointer h-7"
            onClick={handleExportCSV}
          >
            <Download size={13} /> Export Debt CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 cursor-pointer h-7"
            onClick={() => window.print()}
          >
            <Printer size={13} /> Print
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Outstanding Market Debt */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-300 block">
              Total Outstanding Market Debt
            </span>
            <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-xl text-amber-700 dark:text-amber-300">
              ₹{safeNum(totalOutstanding).toFixed(2)}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/20 px-1 rounded border border-amber-500/30 font-medium">
              Udhar
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Pending receivable from customers
          </span>
        </div>

        {/* Total Debtors Count */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Active Debt Customers
            </span>
            <User size={14} className="text-muted-foreground" />
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            {totalDebtorsCount} Accounts
          </span>
          <span className="text-[10px] text-muted-foreground">
            Accounts with pending balances
          </span>
        </div>

        {/* Total Unpaid Bills */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Unpaid Credit Bills
            </span>
            <Receipt size={14} className="text-muted-foreground" />
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            {debtOrders.length} Invoices
          </span>
          <span className="text-[10px] text-muted-foreground">
            Partially paid or full credit
          </span>
        </div>

        {/* Collection Action Box */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-primary block">
            Debt Recovery Action
          </span>
          <p className="text-[10px] text-muted-foreground">
            Settle debt using cash, UPI or card with FIFO bill allocation.
          </p>
          <button
            onClick={() => handleOpenSettleModal()}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Open Debt Manager</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search debtor name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex border border-border rounded-md p-0.5 bg-muted/30 text-xs shrink-0">
            <button
              onClick={() => setActiveTab("debtors")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "debtors"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Debtors Summary ({debtorsList.length})
            </button>
            <button
              onClick={() => setActiveTab("bills")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "bills"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unpaid Credit Bills ({filteredDebtOrders.length})
            </button>
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          Realtime PostgreSQL Udhar Ledger
        </span>
      </div>

      {/* Content Rendering */}
      {activeTab === "debtors" ? (
        /* Debtors Summary Table */
        <div className="overflow-x-auto border border-border rounded-md bg-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                <th className="py-2.5 px-3">Customer / Debtor</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3 text-center">Unpaid Bills</th>
                <th className="py-2.5 px-3 text-right">Total Billed</th>
                <th className="py-2.5 px-3 text-right">Total Paid</th>
                <th className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                  Outstanding Debt (INR)
                </th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {debtorsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground font-medium">
                    No customers with outstanding debt found. All accounts balanced!
                  </td>
                </tr>
              ) : (
                debtorsList.map((d: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-muted-foreground" />
                        <span>{renderSafeString(d.customer_name)}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono">
                      {d.customer_phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={11} /> {d.customer_phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground">
                      {d.unpaid_orders_count}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      ₹{safeNum(d.total_billed).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{safeNum(d.total_paid).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-base text-amber-600 dark:text-amber-400">
                      ₹{safeNum(d.total_balance_due).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] font-semibold h-6 px-2 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                        onClick={() => handleOpenSettleModal(d.customer_id)}
                      >
                        Settle Debt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Unpaid Credit Bills Table */
        <div className="overflow-x-auto border border-border rounded-md bg-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                <th className="py-2.5 px-3">Bill #</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Customer Account</th>
                <th className="py-2.5 px-3">Table</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-right">Amount Paid</th>
                <th className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                  Balance Due (Udhar)
                </th>
                <th className="py-2.5 px-3 text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredDebtOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground font-medium">
                    No credit or partial debt orders recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredDebtOrders.map((o: any) => {
                  const gTotal = safeNum(o.net_amount ?? o.grand_total ?? 0);
                  const aPaid = safeNum(o.amount_paid ?? 0);
                  const bDue = safeNum(o.balance_due ?? (o.payment_status === "unpaid" ? gTotal : 0));
                  return (
                    <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                        #{o.order_number}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground font-mono">
                        {new Date(o.created_at || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {renderSafeString(o.customer_name || (o.customer_id ? `Customer #${o.customer_id}` : "Walk-in Guest"))}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {o.table_name ? `Table ${o.table_name}` : "Express"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        ₹{gTotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        ₹{aPaid.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        ₹{bDue.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                            (o.payment_status || "").toLowerCase() === "partial"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {o.payment_status || "UNPAID (UDHAR)"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Debt Register Modal for Payment Collection */}
      <CustomerDebtRegisterModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          fetchDebtsSummary();
          onRefresh?.();
        }}
        preSelectedCustomerId={selectedCustomerIdForModal || undefined}
        onRefreshData={() => {
          fetchDebtsSummary();
          onRefresh?.();
        }}
      />
    </div>
  );
};
