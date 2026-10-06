import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import { useTenantAppConfig } from "@/hooks/useTenantAppConfig";
import { usePWAManifest } from "@/hooks/usePWAManifest";

export const PWAInstallBanner: React.FC = () => {
  // Activate dynamic PWA manifest and title sync for active branch
  usePWAManifest();

  const { branchName } = useTenantBranchContext();
  const { branding } = useTenantAppConfig();

  const appDisplayName = branchName || branding.businessName || "The Baithak Cafe";

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem("ssrone_pwa_dismissed");
    if (isDismissed) return;

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isApple);

    // Capture Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS and not installed, show after 3 seconds
    if (isApple && !isStandalone) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("ssrone_pwa_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-gradient-to-r from-[#2D241E] to-[#3D3028] text-white p-3.5 rounded-2xl shadow-2xl border border-[#9E6B38]/30 backdrop-blur-md flex items-center justify-between gap-3 select-none font-sans"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#9E6B38] flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-lg overflow-hidden border border-white/20">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={appDisplayName} className="w-full h-full object-contain" />
            ) : (
              <Utensils className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold leading-tight break-words">{appDisplayName}</h4>
            <p className="text-[11px] text-[#E5C9A3] leading-tight break-words mt-0.5">
              Faster 1-tap table ordering and live tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="min-h-[36px] px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] hover:opacity-95 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-white/70 hover:text-white rounded-full transition cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* iOS Helper Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end p-4">
            <div className="bg-white text-[#2D241E] rounded-3xl p-6 w-full max-w-sm mx-auto space-y-3.5 border border-[#E8E3DC] shadow-2xl font-sans">
              <h3 className="font-serif text-base font-bold flex items-center gap-2 text-[#2D241E]">
                <Smartphone className="w-4 h-4 text-[#9E6B38]" /> Install {appDisplayName} on iPhone / iPad
              </h3>
              <p className="text-xs text-[#7A746B] leading-relaxed">
                1. Tap the <Share className="w-4 h-4 inline mx-1 text-[#9E6B38]" /> <strong>Share</strong> button at the bottom of Safari.
              </p>
              <p className="text-xs text-[#7A746B] leading-relaxed">
                2. Scroll down and tap <strong>"Add to Home Screen"</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] py-2.5 bg-[#9E6B38] hover:bg-[#86592d] text-white rounded-full text-xs font-bold mt-2 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallBanner;

