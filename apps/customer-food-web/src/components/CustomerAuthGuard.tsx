import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  User,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useAuthStore, setAuth } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import {
  sendOtp,
  verifyOtp,
  checkCustomerPhone,
  updateCustomerProfile,
} from "@ssrone/api-client";
import { useToast } from "@/hooks/use-toast";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import { useTenantAppConfig } from "@/hooks/useTenantAppConfig";
import { useCartStore } from "@/stores/cartStore";
import CustomerProfileModal from "@/components/CustomerProfileModal";
import { cn } from "@/lib/utils";

interface CustomerAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const CustomerAuthGuard: React.FC<CustomerAuthGuardProps> = ({
  children,
  requireAuth = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setLoyalty } = useAuthStore();
  const { tenantSlug, branchCode, tableNumber } = useTenantBranchContext();
  const { branding } = useTenantAppConfig();
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const { t } = useI18n();
  const { toast } = useToast();

  const storeTitle =
    branding.businessName ||
    (tenantSlug
      ? tenantSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "The Baithak Cafe");

  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [devCodeHint, setDevCodeHint] = useState<string>("1234");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(28);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempUserObj, setTempUserObj] = useState<any>(null);

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // When logged out, strictly reset state back to the initial phone number input screen
  useEffect(() => {
    if (!isLoggedIn) {
      setStep("phone");
      setPhone("");
      setOtp(["", "", "", ""]);
      setError("");
      setTempUserObj(null);
    }
  }, [isLoggedIn]);

  // Bypass authentication for staff / admin QR routes
  const isStaffRoute =
    location.pathname.startsWith("/staff") || location.pathname.startsWith("/admin");

  if (!requireAuth || isLoggedIn || isStaffRoute) {
    return (
      <>
        {children}
        <CustomerProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      </>
    );
  }

  // After login: If table is present, navigate directly to table menu!
  const handlePostLoginFlow = (userObj: any) => {
    setAuth({ user: userObj, access_token: userObj.token || "customer_guest_token" });
    setShowProfileModal(false);

    const activeTable = tableNumber || useCartStore.getState().tableNumber;
    if (activeTable) {
      setTableNumber(activeTable);
      navigate(
        `/t/${tenantSlug || "baithak-cafe"}/b/${branchCode || "101"}/table/${activeTable}/menu`,
        { replace: true }
      );
    }
  };

  const handleSendOtp = async (overrideChannel?: "whatsapp" | "sms") => {
    const targetChannel = overrideChannel || channel;
    if (overrideChannel) setChannel(overrideChannel);

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setError("");
    setVerifying(true);

    try {
      const check = await checkCustomerPhone(cleanDigits, tenantSlug).catch(() => ({
        exists: false,
        name: "",
      }));
      if (check.exists && check.name) {
        setName(check.name);
      }

      const result = await sendOtp(cleanDigits, targetChannel, tenantSlug);
      if (result.success) {
        setStep("otp");
        const activeCode = (result.otp || "1234").slice(0, 4);
        setDevCodeHint(activeCode);
        setOtp(activeCode.split(""));
        setResendTimer(28);
      }
    } catch {
      setError(`Failed to send ${targetChannel.toUpperCase()} verification code. Please retry.`);
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 4).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 4) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(digits.length, 3);
      otpInputRefs[nextIdx].current?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned[0];
    setOtp(newOtp);

    if (cleaned && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join("").trim();
    if (fullOtp.length < 4) {
      setError("Please enter the complete 4-digit code");
      return;
    }

    setError("");
    setVerifying(true);

    try {
      const cleanDigits = phone.replace(/\D/g, "");
      const result = await verifyOtp(cleanDigits, fullOtp, tenantSlug, name || undefined);

      if (result.success) {
        const candidateName = result.user?.name || name || "";
        const isPlaceholder =
          !candidateName.trim() ||
          candidateName.startsWith("Customer ") ||
          candidateName === "Guest Customer";

        if (isPlaceholder) {
          setTempUserObj({
            id: result.user.id,
            name: candidateName,
            phone: result.user.phone,
            token: result.token,
            loyaltyTier: result.user.loyaltyTier,
            loyaltyPoints: result.user.loyaltyPoints,
          });
          setStep("name");
          return;
        }

        const userObj = {
          id: result.user.id,
          name: candidateName,
          phone: result.user.phone,
          token: result.token || "customer_guest_token",
        };

        handlePostLoginFlow(userObj);
        setLoyalty(result.user.loyaltyTier || "BRONZE", result.user.loyaltyPoints || 0);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.detail ||
        err?.message ||
        "Invalid OTP code. Please enter the correct code.";
      setError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveNameAndFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUserObj) return;

    const finalName = name.trim();
    if (finalName) {
      try {
        await updateCustomerProfile(tempUserObj.id, {
          name: finalName,
          phone: tempUserObj.phone,
        });
      } catch {
        try {
          const digits = tempUserObj.phone.replace(/\D/g, "");
          await updateCustomerProfile(digits, { name: finalName });
        } catch {
          // non-fatal
        }
      }

      const updatedUser = {
        ...tempUserObj,
        name: finalName,
      };
      setLoyalty(tempUserObj.loyaltyTier || "BRONZE", tempUserObj.loyaltyPoints || 100);
      handlePostLoginFlow(updatedUser);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-center items-center px-4 py-2 select-none bg-[#FBF8F3] text-[#2D241E] font-sans">
      {/* Subtle Ambient Background Corner Accents */}
      <div
        className="fixed top-0 left-0 w-36 h-36 pointer-events-none opacity-20 bg-no-repeat bg-contain"
        style={{
          backgroundImage: `radial-gradient(circle at top left, #D97706 0%, transparent 70%)`,
        }}
      />
      <div
        className="fixed top-0 right-0 w-36 h-36 pointer-events-none opacity-20 bg-no-repeat bg-contain"
        style={{
          backgroundImage: `radial-gradient(circle at top right, #8C5E35 0%, transparent 70%)`,
        }}
      />

      <div className="w-full max-w-[340px] mx-auto flex flex-col items-center">
        {/* ── Brand Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full text-center mb-3 flex flex-col items-center"
        >
          {/* Steaming Cafe Cup Emblem */}
          <div className="w-12 h-12 rounded-full border border-[#D4A373]/80 bg-[#FAF7F2] p-2 shadow-sm flex items-center justify-center mb-1.5">
            <svg
              className="w-6 h-6 text-[#9E6B38]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
              <path d="M6 2v2M10 2v2M14 2v2" />
              <line x1="2" y1="21" x2="20" y2="21" />
            </svg>
          </div>

          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#2D241E] tracking-tight leading-tight">
            {storeTitle}
          </h1>

          <p className="text-[10px] font-bold text-[#8C5E35] uppercase tracking-[0.2em] mt-0.5">
            Good Food • Great Vibes
          </p>
        </motion.div>

        {/* ── Compact Luxury Card Container (Zero Vertical Overflow) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full bg-white rounded-3xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(158,107,56,0.08)] border border-[#E8E3DC] text-[#2D241E]"
        >
          <AnimatePresence mode="wait">
            {/* ════════ SCREEN 1: PHONE NUMBER ════════ */}
            {step === "phone" && (
              <motion.div
                key="step-phone"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.16 }}
                className="space-y-3"
              >
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2D241E]">
                    Login to Order
                  </h2>
                  <p className="text-[11px] text-[#7A746B] mt-0.5">
                    Enter your mobile number to view menu & order
                  </p>
                </div>

                {/* Mobile Number Input with Indian Flag */}
                <div className="relative flex items-center bg-[#FAF8F5] rounded-2xl border border-[#E8E3DC] focus-within:border-[#9E6B38] focus-within:ring-2 focus-within:ring-[#9E6B38]/15 transition px-3 py-1.5">
                  <div className="flex items-center gap-1 pr-2.5 mr-2 text-xs font-bold text-[#2D241E] border-r border-[#E8E3DC] select-none shrink-0">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      if (error) setError("");
                    }}
                    className="w-full bg-transparent text-sm font-bold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none tracking-wider py-1"
                    autoFocus
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-center text-xs font-semibold text-destructive"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={verifying || phone.length < 10}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white hover:brightness-105 font-bold text-sm shadow-[0_4px_14px_rgba(158,107,56,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                {/* WhatsApp Alternative */}
                <button
                  type="button"
                  onClick={() => handleSendOtp("whatsapp")}
                  disabled={verifying}
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>Continue with WhatsApp</span>
                </button>

                {/* Safe & Secure note */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#7A746B] pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Secure OTP verification</span>
                </div>
              </motion.div>
            )}

            {/* ════════ SCREEN 2: OTP VERIFICATION ════════ */}
            {step === "otp" && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setError("");
                    }}
                    className="p-1 rounded-full hover:bg-[#EFE9DF] text-[#2D241E] transition cursor-pointer"
                    aria-label="Back to mobile number"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <span className="text-[11px] font-bold text-[#8C5E35]">
                    +91 {phone}
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2D241E]">
                    Verify Your Number
                  </h2>
                  <p className="text-[11px] text-[#7A746B] mt-0.5">
                    Enter the 4-digit verification code
                  </p>
                </div>

                {/* Dev/Testing OTP Autofill Banner */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      OTP: <strong className="font-mono">{devCodeHint || "1234"}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const codeToFill = (devCodeHint || "1234").split("");
                      setOtp(codeToFill);
                      setError("");
                    }}
                    className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase transition active:scale-95 cursor-pointer"
                  >
                    Fill 1234
                  </button>
                </div>

                {/* 4 Digit Boxes */}
                <div className="flex justify-center gap-2 py-0.5">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpInputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={index === 0 ? 4 : 1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={cn(
                        "w-11 h-12 rounded-2xl text-center text-lg font-mono font-extrabold bg-[#FAF8F5] border transition text-[#2D241E] focus:outline-none",
                        digit
                          ? "border-[#8C5E35] bg-[#8C5E35]/5 ring-2 ring-[#8C5E35]/15"
                          : "border-[#E8E3DC] focus:border-[#8C5E35] focus:ring-2 focus:ring-[#8C5E35]/15"
                      )}
                    />
                  ))}
                </div>

                {/* Resend Timer */}
                <div className="text-center text-xs text-[#7A746B] flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {resendTimer > 0 ? (
                    <span>
                      Resend in{" "}
                      <strong className="font-mono text-[#2D241E]">
                        00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                      </strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-[#8C5E35] font-bold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-center text-xs font-semibold text-destructive"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Verify & Continue Button */}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifying || otp.join("").length < 4}
                  className="w-full py-3 px-4 rounded-2xl bg-[#8C5E35] hover:bg-[#784f2b] text-white font-bold text-sm shadow-[0_4px_14px_rgba(140,94,53,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* ════════ SCREEN 3: FIRST-TIME CUSTOMER NAME ════════ */}
            {step === "name" && (
              <motion.form
                key="step-name"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSaveNameAndFinish}
                className="space-y-3"
              >
                <div className="text-center space-y-0.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#9E6B38]/10 border border-[#9E6B38]/20 flex items-center justify-center mx-auto text-[#9E6B38] mb-1">
                    <User className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-[#2D241E]">
                    Welcome!
                  </h2>
                  <p className="text-[11px] text-[#7A746B]">
                    What should we call you for your orders?
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="relative flex items-center bg-[#FAF8F5] rounded-2xl border border-[#E8E3DC] focus-within:border-[#9E6B38] focus-within:ring-2 focus-within:ring-[#9E6B38]/15 transition">
                    <User className="w-4 h-4 text-[#7A746B] ml-3 shrink-0 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-2.5 pr-3 py-2.5 bg-transparent text-sm font-bold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white hover:brightness-105 font-bold text-sm shadow-[0_4px_14px_rgba(158,107,56,0.3)] transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Start Ordering</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (tempUserObj) {
                        handlePostLoginFlow({
                          ...tempUserObj,
                          name: `Customer ${phone.slice(-4)}`,
                        });
                      }
                    }}
                    className="text-xs text-[#7A746B] hover:text-[#9E6B38] font-semibold cursor-pointer underline"
                  >
                    Skip for now
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerAuthGuard;
