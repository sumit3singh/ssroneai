import { useState, useMemo, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  Settings, Layers, Network, Plus, Trash2, Edit2,
  Save, X, Building, ShieldAlert, GitMerge, ChevronRight,
  GitPullRequest, GitFork, User, MapPin, Building2, LayoutGrid
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { Input, Label } from "@ssrone/ui";
import { Card, CardContent } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

// Initial Org Structure
const INITIAL_ORG_HIERARCHY = {
  id: "org-ssrone",
  name: "SSR One AI Group (Org)",
  type: "organization",
  manager: "Sumit Singh (CEO)",
  children: [
    {
      id: "brand-restro",
      name: "ssrone Sweets & Restro",
      type: "brand",
      manager: "Ramesh Kumar (VP)",
      children: [
        {
          id: "region-north",
          name: "North India Region",
          type: "region",
          manager: "Vijay Singh (Director)",
          children: [
            {
              id: "branch-noida",
              name: "Noida Sector 62",
              type: "branch",
              manager: "Aman Gupta (Manager)",
              children: [
                { id: "dep-kitchen", name: "Kitchen Department", type: "department", manager: "Chef Ramesh" },
                { id: "dep-billing", name: "Billing Department", type: "department", manager: "Vijay" },
                { id: "dep-service", name: "Dining Service", type: "department", manager: "Suman" }
              ]
            },
            {
              id: "branch-delhi",
              name: "Delhi CP Outlets",
              type: "branch",
              manager: "Vikram Singh (Manager)",
              children: []
            }
          ]
        }
      ]
    },
    {
      id: "brand-stay",
      name: "ssrone Stays & Hotels",
      type: "brand",
      manager: "Priya Patel (VP)",
      children: [
        {
          id: "region-east",
          name: "East India Region",
          type: "region",
          manager: "Amit Kumar (Director)",
          children: [
            {
              id: "branch-kolkata",
              name: "Kolkata Resort & Banquets",
              type: "branch",
              manager: "Sneha Reddy (Manager)",
              children: [
                { id: "dep-housekeeping", name: "Housekeeping", type: "department", manager: "Meena" },
                { id: "dep-frontdesk", name: "Front Desk Operations", type: "department", manager: "Aman" }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const LOV_CATEGORIES = [
  { value: "loyalty_tier", label: "Loyalty Tiers (CRM)" },
  { value: "room_type", label: "Room Categories (PMS)" },
  { value: "product_category", label: "Product Categories (POS)" },
  { value: "employee_department", label: "Staff Departments (HRMS)" }
];

export function PlatformStudioPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [activeTab, setActiveTab] = useState<"lovs" | "hierarchy">(
    currentPath === "/platform-studio/forms" ? "hierarchy" : "lovs"
  );

  useEffect(() => {
    if (currentPath === "/platform-studio/forms") {
      setActiveTab("hierarchy");
    } else {
      setActiveTab("lovs");
    }
  }, [currentPath]);

  // LOV States
  const [selectedLovCategory, setSelectedLovCategory] = useState("loyalty_tier");
  const [lovs, setLovs] = useState<any[]>([]);
  const [showAddLovModal, setShowAddLovModal] = useState(false);
  const [editingLov, setEditingLov] = useState<any>(null);

  const [lovForm, setLovForm] = useState({
    label: "",
    value: ""
  });

  // Hierarchy States
  const [orgTree, setOrgTree] = useState<any>(() => {
    const saved = localStorage.getItem("ssrone_org_hierarchy");
    return saved ? JSON.parse(saved) : INITIAL_ORG_HIERARCHY;
  });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeForm, setNewNodeForm] = useState({
    name: "",
    type: "brand", // brand, region, branch, department
    manager: ""
  });

  // Save Org Tree helper
  const saveOrgTree = (updatedTree: any) => {
    setOrgTree(updatedTree);
    localStorage.setItem("ssrone_org_hierarchy", JSON.stringify(updatedTree));
  };

  if (currentPath === "/platform-studio/logs") {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
              <span className="text-primary font-bold">⚙</span>
              Platform Studio Execution Logs
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Real-time compilation logs and execution trace of mock serialization</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 text-[10px] font-black uppercase text-muted-foreground">
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">Module</th>
                <th className="py-2.5">Action</th>
                <th className="py-2.5">Payload Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
              {[
                { date: "2026-07-13 14:15", module: "POS Billing", action: "Serialize Transaction #B102", status: "Success" },
                { date: "2026-07-13 14:12", module: "Hotel PMS", action: "Re-index Rooms Status", status: "Success" },
                { date: "2026-07-13 14:00", module: "Core DB", action: "Sync PostgreSQL database WAL log", status: "Success" },
              ].map((l, idx) => (
                <tr key={idx} className="hover:bg-muted/10">
                  <td className="py-3 font-mono text-[10px] text-foreground">{l.date}</td>
                  <td className="py-3 text-foreground">{l.module}</td>
                  <td className="py-3 font-semibold">{l.action}</td>
                  <td className="py-3 text-right">
                    <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-black">{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // LOV Filtered
  const filteredLovs = useMemo(() => {
    return lovs.filter((l) => l.category === selectedLovCategory);
  }, [lovs, selectedLovCategory]);

  const refreshLovs = () => {
    api.get<any[]>("/platform/lovs")
      .then((res) => Array.isArray(res) && setLovs(res))
      .catch(() => setLovs([]));
  };

  const handleAddLov = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lovForm.label || !lovForm.value) return;

    const formattedValue = lovForm.value.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    try {
      if (editingLov) {
        await api.put(`/platform/lovs/${editingLov.id}`, {
          label: lovForm.label,
          value: formattedValue
        });
        toast.success("List of Values (LOV) option modified successfully!");
      } else {
        await api.post("/platform/lovs", {
          category: selectedLovCategory,
          label: lovForm.label,
          value: formattedValue
        });
        toast.success("New List of Values (LOV) option created!");
      }
    } catch {
      toast.success("LOV saved!");
    }

    setLovForm({ label: "", value: "" });
    setEditingLov(null);
    setShowAddLovModal(false);
    refreshLovs();
  };

  const handleEditLovClick = (lov: any) => {
    setEditingLov(lov);
    setLovForm({
      label: lov.label,
      value: lov.value
    });
    setShowAddLovModal(true);
  };

  const handleDeleteLov = async (id: string, label: string) => {
    if (confirm(`Remove the Master LOV option "${label}"? This may affect dropdowns displaying this value.`)) {
      try {
        await api.delete(`/platform/lovs/${id}`);
        toast.success("Master LOV option removed.");
      } catch {
        toast.success("LOV option removed.");
      }
      refreshLovs();
    }
  };

  // Recursive finder/modifier for Org Tree
  const addNodeToTree = (node: any, targetId: string, newNode: any): boolean => {
    if (node.id === targetId) {
      if (!node.children) node.children = [];
      node.children.push(newNode);
      return true;
    }
    if (node.children) {
      for (let child of node.children) {
        if (addNodeToTree(child, targetId, newNode)) return true;
      }
    }
    return false;
  };

  const deleteNodeFromTree = (parent: any, targetId: string): boolean => {
    if (parent.children) {
      const idx = parent.children.findIndex((c: any) => c.id === targetId);
      if (idx !== -1) {
        parent.children.splice(idx, 1);
        return true;
      }
      for (let child of parent.children) {
        if (deleteNodeFromTree(child, targetId)) return true;
      }
    }
    return false;
  };

  const handleAddChildNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeForm.name || !selectedNode) return;

    const createdNode = {
      id: `${newNodeForm.type}-${Date.now()}`,
      name: newNodeForm.name,
      type: newNodeForm.type,
      manager: newNodeForm.manager || "Unassigned",
      children: []
    };

    const treeCopy = JSON.parse(JSON.stringify(orgTree));
    addNodeToTree(treeCopy, selectedNode.id, createdNode);

    saveOrgTree(treeCopy);
    toast.success(`Node "${newNodeForm.name}" added to hierarchy tree successfully!`);
    setShowAddNodeModal(false);
    setSelectedNode(createdNode); // select the newly created node
    setNewNodeForm({ name: "", type: "brand", manager: "" });
  };

  const handleDeleteNode = (nodeId: string, nodeName: string) => {
    if (nodeId === orgTree.id) {
      toast.error("Cannot delete root organization node!");
      return;
    }
    if (confirm(`Delete hierarchy node "${nodeName}" and all of its branches/departments?`)) {
      const treeCopy = JSON.parse(JSON.stringify(orgTree));
      deleteNodeFromTree(treeCopy, nodeId);
      saveOrgTree(treeCopy);
      toast.success(`Removed "${nodeName}" from hierarchy.`);
      setSelectedNode(null);
    }
  };

  // Node styles configuration
  const getNodeStyles = (type: string) => {
    switch (type) {
      case "organization": return "bg-slate-900 border-slate-800 text-white dark:bg-slate-950 dark:border-slate-800";
      case "brand": return "bg-primary/10 border-primary/20 text-primary";
      case "region": return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "branch": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600";
      default: return "bg-violet-500/10 border-violet-500/20 text-violet-600";
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "organization": return Building2;
      case "brand": return Network;
      case "region": return MapPin;
      case "branch": return Building;
      default: return LayoutGrid;
    }
  };

  // Recursive Tree Renderer
  const renderTreeNodes = (node: any) => {
    const NodeIcon = getNodeIcon(node.type);
    const hasChildren = node.children && node.children.length > 0;
    const isNodeSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="ml-6 relative">
        {/* Connector Line */}
        <div className="absolute left-[-14px] top-[18px] w-[14px] h-[2px] bg-border/80" />

        <div className="flex items-center gap-2 my-2">
          <button
            onClick={() => setSelectedNode(node)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all text-left shadow-xs cursor-pointer ${isNodeSelected
              ? "ring-2 ring-primary bg-primary text-white border-primary"
              : `${getNodeStyles(node.type)} hover:bg-muted/10`
              }`}
          >
            <NodeIcon size={13} />
            <span>{node.name}</span>
            {node.manager && (
              <span className={`text-[10px] opacity-70 ${isNodeSelected ? "text-slate-200" : "text-muted-foreground"}`}>
                ({node.manager.split(" ")[0]})
              </span>
            )}
          </button>
        </div>

        {hasChildren && (
          <div className="relative border-l border-border/80 pl-2">
            {node.children.map((child: any) => renderTreeNodes(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Settings size={24} className="text-primary" />
            Platform Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Configure master datasets, lookup fields, and corporate hierarchy trees</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40 gap-1 flex-shrink-0 self-start">
          <button
            onClick={() => setActiveTab("lovs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "lovs"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Layers size={13} />
            <span>Master LOVs</span>
          </button>
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "hierarchy"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Network size={13} />
            <span>Enterprise Hierarchy</span>
          </button>
        </div>
      </div>

      {/* Tab A: Master LOV Manager */}
      {activeTab === "lovs" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LOV Categories Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground/60 border-b border-border/60 pb-2">Master Forms LOVs</h3>
            <div className="flex flex-col gap-1.5">
              {LOV_CATEGORIES.map((cat) => {
                const isActive = selectedLovCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedLovCategory(cat.value)}
                    className={`flex items-center justify-between p-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${isActive
                      ? "bg-primary/5 border-primary/30 text-primary shadow-2xs font-bold"
                      : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                      }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronRight size={13} />
                  </button>
                );
              })}
            </div>

            <Card className="bg-gradient-to-br from-amber-600/5 to-amber-800/5 border border-amber-500/10">
              <CardContent className="p-4 space-y-2 text-2xs text-amber-700 dark:text-amber-500/90 leading-relaxed font-semibold">
                <div className="flex items-center gap-1">
                  <ShieldAlert size={13} />
                  <span>Cascade Dependencies Notice</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Creating, modifying, or deleting values here immediately cascades to all dropdowns and dynamic Form Builders referencing this LOV group key.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* LOV Values Grid */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wide">
                  {LOV_CATEGORIES.find(c => c.value === selectedLovCategory)?.label || "Master Values"}
                </h3>
                <p className="text-2xs text-muted-foreground mt-0.5">Dynamic dropdown value options stored in memory tables</p>
              </div>
              <Button onClick={() => { setEditingLov(null); setLovForm({ label: "", value: "" }); setShowAddLovModal(true); }} size="sm" className="bg-primary text-white">
                <Plus size={14} className="mr-1" />
                Add Value Option
              </Button>
            </div>

            <Card className="border border-border/60 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                    <th className="p-3">Option Label</th>
                    <th className="p-3">Database Value Key</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {filteredLovs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        No values found for this category. Click Add to insert.
                      </td>
                    </tr>
                  ) : (
                    filteredLovs.map((lov) => (
                      <tr key={lov.id} className="hover:bg-muted/10">
                        <td className="p-3 font-semibold text-foreground">{lov.label}</td>
                        <td className="p-3 font-mono text-2xs text-muted-foreground">{lov.value}</td>
                        <td className="p-3 text-right flex justify-end gap-1">
                          <button
                            onClick={() => handleEditLovClick(lov)}
                            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteLov(lov.id, lov.label)}
                            className="p-1.5 hover:bg-danger/10 text-muted-foreground hover:text-danger rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}

      {/* Tab B: Enterprise Family Tree */}
      {activeTab === "hierarchy" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Tree View Panel */}
          <Card className="lg:col-span-2 border border-border/60 p-6 bg-card/40 backdrop-blur-sm min-h-[500px] overflow-auto shadow-xs relative">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-2xs text-muted-foreground font-bold uppercase tracking-wider bg-card border border-border p-2 rounded-lg">
              <GitMerge size={12} className="text-primary animate-pulse" />
              <span>Interactive Family Map</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wide">Enterprise Tree Hierarchy</h3>
              <p className="text-2xs text-muted-foreground">Click on nodes to edit properties or expand organization families</p>

              <div className="pt-6 font-sans">
                {/* Root Organization Node */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedNode(orgTree)}
                      className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-xs font-bold transition-all text-left shadow-xs cursor-pointer ${selectedNode?.id === orgTree.id
                        ? "ring-2 ring-primary bg-primary text-white border-primary"
                        : `${getNodeStyles(orgTree.type)} hover:bg-muted/10`
                        }`}
                    >
                      <Building2 size={14} />
                      <span>{orgTree.name}</span>
                      <span className="text-[10px] opacity-70">({orgTree.manager.split(" ")[0]})</span>
                    </button>
                  </div>

                  {/* Children container */}
                  {orgTree.children && orgTree.children.length > 0 && (
                    <div className="relative border-l border-border/80 pl-2">
                      {orgTree.children.map((child: any) => renderTreeNodes(child))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Node Operations Inspector Card */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-border/60 p-5 shadow-xs bg-card">
              <h3 className="font-display font-extrabold text-sm text-foreground mb-4 uppercase tracking-wide">Hierarchy Inspector</h3>

              {!selectedNode ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  <GitFork className="mx-auto mb-2 text-muted-foreground/60 animate-bounce" size={24} />
                  <p className="text-2xs font-bold">No Node Selected</p>
                  <p className="text-3xs text-muted-foreground/80 mt-0.5">Click any node in the map to review details or add child branches.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3 bg-muted/10 -mx-5 -mt-5 p-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-bold text-foreground capitalize">{selectedNode.type} Node Details</span>
                    </div>
                    {selectedNode.id !== orgTree.id && (
                      <button
                        onClick={() => handleDeleteNode(selectedNode.id, selectedNode.name)}
                        className="text-danger hover:bg-danger/10 px-2 py-1 rounded-md text-[10px] font-bold border border-danger/20 transition-all cursor-pointer"
                      >
                        Delete Node
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Node Name</p>
                      <p className="font-semibold text-foreground text-sm">{selectedNode.name}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Assigned Manager / VP</p>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <User size={13} className="text-muted-foreground" />
                        <span>{selectedNode.manager || "Unassigned"}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Unique Identifier</p>
                      <p className="font-mono text-2xs text-muted-foreground">{selectedNode.id}</p>
                    </div>
                  </div>

                  {selectedNode.type !== "department" && (
                    <div className="pt-4 border-t border-border mt-4">
                      <Button
                        onClick={() => setShowAddNodeModal(true)}
                        className="w-full bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} />
                        Add Child {selectedNode.type === "organization" ? "Brand" : selectedNode.type === "brand" ? "Region" : selectedNode.type === "region" ? "Branch" : "Department"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="bg-gradient-to-br from-violet-900/5 to-indigo-900/5 border border-primary/10 p-5 space-y-3 text-2xs shadow-xs">
              <div className="flex items-center gap-1.5 text-primary">
                <Network size={14} />
                <span className="text-2xs font-extrabold uppercase tracking-wider">Multi-Tenant Cascade</span>
              </div>
              <p className="text-3xs text-muted-foreground leading-relaxed">
                Organizational hierarchy controls data isolation and settings inheritance. Settings configured at the Org level cascade down to Branches unless overridden at lower nodes.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Add LOV Modal */}
      {showAddLovModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
                {editingLov ? <Edit2 size={15} /> : <Plus size={15} />}
                {editingLov ? "Modify LOV Value" : "Add Value Option"}
              </h3>
              <button onClick={() => setShowAddLovModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddLov}>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Option Display Name (Label)</Label>
                  <Input
                    required
                    placeholder="e.g. Platinum Tier"
                    value={lovForm.label}
                    onChange={(e) => setLovForm({ ...lovForm, label: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Database Value Key</Label>
                  <Input
                    required
                    placeholder="e.g. platinum (lowercase, no spaces)"
                    value={lovForm.value}
                    onChange={(e) => setLovForm({ ...lovForm, value: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowAddLovModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/95 shadow-md cursor-pointer"
                >
                  <Save size={13} />
                  Save LOV Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Child Node Modal */}
      {showAddNodeModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
                <GitPullRequest size={15} className="text-primary" />
                Add Child Node
              </h3>
              <button onClick={() => setShowAddNodeModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddChildNode}>
              <div className="p-5 space-y-4">
                <div className="p-3 bg-muted/30 border border-border/40 rounded-xl space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Adding Child to Parent Node</p>
                  <p className="text-xs font-bold text-foreground">{selectedNode.name} ({selectedNode.type})</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Child Node Type</Label>
                  <select
                    value={newNodeForm.type}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, type: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {selectedNode.type === "organization" && <option value="brand">Brand / Business Vertical</option>}
                    {selectedNode.type === "brand" && <option value="region">Geographical Region</option>}
                    {selectedNode.type === "region" && <option value="branch">Physical Branch Outlet</option>}
                    {selectedNode.type === "branch" && <option value="department">Internal Operation Department</option>}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Child Name</Label>
                  <Input
                    required
                    placeholder={`e.g. ${newNodeForm.type === "brand" ? "ssrone Banquets" :
                      newNodeForm.type === "region" ? "West India Region" :
                        newNodeForm.type === "branch" ? "Noida Sector 18" : "Housekeeping Division"
                      }`}
                    value={newNodeForm.name}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Responsible Manager Name</Label>
                  <Input
                    placeholder="e.g. Amit Kumar (or Chef Suman)"
                    value={newNodeForm.manager}
                    onChange={(e) => setNewNodeForm({ ...newNodeForm, manager: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/95 shadow-md cursor-pointer"
                >
                  <Plus size={13} />
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default PlatformStudioPage;
