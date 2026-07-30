/**
 * The Baithak – Main Dashboard Page
 * High-fidelity, premium interactive dashboard.
 * Theme-aware layout (fully light in light theme, fully dark in dark theme).
 */
import { useState, useMemo } from "react";
import { useOrders } from "@/modules/pos";

import {
  DollarSign, ShoppingCart, Hotel,
  TrendingUp, Calendar,
  ChevronDown, Send, ArrowRight, Activity
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from "recharts";
import { useAuthStore } from "@/app/providers/auth-store";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";

// Mock Data for KPI Mini-charts
const MINI_CHART_DATA = {
  revenue: [
    { value: 30 }, { value: 35 }, { value: 32 }, { value: 45 },
    { value: 40 }, { value: 48 }, { value: 55 }, { value: 50 }, { value: 65 }
  ],
  orders: [
    { value: 100 }, { value: 110 }, { value: 105 }, { value: 120 },
    { value: 115 }, { value: 130 }, { value: 125 }, { value: 135 }, { value: 145 }
  ],
  bookings: [
    { value: 15 }, { value: 18 }, { value: 16 }, { value: 22 },
    { value: 20 }, { value: 25 }, { value: 23 }, { value: 28 }, { value: 32 }
  ],
  occupancy: [
    { value: 70 }, { value: 72 }, { value: 71 }, { value: 76 },
    { value: 75 }, { value: 78 }, { value: 80 }, { value: 79 }, { value: 82 }
  ],
  profit: [
    { value: 8 }, { value: 9 }, { value: 8.5 }, { value: 10 },
    { value: 9.8 }, { value: 11 }, { value: 10.5 }, { value: 12 }, { value: 13 }
  ],
};

// Main Revenue Overview Chart Data
const REVENUE_OVERVIEW_DATA = [
  { name: "01 Jun", revenue: 15000 },
  { name: "03 Jun", revenue: 18000 },
  { name: "05 Jun", revenue: 14000 },
  { name: "07 Jun", revenue: 22000 },
  { name: "09 Jun", revenue: 19000 },
  { name: "11 Jun", revenue: 25000 },
  { name: "13 Jun", revenue: 21000 },
  { name: "15 Jun", revenue: 32000 },
  { name: "17 Jun", revenue: 28000 },
  { name: "19 Jun", revenue: 35000 },
  { name: "21 Jun", revenue: 30000 },
  { name: "23 Jun", revenue: 42000 },
  { name: "25 Jun", revenue: 38000 },
  { name: "27 Jun", revenue: 48000 },
  { name: "30 Jun", revenue: 45783 },
];

// Business Overview Donut Chart Data
const BUSINESS_OVERVIEW_DATA = [
  { name: "Restaurant", value: 520, percentage: "41.9%", color: "#10B981" },
  { name: "Hotel", value: 320, percentage: "25.8%", color: "#3B82F6" },
  { name: "PG / Hostels", value: 210, percentage: "16.9%", color: "#E67E22" },
  { name: "Sweet Shop", value: 120, percentage: "9.7%", color: "#8B5CF6" },
  { name: "Bakery", value: 73, percentage: "5.7%", color: "#EC4899" },
];

// Recent Orders
const RECENT_ORDERS = [
  { id: "#ORD-001243", outlet: "Baithak Cafe", customer: "Rahul Verma", amount: "₹2,450", status: "Completed", statusStyle: "bg-success/15 text-success border-success/20" },
  { id: "#ORD-001242", outlet: "The Baithak Restro", customer: "Sneha Kapoor", amount: "₹1,850", status: "In Progress", statusStyle: "bg-info/15 text-info border-info/20" },
  { id: "#ORD-001241", outlet: "Baithak Sweets", customer: "Amit Sharma", amount: "₹3,200", status: "Completed", statusStyle: "bg-success/15 text-success border-success/20" },
  { id: "#ORD-001240", outlet: "Cloud Kitchen", customer: "Zomato Order", amount: "₹1,120", status: "Preparing", statusStyle: "bg-warning/15 text-warning border-warning/20" },
  { id: "#ORD-001239", outlet: "Baithak Cafe", customer: "Priya Mehta", amount: "₹990", status: "Completed", statusStyle: "bg-success/15 text-success border-success/20" },
];

export function DashboardPage() {
  const { user } = useAuthStore();
  const isMock = isMockSession();
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "system",
      text: "Good morning, Sumit! ☀️ I've analyzed your business and here are some insights."
    }
  ]);

  // Dynamic calculations from live PostgreSQL database
  const { data: dbOrdersResponse } = useOrders({ page: 1 });
  const orders = useMemo(() => {
    if (dbOrdersResponse?.items && dbOrdersResponse.items.length > 0) {
      return dbOrdersResponse.items;
    }
    return isMock ? mockDB.get<any>("orders") : [];
  }, [dbOrdersResponse, isMock]);

  const invoices = isMock ? mockDB.get<any>("invoices") : [];

  const rooms = isMock ? mockDB.get<any>("rooms") : [];
  const residents = isMock ? mockDB.get<any>("residents") : [];

  const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
  const totalOrders = orders.length;
  const totalBookingsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter((r: any) => r.status === "occupied" || r.status === "dirty").length;
  const occupancyPercentage = rooms.length > 0 ? Math.round((occupiedRoomsCount / rooms.length) * 100) : 0;
  const todaysProfit = Math.round(totalRevenue * 0.27);

  // Dynamic Recent Orders List
  const recentOrders = orders.length > 0 ? orders.slice(-5).reverse().map((ord: any) => {
    const subtotal = ord.subtotal || 0;
    const tax = ord.total_tax || 0;
    const total = ord.grand_total || (subtotal + tax);
    return {
      id: ord.order_number || `#ORD-${ord.id}`,
      outlet: ord.branch_id || "Main Branch",
      customer: ord.notes || "Walk-in Customer",
      amount: `₹${total.toLocaleString()}`,
      status: ord.status || "Completed",
      statusStyle: ord.status === "completed" || ord.status === "paid"
        ? "bg-success/15 text-success border-success/20"
        : ord.status === "preparing"
          ? "bg-warning/15 text-warning border-warning/20"
          : "bg-info/15 text-info border-info/20"
    };
  }) : [
    { id: "No Data", outlet: "N/A", customer: "N/A", amount: "₹0", status: "None", statusStyle: "bg-muted text-muted-foreground border-border" }
  ];

  // Dynamic Revenue Trend Chart Data (last 15 invoices or empty/default structure)
  const revenueOverview = invoices.length > 0 ? invoices.slice(-15).map((inv: any, i: number) => ({
    name: inv.date ? inv.date.slice(5) : `Inv-${i}`,
    revenue: inv.amount || 0
  })) : [
    { name: "01 Jun", revenue: 0 },
    { name: "15 Jun", revenue: 0 },
    { name: "30 Jun", revenue: 0 }
  ];

  // Dynamic Business Overview allocation
  const businessOverview = [
    { name: "Restaurant", value: orders.filter((o: any) => o.order_type === "dine_in" || o.order_type === "takeaway").length, percentage: "0%", color: "#10B981" },
    { name: "Hotel", value: rooms.length, percentage: "0%", color: "#3B82F6" },
    { name: "PG / Hostels", value: residents.length, percentage: "0%", color: "#E67E22" },
    { name: "Sweets & Bakery", value: orders.filter((o: any) => o.order_type === "delivery").length, percentage: "0%", color: "#8B5CF6" },
  ];
  const totalOverviewCount = businessOverview.reduce((sum, item) => sum + item.value, 0);
  businessOverview.forEach(item => {
    item.percentage = totalOverviewCount > 0 ? `${Math.round((item.value / totalOverviewCount) * 100)}%` : "0%";
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsgs = [...chatMessages, { sender: "user", text: chatInput }];
    setChatMessages(newMsgs);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "system",
          text: "I am analyzing the latest transactions to answer your request. All POS pipelines are operational!"
        }
      ]);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-background text-foreground transition-colors duration-300 animate-in fade-in duration-200">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
            Welcome back, {user?.first_name ?? "Sumit Singh"}! 👋
          </h1>
          <p className="text-muted-foreground text-xs font-bold">
            Here's what's happening across your hospitality ecosystem today.
          </p>
        </div>

        {/* Date and Business picker */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <span>All Businesses</span>
            <ChevronDown size={14} />
          </button>

          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Calendar size={14} />
            <span>28 June 2026 - Saturday</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* 5-Column KPI Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Total Revenue */}
        <div className="kpi-card bg-card border border-border rounded-xl p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden shadow-xs transition-all">
          <div className="flex items-start justify-between mb-2">
            <p className="text-3xs font-extrabold text-muted-foreground dark:text-white/40 tracking-widest uppercase">Total Revenue</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-foreground dark:text-white">₹ {totalRevenue.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
              <TrendingUp size={11} /> 12.5% <span className="text-muted-foreground dark:text-white/40 font-normal">vs yesterday</span>
            </span>
          </div>
          <div className="h-[35px] w-full absolute bottom-0 left-0 right-0 opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MINI_CHART_DATA.revenue} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={1.5} fillOpacity={0.1} fill="#10B981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Orders */}
        <div className="kpi-card bg-card border border-border rounded-xl p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden shadow-xs transition-all">
          <div className="flex items-start justify-between mb-2">
            <p className="text-3xs font-extrabold text-muted-foreground dark:text-white/40 tracking-widest uppercase">Total Orders</p>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-foreground dark:text-white">{totalOrders.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
              <TrendingUp size={11} /> 8.2% <span className="text-muted-foreground dark:text-white/40 font-normal">vs yesterday</span>
            </span>
          </div>
          <div className="h-[35px] w-full absolute bottom-0 left-0 right-0 opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MINI_CHART_DATA.orders} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={0.1} fill="#3B82F6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="kpi-card bg-card border border-border rounded-xl p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden shadow-xs transition-all">
          <div className="flex items-start justify-between mb-2">
            <p className="text-3xs font-extrabold text-muted-foreground dark:text-white/40 tracking-widest uppercase">Total Bookings</p>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
              <Calendar size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-foreground dark:text-white">{totalBookingsCount.toLocaleString()}</h3>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold flex items-center gap-1 mt-1">
              <TrendingUp size={11} /> 5.6% <span className="text-muted-foreground dark:text-white/40 font-normal">vs yesterday</span>
            </span>
          </div>
          <div className="h-[35px] w-full absolute bottom-0 left-0 right-0 opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MINI_CHART_DATA.bookings} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={1.5} fillOpacity={0.1} fill="#6366F1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy */}
        <div className="kpi-card bg-card border border-border rounded-xl p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden shadow-xs transition-all">
          <div className="flex items-start justify-between mb-2">
            <p className="text-3xs font-extrabold text-muted-foreground dark:text-white/40 tracking-widest uppercase">Occupancy (Hotel)</p>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Hotel size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-foreground dark:text-white">{occupancyPercentage}%</h3>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
              <TrendingUp size={11} /> 3.4% <span className="text-muted-foreground dark:text-white/40 font-normal">vs yesterday</span>
            </span>
          </div>
          <div className="h-[35px] w-full absolute bottom-0 left-0 right-0 opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MINI_CHART_DATA.occupancy} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#E67E22" strokeWidth={1.5} fillOpacity={0.1} fill="#E67E22" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Profit (Glowing Violet Card highlight) */}
        <div className="kpi-card bg-card dark:bg-violet-500/5 border-2 border-violet-500/35 dark:border-violet-500/50 shadow-md dark:shadow-[0_0_15px_rgba(139,92,246,0.15)] rounded-xl p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden transition-all">
          <div className="flex items-start justify-between mb-2">
            <p className="text-3xs font-extrabold text-violet-600 dark:text-violet-400 tracking-widest uppercase">Today's Profit</p>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center text-violet-500 dark:text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <Activity size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-foreground dark:text-white">₹ {todaysProfit.toLocaleString()}</h3>
            <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1 mt-1">
              <TrendingUp size={11} /> 9.8% <span className="text-muted-foreground dark:text-white/40 font-normal">vs yesterday</span>
            </span>
          </div>
          <div className="h-[35px] w-full absolute bottom-0 left-0 right-0 opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MINI_CHART_DATA.profit} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={1.5} fillOpacity={0.1} fill="#8B5CF6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Main Charts & B-Thak AI Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Revenue Overview (Violet line glow chart) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-sm text-foreground dark:text-white">Revenue Overview</h3>
              <p className="text-[10px] text-muted-foreground dark:text-white/40 mt-0.5 font-bold">Monthly transaction trends</p>
            </div>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
              <span>This Month</span>
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Overview Donut Chart */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-sm text-foreground dark:text-white">Business Overview</h3>
              <p className="text-[10px] text-muted-foreground dark:text-white/40 mt-0.5 font-bold">Vertical allocation</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center relative h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={businessOverview}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {businessOverview.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black font-display text-foreground dark:text-white">{totalOverviewCount}</span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground dark:text-white/35 font-bold">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground dark:text-white/60">
            {businessOverview.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Live Operations Widget */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm transition-all">
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-sm text-foreground dark:text-white">Live Operations</h3>
            <p className="text-[10px] text-muted-foreground dark:text-white/40 mt-0.5 font-bold">Real-time status of ecosystems</p>
          </div>

          <div className="space-y-3 my-4">
            {[
              { label: "Kitchen Display System", count: "Active Orders: 24", status: "Live", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
              { label: "Front Desk", count: "Check-ins Today: 18", status: "Active", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
              { label: "Housekeeping", count: "Rooms to Clean: 14", status: "Active", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
              { label: "POS Terminals", count: "Online: 8 / 10", status: "Online", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
            ].map((op, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs border-b border-border pb-2">
                <div>
                  <p className="font-bold text-foreground dark:text-white/80">{op.label}</p>
                  <p className="text-[10px] text-muted-foreground dark:text-white/40 mt-0.5">{op.count}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${op.color}`}>
                  {op.status}
                </span>
              </div>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors uppercase tracking-wider pt-1">
            <span>View All Live Operations</span>
            <ArrowRight size={12} />
          </button>
        </div>

      </div>

      {/* B-THAK AI assistant chat box */}
      <div className="bg-gradient-to-r from-violet-500/5 to-indigo-500/5 dark:from-[#0C0F1A] dark:to-[#120F1C] border border-violet-500/20 dark:border-violet-500/30 rounded-xl p-5 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[0_4px_30px_rgba(139,92,246,0.05)] transition-all">

        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white text-lg font-black font-display shadow-[0_0_12px_rgba(139,92,246,0.5)]">
            B
          </div>
          <div>
            <h4 className="font-display font-extrabold text-sm text-foreground dark:text-white flex items-center gap-1.5">
              B-THAK AI <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 tracking-wider uppercase bg-violet-500/10 px-1.5 py-0.5 rounded">Assistant</span>
            </h4>
            <p className="text-xs text-muted-foreground dark:text-white/60 mt-1 leading-relaxed max-w-xl font-bold">
              "Good morning, Sumit! I've analyzed your business and here are some key insights: Revenue is 12.5% higher than yesterday, 7 rooms are due for checkout, and Paneer stock is low."
            </p>
          </div>
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2 w-full lg:w-96">
          <input
            type="text"
            placeholder="Ask B-Thak AI anything..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-background dark:bg-black/40 border border-border dark:border-violet-500/30 rounded-lg px-4 py-2.5 text-xs text-foreground dark:text-white placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors shadow-lg shadow-violet-600/20"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
      {/* Grid: Recent Orders, Occupancy, Today's Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Recent Orders Table */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-sm text-foreground dark:text-white">Recent Orders</h3>
            <span className="text-[10px] font-bold text-muted-foreground dark:text-white/40 cursor-pointer hover:text-foreground dark:hover:text-white uppercase tracking-wider">View All</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="text-muted-foreground dark:text-white/40 border-b border-border pb-2 text-[10px] tracking-wider uppercase">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Outlet</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((ord, idx) => (
                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 text-foreground dark:text-white">{ord.id}</td>
                    <td className="py-3 text-muted-foreground dark:text-white/60">{ord.outlet}</td>
                    <td className="py-3 text-muted-foreground dark:text-white/60">{ord.customer}</td>
                    <td className="py-3 text-foreground dark:text-white font-bold">{ord.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${ord.statusStyle}`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Occupancy Arc chart */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-md transition-all">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-sm text-foreground dark:text-white">Occupancy (Hotel)</h3>
            <span className="text-[10px] font-bold text-muted-foreground dark:text-white/40 cursor-pointer hover:text-foreground dark:hover:text-white uppercase tracking-wider">View All</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[160px]">
            <ResponsiveContainer width="100%" height="140">
              <RadialBarChart
                cx="50%"
                cy="100%"
                innerRadius="80%"
                outerRadius="100%"
                barSize={12}
                data={[{ name: "Occupancy", value: occupancyPercentage }]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={6}
                  fill="#10B981"
                />
              </RadialBarChart>
            </ResponsiveContainer>

            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-3xl font-black font-display text-foreground dark:text-white">{occupancyPercentage}%</span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground dark:text-white/40 font-bold">Occupied</span>
            </div>
          </div>

          <div className="flex justify-around border-t border-border pt-3 text-[10px] font-bold text-muted-foreground dark:text-white/60">
            <div className="text-center">
              <p className="text-muted-foreground dark:text-white/40">Occupied</p>
              <p className="font-black text-foreground dark:text-white mt-0.5">{occupiedRoomsCount} Rooms</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground dark:text-white/40">Available</p>
              <p className="font-black text-foreground dark:text-white mt-0.5">{rooms.length - occupiedRoomsCount} Rooms</p>
            </div>
          </div>
        </div>

        {/* Today's Activities Timeline */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-sm text-foreground dark:text-white">Today's Activities</h3>
            <span className="text-[10px] font-bold text-muted-foreground dark:text-white/40 cursor-pointer hover:text-foreground dark:hover:text-white uppercase tracking-wider">View All</span>
          </div>

          <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-border">
            {[
              { title: "New booking received", desc: "Deluxe Room - Rm #205", time: "10:32 AM", color: "bg-emerald-500 text-emerald-400" },
              { title: "Order #ORD-001243 completed", desc: "Baithak Cafe", time: "09:58 AM", color: "bg-emerald-500 text-emerald-400" },
              { title: "Inventory updated", desc: "Paneer received - 25kg", time: "09:45 AM", color: "bg-amber-500 text-amber-400" },
              { title: "Payment received", desc: "₹12,500 from Amit Sharma", time: "09:30 AM", color: "bg-indigo-500 text-indigo-400" },
            ].map((act, idx) => (
              <div key={idx} className="flex gap-4 items-start relative pl-1">
                <div className="w-7 h-7 rounded-full bg-muted/80 dark:bg-white/5 flex items-center justify-center text-xs flex-shrink-0 z-10 border border-card">
                  <div className={`w-2 h-2 rounded-full ${act.color.split(" ")[1] || act.color.split(" ")[0]}`} />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground dark:text-white/90">{act.title}</p>
                    <span className="text-[10px] text-muted-foreground dark:text-white/30">{act.time}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground dark:text-white/50 mt-0.5">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row: AI Insights pulsing brain and 100% System Health indicator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* AI Insights pulsing neural brain widget */}
        <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 dark:from-[#0B0F1A] dark:to-[#120D22] border border-violet-500/20 dark:border-violet-500/25 rounded-xl p-5 flex items-center justify-between shadow-md transition-all">
          <div className="space-y-4 flex-1">
            <div>
              <h3 className="font-display font-extrabold text-sm text-foreground dark:text-white">AI Insights</h3>
              <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider mt-0.5">Powered by B-Thak AI</p>
            </div>

            <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed max-w-sm font-bold">
              We've identified a 12.5% revenue surge and low inventory on paneer. Tap below to launch full recommendations.
            </p>

            <button className="flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors uppercase tracking-wider pt-2">
              <span>View All Insights</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex-shrink-0 pr-4">
            <svg className="w-24 h-24 text-violet-500 filter drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="opacity-40" />
              <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" className="opacity-60" />
              <path d="M 30 50 Q 40 30 50 30 Q 60 30 70 50 Q 60 70 50 70 Q 40 70 30 50 Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 40 50 Q 45 40 50 40 Q 55 40 60 50 Q 55 60 50 60 Q 45 60 40 50 Z" stroke="currentColor" strokeWidth="1" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-40" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-40" />
              <circle cx="50" cy="30" r="2" fill="currentColor" />
              <circle cx="50" cy="70" r="2" fill="currentColor" />
              <circle cx="30" cy="50" r="2" fill="currentColor" />
              <circle cx="70" cy="50" r="2" fill="currentColor" />
              <circle cx="50" cy="50" r="4.5" fill="#8B5CF6" />
            </svg>
          </div>
        </div>

        {/* System Health Circular widget */}
        <div className="bg-card dark:bg-[#07120E] border border-border dark:border-[#163025] rounded-xl p-5 flex items-center justify-between shadow-md transition-all">
          <div className="space-y-3">
            <div>
              <h3 className="font-display font-extrabold text-sm text-foreground dark:text-white">System Health</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Ecosystem Status</p>
            </div>
            <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed max-w-xs font-bold">
              Excellent – All pipelines, databases, and microservices are operating with zero latencies.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center w-24 h-24 mr-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="6" className="text-muted/30 dark:text-[#163025]" fill="transparent" />
              <circle cx="48" cy="48" r="38" stroke="#10B981" strokeWidth="6" fill="transparent"
                strokeDasharray="239" strokeDashoffset="0" className="filter drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-foreground dark:text-white leading-none">100%</span>
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-0.5">Online</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Metrics Sparklines row (6 columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Avg. Order Value", val: "₹ 1,850", change: "+8.5%", trend: "up", chart: MINI_CHART_DATA.revenue, color: "#10B981" },
          { label: "Repeat Customers", val: "68%", change: "+12.3%", trend: "up", chart: MINI_CHART_DATA.orders, color: "#10B981" },
          { label: "Customer Satisfaction", val: "4.8/5", change: "+5.2%", trend: "up", chart: MINI_CHART_DATA.bookings, color: "#10B981" },
          { label: "Food Cost %", val: "28.5%", change: "-2.1%", trend: "down", chart: MINI_CHART_DATA.profit, color: "#EF4444" },
          { label: "Labor Cost %", val: "18.2%", change: "-1.3%", trend: "down", chart: MINI_CHART_DATA.occupancy, color: "#EF4444" },
          { label: "Gross Profit Margin", val: "62.3%", change: "+6.8%", trend: "up", chart: MINI_CHART_DATA.profit, color: "#10B981" },
        ].map((item, idx) => (
          <div key={idx} className="bg-card dark:bg-[#07120E] border border-border dark:border-[#163025] rounded-xl p-3 flex flex-col justify-between min-h-[90px] relative overflow-hidden shadow-card transition-all">
            <div>
              <p className="text-[9px] font-bold text-muted-foreground dark:text-white/40 uppercase tracking-wider truncate">{item.label}</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-base font-black text-foreground dark:text-white">{item.val}</span>
                <span className={`text-[9px] font-extrabold ${item.trend === "up" ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {item.change}
                </span>
              </div>
            </div>

            <div className="h-[25px] w-full absolute bottom-0 left-0 right-0 opacity-30">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={item.chart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="value" stroke={item.color} strokeWidth={1} fillOpacity={0.05} fill={item.color} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
