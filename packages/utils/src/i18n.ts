/**
 * SSR One AI – Lightweight Monorepo i18n Dictionary Engine
 * Zero-dependency instant translation for English, Hindi, and Arabic
 */

export type AppLanguage = "en" | "hi" | "ar";

export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    "pos.title": "Point of Sale Terminal",
    "pos.billing": "Billing",
    "pos.tables": "Table Operations",
    "pos.orders": "Live Orders",
    "pos.kds": "Kitchen Display",
    "pos.shift": "Shift Management",
    "pos.settle": "Settle Order",
    "pos.hold": "Hold Bill",
    "pos.subtotal": "Subtotal",
    "pos.tax": "GST / Tax",
    "pos.discount": "Discount",
    "pos.total": "Grand Total",
    "pos.payment_cash": "Cash",
    "pos.payment_upi": "UPI / QR",
    "pos.payment_card": "Card",
    "pos.payment_due": "Customer Debt (Udhar)",
    "pos.voice_order": "Voice Order (AI)",
    "pos.cfd": "Customer Display",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.search": "Search menu items...",
    "common.print": "Print Receipt",
    "common.whatsapp": "Send via WhatsApp",
  },
  hi: {
    "pos.title": "पीओएस बिलिंग टर्मिनल",
    "pos.billing": "बिलिंग",
    "pos.tables": "टेबल प्रबंधन",
    "pos.orders": "सक्रिय ऑर्डर",
    "pos.kds": "रसोई डिस्प्ले (KDS)",
    "pos.shift": "शिफ्ट प्रबंधन",
    "pos.settle": "बिल भुगतान करें",
    "pos.hold": "बिल होल्ड करें",
    "pos.subtotal": "उप-योग (Subtotal)",
    "pos.tax": "जीएसटी / कर",
    "pos.discount": "छूट (Discount)",
    "pos.total": "कुल योग (Grand Total)",
    "pos.payment_cash": "नकद (Cash)",
    "pos.payment_upi": "यूपीआई / क्यूआर",
    "pos.payment_card": "कार्ड (Card)",
    "pos.payment_due": "उधार खाता (Debt)",
    "pos.voice_order": "वॉयस ऑर्डर (एआई)",
    "pos.cfd": "ग्राहक डिस्प्ले",
    "common.save": "सुरक्षित करें",
    "common.cancel": "रद्द करें",
    "common.search": "मेन्यू आइटम खोजें...",
    "common.print": "रसीद प्रिंट करें",
    "common.whatsapp": "व्हाट्सएप पर भेजें",
  },
  ar: {
    "pos.title": "نقطة البيع",
    "pos.billing": "الفواتير",
    "pos.tables": "إدارة الطاولات",
    "pos.orders": "الطلبات الحالية",
    "pos.kds": "شاشة المطبخ",
    "pos.shift": "إدارة الوردية",
    "pos.settle": "تسوية الفاتورة",
    "pos.hold": "تعليق الفاتورة",
    "pos.subtotal": "المجموع الفرعي",
    "pos.tax": "الضريبة",
    "pos.discount": "الخصم",
    "pos.total": "المجموع الكلي",
    "pos.payment_cash": "نقداً",
    "pos.payment_upi": "رمز الاستجابة السريعة (QR)",
    "pos.payment_card": "بطاقة ائتمان",
    "pos.payment_due": "حساب آجل (دين)",
    "pos.voice_order": "طلب صوتي بالذكاء الاصطناعي",
    "pos.cfd": "شاشة العميل",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.search": "بحث في قائمة الطعام...",
    "common.print": "طباعة الإيصال",
    "common.whatsapp": "إرسال عبر واتساب",
  },
};

export function translate(key: string, lang: AppLanguage = "en"): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}
