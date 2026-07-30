import { useI18n } from "@/stores/i18nStore";
import { cn } from "@/lib/utils";

const LanguageToggle = ({ className }: { className?: string }) => {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className={cn(
        "px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border border-border transition-colors hover:bg-muted",
        className
      )}
      aria-label={`Switch to ${lang === "en" ? "Hindi" : "English"}`}
    >
      {lang === "en" ? "हिं" : "EN"}
    </button>
  );
};

export default LanguageToggle;
