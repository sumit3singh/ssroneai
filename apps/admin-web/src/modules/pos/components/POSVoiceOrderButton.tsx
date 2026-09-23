import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Globe,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { POSMenuItem } from "../types";

interface POSVoiceOrderButtonProps {
  menuItems: POSMenuItem[];
  onAddToCart: (item: POSMenuItem, count?: number) => void;
  className?: string;
}

// ─── Extensive Multilingual Quantity & Unit Dictionary ───
const QUANTITY_MAP: Record<string, number> = {
  // Numeric
  "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
  "11": 11, "12": 12, "15": 15, "20": 20,
  // English words
  "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
  "single": 1, "double": 2, "triple": 3, "couple": 2, "half": 1, "quarter": 1, "full": 1,
  // Hinglish Latin words
  "ek": 1, "aik": 1, "do": 2, "doo": 2, "teen": 3, "tin": 3, "chaar": 4, "char": 4,
  "paanch": 5, "panch": 5, "cheh": 6, "chheh": 6, "che": 6, "saat": 7, "sat": 7,
  "aath": 8, "ath": 8, "nau": 9, "no": 9, "dus": 10, "das": 10,
  "gyarah": 11, "barah": 12, "pandrah": 15, "bees": 20,
  // Devanagari Hindi numerals & words
  "१": 1, "२": 2, "३": 3, "४": 4, "५": 5, "६": 6, "७": 7, "८": 8, "९": 9, "१०": 10,
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पाँच": 5, "पांच": 5, "छह": 6, "सात": 7,
  "आठ": 8, "नौ": 9, "दस": 10, "ग्यारह": 11, "बारह": 12, "पन्द्रह": 15, "बीस": 20,
};

// Filler / Unit words to clean out so they don't break dish name matching
const FILLER_WORDS = new Set([
  "bhaiya", "bhai", "please", "kripya", "chahiye", "kar", "do", "dena", "dijiye", "bhi",
  "plate", "plates", "cup", "cups", "glass", "glasses", "piece", "pieces", "pcs",
  "portion", "portions", "dish", "dishes", "pack", "packs", "order"
]);

// Common spoken culinary aliases
const DISH_SYNONYMS: Record<string, string[]> = {
  "tea": ["chai", "tea"],
  "coffee": ["coffee", "cold coffee", "cappuccino"],
  "fries": ["french fries", "fries"],
  "roll": ["spring roll", "roll", "rolls", "wrap"],
  "burger": ["burger", "burgers"],
  "pizza": ["pizza", "pizzas"],
  "sandwich": ["sandwich", "sandwiches"],
};

