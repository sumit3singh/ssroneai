import React, { useState, useEffect } from "react";
import {
  X, User, Phone, Mail, MapPin, Award, DollarSign, Clock, MessageSquare,
  Plus, Edit, Trash2, CheckCircle2, AlertCircle, RefreshCw, ChevronRight,
  ShieldCheck, Calendar, Receipt, Home, Building, FileText
} from "lucide-react";
import { Button, Input, Badge } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { getInitials } from "@/shared/utils/formatters";

interface CustomerDetailModalProps {
  isOpen: boolean;
  customerId: number | string | null;
  customer?: any | null;
  onClose: () => void;
  onEdit: (customer: any) => void;
  onDelete: (customer: any) => void;
  onCustomerUpdated?: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  customerId,
  customer,
  onClose,
  onEdit,
  onDelete,
  onCustomerUpdated,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "addresses" | "interactions" | "orders">("overview");

  // Add Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressFlat, setAddressFlat] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressCity, setAddressCity] = useState("Mahendragarh");
  const [addressState, setAddressState] = useState("Haryana");
  const [addressPincode, setAddressPincode] = useState("");
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Add Interaction Form State
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [interactionType, setInteractionType] = useState("feedback");
  const [interactionChannel, setInteractionChannel] = useState("in_person");
  const [interactionSentiment, setInteractionSentiment] = useState("positive");
  const [interactionSubject, setInteractionSubject] = useState("");
  const [interactionNotes, setInteractionNotes] = useState("");
  const [isSubmittingInteraction, setIsSubmittingInteraction] = useState(false);

