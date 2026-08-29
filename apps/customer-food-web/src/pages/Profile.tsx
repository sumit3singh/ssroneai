import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, LogOut, MapPin, Plus, Trash2, Award, ShoppingBag,
  Phone, User, Edit2, Check, X, ClipboardList, Mail
} from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import LanguageToggle from "@/components/LanguageToggle";
import { ProfileSkeleton } from "@/components/LoadingSkeleton";
import { fetchSavedAddresses, saveAddress, deleteAddress, type SavedAddress } from "@ssrone/api-client";
import { cn } from "@/lib/utils";
import CustomerProfileModal from "@/components/CustomerProfileModal";

const tierColors: Record<string, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-gray-400 to-gray-300",
  gold: "from-yellow-500 to-amber-300",
  platinum: "from-violet-600 to-indigo-400",
};

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isLoggedIn, user, logout, deliveryAddress, loyaltyTier, loyaltyPoints, totalOrders } = useAuthStore();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");

  const formatPhoneNumber = (ph?: string) => {
    if (!ph) return "+91 8059075260";
    const raw = ph.replace(/\D/g, "");
    const cleanNumber = raw.length > 10 ? raw.slice(-10) : raw;
    return `+91 ${cleanNumber}`;
  };

  const loadAddresses = () => {
    if (!isLoggedIn) return;
    fetchSavedAddresses(user?.id || "").then((addrs) => {
      if (deliveryAddress && !addrs.some((a) => a.address === deliveryAddress)) {
        setAddresses([
          { id: "primary-addr", label: "Primary Address", address: deliveryAddress, fullAddress: deliveryAddress },
          ...addrs,
        ]);
      } else if (addrs.length > 0) {
        setAddresses(addrs);
      } else if (deliveryAddress) {
        setAddresses([{ id: "primary-addr", label: "Primary Address", address: deliveryAddress, fullAddress: deliveryAddress }]);
      } else {
        setAddresses([]);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAddresses();
  }, [isLoggedIn, user?.id, deliveryAddress]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center pb-20">
        <p className="text-5xl mb-4">👤</p>
        <h2 className="font-display text-xl font-bold mb-2">{t("myOrders.loginRequired")}</h2>
        <p className="text-muted-foreground text-sm mb-6">Sign in to access your profile</p>
        <button
          onClick={() => navigate("/")}
          className="btn-order px-6 py-3"
        >
          {t("welcome.login")} 📱
        </button>
      </div>
    );
  }

  if (loading) return <div className="pb-20"><ProfileSkeleton /></div>;

  const handleDeleteAddress = async (id: string) => {
    if (id !== "primary-addr") {
      await deleteAddress(user?.id || "", id);
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      useAuthStore.getState().updateName(nameInput.trim());
    }
    setEditingName(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-popover/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg font-bold">{t("profile.title")}</h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* User info Card */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl border border-primary/20">
              👤
            </div>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-background border border-border text-sm flex-1 font-semibold"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="p-1 text-primary" aria-label="Save"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingName(false)} className="p-1 text-muted-foreground" aria-label="Cancel"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold truncate">{user?.name || "Customer"}</h2>
                  <button onClick={() => { setNameInput(user?.name || ""); setEditingName(true); }} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Edit name">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-primary" /> {formatPhoneNumber(user?.phone)}
              </p>
              {user?.email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  <Mail className="w-3 h-3 text-primary" /> {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loyalty Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-2xl p-4 text-primary-foreground bg-gradient-to-br shadow-md", tierColors[loyaltyTier.toLowerCase()] || tierColors.bronze)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="font-display font-bold text-sm capitalize">{loyaltyTier} Member</span>
            </div>
            <span className="text-xs bg-primary-foreground/20 px-2.5 py-0.5 rounded-full font-semibold">{loyaltyPoints} Points</span>
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> {totalOrders} orders</span>
            <span>1 point = ₹1 off</span>
          </div>
          <div className="mt-3 bg-primary-foreground/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary-foreground/60 rounded-full transition-all"
              style={{ width: `${Math.min(100, (loyaltyPoints / 500) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] mt-1 opacity-85 font-medium">
            {500 - loyaltyPoints > 0 ? `${500 - loyaltyPoints} points to Gold` : "You're Gold! 🏆"}
          </p>
        </motion.div>

        {/* Saved Addresses */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> {t("profile.savedAddresses")}
            </h3>
            <button onClick={() => setShowProfileModal(true)} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
              <Plus className="w-3.5 h-3.5" /> + Add / Edit Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-xs text-muted-foreground mb-2">No saved delivery address yet</p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition"
              >
                + Add Address Details
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-background border border-border/50">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{addr.label || "Delivery Address"}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{addr.fullAddress || addr.address}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="p-1 text-muted-foreground hover:text-destructive transition" aria-label="Delete address">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <button
            onClick={() => navigate("/my-orders")}
            className="w-full bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3 hover:bg-muted/50 transition text-left shadow-sm"
          >
            <ClipboardList className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{t("profile.orderHistory")}</span>
          </button>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3 hover:bg-destructive/5 transition text-left shadow-sm"
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">{t("profile.logout")}</span>
          </button>
        </div>
      </div>

      {/* Customer Profile & Address Setup Modal */}
      <CustomerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={loadAddresses}
      />
    </div>
  );
};

export default Profile;
