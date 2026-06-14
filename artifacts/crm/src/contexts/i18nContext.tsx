import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Locale = "en" | "ar";
type Direction = "ltr" | "rtl";

interface I18nContextType {
  locale: Locale;
  dir: Direction;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.leads": "Leads",
    "nav.leads.list": "Leads List",
    "nav.leads.kanban": "Kanban Board",
    "nav.projects": "Projects",
    "nav.resale": "Resale Units",
    "nav.clients": "Clients",
    "nav.employees": "Employees",
    "nav.employees.pending": "Pending Approvals",
    "nav.planner": "Daily Planner",
    "nav.reports": "Reports",
    "nav.profile": "My Profile",
    "nav.permissions": "Permissions",
    "nav.home": "Home",
    "auth.login": "Sign In",
    "auth.register": "Create Account",
    "auth.logout": "Sign Out",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.name": "Full name",
    "auth.phone": "Phone number",
    "auth.role": "Role",
    "auth.verify_email": "Verify your email",
    "auth.verify_code": "Enter the 6-digit code sent to your email",
    "auth.pending_title": "Account Pending Approval",
    "auth.pending_body": "Your account is awaiting admin approval. You'll be notified once approved.",
    "leads.title": "Leads",
    "leads.add": "Add Lead",
    "leads.search": "Search leads...",
    "leads.status": "Status",
    "leads.source": "Source",
    "leads.assign": "Assign",
    "leads.delay": "Request Delay",
    "leads.import": "Import",
    "leads.export": "Export",
    "leads.kanban": "Kanban",
    "leads.list": "List",
    "leads.detail": "Lead Details",
    "leads.activity": "Activity",
    "leads.notes": "Notes",
    "leads.phone": "Phone",
    "leads.email": "Email",
    "leads.project": "Project",
    "leads.deadline": "Deadline",
    "leads.salesperson": "Salesperson",
    "status.new": "New",
    "status.called": "Called",
    "status.qualified": "Qualified",
    "status.proposal": "Proposal",
    "status.negotiation": "Negotiation",
    "status.won": "Won",
    "status.lost": "Lost",
    "status.pending": "Pending",
    "status.active": "Active",
    "status.rejected": "Rejected",
    "status.suspended": "Suspended",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.import": "Import",
    "common.loading": "Loading...",
    "common.empty": "No data yet",
    "common.error": "Something went wrong",
    "common.confirm": "Are you sure?",
    "common.confirm_delete": "This action cannot be undone.",
    "common.yes_delete": "Yes, delete",
    "common.actions": "Actions",
    "common.view": "View",
    "common.close": "Close",
    "common.submit": "Submit",
    "common.approve": "Approve",
    "common.reject": "Reject",
    "common.role": "Role",
    "common.name": "Name",
    "common.email": "Email",
    "common.phone": "Phone",
    "common.status": "Status",
    "common.date": "Date",
    "common.all": "All",
    "permissions.title": "Permissions Matrix",
    "permissions.desc": "Manage what each role can do across the system",
    "permissions.role": "Role",
    "permissions.module": "Module",
    "reports.title": "Reports & Analytics",
    "reports.leads": "Leads Report",
    "reports.sales": "Sales Performance",
    "reports.pipeline": "Pipeline Funnel",
    "reports.export_pdf": "Export PDF",
    "reports.export_excel": "Export Excel",
    "employees.title": "Employees",
    "employees.pending_title": "Pending Approvals",
    "employees.approve": "Approve",
    "employees.reject": "Reject",
    "resale.title": "Resale Market",
    "resale.add": "Add Unit",
    "resale.owner": "Owner",
    "resale.price": "Price",
    "resale.area": "Area",
    "resale.floor": "Floor",
    "home.greeting_morning": "Good morning",
    "home.greeting_afternoon": "Good afternoon",
    "home.greeting_evening": "Good evening",
    "home.my_leads": "My Leads",
    "home.todays_tasks": "Today's Tasks",
    "home.performance": "My Performance",
  },
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.leads": "العملاء المحتملون",
    "nav.leads.list": "قائمة الليدز",
    "nav.leads.kanban": "لوحة كانبان",
    "nav.projects": "المشاريع",
    "nav.resale": "وحدات الإعادة",
    "nav.clients": "العملاء",
    "nav.employees": "الموظفون",
    "nav.employees.pending": "بانتظار الموافقة",
    "nav.planner": "المخطط اليومي",
    "nav.reports": "التقارير",
    "nav.profile": "ملفي الشخصي",
    "nav.permissions": "الصلاحيات",
    "nav.home": "الرئيسية",
    "auth.login": "تسجيل الدخول",
    "auth.register": "إنشاء حساب",
    "auth.logout": "تسجيل الخروج",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.name": "الاسم الكامل",
    "auth.phone": "رقم الهاتف",
    "auth.role": "الدور الوظيفي",
    "auth.verify_email": "تحقق من بريدك",
    "auth.verify_code": "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك",
    "auth.pending_title": "الحساب في انتظار الموافقة",
    "auth.pending_body": "حسابك في انتظار موافقة المسؤول. ستُخطر فور الموافقة عليه.",
    "leads.title": "الليدز",
    "leads.add": "إضافة ليد",
    "leads.search": "ابحث عن ليد...",
    "leads.status": "الحالة",
    "leads.source": "المصدر",
    "leads.assign": "تعيين",
    "leads.delay": "طلب تأجيل",
    "leads.import": "استيراد",
    "leads.export": "تصدير",
    "leads.kanban": "كانبان",
    "leads.list": "قائمة",
    "leads.detail": "تفاصيل الليد",
    "leads.activity": "النشاط",
    "leads.notes": "الملاحظات",
    "leads.phone": "الهاتف",
    "leads.email": "البريد",
    "leads.project": "المشروع",
    "leads.deadline": "الموعد النهائي",
    "leads.salesperson": "مندوب المبيعات",
    "status.new": "جديد",
    "status.called": "تم الاتصال",
    "status.qualified": "مؤهل",
    "status.proposal": "عرض",
    "status.negotiation": "تفاوض",
    "status.won": "مكسب",
    "status.lost": "خاسر",
    "status.pending": "معلق",
    "status.active": "نشط",
    "status.rejected": "مرفوض",
    "status.suspended": "موقوف",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.add": "إضافة",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.export": "تصدير",
    "common.import": "استيراد",
    "common.loading": "جاري التحميل...",
    "common.empty": "لا توجد بيانات",
    "common.error": "حدث خطأ ما",
    "common.confirm": "هل أنت متأكد؟",
    "common.confirm_delete": "لا يمكن التراجع عن هذا الإجراء.",
    "common.yes_delete": "نعم، احذف",
    "common.actions": "الإجراءات",
    "common.view": "عرض",
    "common.close": "إغلاق",
    "common.submit": "إرسال",
    "common.approve": "موافقة",
    "common.reject": "رفض",
    "common.role": "الدور",
    "common.name": "الاسم",
    "common.email": "البريد",
    "common.phone": "الهاتف",
    "common.status": "الحالة",
    "common.date": "التاريخ",
    "common.all": "الكل",
    "permissions.title": "مصفوفة الصلاحيات",
    "permissions.desc": "إدارة ما يمكن لكل دور فعله في النظام",
    "permissions.role": "الدور",
    "permissions.module": "القسم",
    "reports.title": "التقارير والتحليلات",
    "reports.leads": "تقرير الليدز",
    "reports.sales": "أداء المبيعات",
    "reports.pipeline": "مسار المبيعات",
    "reports.export_pdf": "تصدير PDF",
    "reports.export_excel": "تصدير Excel",
    "employees.title": "الموظفون",
    "employees.pending_title": "طلبات الموافقة",
    "employees.approve": "موافقة",
    "employees.reject": "رفض",
    "resale.title": "سوق الإعادة",
    "resale.add": "إضافة وحدة",
    "resale.owner": "المالك",
    "resale.price": "السعر",
    "resale.area": "المساحة",
    "resale.floor": "الطابق",
    "home.greeting_morning": "صباح الخير",
    "home.greeting_afternoon": "مساء الخير",
    "home.greeting_evening": "مساء النور",
    "home.my_leads": "ليدزي",
    "home.todays_tasks": "مهام اليوم",
    "home.performance": "أدائي",
  },
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  dir: "ltr",
  t: (key) => key,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem("locale") as Locale) ?? "en";
  });

  const dir: Direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    localStorage.setItem("locale", locale);
  }, [locale, dir]);

  function setLocale(l: Locale) {
    setLocaleState(l);
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    let str = translations[locale][key] ?? translations["en"][key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{{${k}}}`, String(v));
      }
    }
    return str;
  }

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
