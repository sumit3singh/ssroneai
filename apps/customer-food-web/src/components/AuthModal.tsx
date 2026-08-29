import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, User, KeyRound, X, Check, ArrowRight } from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import { sendOtp, verifyOtp } from "@ssrone/api-client";
import { useToast } from "@/hooks/use-toast";

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
  const { login, setLoyalty } = useAuthStore();
  const { t } = useI18n();
  const { toast } = useToast();

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
      const result = await sendOtp(phone);
      if (result.success) {
        setOtpSent(true);
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
        login({
          id: result.user.id,
          name: userName,
          phone: result.user.phone,
        });
        setLoyalty(result.user.loyaltyTier, result.user.loyaltyPoints);
        toast({ title: "Logged In Successfully! 🎉", description: `Welcome back, ${userName}` });
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch {
      setError("Invalid OTP code. Please try again.");
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
          className="relative w-full max-w-sm bg-popover border border-border rounded-2xl p-6 shadow-2xl z-10 overflow-hidden text-popover-foreground"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3 mx-auto">
            <Phone className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-display font-bold text-center mb-1">
            {otpSent ? "Enter Verification Code" : title}
          </h3>
          <p className="text-xs text-muted-foreground text-center mb-5">
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
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
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

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {error && <p className="text-destructive text-xs text-center">{error}</p>}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-md transition text-sm flex items-center justify-center gap-1.5"
                >
                  Send OTP Code <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1 text-center">
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
                  className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-md transition text-sm flex items-center justify-center gap-1.5"
                >
                  {verifying ? "Verifying..." : "Verify & Log In"} <Check className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0}
                    className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
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
