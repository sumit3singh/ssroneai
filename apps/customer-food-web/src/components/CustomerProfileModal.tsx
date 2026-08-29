import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User, Mail, Home, Building, Check, X } from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useToast } from "@/hooks/use-toast";
import { updateCustomerProfile, saveCustomerAddress } from "@ssrone/api-client";

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const CustomerProfileModal = ({
  isOpen,
  onClose,
  onSaved,
}: CustomerProfileModalProps) => {
  const { user, updateName, setDeliveryAddress } = useAuthStore();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [flatNo, setFlatNo] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [city, setCity] = useState("Mahendragarh");
  const [pincode, setPincode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setFullName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  if (!isOpen) return null;

  const handleSaveProfileAndAddress = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (saving) return;

    if (!areaStreet.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your street or area address",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const fullAddressString = `${flatNo ? flatNo + ", " : ""}${areaStreet}, ${city}${pincode ? " - " + pincode : ""}`;

    try {
      const customerId = user?.id || "1";
      
      // 1. Save directly to PostgreSQL Backend Database
      await updateCustomerProfile(customerId, {
        name: fullName,
        email: email || undefined,
        address: fullAddressString,
        city,
        pincode,
      });

      // 2. Insert new address entry into public.customer_addresses table
      await saveCustomerAddress(customerId, {
        label: "Home",
        fullAddress: fullAddressString,
        city,
        pincode,
      });

      // 2. Update local session state
      if (typeof updateName === "function") {
        updateName(fullName);
      }
      if (typeof setDeliveryAddress === "function") {
        setDeliveryAddress(fullAddressString);
      }

      toast({
        title: "Profile & Address Saved! 📍",
        description: "Your address details have been updated in PostgreSQL database.",
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error("Save profile error:", err);
      toast({
        title: "Database Save Failed",
        description: err?.response?.data?.detail || err?.message || "Could not save to database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-popover border border-border rounded-2xl p-6 shadow-2xl z-10 overflow-hidden text-popover-foreground max-h-[90vh] flex flex-col"
        >
          {/* Close Icon */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3 mx-auto flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-display font-bold text-center mb-1">
            Complete Your Customer Profile
          </h3>
          <p className="text-xs text-muted-foreground text-center mb-5">
            Please provide your delivery address & contact info to personalize your orders.
          </p>

          <form onSubmit={handleSaveProfileAndAddress} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
            {/* Full Name */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Sumit"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="sumit@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Flat / House No */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Flat / House / Building No.
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. House No. 42, Floor 2"
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Street / Area */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Street / Area / Landmark
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. Near CUH University Campus"
                  value={areaStreet}
                  onChange={(e) => setAreaStreet(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
            </div>

            {/* City & Pincode */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="123029"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveProfileAndAddress}
              disabled={saving}
              className="btn-order w-full py-3 text-center font-bold text-sm flex items-center justify-center gap-1.5 mt-2 cursor-pointer active:scale-95 transition"
            >
              {saving ? "Saving to Account..." : "Save Profile & Address"} <Check className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerProfileModal;
