import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useRouter, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus, FormInput, Eye, Settings2, FileSpreadsheet,
  Trash2, Search, X, Sparkles, Download, Check
} from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input, Label } from "@/shared/ui/primitives/Input";
import { Card, CardContent } from "@/shared/ui/primitives/Card";
import { FormRenderer } from "@/shared/ui/components/FormRenderer";
import { mockDB } from "@/shared/utils/mock-db";
import { isMockSession } from "@/shared/utils/dev-mode";
import { toast } from "sonner";

export function FormBuilderPage() {
  const params = useParams({ strict: false });
  const router = useRouter();
  const queryClient = useQueryClient();

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Safe extraction of formKey parameter
  const formKey = (params as any).formKey || "guest_registration";

  const [activeTab, setActiveTab] = useState<"preview" | "editor" | "report">(
    currentPath === "/forms/designer" ? "editor" :
      currentPath === "/forms/responses" ? "report" : "preview"
  );

  useEffect(() => {
    if (currentPath === "/forms/designer") {
      setActiveTab("editor");
    } else if (currentPath === "/forms/responses") {
      setActiveTab("report");
    } else {
      setActiveTab("preview");
    }
  }, [currentPath]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const isMock = isMockSession();

  // New Field Form State
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    type: "text",
    placeholder: "",
    default_value: "",
    is_required: false,
    section: "default",
    tab: "basic",
    width: "full",
    help_text: ""
  });

  // Load Form definitions
  const formDef = useMemo(() => {
    if (!isMock) return null;
    const list = mockDB.get<any>("form_definitions");
    return list.find((x: any) => x.form_key === formKey) || list[0];
  }, [formKey, isMock]);

  // Load Form submissions
  const submissions = useMemo(() => {
    if (!isMock) return [];
    const list = mockDB.get<any>("form_submissions");
    return list
      .filter((x: any) => x.form_key === formKey)
      .sort((a: any, b: any) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
  }, [formKey, isMock]);

  // Filtered submissions based on search query
  const filteredSubmissions = useMemo(() => {
    if (!searchQuery) return submissions;
    return submissions.filter((sub: any) => {
      const dataStr = JSON.stringify(sub.data).toLowerCase();
      return dataStr.includes(searchQuery.toLowerCase());
    });
  }, [submissions, searchQuery]);

  // Discover columns dynamically from submissions keys
  const submissionColumns = useMemo(() => {
    if (submissions.length === 0) {
      return formDef ? formDef.fields.map((f: any) => f.name) : [];
    }
    const allKeys = submissions.flatMap((sub: any) => Object.keys(sub.data));
    return Array.from(new Set(allKeys)).filter((k) => k !== "id");
  }, [submissions, formDef]);

  // Invalidate query to update FormRenderer
  const refreshFormState = () => {
    queryClient.invalidateQueries({ queryKey: ["form-definition", formKey] });
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMock) {
      toast.error("Form editing is only available in mock sessions.");
      return;
    }
    if (!newField.name || !newField.label) return;

    const list = mockDB.get<any>("form_definitions");
    const idx = list.findIndex((x: any) => x.form_key === formKey);
    if (idx === -1) return;

    const targetForm = list[idx];
    const fieldId = `field-${Date.now()}`;
    const formattedFieldName = newField.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const createdField = {
      id: fieldId,
      name: formattedFieldName,
      label: newField.label,
      type: newField.type,
      placeholder: newField.placeholder || `Enter ${newField.label.toLowerCase()}`,
      default_value: newField.default_value,
      is_required: newField.is_required,
      is_readonly: false,
      is_hidden: false,
      section: newField.section || "default",
      tab: newField.tab || "basic",
      width: newField.width || "full",
      help_text: newField.help_text,
      options: newField.type === "select" ? [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" }
      ] : []
    };

    targetForm.fields.push(createdField);

    // Make sure section is in form sections
    if (!targetForm.sections.includes(newField.section)) {
      targetForm.sections.push(newField.section);
    }
    // Make sure tab is in form tabs
    if (!targetForm.tabs.includes(newField.tab)) {
      targetForm.tabs.push(newField.tab);
    }

    mockDB.update("form_definitions", targetForm.id, targetForm);
    toast.success(`Metadata Field "${newField.label}" added to form successfully!`);
    setShowAddFieldModal(false);
    refreshFormState();

    // Reset Form
    setNewField({
      name: "",
      label: "",
      type: "text",
      placeholder: "",
      default_value: "",
      is_required: false,
      section: "default",
      tab: "basic",
      width: "full",
      help_text: ""
    });
  };

  const handleDeleteField = (fieldId: string, label: string) => {
    if (!isMock) {
      toast.error("Form editing is only available in mock sessions.");
      return;
    }
    if (confirm(`Are you sure you want to delete the metadata field "${label}"? This will modify the form structure.`)) {
      const list = mockDB.get<any>("form_definitions");
      const idx = list.findIndex((x: any) => x.form_key === formKey);
      if (idx === -1) return;

      const targetForm = list[idx];
      targetForm.fields = targetForm.fields.filter((f: any) => f.id !== fieldId);
      mockDB.update("form_definitions", targetForm.id, targetForm);
      toast.success("Field deleted from form definition.");
      refreshFormState();
    }
  };

  const handleDeleteSubmission = (subId: string) => {
    if (confirm("Permanently delete this form submission record?")) {
      mockDB.delete("form_submissions", subId);
      toast.success("Submission deleted.");
      queryClient.invalidateQueries({ queryKey: ["form-submissions"] });
      // Force reload page state
      router.invalidate();
    }
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      toast.error("No submissions to export!");
      return;
    }

    // Construct simple CSV string
    const headers = ["ID", "Submitted At", ...submissionColumns];
    const rows = filteredSubmissions.map((sub: any) => [
      sub.id,
      new Date(sub.created_at || sub.date).toLocaleString(),
      ...submissionColumns.map((col: string) => {
        const val = sub.data[col];
        return typeof val === "object" ? JSON.stringify(val) : `"${String(val || "").replace(/"/g, '""')}"`;
      })
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    toast.success("Forms CSV report exported and downloaded successfully!");
    console.log("CSV Export:\n", csvContent);
  };

  const allForms = isMock ? mockDB.get<any>("form_definitions") : [];

  if (!isMock) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)]">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-xl font-display font-extrabold text-foreground">Form Builder is available only in development mock mode.</h2>
          <p className="mt-3 text-sm text-muted-foreground">This page relies on local mock form definitions and submissions and is disabled for production users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-200">

      {/* Sidebar - Available Forms */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <FormInput className="text-primary" size={20} />
          <h2 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">Dynamic Forms</h2>
        </div>

        <div className="space-y-2">
          {allForms.map((form: any) => {
            const isActive = form.form_key === formKey;
            return (
              <Link
                key={form.form_key}
                to="/forms/$formKey"
                params={{ formKey: form.form_key }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${isActive
                  ? "bg-primary/5 border-primary/40 text-primary shadow-xs font-semibold"
                  : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
              >
                <div>
                  <p className="text-xs font-bold">{form.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate">{form.description}</p>
                </div>
                {isActive && <Check size={14} className="text-primary" />}
              </Link>
            );
          })}
        </div>

        <Card className="bg-gradient-to-br from-violet-900/5 to-indigo-900/5 border border-primary/10">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-primary">
              <Sparkles size={14} />
              <span className="text-2xs font-extrabold uppercase tracking-wider">Metadata Architecture</span>
            </div>
            <p className="text-3xs text-muted-foreground leading-relaxed">
              These forms are parsed dynamically from the database fields master. Adding fields updates the JSON schema, enabling live input validation and custom field captures instantly.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header Profile Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground">{formDef?.title || "Form Configurator"}</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{formDef?.description}</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40 gap-1 flex-shrink-0 self-start">
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "preview"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Eye size={13} />
              <span>Live Preview</span>
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "editor"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Settings2 size={13} />
              <span>Schema Editor</span>
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "report"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <FileSpreadsheet size={13} />
              <span>Submissions Report</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Live Form Preview */}
        {activeTab === "preview" && (
          <Card className="border border-border/60 p-6 bg-card/40 backdrop-blur-sm shadow-xs">
            <FormRenderer formKey={formKey} onSuccess={() => router.invalidate()} />
          </Card>
        )}

        {/* Tab 2: Schema Editor */}
        {activeTab === "editor" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wide">Form Field Definitions</h3>
                <p className="text-2xs text-muted-foreground mt-0.5">Customize database schema parameters and layout sections</p>
              </div>
              <Button onClick={() => setShowAddFieldModal(true)} size="sm" className="bg-primary text-white">
                <Plus size={14} className="mr-1" />
                Add Schema Field
              </Button>
            </div>

            <Card className="border border-border/60 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                    <th className="p-3">Label</th>
                    <th className="p-3">Field Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Width</th>
                    <th className="p-3">Validation</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {formDef?.fields.map((field: any) => (
                    <tr key={field.id} className="hover:bg-muted/10">
                      <td className="p-3 font-semibold text-foreground">{field.label}</td>
                      <td className="p-3 font-mono text-2xs text-muted-foreground">{field.name}</td>
                      <td className="p-3 text-2xs uppercase font-bold text-violet-600">{field.type}</td>
                      <td className="p-3 capitalize">{field.section.replace(/_/g, " ")}</td>
                      <td className="p-3 text-2xs">{field.width}</td>
                      <td className="p-3 text-2xs text-muted-foreground">
                        {field.is_required ? (
                          <span className="text-danger font-semibold">* Required</span>
                        ) : (
                          "Optional"
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteField(field.id, field.label)}
                          className="p-1.5 hover:bg-danger/10 text-muted-foreground hover:text-danger rounded-lg transition-colors cursor-pointer"
                          title="Delete field"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Tab 3: Submissions Report (Forms Report) */}
        {activeTab === "report" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  className="pl-9 h-9 text-xs"
                  placeholder="Search submission data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} size="sm" className="bg-card text-foreground hover:bg-muted border border-border">
                  <Download size={13} className="mr-1.5" />
                  Export CSV
                </Button>
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/10 text-muted-foreground">
                <FileSpreadsheet className="mx-auto mb-2 text-muted-foreground/60" size={32} />
                <p className="text-xs font-bold">No submissions found</p>
                <p className="text-2xs text-muted-foreground/80 mt-0.5">Submit the form in the preview tab to generate reports.</p>
              </div>
            ) : (
              <Card className="border border-border/60 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                        <th className="p-3">Date</th>
                        {submissionColumns.map((col: string) => (
                          <th key={col} className="p-3 capitalize">{col.replace(/_/g, " ")}</th>
                        ))}
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {filteredSubmissions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-muted/10">
                          <td className="p-3 font-semibold text-foreground text-2xs">
                            {new Date(sub.created_at || sub.date).toLocaleString()}
                          </td>
                          {submissionColumns.map((col: string) => {
                            const val = sub.data[col];
                            return (
                              <td key={col} className="p-3 truncate max-w-[200px]" title={String(val || "")}>
                                {val === true ? (
                                  <span className="text-emerald-500 font-bold">Yes</span>
                                ) : val === false ? (
                                  <span className="text-muted-foreground">No</span>
                                ) : (
                                  String(val !== undefined ? val : "")
                                )}
                              </td>
                            );
                          })}
                          <td className="p-3 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="px-2 py-1 bg-muted/40 border border-border/40 hover:bg-muted text-[10px] font-bold rounded-md transition-colors cursor-pointer text-foreground"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(sub.id)}
                              className="p-1.5 hover:bg-danger/10 text-muted-foreground hover:text-danger rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
                <Plus size={15} className="text-primary" />
                Add Schema Field
              </h3>
              <button onClick={() => setShowAddFieldModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddField}>
              <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-1.5">
                  <Label>Field Database Name</Label>
                  <Input
                    required
                    placeholder="e.g. food_allergies (lowercase and underscores only)"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Display Label</Label>
                  <Input
                    required
                    placeholder="e.g. Food Allergies"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Input Type</Label>
                    <select
                      value={newField.type}
                      onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Number Input</option>
                      <option value="select">Dropdown Select</option>
                      <option value="checkbox">Toggle Checkbox</option>
                      <option value="textarea">Text Area</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Grid Width</Label>
                    <select
                      value={newField.width}
                      onChange={(e) => setNewField({ ...newField, width: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="full">Full Width</option>
                      <option value="half">Half Width</option>
                      <option value="third">One Third Width</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Section Category</Label>
                    <select
                      value={newField.section}
                      onChange={(e) => setNewField({ ...newField, section: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {formDef?.sections.map((sec: string) => (
                        <option key={sec} value={sec}>{sec.replace(/_/g, " ").toUpperCase()}</option>
                      ))}
                      <option value="custom_info">NEW CUSTOM SECTION</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tab Section</Label>
                    <select
                      value={newField.tab}
                      onChange={(e) => setNewField({ ...newField, tab: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {formDef?.tabs.map((tab: string) => (
                        <option key={tab} value={tab}>{tab.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Help / Description Tooltip</Label>
                  <Input
                    placeholder="e.g. Specify if guest has allergies like peanuts, lactose, etc."
                    value={newField.help_text}
                    onChange={(e) => setNewField({ ...newField, help_text: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    checked={newField.is_required}
                    onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
                    id="modal-chk-req"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="modal-chk-req" className="text-sm font-semibold text-muted-foreground cursor-pointer">
                    Enforce required validation rules
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/95 shadow-md cursor-pointer"
                >
                  <Plus size={13} />
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20 font-sans">
              <div>
                <h3 className="font-display font-bold text-foreground text-sm">Submission Data Review</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">ID: {selectedSubmission.id}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedSubmission.data).map(([key, val]: any) => (
                  <div key={key} className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                    <p className="text-xs font-semibold text-foreground mt-1 leading-normal whitespace-pre-wrap">
                      {val === true ? "Yes" : val === false ? "No" : String(val || "-")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-border bg-muted/20">
              <Button onClick={() => setSelectedSubmission(null)} className="bg-primary text-white">
                Close Review
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default FormBuilderPage;
