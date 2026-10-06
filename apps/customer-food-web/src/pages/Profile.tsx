import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, LogOut, MapPin, Plus, Trash2,
  Phone, User, Edit2, Check, X, ClipboardList, Mail, ChevronRight, UserCircle
} from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import LanguageToggle from "@/components/LanguageToggle";
import { ProfileSkeleton } from "@/components/LoadingSkeleton";
import { fetchSavedAddresses, saveAddress, deleteAddress, updateCustomerProfile, type SavedAddress } from "@ssrone/api-client";
import { cn } from "@/lib/utils";
import CustomerProfileModal from "@/components/CustomerProfileModal";
import BottomNav from "@/components/BottomNav";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/cartStore";

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isLoggedIn, user, logout, deliveryAddress, totalOrders } = useAuthStore();
  const { tenantSlug, branchCode, tableNumber } = useTenantBranchContext();

  const homePath = tenantSlug && branchCode
    ? tableNumber
      ? `/t/${tenantSlug}/b/${branchCode}/table/${tableNumber}`
      : `/t/${tenantSlug}/b/${branchCode}`
    : "/";

  const ordersPath = tenantSlug && branchCode
    ? `/t/${tenantSlug}/b/${branchCode}/my-orders`
    : "/my-orders";

  const { toast } = useToast();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");

  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    navigate(homePath, { replace: true });
  };

  const formatPhoneNumber = (ph?: string) => {
    const rawTarget = ph || user?.phone;
    if (!rawTarget) return "";
    const raw = rawTarget.replace(/\D/g, "");
    const cleanNumber = raw.length > 10 ? raw.slice(-10) : raw;
    return `+91 ${cleanNumber}`;
  };

  const loadAddresses = () => {
    if (!isLoggedIn) return;
    fetchSavedAddresses(user?.id || "", user?.phone || "")
      .then((addrs) => {
        setAddresses(Array.isArray(addrs) ? addrs : []);
        setLoading(false);
      })
      .catch(() => {
        setAddresses([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAddresses();
  }, [isLoggedIn, user?.id, user?.phone]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex flex-col items-center justify-center p-6 text-center pb-20 font-sans">
        <div className="w-16 h-16 rounded-full bg-[#E8E3DC]/60 flex items-center justify-center mb-4 text-[#7A746B]">
          <UserCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#2D241E] mb-1 font-serif">{t("myOrders.loginRequired")}</h2>
        <p className="text-[#7A746B] text-xs sm:text-sm mb-6 max-w-xs">Sign in to access your profile</p>
        <button
          onClick={() => navigate(homePath)}
          className="px-6 py-3 rounded-full bg-[#9E6B38] hover:bg-[#86592d] text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {t("welcome.login")}
        </button>
      </div>
    );
  }

  if (loading) return <div className="pb-20"><ProfileSkeleton /></div>;

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(user?.id || "", id);
    } catch {
      // ignore
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed && user?.id) {
      useAuthStore.getState().updateName(trimmed);
      useCartStore.getState().setCustomerName(trimmed);
      try {
        await updateCustomerProfile(user.id, { name: trimmed, phone: user.phone });
        toast({ title: "Name Updated", description: "Successfully saved to database." });
      } catch (err) {
        try {
          const digits = (user.phone || "").replace(/\D/g, "");
          if (digits) await updateCustomerProfile(digits, { name: trimmed });
          toast({ title: "Name Updated", description: "Successfully saved to database." });
        } catch {
          toast({ title: "Local Update Saved", description: "Name updated in current session." });
        }
      }
    }
    setEditingName(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] pb-28 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8E3DC] px-4 py-3.5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-[#F8F6F2] hover:bg-[#E8E3DC] text-[#2D241E] flex items-center justify-center transition cursor-pointer active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-extrabold text-[#2D241E] font-serif tracking-tight">{t("profile.title")}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#9E6B38]/10 border border-[#9E6B38]/20 text-[#9E6B38] flex items-center justify-center text-xl font-black shrink-0 font-serif">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm text-[#2D241E] flex-1 font-bold focus:outline-none focus:border-[#9E6B38]"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="p-1.5 rounded-full bg-[#9E6B38] text-white cursor-pointer hover:bg-[#86592d] transition" aria-label="Save">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingName(false)} className="p-1.5 rounded-full bg-[#F8F6F2] text-[#7A746B] border border-[#E8E3DC] cursor-pointer" aria-label="Cancel">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[#2D241E] font-serif">{user?.name || "Customer"}</h2>
                  <button onClick={() => { setNameInput(user?.name || ""); setEditingName(true); }} className="p-1 text-[#7A746B] hover:text-[#9E6B38] cursor-pointer" aria-label="Edit name">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs font-semibold text-[#7A746B] flex items-center gap-1.5 mt-1">
                <Phone className="w-3 h-3 text-[#9E6B38]" /> {formatPhoneNumber(user?.phone)}
              </p>
              {user?.email && (
                <p className="text-xs text-[#7A746B] flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3 h-3 text-[#9E6B38]" /> {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white border border-[#E8E3DC] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-[#2D241E] font-serif">
              <MapPin className="w-4 h-4 text-[#9E6B38]" /> {t("profile.savedAddresses")}
            </h3>
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-xs text-[#9E6B38] font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add / Edit Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-4 bg-[#F8F6F2] border border-dashed border-[#E8E3DC] rounded-xl p-4">
              <p className="text-xs text-[#7A746B] mb-3">No saved delivery address yet</p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="text-xs bg-[#9E6B38]/10 text-[#9E6B38] font-bold px-4 py-2 rounded-full border border-[#9E6B38]/20 hover:bg-[#9E6B38]/20 transition cursor-pointer active:scale-95"
              >
                + Add Address Details
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC]">
                <MapPin className="w-4 h-4 text-[#9E6B38] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#2D241E]">{addr.label || "Delivery Address"}</p>
                  <p className="text-xs text-[#7A746B] leading-snug mt-0.5">{addr.fullAddress || addr.address}</p>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="p-1 text-[#7A746B] hover:text-[#E53935] transition cursor-pointer"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ── Premium Action Buttons ── */}
        <div className="space-y-3 pt-1">
          {/* 1. Premium Order History Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(ordersPath)}
            className="w-full relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border border-amber-300/70 shadow-[0_4px_20px_rgba(158,107,56,0.08)] hover:shadow-[0_6px_24px_rgba(158,107,56,0.15)] hover:border-amber-400 transition-all text-left flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9E6B38] to-[#784f2b] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <ClipboardList className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base text-[#2D241E] tracking-tight">
                    Order History
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Last 7 Days
                  </span>
                </div>
                <p className="text-xs text-[#7A746B] mt-0.5 truncate">
                  View past orders, receipts & quick re-order
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white border border-amber-200 text-[#9E6B38] flex items-center justify-center shadow-xs group-hover:translate-x-1 group-hover:bg-[#9E6B38] group-hover:text-white transition-all shrink-0 ml-2">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </motion.button>

          {/* 2. Premium Logout Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleLogout}
            className="w-full relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-rose-50/70 via-white to-rose-50/40 border border-rose-200 hover:border-rose-400 hover:bg-rose-50/80 shadow-[0_4px_16px_rgba(229,57,53,0.06)] hover:shadow-[0_6px_20px_rgba(229,57,53,0.12)] transition-all text-left flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <LogOut className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="font-serif font-bold text-base text-rose-700 tracking-tight block">
                  Log Out
                </span>
                <p className="text-xs text-[#7A746B] mt-0.5 truncate">
                  Sign out safely from this device
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs group-hover:translate-x-1 group-hover:bg-rose-600 group-hover:text-white transition-all shrink-0 ml-2">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Customer Profile & Address Setup Modal */}
      <CustomerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={loadAddresses}
      />

      {/* Global Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export default Profile;
