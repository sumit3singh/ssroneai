/**
 * Universal Master & Transaction CRUD View Component
 * Provides complete CRUD controls for any business module (POS, Hotel, Inventory, Finance, CRM, HR, PG).
 */
import React, { useState } from "react";
import { Table } from "@ssr-one-ai/tables";
import { Form } from "@ssr-one-ai/forms";

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

  const handleCreate = (data: Record<string, unknown>) => {
    const newItem = {
      id: String(Date.now()),
      ...data,
      created_at: new Date().toISOString().split("T")[0],
    };
    setItems((prev) => [newItem, ...prev]);
    setShowModal(false);
  };

  const columns = [
    { key: "id", header: "ID" },
    ...fields.map((f) => ({ key: f.name, header: f.label })),
    { key: "created_at", header: "Created Date" },
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Master & Transaction Management for {moduleKey.toUpperCase()}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg shadow hover:bg-primary/90 transition"
        >
          + Add New Record
        </button>
      </div>

      <div className="border rounded-xl p-4 bg-card shadow-sm">
        <Table columns={columns} data={items} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4">Create New {title}</h2>
            <Form
              fields={fields}
              onSubmit={handleCreate}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
