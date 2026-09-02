import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Lock, KeyRound, User, ArrowRight, Check, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import { sendOtp, verifyOtp, checkCustomerPhone, registerCustomerAccount, resetCustomerPassword } from "@ssrone/api-client";
import { useToast } from "@/hooks/use-toast";
import heroFood from "@/assets/hero-food.jpg";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import CustomerProfileModal from "@/components/CustomerProfileModal";

interface CustomerAuthGuardProps {
  children: React.ReactNode;
}

export const CustomerAuthGuard: React.FC<CustomerAuthGuardProps> = ({ children }) => {
  const { isLoggedIn, login, setLoyalty } = useAuthStore();
  const { tenantSlug, branchCode, branches } = useTenantBranchContext();
  const { t } = useI18n();
  const { toast } = useToast();

  const activeBranch = branches.find((b) => b.code === branchCode);
  const storeTitle = activeBranch?.name || (tenantSlug ? tenantSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "SSR One AI Cafe");

  // Auth Mode State: 'otp' | 'password' | 'forgot'
  const [authMethod, setAuthMethod] = useState<"otp" | "password" | "forgot">("otp");
  const [isRegister, setIsRegister] = useState(false);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [unregisteredMsg, setUnregisteredMsg] = useState(false);
  const [alreadyRegisteredMsg, setAlreadyRegisteredMsg] = useState(false);

  // If already logged in, render child routes
  if (isLoggedIn) {
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

  // --- Handlers ---

  const handlePostLoginFlow = (userObj: any) => {
    login(userObj);
    setShowProfileModal(false);
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setUnregisteredMsg(false);
    setAlreadyRegisteredMsg(false);
    setVerifying(true);

    try {
      const check = await checkCustomerPhone(phone, tenantSlug);
      if (!check.exists && !isRegister) {
        setUnregisteredMsg(true);
        setError(`Mobile number +91 ${phone} is not registered under this store. Please register yourself first!`);
        setVerifying(false);
        return;
      }

      const result = await sendOtp(phone);
      if (result.success) {
        setOtpSent(true);
        if (check.name) setName(check.name);
        toast({ title: "OTP Sent! 📱", description: `Verification code sent to +91 ${phone}` });
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
    } finally {
      setVerifying(false);
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
      const result = await verifyOtp(phone, otp);
      if (result.success) {
        const userName = name || result.user.name || `Customer ${phone.slice(-4)}`;
        handlePostLoginFlow({
          id: result.user.id,
          name: userName,
          phone: result.user.phone,
        });
        setLoyalty(result.user.loyaltyTier, result.user.loyaltyPoints);
        toast({ title: "Welcome! 🎉", description: `Logged in as ${userName}` });
      }
    } catch {
      setError("Invalid OTP code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handlePasswordLoginOrRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (isRegister && !name.trim()) {
      setError("Please enter your full name to register");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setError("");
    setUnregisteredMsg(false);
    setAlreadyRegisteredMsg(false);
    setVerifying(true);

    try {
      if (isRegister) {
        const check = await checkCustomerPhone(phone, tenantSlug);
        if (check.exists) {
          setAlreadyRegisteredMsg(true);
          setError("You are already registered! Please login with OTP or try forgot password.");
          setVerifying(false);
          return;
        }

        const regRes = await registerCustomerAccount({ name, phone, password, tenantSlug });
        handlePostLoginFlow({
          id: regRes.user.id,
          name: name,
          phone: `+91${phone}`,
        });
        setLoyalty("BRONZE", 100);
        toast({ title: "Account Created! 🎉", description: `Welcome ${name}!` });
      } else {
        const check = await checkCustomerPhone(phone, tenantSlug);
        if (!check.exists) {
          setUnregisteredMsg(true);
          setError(`Mobile number +91 ${phone} is not registered under this store. Please register yourself first!`);
          setVerifying(false);
          return;
        }

        const userName = check.name || `Customer ${phone.slice(-4)}`;
        handlePostLoginFlow({
          id: check.id || "1",
          name: userName,
          phone: `+91${phone}`,
        });
        setLoyalty("BRONZE", 100);
        toast({ title: "Welcome Back! 🔑", description: `Logged in as ${userName}` });
      }
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter a valid 4-digit OTP code");
      return;
    }
    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters");
      return;
    }
    setError("");
    setVerifying(true);

    try {
      await resetCustomerPassword({ phone, otp, newPassword });
      toast({ title: "Password Reset Success! 🔑", description: "Your new password has been set." });
      handlePostLoginFlow({
        id: `usr_${Date.now()}`,
        name: name || `Customer ${phone.slice(-4)}`,
        phone: `+91${phone}`,
      });
    } catch {
      setError("Failed to reset password. Please verify your OTP code.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between items-center overflow-hidden p-4 sm:p-6 select-none bg-slate-950 font-sans">
      {/* Rich Inviting Food Background Image (Preserved) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
        style={{ backgroundImage: `url(${heroFood})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85 backdrop-blur-[2px]" />

      {/* Header Branding */}
      <div className="relative z-10 w-full max-w-sm text-center pt-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 border border-white/30 text-white text-3xl mb-2 backdrop-blur-md shadow-lg mx-auto"
        >
          🍽️
        </motion.div>
        <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-white leading-tight tracking-tight">
          {storeTitle}
        </h1>
        <p className="text-xs text-amber-300 font-semibold mt-1 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Mandatory Mobile Login Required to Access
        </p>
      </div>

      {/* Premium Glassmorphism Login Gateway Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm my-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Toggle Login Method Tabs */}
        {!isRegister && authMethod !== "forgot" && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 text-xs font-bold border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setAuthMethod("otp"); setError(""); setOtpSent(false); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
              className={`flex-1 min-h-[38px] py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMethod === "otp"
                  ? "bg-sky-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Mobile + OTP
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod("password"); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
              className={`flex-1 min-h-[38px] py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMethod === "password"
                  ? "bg-sky-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Mobile + Password
            </button>
          </div>
        )}

        <div className="mb-4 text-center">
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {isRegister
              ? "Register New Customer Account"
              : authMethod === "forgot"
              ? "Reset Your Password"
              : authMethod === "otp"
              ? (otpSent ? "Enter Verification OTP" : "Login with Mobile OTP")
              : "Login with Mobile & Password"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRegister
              ? "Register your details to order food & access menu"
              : authMethod === "forgot"
              ? "Enter your mobile number to reset password via OTP"
              : "Enter your mobile number to unlock digital dining"}
          </p>
        </div>

        {/* METHOD 1: OTP AUTHENTICATION */}
        {authMethod === "otp" && !isRegister && (
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
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-extrabold text-slate-500 border-r border-slate-200 dark:border-slate-700 pr-2.5">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full pl-16 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="space-y-2">
                    <p className="text-rose-600 text-xs text-center font-bold">{error}</p>
                    {unregisteredMsg && (
                      <button
                        type="button"
                        onClick={() => { setIsRegister(true); setAuthMethod("password"); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
                        className="w-full py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-sky-100 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Register New Account Now
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {verifying ? "Checking Account..." : "Send OTP & Unlock App"} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setAuthMethod("password"); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
                    className="text-xs text-sky-600 hover:text-sky-700 hover:underline font-extrabold"
                  >
                    New Customer? Register New Account
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1 text-center">
                    4-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full text-center tracking-[0.5em] font-mono font-black text-lg py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      autoFocus
                    />
                  </div>
                </div>

                {error && <p className="text-rose-600 text-xs text-center font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {verifying ? "Verifying..." : "Verify OTP & Access Store"} <Check className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-xs pt-1 font-semibold">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0}
                    className="text-sky-600 hover:underline font-bold disabled:opacity-40"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* METHOD 2: PASSWORD / REGISTER AUTHENTICATION */}
        {(authMethod === "password" || isRegister) && (
          <form onSubmit={handlePasswordLoginOrRegister} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-extrabold text-slate-500 border-r border-slate-200 dark:border-slate-700 pr-2.5">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-16 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  {isRegister ? "Set Password / PIN" : "Password / PIN"}
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("forgot"); setError(""); setOtpSent(false); }}
                    className="text-[11px] text-sky-600 hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="space-y-2">
                <p className="text-rose-600 text-xs text-center font-bold">{error}</p>
                {unregisteredMsg && (
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
                    className="w-full py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-sky-100 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register New Account Now
                  </button>
                )}
                {alreadyRegisteredMsg && (
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod("otp"); setIsRegister(false); setError(""); setAlreadyRegisteredMsg(false); setUnregisteredMsg(false); }}
                      className="w-full py-2 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-sky-100 transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> Login with OTP Now
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={verifying}
              className="w-full min-h-[44px] py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {verifying
                ? "Authenticating..."
                : isRegister
                ? "Register & Unlock App"
                : "Sign In & Access Store"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
                className="text-xs text-sky-600 hover:underline font-extrabold"
              >
                {isRegister
                  ? "Already registered? Sign In Here"
                  : "New Customer? Register New Account"}
              </button>
            </div>
          </form>
        )}

        {/* METHOD 3: FORGOT / RESET PASSWORD */}
        {authMethod === "forgot" && !isRegister && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Registered Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-extrabold text-slate-500 border-r border-slate-200 dark:border-slate-700 pr-2.5">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-16 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                Send Reset OTP Code <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1 text-center">
                    4-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full text-center tracking-[0.5em] font-mono font-black text-base py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    New Password / PIN
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {verifying ? "Updating Password..." : "Update Password & Login"} <Check className="w-4 h-4" />
                </button>
              </>
            )}

            {error && <p className="text-rose-600 text-xs text-center font-bold">{error}</p>}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setAuthMethod("password"); setError(""); }}
                className="text-xs text-sky-600 hover:underline font-extrabold"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Footer Branding */}
      <div className="relative z-10 text-center pb-2">
        <p className="text-white/80 text-xs font-semibold flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {storeTitle} · Secure PWA Ordering & Dining
        </p>
      </div>
    </div>
  );
};

export default CustomerAuthGuard;
