import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";

export type Language = "en" | "ar";

interface LanguageContextValue {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: string) => string;
}

const STORAGE_KEY = "app_language";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "profile.title": "Profile",
    "profile.account": "ACCOUNT",
    "profile.performance": "PERFORMANCE",
    "profile.settings": "SETTINGS",
    "profile.my_profile": "My Profile",
    "profile.personal_info": "View and edit personal info",
    "profile.notifications": "Notifications",
    "profile.notifications_sub": "Manage your alerts",
    "profile.performance_label": "My Performance",
    "profile.performance_sub": "Sales stats and targets",
    "profile.planner": "Daily Planner",
    "profile.planner_sub": "Tasks and schedule",
    "profile.dark_mode": "Dark Mode",
    "profile.light_mode": "Light Mode",
    "profile.switch_theme": "Switch theme",
    "profile.language": "Language",
    "profile.language_sub": "Switch between English and Arabic",
    "profile.sign_out": "Sign Out",
    "profile.sign_out_confirm": "Are you sure you want to sign out?",
    "profile.cancel": "Cancel",
    "profile.member": "TIL Member",
    "profile.version": "TIL Real Estate Group CRM · v1.0.0",
    "nav.home": "Home",
    "nav.leads": "Leads",
    "nav.notifications": "Notifications",
    "nav.profile": "Profile",
    "leads.title": "My Leads",
    "leads.search": "Search leads...",
    "leads.no_leads": "No leads found.",
    "leads.status.new": "New",
    "leads.status.called": "Called",
    "leads.status.qualified": "Qualified",
    "leads.status.proposal": "Proposal",
    "leads.status.negotiation": "Negotiation",
    "leads.status.won": "Won",
    "leads.status.lost": "Lost",
    "common.loading": "Loading...",
  },
  ar: {
    "profile.title": "الملف الشخصي",
    "profile.account": "الحساب",
    "profile.performance": "الأداء",
    "profile.settings": "الإعدادات",
    "profile.my_profile": "ملفي الشخصي",
    "profile.personal_info": "عرض وتعديل البيانات الشخصية",
    "profile.notifications": "الإشعارات",
    "profile.notifications_sub": "إدارة التنبيهات",
    "profile.performance_label": "أدائي",
    "profile.performance_sub": "إحصاءات المبيعات والأهداف",
    "profile.planner": "المخطط اليومي",
    "profile.planner_sub": "المهام والجدول الزمني",
    "profile.dark_mode": "الوضع الداكن",
    "profile.light_mode": "الوضع الفاتح",
    "profile.switch_theme": "تبديل المظهر",
    "profile.language": "اللغة",
    "profile.language_sub": "التبديل بين العربية والإنجليزية",
    "profile.sign_out": "تسجيل الخروج",
    "profile.sign_out_confirm": "هل أنت متأكد من تسجيل الخروج؟",
    "profile.cancel": "إلغاء",
    "profile.member": "عضو TIL",
    "profile.version": "TIL العقارية · v1.0.0",
    "nav.home": "الرئيسية",
    "nav.leads": "العملاء",
    "nav.notifications": "الإشعارات",
    "nav.profile": "الملف الشخصي",
    "leads.title": "عملائي",
    "leads.search": "البحث عن عميل...",
    "leads.no_leads": "لا توجد عملاء.",
    "leads.status.new": "جديد",
    "leads.status.called": "تم الاتصال",
    "leads.status.qualified": "مؤهل",
    "leads.status.proposal": "عرض",
    "leads.status.negotiation": "تفاوض",
    "leads.status.won": "فاز",
    "leads.status.lost": "خسر",
    "common.loading": "جاري التحميل...",
  },
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  isRTL: false,
  setLanguage: async () => {},
  toggleLanguage: async () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "ar" || stored === "en") {
        setLang(stored);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLang(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  };

  const toggleLanguage = async () => {
    const next: Language = language === "en" ? "ar" : "en";
    await setLanguage(next);
  };

  const t = (key: string): string => {
    return translations[language][key] ?? translations["en"][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      isRTL: language === "ar",
      setLanguage,
      toggleLanguage,
      t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