export const POSVoiceOrderButton: React.FC<POSVoiceOrderButtonProps> = ({
  menuItems = [],
  onAddToCart,
  className = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [transcript, setTranscript] = useState("");
  const [lastMatched, setLastMatched] = useState<string[]>([]);
  const [speechFeedbackEnabled, setSpeechFeedbackEnabled] = useState(true);
  const [isContinuous, setIsContinuous] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Audio Voice Confirmation Synthesis
  const speakConfirmation = (text: string) => {
    if (!speechFeedbackEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = isContinuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);

      if (event.results[event.results.length - 1].isFinal) {
        handleProcessCompoundVoiceCommand(current);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("[VoiceOrder] Recognition event error:", e);
      if (e.error !== "no-speech") {
        toast.error(`Voice error: ${e.error}`);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isContinuous && isListening) {
        try {
          recognition.start();
        } catch {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [lang, menuItems, isContinuous]);

  /**
   * Matches an individual segment (e.g. "two kulhad chai") against the menu catalog.
   */
  const matchSingleSegment = (segment: string): { item: POSMenuItem; qty: number } | null => {
    const cleanTokens = segment
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    if (cleanTokens.length === 0) return null;

    let qty = 1;
    let dishTokens: string[] = [];

    // 1. Extract quantity from tokens
    for (let i = 0; i < cleanTokens.length; i++) {
      const token = cleanTokens[i];
      if (QUANTITY_MAP[token] !== undefined) {
        qty = QUANTITY_MAP[token];
      } else if (!FILLER_WORDS.has(token)) {
        dishTokens.push(token);
      }
    }

    const queryStr = dishTokens.join(" ").trim();
    if (!queryStr) return null;

    // 2. Exact name match
    let match = menuItems.find(
      (m) => m.name.toLowerCase() === queryStr
    );

    // 3. Substring match
    if (!match) {
      match = menuItems.find(
        (m) => m.name.toLowerCase().includes(queryStr) || queryStr.includes(m.name.toLowerCase())
      );
    }

    // 4. Token overlap scoring with Synonym expansion
    if (!match && menuItems.length > 0) {
      let highestScore = 0;
      let bestItem: POSMenuItem | null = null;

      for (const item of menuItems) {
        const itemNameLower = item.name.toLowerCase();
        let score = 0;

        for (const token of dishTokens) {
          if (itemNameLower.includes(token)) {
            score += 2;
          }
          // Check synonyms (e.g. "tea" -> "chai")
          for (const [key, syns] of Object.entries(DISH_SYNONYMS)) {
            if (syns.includes(token)) {
              if (syns.some((s) => itemNameLower.includes(s))) {
                score += 1.5;
              }
            }
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestItem = item;
        }
      }

      if (bestItem && highestScore >= 1.5) {
        match = bestItem;
      }
    }

    return match ? { item: match, qty } : null;
  };

  /**
   * Processes compound voice commands like:
   * "2 chai and 1 veg pizza aur 2 cold coffee"
   * Splitting on delimiters and adding each matched dish to the cart.
   */
  const handleProcessCompoundVoiceCommand = (rawText: string) => {
    const raw = rawText.trim();
    if (!raw) return;

    // Split on English and Hindi compound connectors
    // "and", "aur", "plus", "saath me", "aur bhi", commas, ampersands
    const splitRegex = /\b(?:and|aur|aur\s+bhi|plus|saath\s+me|with|\+|,|&)\b/gi;
    const segments = raw
      .split(splitRegex)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const matchesFound: Array<{ item: POSMenuItem; qty: number }> = [];

    for (const seg of segments) {
      const result = matchSingleSegment(seg);
      if (result) {
        matchesFound.push(result);
      }
    }

    // If compound split found nothing, try the full string directly
    if (matchesFound.length === 0) {
      const single = matchSingleSegment(raw);
      if (single) {
        matchesFound.push(single);
      }
    }

    if (matchesFound.length > 0) {
      const summaryList: string[] = [];

      for (const { item, qty } of matchesFound) {
        for (let i = 0; i < qty; i++) {
          onAddToCart(item);
        }
        summaryList.push(`${qty}x ${item.name}`);
      }

      setLastMatched(summaryList);
      toast.success(`🎙️ Added to cart: ${summaryList.join(", ")}`, {
        icon: "⚡",
        duration: 3500,
      });

      // Spoken voice feedback confirmation
      speakConfirmation(`Added ${summaryList.join(", ")}`);
      setTranscript("");
    } else {
      toast.error(`Could not match "${raw}". Please speak dish name clearly.`, {
        duration: 3000,
      });
    }
  };

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported by this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.info(
          lang === "hi-IN"
            ? "🎙️ सुन रहा हूँ... (उदा: 'दो चाय और एक पिज़्ज़ा')"
            : "🎙️ Listening... (e.g. '2 Chai and 1 Veg Pizza')"
        );
      } catch (err) {
        console.error("Failed to start speech recognition", err);
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`}>
      {/* Language Switcher (EN / हिन्दी) */}
      <button
        type="button"
        onClick={() => setLang((prev) => (prev === "en-IN" ? "hi-IN" : "en-IN"))}
        className="h-8 px-2 rounded-md bg-background border border-border text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
        title="Toggle Voice Language (English / Hindi & Hinglish)"
      >
        <Globe size={12} className="text-primary" />
        <span>{lang === "hi-IN" ? "हिन्दी" : "EN"}</span>
      </button>

      {/* Main Microphone Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`h-8 px-2.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-2xs ${
          isListening
            ? "bg-rose-600 text-white animate-pulse ring-2 ring-rose-400/60 shadow-md"
            : "bg-background hover:bg-accent text-foreground border border-border"
        }`}
        title="AI Voice Order (Click to speak orders e.g. '2 Chai, 1 Burger')"
      >
        {isListening ? (
          <>
            <Mic size={14} className="animate-bounce text-white" />
            <span className="text-[11px] font-mono tracking-tight font-extrabold">Listening...</span>
          </>
        ) : (
          <>
            <Mic size={14} className="text-primary" />
            <span className="text-[11px] hidden sm:inline">Voice Order</span>
          </>
        )}
      </button>

      {/* Voice Audio Feedback Toggle (Speaker icon) */}
      <button
        type="button"
        onClick={() => setSpeechFeedbackEnabled((prev) => !prev)}
        className={`h-8 w-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
          speechFeedbackEnabled
            ? "bg-background border-border text-primary hover:bg-accent"
            : "bg-muted/50 border-border text-muted-foreground line-through opacity-60"
        }`}
        title={speechFeedbackEnabled ? "Voice confirmation audio is ON" : "Voice confirmation audio is MUTED"}
      >
        {speechFeedbackEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
      </button>

      {/* Continuous Dictation Toggle (Hands-Free) */}
      <button
        type="button"
        onClick={() => setIsContinuous((prev) => !prev)}
        className={`h-8 px-1.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer shadow-2xs flex items-center gap-1 ${
          isContinuous
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
            : "bg-background border-border text-muted-foreground hover:text-foreground"
        }`}
        title="Toggle Continuous Hands-Free Mode (Mic stays open)"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${isContinuous ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
        <span className="hidden md:inline">Hands-Free</span>
      </button>

      {/* Live Floating Speech Feedback Pill */}
      {isListening && transcript && (
        <div className="absolute top-10 left-0 z-50 bg-popover text-popover-foreground border border-border text-xs px-3.5 py-2 rounded-xl shadow-2xl font-medium whitespace-nowrap animate-in fade-in slide-in-from-top-1.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-muted-foreground text-[11px]">Heard:</span>
          <span className="font-extrabold text-foreground tracking-tight">"{transcript}"</span>
        </div>
      )}
    </div>
  );
};

export default POSVoiceOrderButton;
