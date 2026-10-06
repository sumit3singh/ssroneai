import { useI18n } from "@/stores/i18nStore";
import { cn } from "@/lib/utils";

const LanguageToggle = ({ className }: { className?: string }) => {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className={cn(
        "min-h-[32px] px-3 py-1 rounded-full text-xs font-bold border border-[#E8E3DC] bg-white hover:bg-[#F8F6F2] text-[#2D241E] hover:text-[#9E6B38] transition-all cursor-pointer shadow-xs active:scale-95",
        className
      )}
      aria-label={`Switch to ${lang === "en" ? "Hindi" : "English"}`}
    >
      {lang === "en" ? "हिं" : "EN"}
    </button>
  );
};

export default LanguageToggle;

