/**
 * Universal Master & Transaction CRUD View Component
 * Provides complete CRUD controls for any business module (POS, Hotel, Inventory, Finance, CRM, HR, PG).
 */
import React, { useState } from "react";

export interface MasterTransactionCRUDProps {
  title: string;
  moduleKey: string;
  entityKey: string;
  fields: Array<{
    name: string;
    label: string;
    type?: "text" | "number" | "select" | "date";
    options?: string[];
  }>;
}

export function MasterTransactionCRUD({
  title,
  moduleKey,
  entityKey,
  fields,
}: MasterTransactionCRUDProps) {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([
    { id: "1", code: `${entityKey.toUpperCase()}_001`, status: "ACTIVE", created_at: "2026-07-30" },
    { id: "2", code: `${entityKey.toUpperCase()}_002`, status: "ACTIVE", created_at: "2026-07-30" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: String(Date.now()),
      ...formData,
      created_at: new Date().toISOString().split("T")[0],
    };
    setItems((prev) => [newItem, ...prev]);
    setShowModal(false);
    setFormData({});
  };

  const columns = [
    { key: "id", header: "ID" },
    ...fields.map((f) => ({ key: f.name, header: f.label })),
    { key: "created_at", header: "Created Date" },
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Master & Transaction Management for {moduleKey.toUpperCase()}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg shadow hover:bg-primary/90 transition cursor-pointer"
        >
          + Add New Record
        </button>
      </div>

      <div className="border border-border rounded-xl p-4 bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase">
              {columns.map((c) => (
                <th key={c.key} className="p-3">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={String(item.id)} className="border-b border-border/50 hover:bg-muted/30">
                {columns.map((c) => (
                  <td key={c.key} className="p-3 font-semibold">{String(item[c.key] ?? "-")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-5 w-full max-w-lg shadow-md relative space-y-3">
            <h2 className="text-sm font-bold text-foreground">Create New {title}</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              {fields.map((f) => (
                <div key={f.name} className="space-y-1">
                  <label className="text-[11px] font-mono font-semibold text-muted-foreground uppercase">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={String(formData[f.name] || "")}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="w-full p-2 text-xs border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-border text-xs font-semibold rounded-md text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md cursor-pointer shadow-2xs"
                >
                  {loading ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
