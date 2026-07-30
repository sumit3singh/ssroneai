import { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  Award, CheckCircle, XCircle, Clock, Plus, Trash2,
  ArrowRight, User, FileText, Settings, ShieldAlert, X, MessageSquare, Save
} from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input, Label } from "@/shared/ui/primitives/Input";
import { Card, CardContent } from "@/shared/ui/primitives/Card";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
import { api } from "@/shared/utils/api-client";
import { toast } from "sonner";

export function WorkflowPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [activeTab, setActiveTab] = useState<"inbox" | "designer">(
    currentPath === "/workflow/rules" ? "designer" : "inbox"
  );

  const isMock = isMockSession();

  useEffect(() => {
    if (currentPath === "/workflow/rules") {
      setActiveTab("designer");
    } else {
      setActiveTab("inbox");
    }
  }, [currentPath]);

  // State
  const [requests, setRequests] = useState<any[]>(() => isMock ? mockDB.get<any>("workflow_requests") : []);
  const [templates, setTemplates] = useState<any[]>(() => isMock ? mockDB.get<any>("workflow_templates") : []);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [selectedTpl, setSelectedTpl] = useState<any>(null);

  // Modal / Input states
  const [remarks, setRemarks] = useState("");
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: "",
    trigger: ""
  });
  const [newStepName, setNewStepName] = useState("");
  const refreshRequests = () => {
    if (isMock) {
      const list = mockDB.get<any>("workflow_requests");
      setRequests(list);
      if (selectedReq) {
        const updated = list.find((x) => x.id === selectedReq.id);
        setSelectedReq(updated || null);
      }
      return;
    }
    api.get<any[]>("/workflow/requests")
      .then((list) => Array.isArray(list) && setRequests(list))
      .catch(() => setRequests([]));
  };

  const refreshTemplates = () => {
    if (isMock) {
      const list = mockDB.get<any>("workflow_templates");
      setTemplates(list);
      if (selectedTpl) {
        const updated = list.find((x) => x.id === selectedTpl.id);
        setSelectedTpl(updated || null);
      }
      return;
    }
    api.get<any[]>("/workflow/templates")
      .then((list) => Array.isArray(list) && setTemplates(list))
      .catch(() => setTemplates([]));
  };

  const handleProcessRequest = (statusAction: "approved" | "rejected") => {
    if (!selectedReq) return;

    let updatedReq = { ...selectedReq };
    const stepName = updatedReq.steps[updatedReq.current_step] || "Final Review";

    const commentObj = {
      author: "Administrator",
      text: remarks ? `${statusAction.toUpperCase()}: ${remarks}` : `${statusAction.toUpperCase()} without comments`,
      date: new Date().toISOString()
    };

    updatedReq.comments = [...(updatedReq.comments || []), commentObj];

    if (statusAction === "approved") {
      const nextStep = updatedReq.current_step + 1;
      if (nextStep >= updatedReq.steps.length) {
        updatedReq.status = "approved";
      } else {
        updatedReq.current_step = nextStep;
      }
      toast.success(`Step "${stepName}" approved successfully!`);
    } else {
      updatedReq.status = "rejected";
      toast.error(`Request rejected with comments.`);
    }

    mockDB.update("workflow_requests", selectedReq.id, updatedReq);
    setRemarks("");
    refreshRequests();
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.name || !newTemplateForm.trigger) return;

    const created = mockDB.insert<any>("workflow_templates", {
      name: newTemplateForm.name,
      trigger: newTemplateForm.trigger,
      steps: ["Manager Initial Review", "Financial Verification"]
    });

    toast.success(`Workflow template "${newTemplateForm.name}" created!`);
    setShowAddTemplateModal(false);
    setSelectedTpl(created);
    setNewTemplateForm({ name: "", trigger: "" });
    refreshTemplates();
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
      mockDB.delete("workflow_templates", id);
      toast.success("Workflow template deleted.");
      if (selectedTpl?.id === id) setSelectedTpl(null);
      refreshTemplates();
    }
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName || !selectedTpl) return;

    const updated = { ...selectedTpl };
    updated.steps.push(newStepName);

    mockDB.update("workflow_templates", selectedTpl.id, updated);
    toast.success(`Step "${newStepName}" appended to chain.`);
    setNewStepName("");
    refreshTemplates();
  };

  const handleDeleteStep = (stepIdx: number) => {
    if (!selectedTpl) return;
    if (confirm("Remove this step from the workflow sequence?")) {
      const updated = { ...selectedTpl };
      updated.steps.splice(stepIdx, 1);
      mockDB.update("workflow_templates", selectedTpl.id, updated);
      toast.success("Step removed from chain.");
      refreshTemplates();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
        return "bg-danger/10 text-danger border-danger/20";
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Award size={24} className="text-primary" />
            Workflow & Approvals
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Design corporate transaction policies, verify purchase bills, and manage discounts</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40 gap-1 flex-shrink-0 self-start">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "inbox"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Clock size={13} />
            <span>Approvals Inbox ({requests.filter(r => r.status === "pending").length})</span>
          </button>
          <button
            onClick={() => setActiveTab("designer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "designer"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Settings size={13} />
            <span>Workflow Designer</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Inbox */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground/60 border-b border-border/60 pb-2">Active Approvals Inbox</h3>
            <div className="space-y-2">
              {requests.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs">No active approvals found.</div>
              ) : (
                requests.map((req) => {
                  const isActive = selectedReq?.id === req.id;
                  return (
                    <button
                      key={req.id}
                      onClick={() => setSelectedReq(req)}
                      className={`w-full p-4 rounded-xl border text-left transition-all space-y-2 cursor-pointer ${isActive
                          ? "bg-primary/5 border-primary/40 shadow-xs"
                          : "border-border/60 hover:bg-muted bg-card"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-foreground leading-normal line-clamp-2">{req.title}</p>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><User size={10} /> {req.requester}</span>
                        {req.status === "pending" && (
                          <span className="font-semibold text-primary">Step: {req.current_step + 1}/{req.steps.length}</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Request details Inspector */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedReq ? (
              <Card className="border border-border/60 p-12 text-center text-muted-foreground min-h-[400px] flex flex-col items-center justify-center bg-card/45 backdrop-blur-xs shadow-xs">
                <Award size={32} className="text-muted-foreground/60 mb-2 animate-pulse" />
                <p className="text-xs font-bold">Select an Approval Request</p>
                <p className="text-2xs text-muted-foreground mt-0.5">Click any request card in the inbox to verify details, verify files, and approve.</p>
              </Card>
            ) : (
              <Card className="border border-border/60 p-6 bg-card shadow-xs space-y-6">
                {/* Details Header */}
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <span className={`px-2.5 py-1 rounded-lg border text-2xs font-black uppercase tracking-wider ${getStatusBadge(selectedReq.status)}`}>
                      {selectedReq.status}
                    </span>
                    <h2 className="text-base font-display font-extrabold text-foreground mt-2">{selectedReq.title}</h2>
                    <p className="text-2xs text-muted-foreground flex items-center gap-1">Requested by: <strong className="text-foreground">{selectedReq.requester}</strong></p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-muted/20 border border-border/40 p-4 rounded-xl space-y-1.5">
                  <h4 className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <FileText size={12} /> Transaction Overview
                  </h4>
                  <p className="text-xs font-medium leading-relaxed text-foreground whitespace-pre-wrap">{selectedReq.description}</p>
                </div>

                {/* Approval visual chain */}
                <div className="space-y-3">
                  <h4 className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider">Approval Sequence Nodes</h4>
                  <div className="flex items-center flex-wrap gap-2 pt-1 font-sans">
                    {selectedReq.steps.map((step: string, idx: number) => {
                      const isCompleted = idx < selectedReq.current_step;
                      const isCurrent = idx === selectedReq.current_step && selectedReq.status === "pending";
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-2xs font-bold ${isCompleted
                              ? "bg-success/5 border-success/30 text-success"
                              : isCurrent
                                ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                                : "bg-muted border-border/60 text-muted-foreground"
                            }`}>
                            <span>{idx + 1}. {step}</span>
                          </div>
                          {idx < selectedReq.steps.length - 1 && <ArrowRight size={12} className="text-muted-foreground/60" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* History reviews */}
                {selectedReq.comments && selectedReq.comments.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MessageSquare size={12} /> Auditor Comments History</h4>
                    <div className="space-y-2">
                      {selectedReq.comments.map((c: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/30 border border-border/40 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-foreground">{c.author}</span>
                            <span className="text-muted-foreground">{new Date(c.date).toLocaleString()}</span>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground leading-normal">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedReq.status === "pending" && (
                  <div className="pt-6 border-t border-border mt-4 space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <Label>Auditor Decision Remarks / Comments</Label>
                      <textarea
                        rows={2}
                        placeholder="Add decision observations or reason for rejection..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="flex w-full rounded-lg border border-input bg-surface px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex justify-end gap-2.5">
                      <button
                        onClick={() => handleProcessRequest("rejected")}
                        className="inline-flex items-center gap-1 px-4 py-2 border border-danger/30 hover:bg-danger/5 text-danger font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        <XCircle size={13} /> Reject Request
                      </button>
                      <button
                        onClick={() => handleProcessRequest("approved")}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-success hover:bg-success/95 text-white font-bold text-xs rounded-lg shadow-md transition-colors cursor-pointer"
                      >
                        <CheckCircle size={13} /> Approve Step
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Designer */}
      {activeTab === "designer" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Templates Switcher list */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground/60">Approval Templates</h3>
              <Button onClick={() => setShowAddTemplateModal(true)} size="sm" className="h-7 px-2 bg-primary text-white text-[10px] font-bold">
                <Plus size={12} className="mr-0.5" /> New Model
              </Button>
            </div>

            <div className="space-y-2">
              {templates.map((tpl) => {
                const isActive = selectedTpl?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTpl(tpl)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${isActive
                        ? "bg-primary/5 border-primary/30 text-primary font-semibold"
                        : "border-border/60 hover:bg-muted bg-card text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Trigger: {tpl.trigger}</p>
                    </div>
                    {isActive && <ArrowRight size={13} className="text-primary" />}
                  </button>
                );
              })}
            </div>

            <Card className="bg-gradient-to-br from-violet-900/5 to-indigo-900/5 border border-primary/10">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-primary">
                  <ShieldAlert size={14} />
                  <span className="text-2xs font-extrabold uppercase tracking-wider">Engine Constraints</span>
                </div>
                <p className="text-3xs text-muted-foreground leading-relaxed">
                  These templates represent structured BPMN-style rules. When matching transaction thresholds trigger, a Request is dynamically generated and routed to the corresponding department node.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Connected card steps details */}
          <div className="lg:col-span-3 space-y-4 animate-in fade-in duration-200">
            {!selectedTpl ? (
              <Card className="border border-border/60 p-12 text-center text-muted-foreground min-h-[400px] flex flex-col items-center justify-center bg-card/40 shadow-xs">
                <Settings size={32} className="text-muted-foreground/60 mb-2 animate-spin-slow" />
                <p className="text-xs font-bold">Select a Workflow Template</p>
                <p className="text-2xs text-muted-foreground mt-0.5">Click any template model in the sidebar to review, customize approval stages, and add nodes.</p>
              </Card>
            ) : (
              <Card className="border border-border/60 p-6 bg-card shadow-xs space-y-6">
                <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-display font-extrabold text-foreground">{selectedTpl.name}</h2>
                    <p className="text-2xs text-muted-foreground">Trigger event: <strong className="text-foreground">{selectedTpl.trigger}</strong></p>
                  </div>
                  <button
                    onClick={() => handleDeleteTemplate(selectedTpl.id, selectedTpl.name)}
                    className="text-danger hover:bg-danger/10 px-2 py-1 rounded-md text-[10px] font-bold border border-danger/20 transition-all cursor-pointer"
                  >
                    Delete Model
                  </button>
                </div>

                {/* Steps Chain Diagram */}
                <div className="space-y-4">
                  <h4 className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider">Approval Sequence Model Chain</h4>
                  <div className="flex flex-col gap-3 max-w-md pt-2">
                    {selectedTpl.steps.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                          <span className="text-xs font-semibold text-foreground">{step}</span>
                          <button
                            onClick={() => handleDeleteStep(idx)}
                            className="p-1 hover:bg-danger/10 text-muted-foreground hover:text-danger rounded-lg transition-colors cursor-pointer"
                            title="Delete step"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Step Form */}
                <form onSubmit={handleAddStep} className="pt-6 border-t border-border mt-4 space-y-3 max-w-md font-sans">
                  <div className="space-y-1.5">
                    <Label>Append Approval Node Step</Label>
                    <div className="flex gap-2">
                      <Input
                        required
                        placeholder="e.g. General Manager Ultimate Review"
                        value={newStepName}
                        onChange={(e) => setNewStepName(e.target.value)}
                        className="text-xs h-9"
                      />
                      <Button type="submit" size="sm" className="bg-primary text-white flex-shrink-0">
                        <Plus size={14} className="mr-1" /> Add Node
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Add Template Modal */}
      {showAddTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
                <Plus size={15} className="text-primary" />
                New Workflow Template
              </h3>
              <button onClick={() => setShowAddTemplateModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTemplate}>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>Workflow Model Name</Label>
                  <Input
                    required
                    placeholder="e.g. High Value Discount Authorizations"
                    value={newTemplateForm.name}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Trigger Event Action</Label>
                  <Input
                    required
                    placeholder="e.g. Discount Rate > 20%"
                    value={newTemplateForm.trigger}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, trigger: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowAddTemplateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/95 shadow-md cursor-pointer"
                >
                  <Save size={13} />
                  Save Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default WorkflowPage;
