/**
 * SSR One AI – Executive Mobile Owner Pocket Hub (Option A)
 * Pure View & Monitoring Companion for Restaurant Owners
 * 
 * Scope:
 * - Pure observation & executive insights (no cashier/kitchen operations).
 * - Only today's orders (Dine-In QR, Takeaway, Delivery).
 * - Real-time incoming Food App order audio chime & notification alerts.
 * - Today's Live Sales, Payment Breakdown (Cash vs UPI/Online), and KPIs.
 * - 1-Tap Customer Receipt preview/print for any today's order.
 * - Luxury, high-end light theme designed for Mobile PWA ("Add to Home Screen").
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell, Volume2, VolumeX, Store, UtensilsCrossed, ShoppingBag,
  Truck, ArrowUpRight, TrendingUp, IndianRupee, Layers,
  RefreshCw, ChefHat, Sparkles, Filter, Phone, MessageSquare, MapPin,
  Clock, Printer, CheckCircle2, AlertCircle, Smartphone, Eye, Receipt,
  Share2, Copy, Download, Calendar, DollarSign, CreditCard, QrCode, Check,
  X, AlertTriangle, ShieldCheck, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@ssrone/auth";
import {
  fetchActiveOrdersFeed,
  fetchPendingOnlineOrders,
  fetchDailyAnalyticsReport
} from "@ssrone/api-client";
import { printCustomerReceiptDirectly } from "../pos/utils/printUtils";

export type AnalyticsRange = "today" | "yesterday" | "week" | "month";

const getDateRangeBounds = (range: AnalyticsRange) => {
  const now = new Date();
  const formatYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (range === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const yStr = formatYMD(y);
    return { from: yStr, to: yStr, label: "Yesterday" };
  }
  if (range === "week") {
    const w = new Date(now);
    w.setDate(w.getDate() - 6);
    return { from: formatYMD(w), to: formatYMD(now), label: "Last 7 Days" };
  }
  if (range === "month") {
    const m = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: formatYMD(m), to: formatYMD(now), label: "This Month" };
  }
  const todayStr = formatYMD(now);
  return { from: todayStr, to: todayStr, label: "Today" };
};

// Luxury Executive Web Audio API Chime Synth
const playExecutiveOrderChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic Triple-Tone Chime: C5 -> E5 -> G5
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;
      const duration = 0.35;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    console.debug("Executive chime failed:", err);
  }
};

const formatCurrency = (val: number | string = 0): string => {
  const num = typeof val === "number" ? val : parseFloat(String(val)) || 0;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Check if timestamp is today in local time
const isTodayDate = (dateStr?: string): boolean => {
  if (!dateStr) return true;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  } catch {
    return true;
  }
};

export const OwnerPocketDashboardPage: React.FC = () => {
  const { user, selected_branch } = useAuthStore();
  const branchId = selected_branch?.id || 1;
  const branchName = selected_branch?.name || "Main Outlet";

  // Navigation State
  const [activeTab, setActiveTab] = useState<"orders" | "analytics">("orders");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [analyticsDateRange, setAnalyticsDateRange] = useState<AnalyticsRange>("today");

  // Mobile PWA App State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState<boolean>(false);
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(() => {
    return localStorage.getItem("owner_pwa_banner_dismissed") !== "true";
  });

  const dismissPwaBanner = () => {
    setShowPwaBanner(false);
    localStorage.setItem("owner_pwa_banner_dismissed", "true");
  };

  // Data Feeds (Today Only)
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [dailyAnalytics, setDailyAnalytics] = useState<any>({
    total_orders: 0,
    total_net: 0,
    total_subtotal: 0,
    total_tax: 0,
    total_discount: 0,
    total_paid: 0,
    total_due: 0,
    avg_order_value: 0,
    payment_breakdown: { cash: 0, upi: 0, card: 0, credit_account: 0 },
    cancelled_orders: 0,
    cancelled_lost_revenue: 0,
  });

  // Sound & Live Sync
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("owner_hub_sound_enabled") !== "false";
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Receipt Modal State
  const [receiptModalOrder, setReceiptModalOrder] = useState<any | null>(null);

  // Sound Tracking for Incoming Food App Orders
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef<boolean>(false);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    ) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("owner_hub_sound_enabled", String(next));
    if (next) {
      playExecutiveOrderChime();
      toast.success("Order chime notifications active");
    } else {
      toast.info("Audio notifications muted");
    }
  };

  const testChime = () => {
    playExecutiveOrderChime();
    toast.success("Playing test chime alert 🔔");
  };

  const copyMobileLink = () => {
    const url = `${window.location.origin}/owner`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setIsCopiedLink(true);
        setTimeout(() => setIsCopiedLink(false), 2500);
        toast.success("Owner Hub Mobile Link copied to clipboard!");
      }).catch(() => {
        toast.info(`Mobile Link: ${url}`);
      });
    } else {
      toast.info(`Mobile Link: ${url}`);
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsPwaInstalled(true);
        toast.success("Owner Hub App installed to your device!");
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuideModal(true);
    }
  };

  // Primary Data Fetcher (Filtered strictly for TODAY with range bounds for reports)
  const loadDashboardData = useCallback(async (isSilent = false, targetRange = analyticsDateRange) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const bounds = getDateRangeBounds(targetRange);
      const [feedRes, pendingRes, analyticsRes] = await Promise.all([
        fetchActiveOrdersFeed(branchId).catch(() => ({ active_orders: [], total: 0 })),
        fetchPendingOnlineOrders(branchId).catch(() => ({ pending_orders: [], total: 0 })),
        fetchDailyAnalyticsReport(branchId, bounds.from, bounds.to).catch(() => null),
      ]);

      const liveActive = Array.isArray(feedRes?.active_orders) ? feedRes.active_orders : [];
      const livePending = Array.isArray(pendingRes?.pending_orders) ? pendingRes.pending_orders : [];

      // STRICT FILTER: Only Today's Orders for real-time live operational list
      const todayActive = liveActive.filter((o: any) => isTodayDate(o.created_at));
      const todayPending = livePending.filter((o: any) => isTodayDate(o.created_at));

      setActiveOrders(todayActive);
      setPendingOrders(todayPending);

      if (analyticsRes) {
        setDailyAnalytics(analyticsRes);
      }

      // Check for incoming new online orders to trigger notification & sound chime
      if (!initialFetchDoneRef.current) {
        todayPending.forEach((o: any) => knownOrderIdsRef.current.add(String(o.order_number || o.id)));
        initialFetchDoneRef.current = true;
      } else {
        const newlyArrived = todayPending.filter(
          (o: any) => !knownOrderIdsRef.current.has(String(o.order_number || o.id))
        );

        if (newlyArrived.length > 0) {
          newlyArrived.forEach((o: any) => knownOrderIdsRef.current.add(String(o.order_number || o.id)));
          if (soundEnabled) {
            playExecutiveOrderChime();
          }
          const topOrder = newlyArrived[0];
          const modeLabel = (topOrder.order_type || topOrder.order_mode || "Order").toUpperCase();
          const tableText = topOrder.table_name ? ` (${topOrder.table_name})` : "";
          toast.success(
            `🔔 New Food App Order #${topOrder.daily_order_number || topOrder.order_number}! ${modeLabel}${tableText} • ₹${topOrder.grand_total || topOrder.net_amount}`,
            {
              duration: 7000,
            }
          );
        }
      }

      setLastRefreshedAt(new Date());
    } catch (err) {
      console.warn("Owner Pocket Hub data sync error:", err);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, [branchId, soundEnabled, analyticsDateRange]);

  const handleRangeChange = (newRange: AnalyticsRange) => {
    setAnalyticsDateRange(newRange);
    loadDashboardData(false, newRange);
  };

  // Polling every 4 seconds for instant real-time visibility
  useEffect(() => {
    loadDashboardData(false);
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Merge today's orders (pending + active) and remove duplicates by order_number
  const allTodayOrders = useMemo(() => {
    const map = new Map<string, any>();
    // Add active orders first
    activeOrders.forEach((o) => {
      const key = String(o.order_number || o.id);
      map.set(key, o);
    });
    // Overlay pending orders
    pendingOrders.forEach((o) => {
      const key = String(o.order_number || o.id);
      map.set(key, o);
    });
    return Array.from(map.values());
  }, [activeOrders, pendingOrders]);

  const pendingCount = pendingOrders.length;

  // Filtered list based on status & channel
  const filteredOrders = useMemo(() => {
    let list = allTodayOrders;

    if (orderStatusFilter === "pending") {
      list = list.filter((o) => {
        const s = String(o.status || "").toLowerCase();
        return s.includes("pending");
      });
    } else if (orderStatusFilter === "kitchen") {
      list = list.filter((o) => {
        const s = String(o.status || "").toLowerCase();
        return s === "kot_sent" || s === "in_kitchen" || s === "preparing" || s === "confirmed";
      });
    } else if (orderStatusFilter === "ready") {
      list = list.filter((o) => {
        const s = String(o.status || "").toLowerCase();
        return s === "ready" || s === "out_for_delivery" || s === "served";
      });
    } else if (orderStatusFilter === "completed") {
      list = list.filter((o) => {
        const s = String(o.status || "").toLowerCase();
        return s === "completed" || s === "paid";
      });
    }

    if (channelFilter !== "all") {
      list = list.filter((o) => {
        const t = String(o.order_type || o.order_mode || "").toLowerCase();
        return t.includes(channelFilter);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((o) => {
        const num = String(o.order_number || o.daily_order_number || "").toLowerCase();
        const cust = String(o.customer_name || "").toLowerCase();
        const phone = String(o.customer_phone || "").toLowerCase();
        const tbl = String(o.table_name || "").toLowerCase();
        return num.includes(q) || cust.includes(q) || phone.includes(q) || tbl.includes(q);
      });
    }

    return list;
  }, [allTodayOrders, orderStatusFilter, channelFilter, searchQuery]);

  // Aggregated Counts for Tabs
  const counts = useMemo(() => {
    let pending = 0;
    let kitchen = 0;
    let ready = 0;
    let completed = 0;

    allTodayOrders.forEach((o) => {
      const s = String(o.status || "").toLowerCase();
      if (s.includes("pending")) pending++;
      else if (s === "kot_sent" || s === "in_kitchen" || s === "preparing" || s === "confirmed") kitchen++;
      else if (s === "ready" || s === "out_for_delivery" || s === "served") ready++;
      else if (s === "completed" || s === "paid") completed++;
    });

    return {
      all: allTodayOrders.length,
      pending,
      kitchen,
      ready,
      completed,
    };
  }, [allTodayOrders]);

  // Channel metrics for Today
  const channelMetrics = useMemo(() => {
    let dineInCount = 0;
    let takeawayCount = 0;
    let deliveryCount = 0;

    allTodayOrders.forEach((o) => {
      const t = String(o.order_type || o.order_mode || "").toLowerCase();
      if (t.includes("dine") || o.table_id || o.table_name) dineInCount++;
      else if (t.includes("take") || t.includes("pickup")) takeawayCount++;
      else if (t.includes("deliv")) deliveryCount++;
      else takeawayCount++;
    });

    const total = allTodayOrders.length || 1;
    return {
      dineInCount,
      takeawayCount,
      deliveryCount,
      dineInPct: Math.round((dineInCount / total) * 100),
      takeawayPct: Math.round((takeawayCount / total) * 100),
      deliveryPct: Math.round((deliveryCount / total) * 100),
    };
  }, [allTodayOrders]);

  // Top Selling Items Today
  const topSellingItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
    allTodayOrders.forEach((o) => {
      (o.items || []).forEach((it: any) => {
        const name = it.name || it.product_name || "Dish Item";
        const qty = Number(it.quantity || 1);
        const rev = Number(it.line_total || it.unit_price * qty || 0);
        const existing = itemMap.get(name) || { name, qty: 0, revenue: 0 };
        existing.qty += qty;
        existing.revenue += rev;
        itemMap.set(name, existing);
      });
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [allTodayOrders]);

  // Robust Multi-Layer Effective Sales Aggregator
  // Seamlessly merges backend database aggregation with local optimistic aggregates
  const effectiveSales = useMemo(() => {
    const backendHasData =
      (dailyAnalytics?.total_orders && dailyAnalytics.total_orders > 0) ||
      (dailyAnalytics?.total_net && Number(dailyAnalytics.total_net) > 0);

    // Calculate local fallback aggregates from allTodayOrders (for non-cancelled orders)
    let localTotalOrders = 0;
    let localTotalNet = 0;
    let localTotalSubtotal = 0;
    let localTotalTax = 0;
    let localTotalDiscount = 0;
    let localTotalPaid = 0;
    let localTotalDue = 0;
    let localCash = 0;
    let localUpi = 0;
    let localCard = 0;
    let localCredit = 0;
    let localCancelledCount = 0;
    let localCancelledLost = 0;

    allTodayOrders.forEach((o) => {
      const s = String(o.status || "").toLowerCase();
      const gTotal = Number(o.grand_total || o.net_amount || 0);
      const sTotal = Number(o.subtotal || gTotal);
      const tTax = Number(o.total_tax || o.tax_amount || 0);
      const dDiscount = Number(o.discount_amount || 0);
      const aPaid = Number(o.amount_paid || (s === "completed" || s === "paid" ? gTotal : 0));
      const bDue = Number(o.balance_due || Math.max(0, gTotal - aPaid));

      if (s === "cancelled") {
        localCancelledCount++;
        localCancelledLost += gTotal;
        return;
      }

      localTotalOrders++;
      localTotalNet += gTotal;
      localTotalSubtotal += sTotal;
      localTotalTax += tTax;
      localTotalDiscount += dDiscount;
      localTotalPaid += aPaid;
      localTotalDue += bDue;

      const pMode = String(o.payment_method || o.payment_mode || "").toLowerCase();
      if (pMode.includes("cash")) {
        localCash += aPaid;
      } else if (
        pMode.includes("upi") ||
        pMode.includes("online") ||
        pMode.includes("qr") ||
        pMode.includes("gpay") ||
        pMode.includes("phonepe") ||
        pMode.includes("paytm")
      ) {
        localUpi += aPaid;
      } else if (pMode.includes("card")) {
        localCard += aPaid;
      } else if (pMode.includes("credit") || pMode.includes("udhar") || pMode.includes("due")) {
        localCredit += aPaid;
      } else {
        if (aPaid > 0) localUpi += aPaid;
      }
    });

    const avgLocal = localTotalOrders > 0 ? Math.round(localTotalNet / localTotalOrders) : 0;

    if (backendHasData) {
      const bNet = Number(dailyAnalytics.total_net) || 0;
      const bOrders = Number(dailyAnalytics.total_orders) || 0;
      return {
        total_orders: bOrders > 0 ? bOrders : localTotalOrders,
        total_net: bNet > 0 ? bNet : localTotalNet,
        total_subtotal: Number(dailyAnalytics.total_subtotal) || (bNet > 0 ? bNet : localTotalSubtotal),
        total_tax: Number(dailyAnalytics.total_tax) || localTotalTax,
        total_discount: Number(dailyAnalytics.total_discount) || localTotalDiscount,
        total_paid: Number(dailyAnalytics.total_paid) || (bNet > 0 ? bNet : localTotalPaid),
        total_due: Number(dailyAnalytics.total_due) || localTotalDue,
        avg_order_value: Number(dailyAnalytics.avg_order_value) || (bOrders > 0 ? Math.round(bNet / bOrders) : avgLocal),
        payment_breakdown: {
          cash: Number(dailyAnalytics.payment_breakdown?.cash || 0) || (analyticsDateRange === "today" ? localCash : 0),
          upi: Number(dailyAnalytics.payment_breakdown?.upi || 0) || (analyticsDateRange === "today" ? localUpi : 0),
          card: Number(dailyAnalytics.payment_breakdown?.card || 0) || (analyticsDateRange === "today" ? localCard : 0),
          credit_account: Number(dailyAnalytics.payment_breakdown?.credit_account || 0) || (analyticsDateRange === "today" ? localCredit : 0),
        },
        cancelled_orders: dailyAnalytics.cancelled_orders ?? localCancelledCount,
        cancelled_lost_revenue: dailyAnalytics.cancelled_lost_revenue ?? localCancelledLost,
      };
    }

    // Default fallback to local aggregates (guarantees non-zero when today has orders)
    return {
      total_orders: localTotalOrders,
      total_net: localTotalNet,
      total_subtotal: localTotalSubtotal,
      total_tax: localTotalTax,
      total_discount: localTotalDiscount,
      total_paid: localTotalPaid,
      total_due: localTotalDue,
      avg_order_value: avgLocal,
      payment_breakdown: {
        cash: localCash,
        upi: localUpi,
        card: localCard,
        credit_account: localCredit,
      },
      cancelled_orders: localCancelledCount,
      cancelled_lost_revenue: localCancelledLost,
    };
  }, [dailyAnalytics, allTodayOrders, analyticsDateRange]);

  // Hourly Order & Sales velocity distribution
  const hourlyVelocity = useMemo(() => {
    const hours: { [key: number]: number } = {};
    for (let h = 8; h <= 23; h++) hours[h] = 0;
    allTodayOrders.forEach((o) => {
      if (String(o.status || "").toLowerCase() === "cancelled") return;
      if (!o.created_at) return;
      try {
        const d = new Date(o.created_at);
        const h = d.getHours();
        if (hours[h] !== undefined) {
          hours[h] += Number(o.grand_total || o.net_amount || 0);
        }
      } catch {}
    });
    return hours;
  }, [allTodayOrders]);

  const handleShareReportWhatsApp = () => {
    const bounds = getDateRangeBounds(analyticsDateRange);
    const text = `📊 *${branchName} — Executive Sales Report*
📅 *Period:* ${bounds.label} (${bounds.from}${bounds.from !== bounds.to ? ` to ${bounds.to}` : ""})
━━━━━━━━━━━━━━━━━━
💰 *Net Billed Sales:* ${formatCurrency(effectiveSales.total_net)}
📦 *Total Orders:* ${effectiveSales.total_orders}
🎯 *Avg Ticket Size:* ${formatCurrency(effectiveSales.avg_order_value)}

💳 *Payment Breakdown:*
  • 💵 Cash: ${formatCurrency(effectiveSales.payment_breakdown.cash)}
  • 📱 UPI / Online: ${formatCurrency(effectiveSales.payment_breakdown.upi)}
  • 💳 Card: ${formatCurrency(effectiveSales.payment_breakdown.card)}
  • 📒 Due / Udhar: ${formatCurrency(effectiveSales.payment_breakdown.credit_account || effectiveSales.total_due)}

🚫 *Cancellations / Void:* ${effectiveSales.cancelled_orders} orders (${formatCurrency(effectiveSales.cancelled_lost_revenue)} lost)
━━━━━━━━━━━━━━━━━━
Generated via SSR One AI Owner Pocket Hub
🔗 https://baithak.ssrit.online/owner`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const printExecutiveReportStatement = () => {
    const bounds = getDateRangeBounds(analyticsDateRange);
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      toast.error("Please allow popups to print executive statement");
      return;
    }
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Sales Statement - ${branchName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; padding: 15px; font-size: 13px; line-height: 1.4; color: #000; margin: 0; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-bottom: 1px dashed #666; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin: 4px 0; }
    .header { font-size: 16px; font-weight: bold; }
    .sub { font-size: 11px; color: #555; }
  </style>
</head>
<body>
  <div class="center header">${branchName}</div>
  <div class="center sub">EXECUTIVE SALES STATEMENT</div>
  <div class="center sub">Period: ${bounds.label} (${bounds.from}${bounds.from !== bounds.to ? " to " + bounds.to : ""})</div>
  <div class="divider"></div>
  <div class="row"><span>Total Orders:</span><span class="bold">${effectiveSales.total_orders}</span></div>
  <div class="row"><span>Gross Subtotal:</span><span>${formatCurrency(effectiveSales.total_subtotal)}</span></div>
  <div class="row"><span>Total Tax (GST):</span><span>${formatCurrency(effectiveSales.total_tax)}</span></div>
  <div class="row"><span>Discounts:</span><span>-${formatCurrency(effectiveSales.total_discount)}</span></div>
  <div class="divider"></div>
  <div class="row bold" style="font-size: 14px;"><span>NET BILLED SALES:</span><span>${formatCurrency(effectiveSales.total_net)}</span></div>
  <div class="divider"></div>
  <div class="bold" style="margin-top: 6px;">PAYMENT SUMMARY</div>
  <div class="row"><span>• Cash:</span><span>${formatCurrency(effectiveSales.payment_breakdown.cash)}</span></div>
  <div class="row"><span>• UPI / Online:</span><span>${formatCurrency(effectiveSales.payment_breakdown.upi)}</span></div>
  <div class="row"><span>• Card POS:</span><span>${formatCurrency(effectiveSales.payment_breakdown.card)}</span></div>
  <div class="row"><span>• Credit / Udhar:</span><span>${formatCurrency(effectiveSales.payment_breakdown.credit_account || effectiveSales.total_due)}</span></div>
  <div class="divider"></div>
  <div class="row"><span>Total Collected:</span><span class="bold">${formatCurrency(effectiveSales.total_paid)}</span></div>
  <div class="row"><span>Balance Due:</span><span>${formatCurrency(effectiveSales.total_due)}</span></div>
  <div class="row"><span>Void / Cancelled:</span><span>${effectiveSales.cancelled_orders} (${formatCurrency(effectiveSales.cancelled_lost_revenue)})</span></div>
  <div class="divider"></div>
  <div class="center sub" style="margin-top: 10px;">SSR ONE AI — OWNER POCKET HUB</div>
  <div class="center sub">${new Date().toLocaleString("en-IN")}</div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getTimeElapsed = (createdStr?: string) => {
    if (!createdStr) return "Just now";
    const created = new Date(createdStr).getTime();
    const now = Date.now();
    const diffMins = Math.max(0, Math.floor((now - created) / 60000));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    return `${hours}h ${diffMins % 60}m ago`;
  };

  const getStatusBadge = (statusStr: string) => {
    const s = String(statusStr || "").toLowerCase();
    if (s.includes("pending")) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
          Awaiting Acceptance
        </span>
      );
    }
    if (s === "kot_sent" || s === "in_kitchen" || s === "preparing" || s === "confirmed") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          In Kitchen
        </span>
      );
    }
    if (s === "ready" || s === "out_for_delivery" || s === "served") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
          Ready
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
        Completed
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans select-none pb-24 md:pb-12">
      {/* ─── LUXURY EXECUTIVE LIGHT HEADER ─── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Outlet Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs font-bold shrink-0">
              <Store size={18} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">
                  {branchName}
                </h1>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  Owner Hub
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-medium">Live Today</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {lastRefreshedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Chime Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                soundEnabled
                  ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
              }`}
              title={soundEnabled ? "Mute Order Chime" : "Enable Order Chime"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Refresh */}
            <button
              onClick={() => loadDashboardData(false)}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Feeds"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin text-slate-900" : ""} />
            </button>

            {/* Share / Copy Mobile Link */}
            <button
              onClick={copyMobileLink}
              className="p-2 rounded-xl text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
              title="Share / Copy Link"
            >
              {isCopiedLink ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            </button>

            {/* Jump to Full Desktop POS */}
            <Link
              to="/pos"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5 transition-all"
              title="Open Cashier POS"
            >
              <UtensilsCrossed size={13} />
              <span className="hidden sm:inline">POS</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── INCOMING FOOD APP ORDER NOTIFICATION BANNER ─── */}
      {pendingCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200 px-4 py-2.5 shadow-2xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-950">
                🔔 {pendingCount} Food App {pendingCount === 1 ? "Order" : "Orders"} Received (Dine-In QR / Takeaway / Delivery)
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTab("orders");
                setOrderStatusFilter("pending");
              }}
              className="px-3 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              View Now ({pendingCount})
            </button>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 flex-1 flex flex-col gap-3">
        {/* ─── OPTIONAL SLIM DISMISSABLE PWA APP BAR ─── */}
        {showPwaBanner && !isPwaInstalled && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-2.5 sm:p-3 shadow-xs flex items-center justify-between gap-2.5 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Smartphone className="text-emerald-400" size={16} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold text-white tracking-tight truncate">
                    Install Owner Hub on Phone
                  </h2>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.2 rounded-full border border-emerald-500/30 shrink-0">
                    PWA
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate">
                  Instant live orders & sales monitoring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallApp}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <Download size={12} />
                <span>Add to Screen</span>
              </button>

              <button
                onClick={dismissPwaBanner}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TOP LEVEL NAVIGATION (Visible on Desktop / Tablet only; mobile uses the bottom dock) */}
        <div className="hidden md:flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag size={14} className={activeTab === "orders" ? "text-emerald-600" : ""} />
              <span>Today's Live Orders</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp size={14} className={activeTab === "analytics" ? "text-indigo-600" : ""} />
              <span>Sales & Reports</span>
            </button>
          </div>

          {/* Today's Sales Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-500 font-medium">Today's Net Sales:</span>
            <span className="font-extrabold text-emerald-700 font-mono text-sm">
              {formatCurrency(effectiveSales.total_net || 0)}
            </span>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: TODAY'S LIVE ORDERS (OBSERVABILITY ONLY) */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-3">
            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              {/* Order Status Filters */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  onClick={() => setOrderStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    orderStatusFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All Today ({counts.all})
                </button>

                <button
                  onClick={() => setOrderStatusFilter("pending")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    orderStatusFilter === "pending"
                      ? "bg-amber-600 text-white font-bold"
                      : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <span>Pending</span>
                  {counts.pending > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {counts.pending}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setOrderStatusFilter("kitchen")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    orderStatusFilter === "kitchen"
                      ? "bg-blue-600 text-white"
                      : "text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  In Kitchen ({counts.kitchen})
                </button>

                <button
                  onClick={() => setOrderStatusFilter("ready")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    orderStatusFilter === "ready"
                      ? "bg-emerald-600 text-white"
                      : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  Ready ({counts.ready})
                </button>
              </div>

              {/* Channel Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setChannelFilter("all")}
                  className={`px-2 py-0.5 rounded font-medium ${
                    channelFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  All Channels
                </button>
                <button
                  onClick={() => setChannelFilter("dine")}
                  className={`px-2 py-0.5 rounded font-medium ${
                    channelFilter === "dine" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  Dine-In
                </button>
                <button
                  onClick={() => setChannelFilter("take")}
                  className={`px-2 py-0.5 rounded font-medium ${
                    channelFilter === "take" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  Takeaway
                </button>
                <button
                  onClick={() => setChannelFilter("deliv")}
                  className={`px-2 py-0.5 rounded font-medium ${
                    channelFilter === "deliv" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  Delivery
                </button>
              </div>
            </div>

            {/* ORDERS GRID STREAM */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">No Orders Today in this View</h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Incoming orders placed today from the Food App or Cashier POS appear here in real time.
                </p>
                <button
                  onClick={() => {
                    setOrderStatusFilter("all");
                    setChannelFilter("all");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredOrders.map((order) => {
                  const orderKey = order.order_number || order.id;
                  const orderMode = String(order.order_type || order.order_mode || "takeaway").toLowerCase();
                  const isDineIn = orderMode.includes("dine") || Boolean(order.table_id);
                  const isDelivery = orderMode.includes("deliv");
                  const isTakeaway = !isDineIn && !isDelivery;

                  const isOnline =
                    String(order.source_channel || "").toLowerCase().includes("web") ||
                    String(order.source_channel || "").toLowerCase().includes("food_app") ||
                    String(order.source_channel || "").toLowerCase().includes("online");

                  const customerPhone = order.customer_phone?.replace(/\D/g, "");

                  return (
                    <div
                      key={orderKey}
                      className="relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs"
                    >
                      {/* CARD HEADER */}
                      <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-extrabold text-slate-900">
                              #{order.daily_order_number || order.order_number}
                            </span>

                            {/* Channel Badge */}
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isDineIn
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : isDelivery
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {isDineIn ? (
                                <>
                                  <UtensilsCrossed size={10} />
                                  <span>{order.table_name || `Table ${order.table_id || "Dine-In"}`}</span>
                                </>
                              ) : isDelivery ? (
                                <>
                                  <Truck size={10} />
                                  <span>Delivery</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={10} />
                                  <span>Takeaway</span>
                                </>
                              )}
                            </span>

                            {isOnline && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Food App
                              </span>
                            )}
                          </div>

                          {/* Time Elapsed */}
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                            <Clock size={12} />
                            <span>{getTimeElapsed(order.created_at)}</span>
                          </div>
                        </div>

                        {/* Customer Info & Direct Contacts */}
                        <div className="flex items-center justify-between text-xs text-slate-700">
                          <span className="font-semibold truncate max-w-[160px]">
                            {order.customer_name || "Guest Customer"}
                          </span>

                          {customerPhone && (
                            <div className="flex items-center gap-1.5">
                              {/* 1-Tap Direct Call */}
                              <a
                                href={`tel:${customerPhone}`}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="Call Customer"
                              >
                                <Phone size={13} className="text-emerald-600" />
                              </a>
                              {/* 1-Tap WhatsApp */}
                              <a
                                href={`https://wa.me/91${customerPhone}?text=Hi%20${encodeURIComponent(
                                  order.customer_name || "Customer"
                                )},%20regarding%20your%20order%20%23${order.daily_order_number || order.order_number}%20at%20${encodeURIComponent(
                                  branchName
                                )}:`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={13} className="text-emerald-600" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Delivery Address if Delivery Order */}
                        {isDelivery && order.delivery_address && (
                          <div className="mt-1.5 text-[11px] text-slate-500 flex items-start gap-1">
                            <MapPin size={12} className="shrink-0 mt-0.5 text-purple-600" />
                            <span className="line-clamp-1">{order.delivery_address}</span>
                          </div>
                        )}
                      </div>

                      {/* ITEM LIST */}
                      <div className="p-3.5 space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {(order.items || []).map((it: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between text-xs gap-2">
                            <div className="flex items-start gap-2">
                              <span className="font-bold font-mono text-emerald-700 px-1.5 py-0.2 rounded bg-emerald-50 text-[11px] border border-emerald-100">
                                {it.quantity}x
                              </span>
                              <div>
                                <span className="font-semibold text-slate-800">
                                  {it.name || it.product_name}
                                </span>
                                {it.variant_name && (
                                  <span className="ml-1 text-[10px] text-slate-500">
                                    ({it.variant_name})
                                  </span>
                                )}
                                {it.notes && (
                                  <p className="text-[10px] text-amber-700 italic">
                                    Note: {it.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-mono text-slate-600 text-xs shrink-0 font-medium">
                              ₹{it.line_total || it.unit_price * (it.quantity || 1)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CARD FOOTER & CUSTOMER RECEIPT VIEW BUTTON */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100">
                        {/* Financial Summary & Status */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <div>
                            <span className="text-slate-500 text-[11px]">Total: </span>
                            <span className="font-extrabold text-slate-900 font-mono text-sm">
                              ₹{order.grand_total || order.net_amount || 0}
                            </span>
                          </div>

                          {getStatusBadge(order.status)}
                        </div>

                        {/* Customer Receipt Action (View & Print) */}
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setReceiptModalOrder(order)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Receipt size={13} className="text-indigo-600" />
                            <span>View Customer Receipt</span>
                          </button>

                          <button
                            onClick={() => {
                              printCustomerReceiptDirectly(order);
                              toast.success(`Printing Receipt for Order #${order.daily_order_number || order.order_number}`);
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Print Customer Receipt"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: ADVANCED EXECUTIVE SALES & AUDIT REPORTS */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            {/* Period Filter Toolbar & Executive Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              {/* Date Range Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: "today", label: "Today" },
                    { id: "yesterday", label: "Yesterday" },
                    { id: "week", label: "Last 7 Days" },
                    { id: "month", label: "This Month" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleRangeChange(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      analyticsDateRange === tab.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons: WhatsApp Share & Print Statement */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={handleShareReportWhatsApp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Share Report on WhatsApp"
                >
                  <Share2 size={13} />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={printExecutiveReportStatement}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
                  title="Print Sales Summary"
                >
                  <Printer size={13} />
                  <span className="hidden sm:inline">Print Summary</span>
                </button>
              </div>
            </div>

            {/* Top 4 Hero KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Net Billed Sales */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
                  <span>Net Billed Sales</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <IndianRupee size={15} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatCurrency(effectiveSales.total_net || 0)}
                </div>
                <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <TrendingUp size={12} />
                  <span>Real-time aggregated sales</span>
                </div>
              </div>

              {/* Total Orders Today */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
                  <span>Total Orders</span>
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                    <ShoppingBag size={15} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {effectiveSales.total_orders || allTodayOrders.length}
                </div>
                <div className="mt-2 text-[11px] text-slate-500 truncate">
                  {channelMetrics.dineInCount} Dine-In • {channelMetrics.takeawayCount} Takeaway
                </div>
              </div>

              {/* Average Order Value */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
                  <span>Avg Ticket Size</span>
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                    <TrendingUp size={15} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatCurrency(effectiveSales.avg_order_value || 0)}
                </div>
                <div className="mt-2 text-[11px] text-purple-700 font-medium">
                  Per customer order
                </div>
              </div>

              {/* Collected vs Due */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
                  <span>Collected vs Due</span>
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                    <Layers size={15} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatCurrency(effectiveSales.total_paid || 0)}
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  {effectiveSales.total_due > 0 ? (
                    <span>Due: <strong className="text-rose-600 font-mono">{formatCurrency(effectiveSales.total_due)}</strong></span>
                  ) : (
                    <span className="text-emerald-700 font-medium">All Payments Cleared</span>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Ledger & Payment Mode Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detailed Financial Ledger */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Receipt size={15} className="text-indigo-600" />
                    Financial Breakdown Statement
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                      <span>Gross Subtotal (Food & Drinks)</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {formatCurrency(effectiveSales.total_subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                      <span>GST & Taxes Collected</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        + {formatCurrency(effectiveSales.total_tax)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                      <span>Discounts Allowed</span>
                      <span className="font-mono font-semibold text-rose-600">
                        - {formatCurrency(effectiveSales.total_discount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-900 font-bold pt-1 text-sm">
                      <span>Net Billed Sales</span>
                      <span className="font-mono font-extrabold text-emerald-800">
                        {formatCurrency(effectiveSales.total_net)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1">
                      <span>Total Realized (Paid)</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatCurrency(effectiveSales.total_paid)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Outstanding Balance (Due)</span>
                      <span className={`font-mono font-bold ${effectiveSales.total_due > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                        {formatCurrency(effectiveSales.total_due)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Period: {getDateRangeBounds(analyticsDateRange).label}</span>
                  <span className="font-mono">Audit Verified</span>
                </div>
              </div>

              {/* Payment Mode Collections Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CreditCard size={15} className="text-emerald-600" />
                  Payment Methods Breakdown
                </h3>
                {(() => {
                  const totalColl = effectiveSales.total_paid || effectiveSales.total_net || 1;
                  const cashAmt = effectiveSales.payment_breakdown.cash || 0;
                  const upiAmt = effectiveSales.payment_breakdown.upi || 0;
                  const cardAmt = effectiveSales.payment_breakdown.card || 0;
                  const creditAmt = effectiveSales.payment_breakdown.credit_account || effectiveSales.total_due || 0;

                  const cashPct = Math.min(100, Math.round((cashAmt / totalColl) * 100));
                  const upiPct = Math.min(100, Math.round((upiAmt / totalColl) * 100));
                  const cardPct = Math.min(100, Math.round((cardAmt / totalColl) * 100));
                  const creditPct = Math.min(100, Math.round((creditAmt / totalColl) * 100));

                  return (
                    <div className="space-y-3.5 text-xs">
                      {/* Cash */}
                      <div>
                        <div className="flex items-center justify-between mb-1 font-medium">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Cash
                          </span>
                          <span className="font-mono text-slate-800 font-bold">
                            {formatCurrency(cashAmt)} ({cashPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${cashPct}%` }}
                          />
                        </div>
                      </div>

                      {/* UPI / Online */}
                      <div>
                        <div className="flex items-center justify-between mb-1 font-medium">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            UPI / Online / QR
                          </span>
                          <span className="font-mono text-slate-800 font-bold">
                            {formatCurrency(upiAmt)} ({upiPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${upiPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Card POS */}
                      <div>
                        <div className="flex items-center justify-between mb-1 font-medium">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            Card / POS Machine
                          </span>
                          <span className="font-mono text-slate-800 font-bold">
                            {formatCurrency(cardAmt)} ({cardPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all"
                            style={{ width: `${cardPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Udhar / Due */}
                      <div>
                        <div className="flex items-center justify-between mb-1 font-medium">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Credit Account / Udhar
                          </span>
                          <span className="font-mono text-slate-800 font-bold">
                            {formatCurrency(creditAmt)} ({creditPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${creditPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Cancellations & Loss Prevention Audit Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Order Cancellations & Loss Audit
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tracked in real time to prevent cashier theft, unrecorded food voids, and wastage.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block">Voided Orders</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {effectiveSales.cancelled_orders}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block">Lost Billed Value</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    {formatCurrency(effectiveSales.cancelled_lost_revenue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Channel Breakdown + Top Selling Dishes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Channel Distribution */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Filter size={15} className="text-slate-600" />
                  Order Channel Volume
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <UtensilsCrossed size={13} className="text-blue-600" />
                        Dine-In QR / Tables
                      </span>
                      <span className="font-mono text-slate-800">
                        {channelMetrics.dineInCount} ({channelMetrics.dineInPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${channelMetrics.dineInPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <ShoppingBag size={13} className="text-amber-600" />
                        Takeaway / Pickup
                      </span>
                      <span className="font-mono text-slate-800">
                        {channelMetrics.takeawayCount} ({channelMetrics.takeawayPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${channelMetrics.takeawayPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Truck size={13} className="text-purple-600" />
                        Home Delivery
                      </span>
                      <span className="font-mono text-slate-800">
                        {channelMetrics.deliveryCount} ({channelMetrics.deliveryPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${channelMetrics.deliveryPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Selling Dishes Today */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-600" />
                  Top Selling Dishes
                </h3>
                {topSellingItems.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Top dish volume will populate as active orders process today.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topSellingItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-700 font-mono">
                            {item.qty} sold
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            ₹{item.revenue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Accounting Link */}
            <div className="flex justify-end">
              <Link
                to="/pos/reports/daily-sales"
                className="text-xs text-slate-900 hover:text-emerald-700 font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>View Complete Accounting & Tax Ledger in POS</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ─── CUSTOMER RECEIPT PREVIEW MODAL ─── */}
      {receiptModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt size={17} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Customer Receipt #{receiptModalOrder.daily_order_number || receiptModalOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setReceiptModalOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Date & Time:</span>
                <span className="font-medium text-slate-800">
                  {new Date(receiptModalOrder.created_at || Date.now()).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Channel:</span>
                <span className="font-bold text-slate-800 uppercase">
                  {receiptModalOrder.table_name || receiptModalOrder.order_type || "Takeaway"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Customer:</span>
                <span className="font-medium text-slate-800">
                  {receiptModalOrder.customer_name || "Guest Customer"}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="max-h-48 overflow-y-auto space-y-2 border-y border-slate-100 py-3 text-xs">
              {(receiptModalOrder.items || []).map((it: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {it.quantity}x {it.name || it.product_name}
                  </span>
                  <span className="font-mono font-medium">
                    ₹{it.line_total || it.unit_price * (it.quantity || 1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">₹{receiptModalOrder.subtotal || receiptModalOrder.grand_total}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                <span>Grand Total:</span>
                <span className="font-mono">₹{receiptModalOrder.grand_total || receiptModalOrder.net_amount || 0}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReceiptModalOrder(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  printCustomerReceiptDirectly(receiptModalOrder);
                  toast.success("Printing Customer Receipt...");
                }}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PWA INSTALLATION GUIDE MODAL (iOS / Android) ─── */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="text-emerald-600" size={18} />
                <h3 className="text-sm font-bold text-slate-900">
                  Install Owner Hub on Phone
                </h3>
              </div>
              <button
                onClick={() => setShowInstallGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Install SSR One Owner Pocket Hub directly to your mobile home screen:
            </p>

            {/* iOS Safari Steps */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>🍎 iPhone / iPad (Safari)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
                <li>Tap the <strong>Share</strong> button (box with arrow up) at the bottom.</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>"Add"</strong> in the top right.</li>
              </ol>
            </div>

            {/* Android Chrome Steps */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>🤖 Android (Chrome)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
                <li>Tap the <strong>three dots (⋮)</strong> menu in the top-right.</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>Confirm <strong>"Install"</strong>.</li>
              </ol>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={copyMobileLink}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy size={13} />
                <span>{isCopiedLink ? "Copied!" : "Copy Link"}</span>
              </button>

              <button
                onClick={() => setShowInstallGuideModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PWA LUXURY FROSTED BOTTOM DOCK (Mobile only) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-2 md:hidden shadow-lg pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-emerald-50 text-emerald-800 shadow-2xs border border-emerald-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="relative">
              <ShoppingBag size={18} className={activeTab === "orders" ? "text-emerald-700" : ""} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                  {pendingCount}
                </span>
              )}
            </div>
            <span>Live Orders</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-indigo-50 text-indigo-800 shadow-2xs border border-indigo-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp size={18} className={activeTab === "analytics" ? "text-indigo-700" : ""} />
            <span>Sales & Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerPocketDashboardPage;
