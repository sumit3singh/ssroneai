import { create } from "zustand";
import { t, type Language } from "@/i18n/translations";

interface I18nStore {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const useI18n = create<I18nStore>((set, get) => ({
  lang: "en",
  setLang: (lang) => set({ lang }),
  t: (key, params) => t(key, get().lang, params),
}));
