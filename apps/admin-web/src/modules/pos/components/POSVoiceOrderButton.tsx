import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Globe, Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { POSMenuItem } from "../types";

interface POSVoiceOrderButtonProps {
  menuItems: POSMenuItem[];
  onAddToCart: (item: POSMenuItem, count?: number) => void;
  className?: string;
}

const NUMBER_MAP: Record<string, number> = {
  "1": 1, "one": 1, "ek": 1, "एक": 1, "single": 1,
  "2": 2, "two": 2, "do": 2, "दो": 2, "double": 2,
  "3": 3, "three": 3, "teen": 3, "तीन": 3,
  "4": 4, "four": 4, "char": 4, "चार": 4,
  "5": 5, "five": 5, "paanch": 5, "पाँच": 5,
  "6": 6, "six": 6, "cheh": 6, "छह": 6,
  "7": 7, "seven": 7, "saat": 7, "सात": 7,
  "8": 8, "eight": 8, "aath": 8, "आठ": 8,
  "9": 9, "nine": 9, "nau": 9, "नौ": 9,
  "10": 10, "ten": 10, "dus": 10, "दस": 10,
};

export const POSVoiceOrderButton: React.FC<POSVoiceOrderButtonProps> = ({
  menuItems = [],
  onAddToCart,
  className = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);

      if (event.results[event.results.length - 1].isFinal) {
        handleProcessVoiceCommand(current);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
      if (e.error !== "no-speech") {
        toast.error(`Voice error: ${e.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [lang, menuItems]);

  const handleProcessVoiceCommand = (rawText: string) => {
    const clean = rawText.trim().toLowerCase();
    if (!clean) return;

    // 1. Detect Quantity (e.g. "two masala dosa", "teen chai", "ek biryani")
    const words = clean.split(/\s+/);
    let qty = 1;
    let textWithoutQty = clean;

    if (words.length > 0 && NUMBER_MAP[words[0]]) {
      qty = NUMBER_MAP[words[0]];
      textWithoutQty = words.slice(1).join(" ");
    } else if (words.length > 1 && NUMBER_MAP[words[1]]) {
      qty = NUMBER_MAP[words[1]];
      textWithoutQty = [words[0], ...words.slice(2)].join(" ");
    }

    // 2. Fuzzy match dish in catalog
    const query = textWithoutQty.trim();
    if (!query) {
      toast.info(`Heard: "${rawText}" - Please specify the dish name.`);
      return;
    }

    // Best exact or substring match
    let matchedItem = menuItems.find(
      (m) => m.name.toLowerCase() === query || query.includes(m.name.toLowerCase())
    );

    if (!matchedItem) {
      // Token overlap matching
      let bestScore = 0;
      let candidate: POSMenuItem | null = null;
      const queryTokens = query.split(/\s+/);

      for (const item of menuItems) {
        const itemTokens = item.name.toLowerCase().split(/\s+/);
        let matchCount = 0;
        for (const qt of queryTokens) {
          if (itemTokens.some((it) => it.includes(qt) || qt.includes(it))) {
            matchCount++;
          }
        }
        if (matchCount > bestScore) {
          bestScore = matchCount;
          candidate = item;
        }
      }

      if (candidate && bestScore > 0) {
        matchedItem = candidate;
      }
    }

    if (matchedItem) {
      for (let i = 0; i < qty; i++) {
        onAddToCart(matchedItem);
      }
      toast.success(`🎙️ Added ${qty}x ${matchedItem.name} to cart!`, {
        icon: "⚡",
        duration: 3000,
      });
      setTranscript("");
    } else {
      toast.error(`Could not match "${query}" to menu. Try speaking dish name clearly.`);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported by this browser. Use Chrome or Edge.");
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
            ? "🎙️ सुन रहा हूँ... बोलिए (उदा: 'दो चाय' या 'एक पनीर टिक्का')"
            : "🎙️ Listening... Speak dish & qty (e.g. 'Two butter chicken')"
        );
      } catch (err) {
        console.error("Failed to start speech recognition", err);
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`}>
      {/* Language Switcher */}
      <button
        type="button"
        onClick={() => setLang((prev) => (prev === "en-IN" ? "hi-IN" : "en-IN"))}
        className="h-8 px-2 rounded-md bg-muted/60 border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
        title="Toggle Voice Language (English / Hindi)"
      >
        <Globe size={11} />
        <span>{lang === "hi-IN" ? "हिन्दी" : "EN"}</span>
      </button>

      {/* Mic Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`h-8 px-2.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
          isListening
            ? "bg-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-400/50"
            : "bg-muted hover:bg-muted/80 text-foreground border border-border"
        }`}
        title="AI Voice Order Taking (Click to speak)"
      >
        {isListening ? (
          <>
            <Mic size={14} className="animate-bounce" />
            <span className="text-[11px] font-mono">Listening...</span>
          </>
        ) : (
          <>
            <Mic size={14} className="text-primary" />
            <span className="text-[11px] hidden sm:inline">Voice Order</span>
          </>
        )}
      </button>

      {/* Floating live transcript pill when speaking */}
      {isListening && transcript && (
        <div className="absolute top-10 left-0 z-50 bg-popover text-popover-foreground border border-border text-xs px-3 py-1.5 rounded-lg shadow-xl font-medium whitespace-nowrap animate-in fade-in slide-in-from-top-1">
          <span className="text-muted-foreground mr-1">Heard:</span>
          <span className="font-semibold text-primary">"{transcript}"</span>
        </div>
      )}
    </div>
  );
};