  const fetchCustomerDetail = async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const res = await api.get<any>(`/crm/customers/${customerId}`);
      setData(res);
    } catch (err: any) {
      console.error("Failed to fetch customer full details", err);
      toast.error("Failed to load customer profile details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetail();
      setShowAddAddress(false);
      setShowAddInteraction(false);
    } else {
      setData(null);
    }
  }, [isOpen, customerId]);

  if (!isOpen || !customerId) return null;

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressStreet.trim()) {
      toast.error("Area / Street address is required");
      return;
    }

    setIsSubmittingAddress(true);
    try {
      await api.post("/crm/addresses", {
        customer_id: Number(customerId),
        label: addressLabel,
        flat_no: addressFlat.trim() || undefined,
        area_street: addressStreet.trim(),
        landmark: addressLandmark.trim() || undefined,
        city: addressCity.trim() || undefined,
        state: addressState.trim() || undefined,
        pincode: addressPincode.trim() || undefined,
        is_default: (data?.addresses || []).length === 0,
      });

      toast.success("New address added successfully!");
      setShowAddAddress(false);
      setAddressFlat("");
      setAddressStreet("");
      setAddressLandmark("");
      setAddressPincode("");
      fetchCustomerDetail();
      onCustomerUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save address");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleCreateInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionNotes.trim() && !interactionSubject.trim()) {
      toast.error("Notes or subject is required for interaction log");
      return;
    }

    setIsSubmittingInteraction(true);
    try {
      const fullNotes = [interactionSubject.trim() ? `[${interactionSubject.trim()}]` : null, interactionNotes.trim()].filter(Boolean).join(" ");
      await api.post("/crm/interactions", {
        customer_id: Number(customerId),
        interaction_type: interactionType,
        notes: fullNotes || undefined,
      });

      toast.success("Customer interaction recorded!");
      setShowAddInteraction(false);
      setInteractionSubject("");
      setInteractionNotes("");
      fetchCustomerDetail();
    } catch (err: any) {
      toast.error(err?.message || "Failed to record interaction");
    } finally {
      setIsSubmittingInteraction(false);
    }
  };

  const cust = data?.customer || customer;
  const summary = data?.summary || { total_billed: 0, total_paid: 0, total_balance_due: 0, unpaid_orders_count: 0 };
  const addresses = data?.addresses || [];
  const interactions = data?.interactions || [];
  const recentOrders = data?.recent_orders || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-base flex items-center justify-center shrink-0">
              {cust ? getInitials(cust.name ? cust.name.split(" ")[0] : "", cust.name ? cust.name.split(" ")[1] : "") : <User size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-foreground leading-tight">
                  {cust?.name || "Customer Profile"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  ID: #{customerId}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono">
                  <Phone size={12} className="text-muted-foreground" /> {cust?.phone || "No phone"}
                </span>
                {cust?.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={12} className="text-muted-foreground" /> {cust.email}
                  </span>
                )}
                {cust?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-muted-foreground" /> {cust.city}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cust && onEdit(cust)}
              className="h-8 gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Edit size={13} /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => cust && onDelete(cust)}
              className="h-8 gap-1.5 text-xs font-bold cursor-pointer bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30"
            >
              <Trash2 size={13} /> Delete
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Financial Highlights Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:px-5 bg-card border-b border-border text-xs shrink-0 font-mono">
          <div className="p-2.5 rounded-xl border border-border bg-muted/10 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold block">Outstanding Debt (उधार)</span>
            <strong className={`text-sm font-black ${summary.total_balance_due > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              ₹{Number(summary.total_balance_due || 0).toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl border border-border bg-muted/10 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold block">Lifetime Billed</span>
            <strong className="text-sm font-black text-foreground">
              ₹{Number(summary.total_billed || 0).toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl border border-border bg-muted/10 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold block">Total Paid So Far</span>
            <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              ₹{Number(summary.total_paid || 0).toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl border border-border bg-muted/10 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold block">Loyalty Points</span>
            <strong className="text-sm font-black text-primary flex items-center gap-1 font-mono">
              <Award size={14} className="text-primary" /> {cust?.loyalty_points || 0} pts
            </strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 border-b border-border bg-muted/20 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "addresses"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Saved Addresses ({addresses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("interactions")}
            className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "interactions"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Feedback & Log ({interactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "orders"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Recent Orders ({recentOrders.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin text-xs">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading customer details...</div>
          ) : (
            <>
              {/* TAB 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                      <h4 className="font-bold text-xs uppercase text-muted-foreground flex items-center gap-1.5">
                        <User size={14} className="text-primary" /> Profile Master Data
                      </h4>
                      <div className="divide-y divide-border/60 text-xs font-medium space-y-1.5">
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Full Name:</span>
                          <span className="font-bold text-foreground">{cust?.name || "—"}</span>
                        </div>
                        <div className="flex justify-between py-1 font-mono">
                          <span className="text-muted-foreground font-sans">Primary Mobile:</span>
                          <span className="font-bold text-foreground">{cust?.phone || "—"}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="text-foreground">{cust?.email || "No email on record"}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">City:</span>
                          <span className="text-foreground">{cust?.city || "—"}</span>
                        </div>
                        <div className="flex justify-between py-1 font-mono">
                          <span className="text-muted-foreground font-sans">Pincode:</span>
                          <span className="text-foreground">{cust?.pincode || "—"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                      <h4 className="font-bold text-xs uppercase text-muted-foreground flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary" /> Default Delivery Address
                      </h4>
                      {addresses.length > 0 ? (
                        <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase font-mono">
                            {addresses[0].label || "Default"}
                          </span>
                          <p className="font-semibold text-foreground text-xs mt-1">
                            {addresses[0].area_street}
                          </p>
                          {(addresses[0].landmark || addresses[0].flat_no) && (
                            <p className="text-[11px] text-muted-foreground">
                              {[addresses[0].flat_no, addresses[0].landmark ? `Near ${addresses[0].landmark}` : null].filter(Boolean).join(", ")}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {[addresses[0].city, addresses[0].state, addresses[0].pincode].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                          <p>No address saved yet.</p>
                          <button
                            type="button"
                            onClick={() => { setActiveTab("addresses"); setShowAddAddress(true); }}
                            className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                          >
                            + Add Delivery Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Addresses */}
              {activeTab === "addresses" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Customer Delivery Addresses</h4>
                      <p className="text-[11px] text-muted-foreground">Addresses stored in public.customer_addresses table.</p>
                    </div>
                    {!showAddAddress && (
                      <Button
                        size="sm"
                        onClick={() => setShowAddAddress(true)}
                        className="text-xs font-bold gap-1 cursor-pointer h-8"
                      >
                        <Plus size={14} /> Add Address
                      </Button>
                    )}
                  </div>

                  {showAddAddress && (
                    <form onSubmit={handleCreateAddress} className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-primary">Add New Delivery Address</span>
                        <button type="button" onClick={() => setShowAddAddress(false)} className="text-muted-foreground hover:text-foreground">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Label</label>
                          <select
                            value={addressLabel}
                            onChange={(e) => setAddressLabel(e.target.value)}
                            className="w-full h-8 rounded border border-border bg-background px-2 text-xs"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Shop">Shop</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Flat / House No.</label>
                          <Input
                            placeholder="e.g. 104, 2nd Floor"
                            value={addressFlat}
                            onChange={(e) => setAddressFlat(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Area / Street *</label>
                          <Input
                            placeholder="e.g. Subhash Marg, Ward 4"
                            value={addressStreet}
                            onChange={(e) => setAddressStreet(e.target.value)}
                            className="h-8 text-xs bg-background"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Landmark</label>
                          <Input
                            placeholder="e.g. Near Shiv Mandir"
                            value={addressLandmark}
                            onChange={(e) => setAddressLandmark(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">City</label>
                          <Input
                            value={addressCity}
                            onChange={(e) => setAddressCity(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Pincode</label>
                          <Input
                            value={addressPincode}
                            onChange={(e) => setAddressPincode(e.target.value)}
                            className="h-8 text-xs font-mono bg-background"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowAddAddress(false)} className="h-7 text-xs">
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmittingAddress} className="h-7 text-xs font-bold">
                          {isSubmittingAddress ? "Saving..." : "Save Address"}
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr: any) => (
                      <div key={addr.id} className="p-3.5 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            {addr.label === "Home" ? <Home size={13} className="text-primary" /> : <Building size={13} className="text-primary" />}
                            {addr.label}
                          </span>
                          {addr.is_default && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground font-medium pt-1">
                          {addr.area_street}
                        </p>
                        {(addr.flat_no || addr.landmark) && (
                          <p className="text-[11px] text-muted-foreground">
                            {[addr.flat_no, addr.landmark ? `Near ${addr.landmark}` : null].filter(Boolean).join(", ")}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Interactions */}
              {activeTab === "interactions" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Guest Feedback & Interaction Logs</h4>
                      <p className="text-[11px] text-muted-foreground">Stored in public.customer_interactions table.</p>
                    </div>
                    {!showAddInteraction && (
                      <Button
                        size="sm"
                        onClick={() => setShowAddInteraction(true)}
                        className="text-xs font-bold gap-1 cursor-pointer h-8"
                      >
                        <Plus size={14} /> Log Feedback
                      </Button>
                    )}
                  </div>

                  {showAddInteraction && (
                    <form onSubmit={handleCreateInteraction} className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-primary">Record Guest Interaction</span>
                        <button type="button" onClick={() => setShowAddInteraction(false)} className="text-muted-foreground hover:text-foreground">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Type</label>
                          <select
                            value={interactionType}
                            onChange={(e) => setInteractionType(e.target.value)}
                            className="w-full h-8 rounded border border-border bg-background px-2 text-xs"
                          >
                            <option value="feedback">Feedback</option>
                            <option value="complaint">Complaint</option>
                            <option value="enquiry">Enquiry</option>
                            <option value="call">Phone Call</option>
                            <option value="visit">Dine-in Visit</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Channel</label>
                          <select
                            value={interactionChannel}
                            onChange={(e) => setInteractionChannel(e.target.value)}
                            className="w-full h-8 rounded border border-border bg-background px-2 text-xs"
                          >
                            <option value="in_person">In Person / Counter</option>
                            <option value="phone">Phone</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="web">Web Application</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Sentiment</label>
                          <select
                            value={interactionSentiment}
                            onChange={(e) => setInteractionSentiment(e.target.value)}
                            className="w-full h-8 rounded border border-border bg-background px-2 text-xs font-bold"
                          >
                            <option value="positive">Positive (Delighted)</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative (Unhappy)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Subject</label>
                        <Input
                          placeholder="e.g. Appreciated Paneer Roll quality"
                          value={interactionSubject}
                          onChange={(e) => setInteractionSubject(e.target.value)}
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Notes & Details *</label>
                        <textarea
                          placeholder="Write guest remarks, feedback points, or resolution notes..."
                          value={interactionNotes}
                          onChange={(e) => setInteractionNotes(e.target.value)}
                          className="w-full h-16 p-2 rounded border border-border bg-background text-xs"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowAddInteraction(false)} className="h-7 text-xs">
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmittingInteraction} className="h-7 text-xs font-bold">
                          {isSubmittingInteraction ? "Saving..." : "Save Log"}
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {interactions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                        No interaction logged yet. Use "Log Feedback" to record guest visit remarks.
                      </div>
                    ) : (
                      interactions.map((it: any) => (
                        <div key={it.id} className="p-3 rounded-xl border border-border bg-card space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-foreground uppercase">{it.interaction_type}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">via {it.channel}</span>
                            </div>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-mono ${
                              it.sentiment === "positive"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : it.sentiment === "negative"
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}>
                              {it.sentiment || "neutral"}
                            </span>
                          </div>
                          {it.subject && <h5 className="font-semibold text-xs text-foreground">{it.subject}</h5>}
                          {it.notes && <p className="text-xs text-muted-foreground">{it.notes}</p>}
                          <span className="text-[10px] text-muted-foreground font-mono block pt-1">
                            {it.created_at ? new Date(it.created_at).toLocaleString() : ""}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Orders */}
              {activeTab === "orders" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Recent Orders & Bills</h4>
                      <p className="text-[11px] text-muted-foreground">Orders linked to this customer account in PostgreSQL.</p>
                    </div>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                      No order history found for this customer.
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-x-auto shadow-2xs bg-card">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-[10px] uppercase font-mono text-muted-foreground border-b border-border">
                          <tr>
                            <th className="p-2.5">Order #</th>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5 text-right">Total</th>
                            <th className="p-2.5 text-right">Paid</th>
                            <th className="p-2.5 text-right">Due</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border font-mono">
                          {recentOrders.map((ord: any) => {
                            const isCancelled = ord.status === "cancelled" || ord.status === "void";
                            return (
                              <tr key={ord.id} className={`hover:bg-muted/20 ${isCancelled ? "opacity-60" : ""}`}>
                                <td className="p-2.5 font-bold text-foreground">{ord.order_number}</td>
                                <td className="p-2.5 text-[11px] text-muted-foreground font-sans">
                                  {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "—"}
                                </td>
                                <td className="p-2.5 text-right font-semibold text-foreground">₹{ord.grand_total}</td>
                                <td className="p-2.5 text-right text-emerald-600 dark:text-emerald-400">₹{ord.amount_paid}</td>
                                <td className="p-2.5 text-right font-bold text-amber-600 dark:text-amber-400">
                                  ₹{isCancelled ? 0 : ord.balance_due}
                                </td>
                                <td className="p-2.5 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                    isCancelled
                                      ? "bg-destructive/10 text-destructive border-destructive/20"
                                      : ord.payment_status === "paid"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  }`}>
                                    {isCancelled ? "CANCELLED" : ord.payment_status || ord.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-semibold cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
