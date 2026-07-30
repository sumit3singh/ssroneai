import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowLeft, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useI18n } from "@/stores/i18nStore";
import { sendOtp, verifyOtp } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import heroFood from "@/assets/hero-food.jpg";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, otpSent, setOtpSent, setLoyalty } = useAuthStore();
  const { t } = useI18n();
  const { toast } = useToast();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const from = (location.state as { from?: string })?.from || "/";

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setError("");
    try {
      const result = await sendOtp(phone);
      if (result.success) {
        setOtpSent(true);
        toast({ title: "OTP Sent! 📱", description: `Code sent to +91 ${phone}` });
        // Start resend timer
        setResendTimer(30);
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) { clearInterval(interval); return 0; }
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
      setError("Enter a valid OTP");
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const result = await verifyOtp(phone, otp);
      if (result.success) {
        login({
          id: result.user.id,
          name: name || result.user.name,
          phone: result.user.phone,
        });
        setLoyalty(result.user.loyaltyTier, result.user.loyaltyPoints);
        toast({ title: "Welcome! 🎉", description: `Logged in as ${name || result.user.name}` });
        navigate(from, { replace: true });
      }
    } catch {
      setError("Invalid OTP. Please try again.");
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    handleSendOtp();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroFood})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm mx-auto px-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 p-2 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🍽️</p>
          <h1 className="text-3xl font-display font-bold text-primary-foreground mb-2">
            {otpSent ? t("login.verifyOtp") : t("login.title")}
          </h1>
          <p className="text-primary-foreground/70 text-sm">
            {otpSent
              ? t("login.otpSent", { phone })
              : t("login.enterPhone")}
          </p>
        </div>

        <div className="bg-popover/95 backdrop-blur rounded-2xl p-5 space-y-4">
          {!otpSent ? (
            <>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder={t("login.phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Phone number"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("login.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Name"
                />
              </div>
              {error && <p className="text-destructive text-xs" role="alert">{error}</p>}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSendOtp}
                className="btn-order w-full py-3 text-center font-bold"
              >
                {t("login.sendOtp")}
              </motion.button>
            </>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const newOtp = otp.split("");
                      newOtp[i] = val;
                      setOtp(newOtp.join(""));
                      if (val && i < 3) {
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        next?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        prev?.focus();
                      }
                    }}
                    className="w-12 h-14 rounded-xl bg-background border border-border text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {t("login.demoOtp")}
              </p>
              {error && <p className="text-destructive text-xs text-center" role="alert">{error}</p>}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleVerifyOtp}
                disabled={verifying}
                className="btn-order w-full py-3 text-center font-bold disabled:opacity-50"
              >
                {verifying ? t("login.verifying") : t("login.verify")}
              </motion.button>
              <div className="flex justify-between">
                <button
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="text-xs text-primary-foreground/60 hover:text-primary-foreground/80 transition"
                >
                  {t("login.changePhone")}
                </button>
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="text-xs text-primary-foreground/60 hover:text-primary-foreground/80 transition disabled:opacity-40"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : t("login.resendOtp")}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-primary-foreground/40 text-xs mt-6">
          {t("app.tagline")}
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
