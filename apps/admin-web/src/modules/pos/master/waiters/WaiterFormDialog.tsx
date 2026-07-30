import React, { useState } from "react";
import { Users, X } from "lucide-react";
import { Input } from "@/shared/ui/primitives/Input";
import { Button } from "@/shared/ui/primitives/Button";

interface WaiterFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, code: string) => Promise<void>;
}

export const WaiterFormDialog: React.FC<WaiterFormDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave(name, code || `W${Date.now().toString().slice(-3)}`);
      setName("");
      setCode("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-extrabold text-base text-foreground">Register New Waiter / Staff</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Full Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suman Lata"
              required
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Staff Code / Badge ID</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. W102"
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-primary text-white font-bold">
              {isSaving ? "Registering..." : "Register Waiter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
