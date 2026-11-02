import React, { useState, useEffect, useRef } from "react";
import {
  Utensils,
  UtensilsCrossed,
  Truck,
  Plus,
  Minus,
  Trash2,
  Users,
  CreditCard,
  Banknote,
  Send,
  MoreHorizontal,
  FileText,
  User,
  Edit2,
  Pause,
  Repeat,
  Check,
  Percent,
  ChevronDown,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS, TableItem } from "@/stores/useStaffPOSStore";
import { HoldBillsModal, HeldBill } from "./HoldBillsModal";

interface PosLiveCartProps {
  isSubmitting: boolean;
  onDispatchKOT: () => void;
  onOpenPrintPreview: () => void;
  onOpenCheckout: (paymentMethod?: "cash" | "card" | "upi") => void;
  tables: TableItem[];
  onSwitchTable: (tbl: string) => void;
  waiterName?: string;
  onBackToTables?: () => void;
  openKotsCount?: number;
  onOpenKds?: () => void;
  onMobileBackToMenu?: () => void;
}

export const PosLiveCart: React.FC<PosLiveCartProps> = ({
  isSubmitting,
  onDispatchKOT,
  onOpenPrintPreview,
  onOpenCheckout,
  tables,
  onSwitchTable,
  waiterName = "Aman",
  onBackToTables,
  openKotsCount,
  onOpenKds,
  onMobileBackToMenu,
}) => {
  const store = useStaffPOS();
  const [showTableSelect, setShowTableSelect] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);

  // Customer Management matching user screenshots
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  const mockCustomersList = [
    { name: "Sumit Singh", phone: "9876543210" },
    { name: "Rahul Verma", phone: "9812345678" },
    { name: "Pooja Sharma", phone: "9723456789" },
    { name: "Aman Gupta", phone: "9988776655" },
    { name: "Vikram Malhotra", phone: "9871122334" },
  ];

  const filteredCustomers = mockCustomersList.filter((c) =>
    c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.phone.includes(customerSearchQuery)
  );

  // Packaging charge toggle matching user screenshot
  const [isPackagingChargeEnabled, setIsPackagingChargeEnabled] = useState(false);
  const [packagingFee, setPackagingFee] = useState<number>(20);

  // Discount engine matching user screenshot
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [showAutoRound, setShowAutoRound] = useState(false);
  const [tenderedInput, setTenderedInput] = useState("");
  const discountInputRef = useRef<HTMLInputElement>(null);

  // Apply GST (5%) toggle matching user screenshot
  const [applyGst, setApplyGst] = useState<boolean>(true);

  // Financial calculations matching reference screenshot
  const itemsCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = store.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const discountAmount =
    discountType === "percent"
      ? Math.round((subtotal * (discountVal || 0)) / 100)
      : Math.min(subtotal, discountVal || 0);

  const packagingAmount = isPackagingChargeEnabled ? packagingFee : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount + packagingAmount);
  const taxAmount = applyGst ? Math.round(taxableAmount * 0.05) : 0; // 5% GST
  const netPayable = taxableAmount + taxAmount;

  // Held Bills storage
  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
    try {
      const saved = localStorage.getItem("staff_pos_held_bills");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveHeldBills = (bills: HeldBill[]) => {
    setHeldBills(bills);
    try {
      localStorage.setItem("staff_pos_held_bills", JSON.stringify(bills));
    } catch { }
  };

  const handleHoldCurrentBill = () => {
    if (store.cart.length === 0) return;
    sound.tap();
    const newHeld: HeldBill = {
      id: `hold-${Date.now()}`,
      orderType: store.orderType,
      tableName: store.selectedTable,
      waiterName: waiterName,
      guestCount: store.guestCount,
      heldAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      items: [...store.cart],
      subtotal: subtotal,
      total: netPayable,
    };
    const updated = [newHeld, ...heldBills];
    saveHeldBills(updated);
    store.clearCart();
  };

  // Keyboard Shortcuts (Alt+1: Dine-In, Alt+2: Takeaway, Alt+3: Delivery, Alt+T: Table, Alt+C: Customer, F1-F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        sound.tap();
        store.setOrderType("dine_in");
      } else if (e.altKey && e.key === "2") {
        e.preventDefault();
        sound.tap();
        store.setOrderType("takeaway");
        store.setSelectedTable("Takeaway");
      } else if (e.altKey && e.key === "3") {
        e.preventDefault();
        sound.tap();
        store.setOrderType("delivery");
        store.setSelectedTable("Delivery");
      } else if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        sound.tap();
        setShowTableSelect((prev) => !prev);
      } else if (e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        sound.tap();
        setShowCustomerDropdown((prev) => !prev);
      } else if (e.key === "F1") {
        e.preventDefault();
        handleHoldCurrentBill();
      } else if (e.key === "F2") {
        e.preventDefault();
        if (store.cart.length > 0 && !isSubmitting) {
          onDispatchKOT();
        }
      } else if (e.key === "F3") {
        e.preventDefault();
        if (store.cart.length > 0 && !isSubmitting) {
          onOpenCheckout();
        }
      } else if (e.key === "F4") {
        e.preventDefault();
        discountInputRef.current?.focus();
        discountInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store.cart, isSubmitting, subtotal, netPayable]);

  return (
    <aside className="w-full lg:w-[350px] xl:w-[380px] bg-white border-r border-slate-200 flex flex-col h-full min-h-0 justify-between shrink-0 select-none shadow-sm z-10">
      {/* Mobile Back To Menu Bar (< lg) */}
      {onMobileBackToMenu && (
        <div className="lg:hidden px-2.5 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onMobileBackToMenu}
            className="text-xs font-bold text-slate-800 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs active:scale-95 transition"
          >
            <ChevronLeft size={14} /> Back to Food Menu
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-600">
            {store.selectedTable ? `Table ${store.selectedTable}` : store.orderType.toUpperCase()}
          </span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. TOP ORDER MODE & DESTINATION CONTROLS (EXACT MATCH TO SCREENSHOTS) */}
      {/* ==================================================================== */}
      <div className="p-2 sm:p-2.5 border-b border-slate-200 space-y-2 shrink-0 bg-white">
        {/* ROW 1: MODE BUTTONS (Dine-In Alt+1 | Takeaway Alt+2 | Delivery Alt+3) */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Dine-In Alt+1 */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              store.setOrderType("dine_in");
            }}
            className={`min-h-[34px] px-2 rounded-md text-xs font-medium flex items-center justify-between cursor-pointer transition active:scale-95 border ${
              store.orderType === "dine_in"
                ? "bg-[#0B3B2C] text-white border-[#0B3B2C] shadow-xs font-bold"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <UtensilsCrossed size={13} className={store.orderType === "dine_in" ? "text-white" : "text-slate-500"} />
              <span className="truncate">Dine-In</span>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ml-1 ${store.orderType === "dine_in" ? "text-slate-300" : "text-slate-400"}`}>
              Alt+1
            </span>
          </button>

          {/* Takeaway Alt+2 */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              store.setOrderType("takeaway");
              store.setSelectedTable("Takeaway");
            }}
            className={`min-h-[34px] px-2 rounded-md text-xs font-medium flex items-center justify-between cursor-pointer transition active:scale-95 border ${
              store.orderType === "takeaway"
                ? "bg-[#0B3B2C] text-white border-[#0B3B2C] shadow-xs font-bold"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-slate-400 text-xs">·</span>
              <span className="truncate">Takeaway</span>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ml-1 ${store.orderType === "takeaway" ? "text-slate-300" : "text-slate-400"}`}>
              Alt+2
            </span>
          </button>

          {/* Delivery Alt+3 */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              store.setOrderType("delivery");
              store.setSelectedTable("Delivery");
            }}
            className={`min-h-[34px] px-2 rounded-md text-xs font-medium flex items-center justify-between cursor-pointer transition active:scale-95 border ${
              store.orderType === "delivery"
                ? "bg-[#0B3B2C] text-white border-[#0B3B2C] shadow-xs font-bold"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Truck size={13} className={store.orderType === "delivery" ? "text-white" : "text-slate-500"} />
              <span className="truncate">Delivery</span>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ml-1 ${store.orderType === "delivery" ? "text-slate-300" : "text-slate-400"}`}>
              Alt+3
            </span>
          </button>
        </div>

        {/* ROW 2: DESTINATION / CUSTOMER SELECTION ACCORDING TO MODE */}
        {store.orderType === "dine_in" && (
          <div className="grid grid-cols-2 gap-1.5">
            {/* Select Table Alt+T (Highlighted with warm amber border) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setShowTableSelect(!showTableSelect);
                }}
                className="w-full min-h-[34px] px-2.5 rounded-md bg-white border border-amber-500 text-xs font-normal flex items-center justify-between cursor-pointer hover:bg-amber-50/20 transition shadow-2xs"
              >
                <span className="text-slate-600 truncate">
                  {store.selectedTable && store.selectedTable !== "Takeaway" && store.selectedTable !== "Delivery"
                    ? `Table ${store.selectedTable}`
                    : "Select Table"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 font-medium">
                    Alt+T
                  </span>
                  <ChevronDown size={13} className="text-slate-400" />
                </div>
              </button>

              {/* Table Switch Dropdown */}
              {showTableSelect && (
                <div className="absolute left-0 top-10 z-50 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xl w-64 max-h-56 overflow-y-auto no-scrollbar animate-in fade-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                      Select Table:
                    </span>
                    {onBackToTables && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowTableSelect(false);
                          onBackToTables();
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                      >
                        Floor Plan &gt;
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {tables.map((t) => (
                      <button
                        key={t.id || t.number}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          onSwitchTable(t.number);
                          setShowTableSelect(false);
                        }}
                        className={`min-h-[30px] rounded-md text-xs font-mono font-bold transition cursor-pointer ${
                          store.selectedTable === t.number
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                        }`}
                      >
                        {t.number}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Type cus... Alt+C */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setShowCustomerDropdown(!showCustomerDropdown);
                }}
                className="w-full min-h-[34px] px-2.5 rounded-md bg-white border border-slate-200 text-xs font-normal flex items-center justify-between cursor-pointer hover:bg-slate-50 transition shadow-2xs"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <User size={13} className="text-slate-500 shrink-0" />
                  <span className="text-slate-600 truncate">
                    {selectedCustomer ? `${selectedCustomer.name}` : "Type cus..."}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 font-medium">
                    Alt+C
                  </span>
                  <ChevronDown size={13} className="text-slate-400" />
                </div>
              </button>
            </div>
          </div>
        )}

        {store.orderType === "takeaway" && (
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setShowCustomerDropdown(!showCustomerDropdown);
              }}
              className="w-full min-h-[34px] px-2.5 rounded-md bg-white border border-slate-200 text-xs font-normal flex items-center justify-between cursor-pointer hover:bg-slate-50 transition shadow-2xs"
            >
              <div className="flex items-center gap-1.5 truncate">
                <User size={13} className="text-slate-500 shrink-0" />
                <span className="text-slate-600 truncate">
                  {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : "Type customer... (Alt+C)"}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 font-medium">
                  Alt+C
                </span>
                <ChevronDown size={13} className="text-slate-400" />
              </div>
            </button>
          </div>
        )}

        {store.orderType === "delivery" && (
          <div className="space-y-1.5">
            {/* Full-width bar with Amber border */}
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setShowCustomerDropdown(!showCustomerDropdown);
                }}
                className="w-full min-h-[34px] px-2.5 rounded-md bg-white border border-amber-500 text-xs font-normal flex items-center justify-between cursor-pointer hover:bg-amber-50/20 transition shadow-2xs"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <User size={13} className="text-slate-500 shrink-0" />
                  {selectedCustomer ? (
                    <span className="text-slate-800 font-medium truncate">
                      {selectedCustomer.name} ({selectedCustomer.phone})
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 truncate">
                      <AlertTriangle size={13} className="text-amber-500 fill-amber-300 shrink-0" />
                      <span className="text-slate-600 truncate">Customer required for delivery...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 font-medium">
                    Alt+C
                  </span>
                  <ChevronDown size={13} className="text-slate-400" />
                </div>
              </button>
            </div>

            {/* Warning Alert Box when customer not set */}
            {!selectedCustomer && (
              <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-md px-2.5 py-2 flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-1.5 text-[#e11d48] text-xs font-medium leading-tight">
                  <AlertTriangle size={13} className="text-amber-500 fill-amber-300 shrink-0" />
                  <span>Customer Name &amp; Mobile Number are <span className="font-bold">REQUIRED</span> for Delivery orders.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setShowAddCustomerModal(true);
                  }}
                  className="px-2.5 py-1 rounded bg-[#ffe4e6] hover:bg-[#fecdd3] text-[#e11d48] border border-[#fecdd3] font-medium text-xs cursor-pointer whitespace-nowrap transition active:scale-95 shrink-0 ml-2"
                >
                  + Add Customer
                </button>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER SEARCH DROPDOWN POPOVER */}
        {showCustomerDropdown && (
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Select Customer:
              </span>
              <button
                type="button"
                onClick={() => setShowCustomerDropdown(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              placeholder="Search by name or mobile..."
              className="w-full h-7 px-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />

            <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {filteredCustomers.map((cust) => (
                <button
                  key={cust.phone}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setSelectedCustomer(cust);
                    setShowCustomerDropdown(false);
                  }}
                  className="w-full text-left p-1.5 rounded hover:bg-slate-50 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="font-bold text-slate-900">{cust.name}</span>
                  <span className="font-mono text-slate-500 text-[11px]">{cust.phone}</span>
                </button>
              ))}
            </div>

            <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setSelectedCustomer(null);
                  setShowCustomerDropdown(false);
                }}
                className="text-[10px] text-slate-500 hover:text-slate-700 underline"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setShowCustomerDropdown(false);
                  setShowAddCustomerModal(true);
                }}
                className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                + New Customer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. ORDER ITEMS TABLE HEADER & LIST (Matching Exact Reference Screenshot) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-1 px-3 py-1.5 bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono font-bold text-slate-600 uppercase">
          <span className="col-span-1 text-center">#</span>
          <span className="col-span-5">Item Name</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Price</span>
          <span className="col-span-2 text-right">Total</span>
        </div>

        {/* Scrollable Item Rows */}
        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100">
          {store.cart.length === 0 ? (
            <div className="py-20 text-center space-y-1.5 text-slate-400">
              <Utensils size={32} className="mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-xs text-slate-600">Cart is empty</p>
              <p className="text-[11px] text-slate-400">Select dishes from the menu to start order.</p>
            </div>
          ) : (
            store.cart.map((item, idx) => {
              const itemTotal = item.unitPrice * item.quantity;
              return (
                <div
                  key={item.cartKey}
                  className="grid grid-cols-12 gap-1 items-center px-3 py-2 hover:bg-slate-50 transition group"
                >
                  {/* # Index */}
                  <span className="col-span-1 text-center text-xs font-mono font-bold text-slate-400">
                    {idx + 1}
                  </span>

                  {/* Thumbnail & Item Name */}
                  <div className="col-span-5 flex items-center gap-2 min-w-0 pr-1">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 rounded-md object-cover shrink-0 border border-slate-200 shadow-2xs"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      {item.selectedVariant && (
                        <p className="text-[10px] text-emerald-700 font-mono font-semibold truncate leading-tight">
                          {item.selectedVariant.name}
                        </p>
                      )}
                      {item.kitchenNote && (
                        <p className="text-[10px] text-amber-600 font-mono truncate leading-tight">
                          {item.kitchenNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Qty Stepper [- 1 +] */}
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => store.updateQuantity(item.cartKey, -1)}
                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-mono font-black text-xs text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => store.updateQuantity(item.cartKey, 1)}
                      className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Unit Price */}
                  <span className="col-span-2 text-right text-xs font-mono font-medium text-slate-600">
                    {item.unitPrice}
                  </span>

                  {/* Total & Trash Button */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {itemTotal}
                    </span>
                    <button
                      type="button"
                      onClick={() => store.updateQuantity(item.cartKey, -item.quantity)}
                      title="Remove item"
                      className="text-rose-400 hover:text-rose-600 p-0.5 cursor-pointer opacity-70 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. TOTALS, FINANCIALS & ACTIONS (EXACT MATCH TO USER'S SCREENSHOT)    */}
      {/* ==================================================================== */}
      <div className="border-t border-slate-200 p-3 bg-white space-y-2 shrink-0">
        <div className="space-y-1.5 text-xs">
          {/* Subtotal */}
          <div className="flex justify-between items-center text-slate-700">
            <span className="font-medium text-slate-800 text-[13px]">Subtotal</span>
            <span className="font-mono font-bold text-slate-900 text-sm">₹{subtotal}</span>
          </div>

          {/* Packaging Charge Checkbox */}
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none text-slate-800">
              <input
                type="checkbox"
                checked={isPackagingChargeEnabled}
                onChange={(e) => setIsPackagingChargeEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
              />
              <span className="text-slate-800">Packaging Charge</span>
            </label>
            <span className={`font-mono text-xs ${isPackagingChargeEnabled ? "font-bold text-slate-900" : "italic text-slate-400"}`}>
              {isPackagingChargeEnabled ? `+₹${packagingFee}` : "Disabled (₹0)"}
            </span>
          </div>

          {/* Discount with F4 Badge, [ ₹ | % ] Toggle, Auto-Round, and Input */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <span className="font-medium text-slate-800">Discount</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-300 text-[9px] font-mono font-bold text-slate-600">
                F4
              </span>
              <div className="flex bg-slate-100 rounded border border-slate-300 p-0.5 ml-0.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setDiscountType("fixed");
                  }}
                  className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded cursor-pointer ${
                    discountType === "fixed" ? "bg-[#0B3B2C] text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ₹
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setDiscountType("percent");
                  }}
                  className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded cursor-pointer ${
                    discountType === "percent" ? "bg-[#0B3B2C] text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  %
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowAutoRound(!showAutoRound)}
                className="text-[11px] text-teal-800 hover:underline font-bold cursor-pointer ml-1"
              >
                Auto-Round
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                ref={discountInputRef}
                type="number"
                min={0}
                max={discountType === "percent" ? 50 : subtotal}
                value={discountVal || ""}
                onChange={(e) => setDiscountVal(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-16 h-7 px-2 text-right rounded-md border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              {discountAmount > 0 && (
                <span className="text-[10px] font-mono font-bold text-rose-600">
                  (-₹{discountAmount})
                </span>
              )}
            </div>
          </div>

          {/* Auto-Round Drawer / Helper */}
          {showAutoRound && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg space-y-1 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 text-[11px]">Customer Cash Paid:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 200"
                    value={tenderedInput}
                    onChange={(e) => setTenderedInput(e.target.value)}
                    className="w-16 h-6 px-1 text-right rounded border border-amber-300 bg-white font-mono font-bold text-xs"
                  />
                </div>
              </div>
              {Number(tenderedInput) > 0 && (subtotal + taxAmount) > Number(tenderedInput) && (
                <button
                  type="button"
                  onClick={() => {
                    const diff = Math.max(0, (subtotal + taxAmount) - Number(tenderedInput));
                    setDiscountType("fixed");
                    setDiscountVal(diff);
                    setShowAutoRound(false);
                    setTenderedInput("");
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold py-1 px-2 rounded cursor-pointer text-center transition"
                >
                  Adjust ₹{((subtotal + taxAmount) - Number(tenderedInput)).toFixed(0)} round-off discount (Net: ₹{tenderedInput})
                </button>
              )}
            </div>
          )}

          {/* Apply GST (5%) Checkbox */}
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none text-slate-800">
              <input
                type="checkbox"
                checked={applyGst}
                onChange={(e) => setApplyGst(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
              />
              <span className="text-slate-800">Apply GST (5%)</span>
            </label>
            <span className={`font-mono text-xs ${applyGst ? "font-bold text-slate-900" : "text-slate-400 line-through"}`}>
              ₹{taxAmount}
            </span>
          </div>
        </div>

        {/* Net Payable Row */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <span className="text-base font-black text-slate-900 tracking-tight">Net Payable</span>
          <span className="text-xl font-black font-mono text-slate-900">
            ₹{netPayable}
          </span>
        </div>

        {/* Operational Action Buttons Row matching exact image: [F1] Hold | [F2] Send KOT > | [F3] PAY & PRINT */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {/* [F1] Hold */}
          <button
            type="button"
            disabled={store.cart.length === 0}
            onClick={handleHoldCurrentBill}
            className="min-h-[42px] px-1 rounded-lg bg-[#f8fafc] hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95 disabled:opacity-40 shadow-2xs relative"
            title="Hold Bill (F1)"
          >
            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[9px] font-extrabold text-slate-700 shrink-0">
              F1
            </span>
            <div className="flex items-center gap-0.5 text-slate-500 font-bold">
              <div className="w-0.5 h-3 bg-slate-500 rounded-full" />
              <div className="w-0.5 h-3 bg-slate-500 rounded-full" />
            </div>
            <span>Hold</span>
            {heldBills.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {heldBills.length}
              </span>
            )}
          </button>

          {/* [F2] Send KOT > */}
          <button
            type="button"
            disabled={store.cart.length === 0 || isSubmitting}
            onClick={() => {
              sound.tap();
              onDispatchKOT();
            }}
            className="min-h-[42px] px-1 rounded-lg bg-[#64748b] hover:bg-[#526173] text-white font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 disabled:opacity-40 shadow-xs"
            title="Send KOT to Kitchen (F2)"
          >
            <span className="px-1.5 py-0.5 rounded bg-black/20 border border-white/20 font-mono text-[9px] font-extrabold text-white shrink-0">
              F2
            </span>
            <span>Send KOT</span>
            <ChevronRight size={13} />
          </button>

          {/* [F3] PAY & PRINT */}
          <button
            type="button"
            disabled={store.cart.length === 0 || isSubmitting}
            onClick={() => {
              sound.tap();
              onOpenCheckout();
            }}
            className="min-h-[42px] px-1 rounded-lg bg-[#52b788] hover:bg-[#40916c] text-white font-black text-xs uppercase tracking-tight flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 disabled:opacity-40 shadow-xs"
            title="Pay & Print Bill (F3)"
          >
            <span className="px-1.5 py-0.5 rounded bg-black/20 border border-white/20 font-mono text-[9px] font-extrabold text-white shrink-0">
              F3
            </span>
            <CheckCircle2 size={13} className="shrink-0" />
            <span>PAY &amp; PRINT</span>
          </button>
        </div>
      </div>

      {/* Held Bills Modal */}
      {showHoldModal && (
        <HoldBillsModal
          isOpen={showHoldModal}
          onClose={() => setShowHoldModal(false)}
          heldBills={heldBills}
          onRecall={(bill) => {
            sound.tap();
            store.setOrderType(bill.orderType as any);
            store.setSelectedTable(bill.tableName);
            store.setGuestCount(bill.guestCount);
            store.clearCart();
            bill.items.forEach((it) => {
              store.addToCart({
                id: it.id,
                name: it.name,
                unitPrice: it.unitPrice,
                isVeg: it.isVeg,
                image: it.image,
                selectedVariant: it.selectedVariant,
                selectedAddons: it.selectedAddons,
                kitchenNote: it.kitchenNote,
              });
            });
            const updated = heldBills.filter((b) => b.id !== bill.id);
            saveHeldBills(updated);
            setShowHoldModal(false);
          }}
          onDelete={(id) => {
            const updated = heldBills.filter((b) => b.id !== id);
            saveHeldBills(updated);
          }}
        />
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-2xl space-y-3 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <User size={15} className="text-emerald-600" />
                <span>Add Customer for Order</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Sumit Singh"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newCustName.trim() || !newCustPhone.trim()}
                onClick={() => {
                  sound.tap();
                  setSelectedCustomer({ name: newCustName.trim(), phone: newCustPhone.trim() });
                  setNewCustName("");
                  setNewCustPhone("");
                  setShowAddCustomerModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#0B3B2C] hover:bg-[#072E22] text-white text-xs font-black cursor-pointer shadow-xs disabled:opacity-40"
              >
                Save &amp; Select
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
