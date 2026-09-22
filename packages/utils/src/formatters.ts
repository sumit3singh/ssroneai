/**
 * Utility Formatters for Currency, Numbers, and Dates
 */
export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP" | "AED";

export const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  AED: "ar-AE",
};

export const formatCurrency = (amount: number, currency: SupportedCurrency | string = "INR"): string => {
  const code = (currency || "INR").toUpperCase() as SupportedCurrency;
  const locale = CURRENCY_LOCALES[code] || "en-IN";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  }
};

export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

/**
 * Generates standard dynamic UPI payment URL for Bharat QR / PhonePe / GPay / Paytm
 */
export interface UPILinkParams {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  transactionRef: string;
  note?: string;
}

export function generateUPILink({ payeeVpa, payeeName, amount, transactionRef, note = "Payment" }: UPILinkParams): string {
  const cleanVpa = encodeURIComponent(payeeVpa.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(note.trim());
  const cleanAmount = Number(amount || 0).toFixed(2);
  const cleanRef = encodeURIComponent(transactionRef.trim());

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tr=${cleanRef}&tn=${cleanNote}`;
}

/**
 * Web Audio API Soundbox Synthesizer (100% Offline, Zero Media Assets Required)
 * Generates instant crisp POS payment chime and soundbox feedback.
 */
export function playPaymentSuccessSound(): void {
  if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
    return;
  }
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    
    // Multi-tone triumphant chord (C5 -> E5 -> G5)
    const tones = [523.25, 659.25, 783.99];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
    });
  } catch (err) {
    console.debug("Audio synthesis unavailable", err);
  }
}
