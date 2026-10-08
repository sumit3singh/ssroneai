import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin, Award, Save } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

interface CustomerEditModalProps {
  isOpen: boolean;
  customer: any | null;
  onClose: () => void;
  onSuccess: (updatedCustomer: any) => void;
}

export const CustomerEditModal: React.FC<CustomerEditModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      setName(customer.name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "");
      setPhone(customer.phone || "");
      setEmail(customer.email || "");
      setCity(customer.city || "");
      setPincode(customer.pincode || "");
      const addrStr = typeof customer.address === "string"
        ? customer.address
        : customer.address?.fullAddress || customer.address?.area_street || "";
      setAddress(addrStr);
      setLoyaltyPoints(customer.loyalty_points || 0);
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Mobile phone number is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        city: city.trim() || null,
        pincode: pincode.trim() || null,
        address: address.trim() || null,
        loyalty_points: Number(loyaltyPoints),
      };

      const res = await api.put<any>(`/crm/customers/${customer.id}`, payload);
      toast.success(`Guest profile '${name}' updated successfully!`);
      const updated = res.customer || { ...customer, ...payload };
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error("Failed to update customer", err);
      toast.error(err?.response?.data?.detail || err?.message || "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <User size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-foreground leading-tight">
                Edit Guest Profile
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Update customer contact, addresses, and loyalty metrics.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:bg-muted rounded-md cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Full Name (ग्राहक का नाम) *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ajay"
                className="h-8 text-xs bg-background"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Mobile Number (मोबाइल नं.) *
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 8930850777"
                className="h-8 text-xs font-mono bg-background"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. guest@example.com"
                className="h-8 text-xs bg-background"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Loyalty Points Balance
              </label>
              <Input
                type="number"
                min="0"
                value={loyaltyPoints}
                onChange={(e) => setLoyaltyPoints(Number(e.target.value))}
                className="h-8 text-xs font-mono font-bold bg-background text-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
              Address / Street (पता / मोहल्ला)
            </label>
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Market, Near Clock Tower"
              className="h-8 text-xs bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                City (शहर)
              </label>
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mahendragarh"
                className="h-8 text-xs bg-background"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Pincode
              </label>
              <Input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 123029"
                className="h-8 text-xs font-mono bg-background"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
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
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
            >
              <Save size={13} /> {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
