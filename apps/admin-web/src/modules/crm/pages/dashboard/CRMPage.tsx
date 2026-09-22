import React, { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Users, Database, Receipt, BarChart3, Plus, RefreshCw, Award, HeartHandshake, Megaphone, MessageSquare } from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { CRMMasterSection } from "../master/CRMMasterSection";
import { CRMTransactionSection } from "../transaction/CRMTransactionSection";
import { CRMReportSection } from "../report/CRMReportSection";
import { CampaignModal } from "../transaction/CampaignModal";
import { CustomerInteractionModal } from "../transaction/CustomerInteractionModal";

export function CRMPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [activeTab, setActiveTab] = useState<"master" | "transaction" | "report">("master");
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    city: "",
  });

  // Sync active section from router path if present
  useEffect(() => {
    if (currentPath.includes("/campaigns")) {
      setIsCampaignModalOpen(true);
    } else if (currentPath.includes("/interactions")) {
      setIsInteractionModalOpen(true);
    } else if (currentPath.includes("/master") || currentPath.includes("/customers") || currentPath.includes("/tiers")) {
      setActiveTab("master");
    } else if (currentPath.includes("/transaction") || currentPath.includes("/points")) {
      setActiveTab("transaction");
    } else if (currentPath.includes("/report") || currentPath.includes("/ledger") || currentPath.includes("/tier-distribution")) {
      setActiveTab("report");
    }
  }, [currentPath]);

  // Fetch customers directly from PostgreSQL API
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>("/crm/customers");
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load CRM customers from PostgreSQL", err);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.first_name || !newCustomer.phone) {
      toast.error("First Name and Phone are required.");
      return;
    }

    try {
      await api.post("/crm/customers", {
        name: `${newCustomer.first_name} ${newCustomer.last_name}`.trim(),
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        phone: newCustomer.phone,
        email: newCustomer.email || null,
        city: newCustomer.city || null,
      });
      toast.success(`Guest ${newCustomer.first_name} saved successfully!`);
      setShowAddModal(false);
      setNewCustomer({ first_name: "", last_name: "", phone: "", email: "", city: "" });
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to save guest profile to database");
    }
  };

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="CRM & Guest Loyalty Workspace"
        description="Single source of truth for guest master profiles, loyalty points, and feedback"
        icon={<HeartHandshake size={18} />}
        badge={`${customers.length} Guests`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCustomers}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Refresh Guest Database"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCampaignModalOpen(true)}
              className="text-xs font-semibold gap-1.5 cursor-pointer border-pink-500/30 text-pink-600 hover:bg-pink-500/10"
            >
              <Megaphone size={14} /> Marketing Campaigns
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInteractionModalOpen(true)}
              className="text-xs font-semibold gap-1.5 cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
            >
              <MessageSquare size={14} /> Guest Feedback Log
            </Button>

            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Add Guest Profile
            </Button>
          </div>
        }
      />

      {/* ── Active Section Render ── */}
      {activeTab === "master" && (
        <CRMMasterSection
          customers={customers}
          search={search}
          onSearchChange={setSearch}
          onOpenAddModal={() => setShowAddModal(true)}
        />
      )}

      {activeTab === "transaction" && (
        <CRMTransactionSection customers={customers} />
      )}

      {activeTab === "report" && (
        <CRMReportSection customers={customers} />
      )}

      {/* ── Add Guest Profile Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Onboard Guest Customer Profile</h3>
            <p className="text-xs text-slate-500">Add guest profile into PostgreSQL database with loyalty rewards.</p>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">First Name *</label>
                  <input
                    required
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                    placeholder="e.g. Rahul"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Last Name</label>
                  <input
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                    placeholder="e.g. Sharma"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Phone Number *</label>
                <input
                  required
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="rahul@gmail.com"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">City</label>
                <input
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  placeholder="e.g. Mahendragarh"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 font-semibold text-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-pink-600 text-white rounded-lg">Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Broadcasts Modal */}
      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
      />

      {/* Customer Feedback & Support Interaction Modal */}
      <CustomerInteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        customers={customers}
      />
    </PageContainer>
  );
}
