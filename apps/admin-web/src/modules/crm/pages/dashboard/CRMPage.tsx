import React, { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Users, Database, Receipt, BarChart3, Plus, RefreshCw, Award, HeartHandshake } from "lucide-react";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { CRMMasterSection } from "../master/CRMMasterSection";
import { CRMTransactionSection } from "../transaction/CRMTransactionSection";
import { CRMReportSection } from "../report/CRMReportSection";

export function CRMPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [activeTab, setActiveTab] = useState<"master" | "transaction" | "report">("master");
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    city: "",
  });

  // Sync active section from router path if present
  useEffect(() => {
    if (currentPath.includes("/master")) setActiveTab("master");
    else if (currentPath.includes("/transaction")) setActiveTab("transaction");
    else if (currentPath.includes("/report")) setActiveTab("report");
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
      toast.success(`Guest ${newCustomer.first_name} saved to PostgreSQL!`);
      setShowAddModal(false);
      setNewCustomer({ first_name: "", last_name: "", phone: "", email: "", city: "" });
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to save guest profile to database");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                CRM & Guest Loyalty Workspace
              </h1>
              <p className="text-xs text-slate-500">
                PostgreSQL database single source of truth for guest master profiles, loyalty points, and feedback.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <Button onClick={() => setShowAddModal(true)} className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs gap-1.5">
            <Plus className="w-4 h-4" /> Add Guest Profile
          </Button>
        </div>
      </div>

      {/* Main 3-Tier Enterprise Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("master")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "master"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
          }`}
        >
          <Database className="w-4 h-4 text-pink-500" />
          MASTER
        </button>

        <button
          onClick={() => setActiveTab("transaction")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "transaction"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
          }`}
        >
          <Receipt className="w-4 h-4 text-pink-500" />
          TRANSACTION
        </button>

        <button
          onClick={() => setActiveTab("report")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "report"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-pink-500" />
          REPORT
        </button>
      </div>

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
    </div>
  );
}
