import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, KeyRound, User, ArrowRight, Check, ShieldCheck, Sparkles, UserPlus, HelpCircle } from "lucide-react";
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
  const { isLoggedIn, user, deliveryAddress, login, setLoyalty } = useAuthStore();
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

  // If already logged in, render child routes (and offer CustomerProfileModal if user opens it)
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
      // 1. Check if customer exists under tenant
      const check = await checkCustomerPhone(phone, tenantSlug);
      if (!check.exists && !isRegister) {
        setUnregisteredMsg(true);
        setError(`Mobile number +91 ${phone} is not registered under this store. Please register yourself first!`);
        setVerifying(false);
        return;
      }

      // 2. Send OTP
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
        // 1. Check if user already exists
        const check = await checkCustomerPhone(phone, tenantSlug);
        if (check.exists) {
          setAlreadyRegisteredMsg(true);
          setError("You are already registered! Please login with OTP or try forgot password.");
          setVerifying(false);
          return;
        }

        // 2. Register New Customer in DB
        const regRes = await registerCustomerAccount({ name, phone, password, tenantSlug });
        handlePostLoginFlow({
          id: regRes.user.id,
          name: name,
          phone: `+91${phone}`,
        });
        setLoyalty("BRONZE", 100);
        toast({ title: "Account Created! 🎉", description: `Welcome ${name}!` });
      } else {
        // Check if user exists
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
    <div className="relative h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between items-center overflow-hidden p-4 sm:p-6 select-none bg-background">
      {/* Background Image & Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroFood})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/65 to-foreground/90" />

      {/* Header Branding */}
      <div className="relative z-10 w-full max-w-sm text-center pt-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 border border-primary/40 text-primary text-3xl mb-2 backdrop-blur shadow-lg mx-auto"
        >
          🍽️
        </motion.div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-primary-foreground leading-tight">
          {storeTitle}
        </h1>
        <p className="text-xs text-primary-foreground/75 mt-0.5 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Mandatory Mobile Login Required to Access
        </p>
      </div>

      {/* Main Authentication Gateway Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm my-auto bg-popover/95 backdrop-blur-xl border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xl overflow-hidden text-popover-foreground"
      >
        {/* Toggle Login Method Tabs */}
        {!isRegister && authMethod !== "forgot" && (
          <div className="flex bg-muted/80 p-1 rounded-xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMethod("otp"); setError(""); setOtpSent(false); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                authMethod === "otp"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Mobile + OTP
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod("password"); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                authMethod === "password"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Mobile + Password
            </button>
          </div>
        )}

        <div className="mb-3 text-center">
          <h2 className="text-lg font-bold">
            {isRegister
              ? "Register New Customer Account"
              : authMethod === "forgot"
              ? "Reset Your Password"
              : authMethod === "otp"
              ? (otpSent ? "Enter Verification OTP" : "Login with Mobile OTP")
              : "Login with Mobile & Password"}
          </h2>
          <p className="text-[11px] text-muted-foreground">
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
            className="space-y-3"
          >
            {!otpSent ? (
              <>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-semibold text-muted-foreground border-r border-border pr-2">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full pl-14 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="space-y-2">
                    <p className="text-destructive text-xs text-center font-medium">{error}</p>
                    {unregisteredMsg && (
                      <button
                        type="button"
                        onClick={() => { setIsRegister(true); setAuthMethod("password"); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
                        className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Register New Account Now
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="btn-order w-full py-3 text-center font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  {verifying ? "Checking Account..." : "Send OTP & Unlock App"} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setAuthMethod("password"); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    New Customer? Register New Account
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 text-center">
                    4-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="1234"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full text-center tracking-[0.5em] font-mono text-lg py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                      autoFocus
                    />
                  </div>
                </div>

                {error && <p className="text-destructive text-xs text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={verifying}
                  className="btn-order w-full py-3 text-center font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  {verifying ? "Verifying..." : "Verify OTP & Access Store"} <Check className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0}
                    className="text-primary hover:underline font-medium disabled:opacity-40"
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
          <form onSubmit={handlePasswordLoginOrRegister} className="space-y-3">
            {isRegister && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-semibold text-muted-foreground border-r border-border pr-2">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-14 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {isRegister ? "Set Password / PIN" : "Password / PIN"}
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => { setAuthMethod("forgot"); setError(""); setOtpSent(false); }}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Forgot / Change Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="space-y-2">
                <p className="text-destructive text-xs text-center font-medium">{error}</p>
                {unregisteredMsg && (
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setError(""); setUnregisteredMsg(false); setAlreadyRegisteredMsg(false); }}
                    className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register New Account Now
                  </button>
                )}
                {alreadyRegisteredMsg && (
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod("otp"); setIsRegister(false); setError(""); setAlreadyRegisteredMsg(false); setUnregisteredMsg(false); }}
                      className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> Login with OTP Now
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMethod("forgot"); setIsRegister(false); setError(""); setAlreadyRegisteredMsg(false); setUnregisteredMsg(false); }}
                      className="w-full py-2 bg-muted text-muted-foreground border border-border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:text-foreground transition text-center"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Reset / Forgot Password
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={verifying}
              className="btn-order w-full py-3 text-center font-bold text-sm flex items-center justify-center gap-1.5"
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
                className="text-xs text-primary hover:underline font-semibold"
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
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Registered Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-semibold text-muted-foreground border-r border-border pr-2">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-14 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                className="btn-order w-full py-2.5 text-center font-bold text-xs flex items-center justify-center gap-1.5"
              >
                Send Reset OTP Code <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 text-center">
                    4-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full text-center tracking-[0.5em] font-mono text-base py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    New Password / PIN
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="btn-order w-full py-3 text-center font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  {verifying ? "Updating Password..." : "Update Password & Login"} <Check className="w-4 h-4" />
                </button>
              </>
            )}

            {error && <p className="text-destructive text-xs text-center">{error}</p>}

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setAuthMethod("password"); setError(""); }}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Footer Branding */}
      <div className="relative z-10 text-center">
        <p className="text-primary-foreground/60 text-[11px] flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> {storeTitle} · Secure PWA Ordering & Dining
        </p>
      </div>
    </div>
  );
};

export default CustomerAuthGuard;
