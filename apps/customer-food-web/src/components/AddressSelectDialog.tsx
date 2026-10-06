import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Plus, Check, Trash2, Home, Building, Phone, LogIn, Bike, Briefcase, Building2 } from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useToast } from "@/hooks/use-toast";
import { fetchSavedAddresses, saveCustomerAddress, deleteAddress, type SavedAddress } from "@ssrone/api-client";
import { cn } from "@/lib/utils";
import AuthModal from "@/components/AuthModal";

interface AddressSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (address: string) => void;
}

export const AddressSelectDialog: React.FC<AddressSelectDialogProps> = ({ isOpen, onClose, onSelect }) => {
  const { isLoggedIn, user, deliveryAddress, setDeliveryAddress } = useAuthStore();
  const { toast } = useToast();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form states
  const [addressLabel, setAddressLabel] = useState<"Home" | "Work" | "Hostel">("Home");
  const [flatNo, setFlatNo] = useState("");
  const [areaStreet, setAreaStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Mahendragarh");
  const [state, setState] = useState("Haryana");
  const [pincode, setPincode] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAddresses = () => {
    if (!isLoggedIn) return;
    setLoading(true);
    fetchSavedAddresses(user?.id || "", user?.phone || "")
      .then((res) => {
        setSavedAddresses(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        setSavedAddresses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      if (isLoggedIn) {
        loadAddresses();
      }
      setShowAddForm(false);
    }
  }, [isOpen, isLoggedIn, user?.id, user?.phone]);

  if (!isOpen) return null;

  const handleSelectAddress = (addrText: string) => {
    setDeliveryAddress(addrText);
    toast({
      title: "Delivery Address Set",
      description: addrText,
    });
    onSelect?.(addrText);
    onClose();
  };

  const handleDelete = async (addrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteAddress(user?.id || "", addrId);
      setSavedAddresses((prev) => prev.filter((a) => String(a.id) !== String(addrId)));
      toast({ title: "Address deleted" });
    } catch {
      toast({ title: "Failed to delete address", variant: "destructive" });
    }
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaStreet.trim()) {
      toast({
        title: "Street / Area Required",
        description: "Please enter your street, hostel, or road",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const parts = [];
    if (flatNo) parts.push(flatNo);
    parts.push(areaStreet.trim());
    if (landmark) parts.push(`Near ${landmark.trim()}`);
    if (city) parts.push(city);
    if (pincode) parts.push(pincode);
    const fullAddr = parts.join(", ");

    try {
      if (isLoggedIn) {
        await saveCustomerAddress(user?.id || "1", {
          label: addressLabel,
          flat_no: flatNo,
          area_street: areaStreet.trim(),
          landmark: landmark.trim(),
          fullAddress: fullAddr,
          city,
          state,
          pincode,
          alternate_phone: alternatePhone,
          phone: user?.phone,
          is_default: savedAddresses.length === 0,
        });
      }

      setDeliveryAddress(fullAddr);
      toast({
        title: "Address Saved",
        description: "Set as active delivery address.",
      });
      onSelect?.(fullAddr);
      onClose();
    } catch (err: any) {
      // Even if backend fails, set delivery address locally
      setDeliveryAddress(fullAddr);
      toast({
        title: "Address Set",
        description: fullAddr,
      });
      onSelect?.(fullAddr);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white border border-[#E8E3DC] rounded-3xl shadow-2xl p-5 sm:p-6 text-[#2D241E] overflow-hidden max-h-[90vh] flex flex-col font-sans"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-[#7A746B] hover:bg-[#F8F6F2] hover:text-[#2D241E] transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#9E6B38]/10 text-[#9E6B38] flex items-center justify-center mx-auto mb-2 border border-[#9E6B38]/20 shadow-xs">
                <Bike className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#2D241E]">Select Delivery Address</h3>
              <p className="text-xs text-[#7A746B] mt-1 leading-relaxed">
                {deliveryAddress ? (
                  <>Deliver to: <span className="font-bold text-[#2D241E] break-words">{deliveryAddress}</span></>
                ) : (
                  "Choose or add your location for fast home delivery"
                )}
              </p>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
              {!isLoggedIn && (
                <div className="bg-[#9E6B38]/5 border border-[#9E6B38]/20 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-bold text-[#2D241E]">Sign In with Mobile OTP</p>
                    <p className="text-[#7A746B] text-[11px]">Access all your saved addresses automatically</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="min-h-[36px] px-3.5 py-1.5 bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] hover:opacity-95 text-white text-xs font-bold rounded-full shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </button>
                </div>
              )}

              {/* Show Add Form Toggle or Saved Addresses */}
              {!showAddForm ? (
                <>
                  {isLoggedIn && savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider">
                        Saved Addresses
                      </p>
                      {savedAddresses.map((addr) => {
                        const isSelected = deliveryAddress === addr.fullAddress;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr.fullAddress)}
                            className={cn(
                              "group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3",
                              isSelected
                                ? "bg-[#9E6B38]/5 border-[#9E6B38] shadow-xs"
                                : "bg-white border-[#E8E3DC] hover:border-[#9E6B38]/40 hover:bg-[#F8F6F2]"
                            )}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={cn(
                                "p-2 rounded-xl shrink-0 mt-0.5",
                                isSelected ? "bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white" : "bg-[#F8F6F2] text-[#7A746B]"
                              )}>
                                {addr.label?.toLowerCase() === "work" ? (
                                  <Briefcase className="w-4 h-4" />
                                ) : addr.label?.toLowerCase() === "hostel" ? (
                                  <Building2 className="w-4 h-4" />
                                ) : (
                                  <Home className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs sm:text-sm text-[#2D241E]">{addr.label || "Address"}</span>
                                  {isSelected && (
                                    <span className="text-[10px] font-bold text-white bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] px-2 py-0.5 rounded-full shadow-xs">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#7A746B] leading-snug mt-1">
                                  {addr.fullAddress}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(addr.id, e)}
                              className="p-1.5 text-[#7A746B] hover:text-rose-600 opacity-40 group-hover:opacity-100 transition shrink-0"
                              title="Delete address"
                              aria-label="Delete address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add New Address Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-full border border-dashed border-[#9E6B38]/40 hover:border-[#9E6B38] bg-[#9E6B38]/5 hover:bg-[#9E6B38]/10 text-[#9E6B38] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add New Delivery Address
                  </button>

                  {/* Manual Quick Entry */}
                  <div className="pt-3 border-t border-[#E8E3DC]">
                    <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1.5">
                      Or Quick Type Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Near CUH Gate 2, Mahendragarh"
                        defaultValue={deliveryAddress}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) handleSelectAddress(val);
                          }
                        }}
                        id="quick-address-input"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-xs sm:text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("quick-address-input") as HTMLInputElement;
                          if (el?.value?.trim()) handleSelectAddress(el.value.trim());
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] hover:opacity-95 text-white text-xs font-bold rounded-full transition cursor-pointer shrink-0 shadow-xs"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* New Address Form */
                <form onSubmit={handleSaveNewAddress} className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-bold text-[#2D241E]">Add New Address</span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-[#9E6B38] hover:underline font-semibold cursor-pointer"
                    >
                      ← Back to list
                    </button>
                  </div>

                  {/* Label tag */}
                  <div className="flex gap-2">
                    {(["Home", "Work", "Hostel"] as const).map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddressLabel(lbl)}
                        className={cn(
                          "flex-1 min-h-[38px] py-1.5 px-2 rounded-full border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer",
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

                  <div>
                    <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                      Flat / Room / House No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Room 204, Boys Hostel 2"
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-xs sm:text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                      Street / Road / Area *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Main Market, Station Road"
                      value={areaStreet}
                      onChange={(e) => setAreaStreet(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-xs sm:text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Shiv Temple / Opp. Police Station"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-xs sm:text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-xs sm:text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-xs sm:text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                      Alternate Mobile No. (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="Secondary contact for delivery partner"
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-xs sm:text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full min-h-[44px] py-3 bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition cursor-pointer flex items-center justify-center gap-2 mt-3 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {saving ? "Saving Address" : "Save and Deliver Here"} <Check className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          loadAddresses();
        }}
        title="Sign In with Mobile"
        subtitle="Log in with your OTP-verified number to load addresses"
      />
    </>
  );
};

export default AddressSelectDialog;
