import React, { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

interface CustomerDeleteModalProps {
  isOpen: boolean;
  customer: any | null;
  onClose: () => void;
  onSuccess: (deletedCustomerId: number | string) => void;
}

export const CustomerDeleteModal: React.FC<CustomerDeleteModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !customer) return null;

  const displayName = customer.name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || `Customer #${customer.id}`;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/crm/customers/${customer.id}`);
      toast.success(`Guest profile '${displayName}' has been deleted`);
      onSuccess(customer.id);
      onClose();
    } catch (err: any) {
      console.error("Failed to delete customer", err);
      toast.error(err?.response?.data?.detail || err?.message || "Failed to delete customer");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-card border border-destructive/30 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 font-sans">
        
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive border border-destructive/25 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-foreground">
              Delete Guest Profile?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove <strong className="text-foreground">{displayName}</strong> ({customer.phone || "No phone"})?
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
          <p>• The customer record will be safely deactivated in PostgreSQL.</p>
          <p>• Existing bills and historical transaction records will remain preserved for audit integrity.</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleDelete}
            className="h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 size={13} /> {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};
