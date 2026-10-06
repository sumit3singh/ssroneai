import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User, Mail, Home, Building, Check, X, Briefcase, Building2 } from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { updateCustomerProfile, saveCustomerAddress } from "@ssrone/api-client";
import { cn } from "@/lib/utils";

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
  const [addressLabel, setAddressLabel] = useState<"Home" | "Work" | "Hostel">("Home");
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
      
      // 1. Update customer profile in CRM
      await updateCustomerProfile(customerId, {
        name: fullName,
        email: email || undefined,
        address: fullAddressString,
        city,
        pincode,
      }).catch((e) => console.warn("updateCustomerProfile warning:", e));

      // 2. Insert new address entry into public.customer_addresses table
      await saveCustomerAddress(customerId, {
        label: addressLabel,
        fullAddress: fullAddressString,
        city,
        pincode,
      });

      // 3. Update local session state
      if (typeof updateName === "function") {
        updateName(fullName);
      }
      try {
        useCartStore.getState().setCustomerName(fullName);
      } catch {}
      if (typeof setDeliveryAddress === "function") {
        setDeliveryAddress(fullAddressString);
      }

      toast({
        title: "Profile and Address Saved",
        description: "Your address details have been updated successfully.",
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error("Save profile error:", err);
      toast({
        title: "Save Failed",
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
          className="relative w-full max-w-md bg-white border border-[#E8E3DC] rounded-3xl p-6 shadow-2xl z-10 overflow-hidden text-[#2D241E] max-h-[90vh] flex flex-col font-sans"
        >
          {/* Close Icon */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F8F6F2] text-[#7A746B] hover:text-[#2D241E] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#9E6B38]/10 text-[#9E6B38] mb-3 mx-auto flex-shrink-0 border border-[#9E6B38]/20 shadow-xs">
            <MapPin className="w-6 h-6" />
          </div>

          <h3 className="font-serif text-xl font-bold text-center mb-1 text-[#2D241E]">
            Complete Your Customer Profile
          </h3>
          <p className="text-xs text-[#7A746B] text-center mb-5 leading-relaxed">
            Please provide your delivery address and contact info to personalize your orders.
          </p>

          <form onSubmit={handleSaveProfileAndAddress} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A746B]" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                  required
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A746B]" />
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                />
              </div>
            </div>

            {/* Address Type / Label */}
            <div>
              <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                Save Address As
              </label>
              <div className="flex gap-2">
                {(["Home", "Work", "Hostel"] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddressLabel(lbl)}
                    className={cn(
                      "flex-1 min-h-[38px] py-1.5 px-3 rounded-full border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer",
                      addressLabel === lbl
                        ? "bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white border-[#8C5E35] shadow-xs"
                        : "bg-[#F8F6F2] border-[#E8E3DC] text-[#7A746B] hover:text-[#2D241E]"
                    )}
                  >
                    {lbl === "Home" && <Home className="w-3.5 h-3.5" />}
                    {lbl === "Work" && <Briefcase className="w-3.5 h-3.5" />}
                    {lbl === "Hostel" && <Building2 className="w-3.5 h-3.5" />}
                    <span>{lbl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flat / House No */}
            <div>
              <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                Flat / House / Building No.
              </label>
              <div className="relative">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A746B]" />
                <input
                  type="text"
                  placeholder="e.g. House No. 42, Floor 2"
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                />
              </div>
            </div>

            {/* Street / Area */}
            <div>
              <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                Street / Area / Landmark
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A746B]" />
                <input
                  type="text"
                  placeholder="e.g. Near University Campus"
                  value={areaStreet}
                  onChange={(e) => setAreaStreet(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                  required
                />
              </div>
            </div>

            {/* City & Pincode */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="123029"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-[44px] py-3 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] hover:opacity-95 text-white text-center font-bold text-sm flex items-center justify-center gap-2 mt-3 cursor-pointer shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? "Saving to Account" : "Save Profile & Address"} <Check className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerProfileModal;
