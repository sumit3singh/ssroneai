import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, User, KeyRound, X, Check, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore, setAuth } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import { sendOtp, verifyOtp, updateCustomerProfile } from "@ssrone/api-client";
import { useToast } from "@/hooks/use-toast";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign In with Mobile Number",
  subtitle = "Enter your mobile number to proceed with your order",
}: AuthModalProps) => {
  const { setLoyalty } = useAuthStore();
  const { t } = useI18n();
  const { toast } = useToast();
  const { tenantSlug } = useTenantBranchContext();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPhone("");
      setOtp("");
      setName("");
      setOtpSent(false);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    try {
      const cleanDigits = phone.replace(/\D/g, "");
      const result = await sendOtp(cleanDigits, "sms", tenantSlug);
      if (result.success) {
        setOtpSent(true);
        const activeCode = (result.otp || "1234").slice(0, 4);
        setOtp(activeCode);
        toast({ title: "Verification Code Ready ⚡", description: `Test code ${activeCode} auto-filled. Tap Verify!` });
        setResendTimer(30);
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const cleanDigits = phone.replace(/\D/g, "");
      const result = await verifyOtp(cleanDigits, otp, tenantSlug, name.trim() || undefined);
      if (result.success) {
        const userName = name.trim() || result.user.name || `Customer ${phone.slice(-4)}`;
        if (name.trim()) {
          try {
            await updateCustomerProfile(result.user.id, { name: name.trim(), phone: result.user.phone });
          } catch {
            // non-fatal fallback
          }
        }
        const userObj = {
          id: result.user.id,
          name: userName,
          phone: result.user.phone,
          token: result.token || "customer_guest_token",
        };
        setAuth({ user: userObj, access_token: userObj.token });
        setLoyalty(result.user.loyaltyTier, result.user.loyaltyPoints);
        toast({ title: "Logged In Successfully", description: `Welcome back, ${userName}` });
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error("AuthModal verification failed:", err);
      const detail = err?.response?.data?.detail || err?.detail || err?.message || "Invalid OTP code. Please try again.";
      setError(detail);
    } finally {
      setVerifying(false);
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

        {/* Auth Sheet Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-sm bg-white border border-[#E8E3DC] rounded-3xl p-6 shadow-2xl z-10 overflow-hidden text-[#2D241E] font-sans"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F8F6F2] text-[#7A746B] hover:text-[#2D241E] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#9E6B38]/10 text-[#9E6B38] mb-3 mx-auto border border-[#9E6B38]/20 shadow-xs">
            <Phone className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="font-serif text-xl font-bold text-center mb-1 text-[#2D241E]">
            {otpSent ? "Enter Verification Code" : title}
          </h3>
          <p className="text-xs text-[#7A746B] text-center mb-5 leading-relaxed">
            {otpSent ? `Code sent via SMS to +91 ${phone}` : subtitle}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!otpSent) {
                handleSendOtp();
              } else {
                handleVerifyOtp();
              }
            }}
            className="space-y-3.5"
          >
            {!otpSent ? (
              <>
                <div>
                  <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-[#2D241E] border-r border-[#E8E3DC] pr-2.5">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full pl-16 pr-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A746B]" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                    />
                  </div>
                </div>

                {error && <p className="text-rose-600 text-xs text-center font-medium bg-rose-50 border border-rose-200 rounded-xl py-2 px-3">{error}</p>}

                <button
                  type="submit"
                  className="w-full min-h-[44px] py-3 px-4 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white font-bold hover:opacity-95 shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  Send OTP Code <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Instant Dev/Testing OTP Autofill Banner */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Test OTP: <strong className="font-mono text-sm tracking-widest">{otp || "1234"}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp("1234");
                      setError("");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold uppercase tracking-wide transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    Fill 1234
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider block mb-1 text-center">
                    4-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A746B]" />
                    <input
                      type="text"
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full text-center tracking-[0.5em] font-mono font-black text-lg py-2.5 rounded-xl bg-[#F8F6F2] border border-[#E8E3DC] text-[#2D241E] focus:outline-none focus:border-[#9E6B38] focus:ring-2 focus:ring-[#9E6B38]/20 transition"
                      autoFocus
                    />
                  </div>
                </div>

                {error && <p className="text-rose-600 text-xs text-center font-medium bg-rose-50 border border-rose-200 rounded-xl py-2 px-3">{error}</p>}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full min-h-[44px] py-3 px-4 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white font-bold hover:opacity-95 shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {verifying ? "Verifying Code" : "Verify & Log In"} <Check className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0}
                    className="text-xs text-[#9E6B38] hover:underline font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP Code"}
                  </button>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;

